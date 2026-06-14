"use client";

import { motion } from "framer-motion";

type Experience = {
  company: string;
  role: string;
  dates: string;
  bullets: ReadonlyArray<string>;
};

const EXPERIENCE: ReadonlyArray<Experience> = [
  {
    company: "TradeVed Fintech Labs",
    role: "Quant ML Intern",
    dates: "Jun 2026 — Jul 2026",
    bullets: [
      "Backtesting systematic strategies on NSE data with Python and Pandas",
      "Building filter logic and data validation for TradeVed's stock screener",
    ],
  },
  {
    company: "Dynamic Bubble",
    role: "Web Developer Intern",
    dates: "May 2026 — Present",
    bullets: [
      "Built and deployed dynamicbubble.agency from scratch",
      "React, Node.js, MongoDB; shipped questionnaire flows, service pages, consultation forms",
    ],
  },
  {
    company: "Shipd by Datacurve (YC W24)",
    role: "AI Training Data Contributor",
    dates: "May 2026 — Present",
    bullets: [
      "Designed 10+ coding challenges for LLM training",
      "Shipd has paid out $2M+ to contributors",
    ],
  },
  {
    company: "Techfest IIT Bombay",
    role: "Campus Ambassador",
    dates: "May 2025 — Dec 2025",
    bullets: [
      "Top 4,000 of 50,000+ ambassadors nationwide",
      "Increased event registrations by 40% across 3 departments at VIT Bhopal",
    ],
  },
  {
    company: "ECell VIT Bhopal",
    role: "Operations",
    dates: "Nov 2024 — Dec 2025",
    bullets: [
      "Coordinated logistics for large-scale entrepreneurship events",
    ],
  },
];

export function ExperienceSection() {
  return (
    <section
      id="experience"
      className="relative w-full border-t border-white/[0.06] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        {/* Section header */}
        <div className="grid-12 mb-16 md:mb-20">
          <div className="col-span-12 md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              Experience
            </span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif italic text-display-md font-light text-paper"
            >
              Path.
            </motion.h2>
          </div>
        </div>

        {/* Timeline */}
        <div className="grid-12">
          <div className="col-span-12 md:col-span-10 md:col-start-3">
            <ol className="relative space-y-12">
              {/* Vertical line */}
              <span
                aria-hidden
                className="absolute left-0 top-2 bottom-2 w-px bg-zinc-800"
              />
              {EXPERIENCE.map((entry, i) => (
                <motion.li
                  key={entry.company}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative pl-8"
                >
                  {/* Dot */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 -translate-x-1/2 h-2 w-2 rounded-full bg-zinc-700 ring-4 ring-bg"
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-zinc-100">
                        {entry.company}
                      </h3>
                      <p className="text-sm italic text-zinc-400">{entry.role}</p>
                    </div>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {entry.dates}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-zinc-300">
                    {entry.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span aria-hidden className="text-zinc-600 shrink-0">·</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </ol>
            <div className="mt-12">
              <a
                href="/resume.pdf"
                className="font-mono text-xs text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
              >
                [ show full resume → ]
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
