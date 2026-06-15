"use client";

import { LastUpdated } from "@/components/ui/last-updated";

export function Footer() {

  return (
    <footer className="relative w-full border-t border-border py-16 md:py-20">
      {/* Top row: wordmark left, back-to-top right */}
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <span
            className="font-mono text-[11px] tracking-wide text-text-2"
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "18px",
              letterSpacing: "-0.01em",
            }}
          >
            Tanmay Mangal
          </span>
          <a
            href="#top"
            className="font-mono text-[11px] text-text-3 transition-colors duration-200 hover:text-text-1"
            style={{ minHeight: "44px", minWidth: "44px", display: "inline-flex", alignItems: "center" }}
          >
            ↑ back to top
          </a>
        </div>

        {/* Bottom row: meta line + sign-off */}
        <div className="mt-6 flex flex-col gap-3">
          <p className="font-mono text-[11px] text-text-3">
            VIT Bhopal · 2026
            <LastUpdated />
            <span className="mx-1.5">·</span>
            <a
              href="https://github.com/tanmay-alpha/tanmay-portfolio"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200 hover:text-text-1"
            >
              view source →
            </a>
          </p>
          <p
            className="font-mono text-[11px] text-text-3"
            style={{
              fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
              fontStyle: "italic",
              fontSize: "13px",
            }}
          >
            Thanks for reading. — Tanmay
          </p>
        </div>
      </div>
    </footer>
  );
}
