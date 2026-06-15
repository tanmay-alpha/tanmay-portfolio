import { NextResponse, type NextRequest } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_USER = "tanmay-alpha";
const EVENTS_URL = `https://api.github.com/users/${GITHUB_USER}/events/public`;
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`;

// 5 min for events, 1 hr for stats. The route never 500s — it returns a
// { fallback: true, ... } payload on failure so the UI degrades quietly.
const REVALIDATE_EVENTS = 300;
const REVALIDATE_REPOS = 600;
const REVALIDATE_COMMITS = 300;
const REVALIDATE_STATS = 3600;

// Per-IP rate limit. The data behind this endpoint is public, but the
// route also acts as a proxy to GitHub's unauthenticated 60 req/hr
// rate limit, so we cap clients BEFORE we burn our shared budget.
const commitLimiter = createRateLimiter({ max: 30, windowMs: 60_000 });

const GH_HEADERS: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "tanmay-portfolio",
};

async function safeFetch(
  url: string,
  init: RequestInit & { next?: { revalidate: number } },
  timeoutMs: number,
): Promise<{ ok: boolean; data: unknown; status: number; error?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) return { ok: false, data: null, status: res.status };
    const data = (await res.json()) as unknown;
    return { ok: true, data, status: res.status };
  } catch (err) {
    return {
      ok: false,
      data: null,
      status: 0,
      error: err instanceof Error ? err.message : "fetch failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

// ----- Commit mapping -----------------------------------------------------

type GhCommit = {
  sha: string;
  url: string;
  html_url: string;
  commit: { message: string; author: { name: string; email: string; date: string } };
};

type GhPushPayload = {
  push_id: number;
  ref: string;
  head: string;
  size: number;
  commits: GhCommit[];
};

export type Commit = {
  id: string;
  repo: string;
  message: string;
  url: string;
  sha7: string;
  timestamp: string;
  additions: number | null;
  deletions: number | null;
};

function isLikelyBotAuthor(name: string, email: string): boolean {
  // GitHub's bot authors carry the [bot] suffix in their display name and
  // a users.noreply.github.com email. The events API only gives us the
  // commit author (not the GitHub login), so this is a heuristic, not a
  // guarantee. The result is honest: real bot commits still come through
  // sometimes, and the user can curate later.
  if (name.endsWith("[bot]")) return true;
  if (name.toLowerCase().includes("github-actions")) return true;
  if (email.toLowerCase().endsWith("@users.noreply.github.com") && name.toLowerCase().includes("bot")) return true;
  return false;
}

function mapPushEvent(evt: {
  created_at: string;
  repo: { name: string };
  payload: unknown;
}): Commit[] {
  if (!evt || typeof evt !== "object") return [];
  const payload = evt.payload as GhPushPayload;
  if (!payload || !Array.isArray(payload.commits)) return [];
  const repo = evt.repo.name;
  return payload.commits
    .filter((c) => c && typeof c.sha === "string")
    .map<Commit>((c) => ({
      id: c.sha,
      repo,
      message: (c.commit.message ?? "").split("\n")[0] ?? "",
      url: c.html_url ?? c.url,
      sha7: c.sha.slice(0, 7),
      timestamp: c.commit.author?.date ?? evt.created_at,
      additions: null,
      deletions: null,
    }))
    .filter((c) => {
      // Reconstruct the author info for filtering.
      const matched = payload.commits.find((p) => p.sha === c.id);
      if (!matched) return true;
      return !isLikelyBotAuthor(matched.commit.author.name, matched.commit.author.email);
    });
}

export type CommitsResponse = {
  commits: Commit[];
  fetchedAt: string;
  cached: boolean;
  fallback?: boolean;
  /** Why the feed is showing fallback UI. */
  reason?: "rate_limited" | "error" | "empty";
  /** When GitHub's rate limit resets, as a Unix timestamp (seconds). */
  resetAt?: number;
  error?: string;
};

export type StatsResponse = {
  stars: number | null;
  publicRepos: number | null;
  fetchedAt: string;
  cached: boolean;
  fallback?: boolean;
};

export async function GET(req: NextRequest) {
  const limit = commitLimiter(getClientIp(req));
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSec) },
      },
    );
  }
  const wantStats = req.nextUrl.searchParams.get("stats") === "1";
  if (wantStats) return getStats();
  return getCommits();
}

async function getCommits() {
  const fetchedAt = new Date().toISOString();

  // 1) Try the events feed first — it's cheap and gives us multiple
  //    commits per push.
  const eventsRes = await safeFetch(
    EVENTS_URL,
    { headers: GH_HEADERS, next: { revalidate: REVALIDATE_EVENTS } },
    6000,
  );

  // Rate-limited: surface that to the UI with a reset time.
  if (!eventsRes.ok && eventsRes.status === 403) {
    return NextResponse.json<CommitsResponse>(
      {
        commits: [],
        fetchedAt,
        cached: false,
        fallback: true,
        reason: "rate_limited",
        error: "rate-limited",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": `public, s-maxage=60, stale-while-revalidate=30`,
        },
      },
    );
  }

  if (eventsRes.ok) {
    const events =
      (eventsRes.data as Array<{
        type: string;
        created_at: string;
        repo: { name: string };
        payload: unknown;
      }>) ?? [];

    const pushEvents = events.filter((e) => e && e.type === "PushEvent");

    // Newest first: events are newest-first, but commits inside a push
    // are oldest-first. Reverse each, then global-sort by timestamp.
    const fromEvents: Commit[] = pushEvents
      .flatMap((e) => mapPushEvent(e).reverse())
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

    if (fromEvents.length > 0) {
      return NextResponse.json<CommitsResponse>(
        { commits: fromEvents.slice(0, 10), fetchedAt, cached: false },
        {
          status: 200,
          headers: {
            "Cache-Control": `public, s-maxage=${REVALIDATE_EVENTS}, stale-while-revalidate=60`,
          },
        },
      );
    }

    // Events endpoint returned OK but with no push events. This is the
    // "haven't pushed in 90 days" case. Fall through to per-repo fetch.
  }

  // 2) Fall back to the most recent commit per public repo. This catches
  //    accounts with no recent activity in the events window but with
  //    recent commits in their repos.
  const reposRes = await safeFetch(
    REPOS_URL,
    { headers: GH_HEADERS, next: { revalidate: REVALIDATE_REPOS } },
    6000,
  );

  if (reposRes.ok) {
    const repos =
      (reposRes.data as Array<{ name: string; fork?: boolean }>) ?? [];
    const ownRepos = repos
      .filter((r) => r && r.name && !r.fork)
      .slice(0, 8); // cap fan-out — we only need 10 commits total

    // Fetch latest commit for each repo in parallel.
    const perRepo = await Promise.all(
      ownRepos.map((r) =>
        safeFetch(
          `https://api.github.com/repos/${GITHUB_USER}/${r.name}/commits?per_page=1`,
          { headers: GH_HEADERS, next: { revalidate: REVALIDATE_COMMITS } },
          4000,
        ).then((res) => {
          if (!res.ok) return null;
          const arr = res.data as Array<{
            sha: string;
            html_url: string;
            commit: { message: string; author: { name: string; email: string; date: string } };
          }>;
          const c = arr?.[0];
          if (!c) return null;
          return {
            id: c.sha,
            repo: r.name,
            message: (c.commit.message ?? "").split("\n")[0] ?? "",
            url: c.html_url,
            sha7: c.sha.slice(0, 7),
            timestamp: c.commit.author?.date ?? new Date().toISOString(),
            additions: null,
            deletions: null,
          } as Commit;
        }),
      ),
    );

    const commits = perRepo
      .filter((c): c is Commit => c !== null)
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
      .slice(0, 10);

    if (commits.length > 0) {
      return NextResponse.json<CommitsResponse>(
        { commits, fetchedAt, cached: false },
        {
          status: 200,
          headers: {
            "Cache-Control": `public, s-maxage=${REVALIDATE_EVENTS}, stale-while-revalidate=60`,
          },
        },
      );
    }

    // Events empty + per-repo empty = genuinely no public commits.
    return NextResponse.json<CommitsResponse>(
      {
        commits: [],
        fetchedAt,
        cached: false,
        fallback: true,
        reason: "empty",
      },
      { status: 200 },
    );
  }

  // 3) Both endpoints failed. Generic error fallback.
  return NextResponse.json<CommitsResponse>(
    {
      commits: [],
      fetchedAt,
      cached: false,
      fallback: true,
      reason: "error",
      error: `http_${reposRes.status || eventsRes.status || 0}`,
    },
    { status: 200 },
  );
}

async function getStats() {
  const res = await safeFetch(
    REPOS_URL,
    { headers: GH_HEADERS, next: { revalidate: REVALIDATE_STATS } },
    8000,
  );

  const fetchedAt = new Date().toISOString();

  if (!res.ok) {
    return NextResponse.json<StatsResponse>(
      { stars: null, publicRepos: null, fetchedAt, cached: false, fallback: true },
      { status: 200 },
    );
  }

  const repos = (res.data as Array<{ stargazers_count?: number; fork?: boolean; public?: boolean }>) ?? [];
  // Don't count forks — only stars on your own projects.
  const stars = repos
    .filter((r) => !r.fork)
    .reduce((acc, r) => acc + (typeof r.stargazers_count === "number" ? r.stargazers_count : 0), 0);
  // Count public non-fork repos. (The owner listing returns public repos;
  // a future-proofing check on `public` keeps the math honest if GitHub
  // changes the listing semantics.)
  const publicRepos = repos.filter((r) => !r.fork && r.public !== false).length;

  return NextResponse.json<StatsResponse>(
    { stars, publicRepos, fetchedAt, cached: false },
    {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_STATS}, stale-while-revalidate=120`,
      },
    },
  );
}
