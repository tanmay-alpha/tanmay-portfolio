"use client";

import { useEffect, useState } from "react";

type CommitsResponse = {
  commits: Array<{ timestamp: string }>;
  fallback?: boolean;
  reason?: string;
};

function formatRelative(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const wk = Math.floor(day / 7);
  if (day < 30) return `${wk}w ago`;
  const mo = Math.floor(day / 30);
  if (day < 365) return `${mo}mo ago`;
  const yr = Math.floor(day / 365);
  return `${yr}y ago`;
}

export function LastUpdated() {
  const [label, setLabel] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    const tick = (timestamp: string) => {
      const then = new Date(timestamp).getTime();
      const update = () => {
        if (cancelled) return;
        const diff = Date.now() - then;
        setLabel(formatRelative(diff));
      };
      update();
      if (interval) clearInterval(interval);
      interval = setInterval(update, 60_000);
    };

    fetch("/api/commits")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CommitsResponse | null) => {
        if (cancelled) return;
        if (data && !data.fallback && data.commits && data.commits.length > 0) {
          setLive(true);
          const first = data.commits[0];
          if (first) tick(first.timestamp);
        } else {
          setLabel(null);
        }
      })
      .catch(() => {
        if (!cancelled) setLabel(null);
      });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, []);

  if (!label) return null;

  return (
    <span className="ml-1">
      {" "}· last commit {label}
      {live && (
        <span style={{ color: "#D97757" }}> (live)</span>
      )}
    </span>
  );
}
