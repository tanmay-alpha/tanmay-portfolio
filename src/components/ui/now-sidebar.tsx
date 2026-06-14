"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import nowData from "@/data/now.json";
import { relativeTime } from "./commit-feed";

export function NowSidebar() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, reduced ? 0 : -20]);
  const [hoverDot, setHoverDot] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  // Hide while the hero occupies the viewport so the sidebar never
  // overlaps the name/role/photo.
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

  return (
    <motion.aside
      aria-label="What I'm working on now"
      style={{ y, opacity: heroInView ? 0 : 1 }}
      className="pointer-events-none fixed left-0 top-1/2 z-30 hidden w-[220px] -translate-y-1/2 lg:block"
    >
      <div className="pointer-events-auto ml-6 border-l border-white/[0.06] pl-4">
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
                className="absolute left-4 top-0 whitespace-nowrap rounded border border-white/[0.08] bg-bg px-2 py-1 font-mono text-[10px] text-zinc-300"
              >
                Last updated: {relativeTime(nowData.updatedAt)}
              </span>
            )}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            NOW
          </span>
        </div>

        <ul className="mt-4 space-y-4">
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
                    className="ml-1 text-zinc-500 transition-colors duration-150 hover:text-accent"
                  >
                    <ArrowUpRight className="inline h-3 w-3" />
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            LOOKING FOR
          </p>
          <p className="mt-2 font-sans text-[12px] leading-relaxed text-zinc-300">
            AI/ML or full-stack roles @ fintech, trading, or YC-stage. Open to
            internships (Fall 2026) and full-time (post-grad).
          </p>
          <a
            href="#contact"
            className="mt-3 inline-block font-mono text-[11px] text-zinc-300 transition-colors duration-200 hover:text-accent"
          >
            [ get in touch → ]
          </a>
        </div>
      </div>
    </motion.aside>
  );
}
