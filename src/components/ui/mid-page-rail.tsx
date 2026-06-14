"use client";

import type { ReactNode } from "react";
import { CommitFeed } from "@/components/ui/commit-feed";

/**
 * MidPageRail — wraps the Work / More Work / Experience sections. The
 * right column holds a sticky commit feed that stays visible while the
 * user scrolls through those sections. Hero, Contact, and Footer sit
 * outside this rail, so the feed does not appear there.
 *
 * Layout: a flex row. Children flow on the left, the commit feed is a
 * fixed-width sticky aside on the right (hidden on smaller viewports).
 */
export function MidPageRail({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1">{children}</div>
          <aside
            aria-label="Live GitHub commit feed"
            className="hidden w-[240px] shrink-0 lg:block"
          >
            <div className="sticky top-24">
              <CommitFeed />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
