"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

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
      "Backtested systematic NSE strategies in Python with Pandas; iterated on filters and risk logic",
      "Built data validation + filter pipeline for TradeVed's stock screener (live in production)",
    ],
  },
  {
    company: "Dynamic Bubble",
    role: "Web Developer Intern",
    dates: "May 2026 — Present",
    bullets: [
      "Built and shipped dynamicbubble.agency from scratch — service pages, questionnaire flows, consultation forms",
      "React, Node.js, MongoDB, deployed on Vercel",
    ],
  },
  {
    company: "Shipd by Datacurve (YC W24)",
    role: "AI Training Data Contributor",
    dates: "May 2026 — Present",
    bullets: [
      "Designed 10+ coding challenges for LLM training",
      "Built a 'challenge-authoring' workflow inside ai-workspace — used it to ship the Shipd challenges faster",
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
      "First-year hire, ran ops for 2 flagship events",
    ],
  },
];

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    targets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-12 gap-y-8 md:mb-16">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-3">
            <span className="eyebrow">Where I&apos;ve worked</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading"
            >
              Experience
            </motion.h2>
          </div>
        </div>

        <div className="grid-12">
          <div className="col-span-12 md:col-span-10 md:col-start-3">
            <ol className="experience-list">
              {EXPERIENCE.map((entry) => (
                <li
                  key={entry.company}
                  data-reveal
                  className="experience-item"
                >
                  <h3 className="experience-company">{entry.company}</h3>
                  <p className="experience-role">{entry.role}</p>
                  <p className="experience-date">{entry.dates}</p>
                  <ul className="experience-bullets">
                    {entry.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>

            <div data-reveal className="mt-16 border-t border-border pt-8">
              <p className="eyebrow">Working toward</p>
              <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-text-1">
                An AI/ML or full-stack role at a company where the engineering
                moves money or moves people. I&apos;m strongest when the work
                has real consequences — backtests that risk real P&amp;L, fraud
                systems that block real attacks, products real users depend on.
              </p>
            </div>

            <div className="mt-10">
              <a
                href="/resume.pdf"
                className="font-mono text-xs text-text-2 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:text-text-1 hover:decoration-accent"
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
