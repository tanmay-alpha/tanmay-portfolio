"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import nowData from "@/data/now.json";
import { relativeTime } from "./commit-feed";

/**
 * NOW content block — lives INSIDE the About section, not as fixed chrome.
 * No parallax, no intersection observer. Just a styled content card.
 */
export function NowSidebar() {
  const reduced = useReducedMotion();
  const [hoverDot, setHoverDot] = useState(false);

  return (
    <div
      aria-label="What I'm working on now"
      className="rounded-lg border border-white/[0.06] bg-[#0F0F0F] p-6"
    >
      <div className="flex items-center gap-2">
        <span
          onMouseEnter={() => setHoverDot(true)}
          onMouseLeave={() => setHoverDot(false)}
          className="relative flex items-center"
        >
          <motion.span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]"
            animate={
              reduced
                ? { opacity: 0.7 }
                : { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }
            }
            transition={
              reduced
                ? undefined
                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
            }
          />
          {hoverDot && (
            <span
              role="tooltip"
              className="absolute left-4 top-0 z-10 whitespace-nowrap rounded border border-white/[0.08] bg-bg px-2 py-1 font-mono text-[10px] text-zinc-300"
            >
              Last updated: {relativeTime(nowData.updatedAt)}
            </span>
          )}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          NOW
        </span>
      </div>

      <ul className="mt-5 space-y-4">
        {nowData.items.map((item) => (
          <li key={item.label}>
            <p className="font-mono text-[10px] text-zinc-500">{item.date}</p>
            <p className="mt-1 font-sans text-[13px] leading-snug text-zinc-200">
              {item.label}
              {item.href && (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex align-baseline text-zinc-500 transition-colors duration-150 hover:text-accent"
                  aria-label={`Open ${item.label}`}
                >
                  <ArrowUpRight className="inline h-3 w-3" />
                </a>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
