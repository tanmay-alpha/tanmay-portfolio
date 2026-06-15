"use client";

import { useEffect, useState } from "react";
import { LastUpdated } from "@/components/ui/last-updated";

export function Footer() {
  const [views, setViews] = useState<number | null>(null);

  // If Plausible is configured AND the user has visited the site, pull the
  // aggregate pageviews. Falls back silently if anything fails.
  useEffect(() => {
    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (!domain) return;
    let cancelled = false;
    fetch(`https://plausible.io/api/v1/stats/aggregate?site_id=${domain}&period=month&metrics=visitors`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { results?: { visitors?: { value?: number } } } | null) => {
        if (cancelled) return;
        const v = data?.results?.visitors?.value;
        if (typeof v === "number") setViews(v);
      })
      .catch(() => {
        // Ignore — badge just won't show.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="relative w-full border-t border-border py-12">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8 text-center">
        <p className="font-mono text-[11px] text-text-3">
          Tanmay Mangal · VIT Bhopal · 2026
          <LastUpdated />
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 font-mono text-[10px] text-text-3">
          <a
            href="#top"
            className="text-text-2 transition-colors duration-200 hover:text-text-1"
          >
            ↑ back to top
          </a>
          {views !== null && (
            <>
              <span aria-hidden>·</span>
              <span>{views.toLocaleString()} views this month</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
