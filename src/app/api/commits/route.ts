import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GITHUB_USER = "tanmay-alpha";
const EVENTS_URL = `https://api.github.com/users/${GITHUB_USER}/events/public`;
const REPOS_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&type=owner`;

// 5 min for events, 1 hr for stats. The route never 500s — it returns a
// { fallback: true, ... } payload on failure so the UI degrades quietly.
const REVALIDATE_EVENTS = 300;
const REVALIDATE_STATS = 3600;

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
  error?: string;
};

export type StatsResponse = {
  stars: number | null;
  fetchedAt: string;
  cached: boolean;
  fallback?: boolean;
};

export async function GET(req: NextRequest) {
  const wantStats = req.nextUrl.searchParams.get("stats") === "1";
  if (wantStats) return getStats();
  return getCommits();
}

async function getCommits() {
  const res = await safeFetch(
    EVENTS_URL,
    { headers: GH_HEADERS, next: { revalidate: REVALIDATE_EVENTS } },
    6000,
  );

  const fetchedAt = new Date().toISOString();

  if (!res.ok) {
    return NextResponse.json<CommitsResponse>(
      {
        commits: [],
        fetchedAt,
        cached: false,
        fallback: true,
        error: res.status === 403 ? "rate-limited" : `http_${res.status}`,
      },
      { status: 200 },
    );
  }

  const events =
    (res.data as Array<{
      type: string;
      created_at: string;
      repo: { name: string };
      payload: unknown;
    }>) ?? [];

  const pushEvents = events.filter((e) => e && e.type === "PushEvent");

  // Newest first: events are newest-first, but commits inside a push are
  // oldest-first. Reverse each, then global-sort by timestamp.
  const commits: Commit[] = pushEvents
    .flatMap((e) => mapPushEvent(e).reverse())
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 10);

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

async function getStats() {
  const res = await safeFetch(
    REPOS_URL,
    { headers: GH_HEADERS, next: { revalidate: REVALIDATE_STATS } },
    8000,
  );

  const fetchedAt = new Date().toISOString();

  if (!res.ok) {
    return NextResponse.json<StatsResponse>(
      { stars: null, fetchedAt, cached: false, fallback: true },
      { status: 200 },
    );
  }

  const repos = (res.data as Array<{ stargazers_count?: number; fork?: boolean }>) ?? [];
  // Don't count forks — only stars on your own projects.
  const stars = repos
    .filter((r) => !r.fork)
    .reduce((acc, r) => acc + (typeof r.stargazers_count === "number" ? r.stargazers_count : 0), 0);

  return NextResponse.json<StatsResponse>(
    { stars, fetchedAt, cached: false },
    {
      status: 200,
      headers: {
        "Cache-Control": `public, s-maxage=${REVALIDATE_STATS}, stale-while-revalidate=120`,
      },
    },
  );
}
