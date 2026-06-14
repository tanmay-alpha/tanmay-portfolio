"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Github } from "lucide-react";

const REVALIDATE_MS = 5 * 60 * 1000;
const MAX_VISIBLE = 8;

type Commit = {
  id: string;
  repo: string;
  message: string;
  url: string;
  sha7: string;
  timestamp: string;
  additions: number | null;
  deletions: number | null;
};

type CommitsResponse = {
  commits: Commit[];
  fetchedAt: string;
  cached: boolean;
  fallback?: boolean;
  error?: string;
};

type FeedState = {
  status: "loading" | "ready" | "fallback";
  commits: Commit[];
  fetchedAt: string | null;
};

async function fetchCommits(): Promise<FeedState> {
  try {
    const res = await fetch("/api/commits", { cache: "no-store" });
    if (!res.ok) throw new Error(`http_${res.status}`);
    const data = (await res.json()) as CommitsResponse;
    if (data.fallback) {
      return { status: "fallback", commits: [], fetchedAt: data.fetchedAt ?? null };
    }
    return {
      status: "ready",
      commits: data.commits ?? [],
      fetchedAt: data.fetchedAt ?? null,
    };
  } catch {
    return { status: "fallback", commits: [], fetchedAt: null };
  }
}

// ----- Sidebar (desktop) --------------------------------------------------

export function CommitFeedSidebar() {
  const [feed, setFeed] = useState<FeedState>({ status: "loading", commits: [], fetchedAt: null });
  const [open, setOpen] = useState(false);
  const [heroInView, setHeroInView] = useState(true);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // Subtle parallax: lifts up as the user scrolls, so the feed never
  // visually overlaps section content.
  const y = useTransform(scrollY, [0, 800], [0, reduced ? 0 : -24]);

  // Watch the hero — hide the sidebar whenever the hero occupies the
  // viewport so it never sits on top of the photo.
  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setHeroInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await fetchCommits();
      if (!cancelled) setFeed(next);
    };
    void load();
    const id = setInterval(load, REVALIDATE_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <motion.aside
      aria-label="Live GitHub commit feed"
      className="pointer-events-none fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      style={{ y, opacity: heroInView ? 0 : 1 }}
    >
      <div
        className="pointer-events-auto w-[260px] rounded-l-md border-l border-white/5 p-4 backdrop-blur-md"
        style={{ backgroundColor: "rgba(17,17,17,0.6)" }}
      >
        <FeedHeader
          status={feed.status}
          count={feed.commits.length}
          onOpenMobile={() => setOpen(true)}
          hidePill
        />
        <FeedList commits={feed.commits} status={feed.status} />
        {feed.status === "ready" && feed.commits.length > MAX_VISIBLE && (
          <a
            href="https://github.com/tanmay-alpha?tab=overview"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block font-mono text-[10px] text-zinc-500 transition-colors duration-150 hover:text-zinc-300"
          >
            + {feed.commits.length - MAX_VISIBLE} more →
          </a>
        )}
      </div>

      {/* Mobile bottom sheet — same data, opened by the nav pill. */}
      <AnimatePresence>
        {open && (
          <CommitSheet onClose={() => setOpen(false)} feed={feed} />
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

// ----- Nav pill (mobile) --------------------------------------------------

export function CommitFeedPill() {
  const [feed, setFeed] = useState<FeedState>({ status: "loading", commits: [], fetchedAt: null });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await fetchCommits();
      if (!cancelled) setFeed(next);
    };
    void load();
    const id = setInterval(load, REVALIDATE_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open shipping feed"
        className="flex md:hidden h-9 items-center gap-2 rounded-md border border-zinc-800 bg-transparent px-3 text-zinc-400 transition-colors duration-200 hover:border-zinc-700 hover:text-zinc-100"
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
        <span className="font-mono text-[10px] uppercase tracking-widest">Shipping</span>
      </button>
      <AnimatePresence>
        {open && <CommitSheet onClose={() => setOpen(false)} feed={feed} />}
      </AnimatePresence>
    </>
  );
}

// ----- Pieces -------------------------------------------------------------

function FeedHeader({
  status,
  count,
  onOpenMobile,
  hidePill,
}: {
  status: FeedState["status"];
  count: number;
  onOpenMobile: () => void;
  hidePill?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
        <motion.span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]"
          animate={reduced ? { opacity: 0.7 } : { opacity: [0.3, 1, 0.3] }}
          transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {status === "fallback" ? "Feed paused" : "Shipping now"}
      </span>
      {status === "ready" && (
        <span className="font-mono text-[10px] text-zinc-500">{count}</span>
      )}
      {!hidePill && (
        <button
          onClick={onOpenMobile}
          className="ml-2 font-mono text-[10px] text-zinc-500 hover:text-zinc-300"
        >
          open
        </button>
      )}
    </div>
  );
}

function FeedList({ commits, status }: { commits: Commit[]; status: FeedState["status"] }) {
  if (status === "fallback") {
    return (
      <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
        ● Feed temporarily unavailable — refresh in a few minutes
      </p>
    );
  }
  if (status === "loading" || commits.length === 0) {
    return (
      <p className="font-mono text-[11px] leading-relaxed text-zinc-500">
        ● Waiting for first commit…
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {commits.slice(0, MAX_VISIBLE).map((c) => (
        <li key={c.id}>
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-sm border-l border-transparent px-2 py-1.5 transition-all duration-150 hover:border-[#D97757] hover:bg-white/[0.04]"
          >
            <span className="block font-mono text-[11px] text-zinc-300 group-hover:text-zinc-100">
              {c.repo}
            </span>
            <span className="mt-0.5 block font-sans text-[13px] leading-snug text-zinc-100 group-hover:text-[#FAFAF7]">
              {truncate(c.message, 60)}
            </span>
            <span className="mt-0.5 flex items-center justify-between font-mono text-[10px] text-zinc-500">
              <span>{relativeTime(c.timestamp)}</span>
              <span>{c.sha7}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function CommitSheet({ onClose, feed }: { onClose: () => void; feed: FeedState }) {
  const reduced = useReducedMotion();
  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="Live GitHub commit feed"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-zinc-800 bg-bg p-5 md:hidden"
        initial={reduced ? false : { y: "100%" }}
        animate={reduced ? { y: 0 } : { y: 0 }}
        exit={reduced ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-800" aria-hidden />
        <FeedHeader
          status={feed.status}
          count={feed.commits.length}
          onOpenMobile={onClose}
          hidePill
        />
        <FeedList commits={feed.commits} status={feed.status} />
        <a
          href="https://github.com/tanmay-alpha?tab=overview"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 font-mono text-xs text-zinc-300 transition-colors duration-150 hover:text-zinc-100"
        >
          <Github className="h-3.5 w-3.5" /> View activity on GitHub →
        </a>
      </motion.div>
    </>
  );
}

// ----- Helpers ------------------------------------------------------------

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1).trimEnd() + "…";
}

export function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
