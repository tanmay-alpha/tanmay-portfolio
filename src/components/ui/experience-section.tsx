"use client";

import { motion, useReducedMotion } from "framer-motion";

type Experience = {
  company: string;
  role: string;
  dates: string;
  bullets: ReadonlyArray<string>;
};

const EXPERIENCE: ReadonlyArray<Experience> = [
  {
    company: "TradeVed Fintech Labs",
    role: "Quantitative Research Intern (remote)",
    dates: "Jun 2026 — Jul 2026",
    bullets: [
      "Worked on the stock screener's filter logic, data validation and UI workflows",
      "Backtested systematic strategies on historical NSE data in Python and Pandas",
    ],
  },
  {
    company: "Dynamic Bubble",
    role: "Web Developer Intern (remote)",
    dates: "May 2026 — Present",
    bullets: [
      "Built and deployed the company's website (dynamicbubble.agency) from scratch with React, Node.js and MongoDB",
      "Keep shipping features, UI improvements and performance work on the live site",
    ],
  },
  {
    company: "Shipd by Datacurve",
    role: "AI training data contributor",
    dates: "May 2026 — Present",
    bullets: [
      "Designed 10+ coding challenges for Shipd's AI training pipeline (details confidential)",
    ],
  },
];

export function ExperienceSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="experience"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-12 gap-y-8 md:mb-16">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-3">
            <span className="eyebrow">Professional experience</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4, margin: "0px 0px -40px 0px" }}
              transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading"
            >
              Where I&apos;ve worked.
            </motion.h2>
          </div>
        </div>

        <div className="grid-12">
          <div className="col-span-12 md:col-span-10 md:col-start-3">
            <motion.ol
              className="experience-list"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1, margin: "0px 0px -40px 0px" }}
              variants={{
                hidden: {},
                show: {
                  transition: reduced
                    ? { staggerChildren: 0 }
                    : { staggerChildren: 0.1, delayChildren: 0.05 },
                },
              }}
            >
              {EXPERIENCE.map((entry) => (
                <motion.li
                  key={entry.company}
                  className="experience-item"
                  variants={{
                    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
                    },
                  }}
                >
                  <h3 className="experience-company">{entry.company}</h3>
                  <p className="experience-role">{entry.role}</p>
                  <p className="experience-date">{entry.dates}</p>
                  <ul className="experience-bullets">
                    {entry.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </motion.li>
              ))}
            </motion.ol>

            <motion.div
              className="mt-16 border-t border-border pt-8"
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
              transition={reduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="eyebrow">Independent technical contributions</p>
              <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-text-1">
                Alongside internships, I take on paid AI-evaluation and
                data-quality assignments as an independent contributor through
                Shipd, Outlier, Turing, Meera and DataAnnotation. These are
                contractor-style tasks, not employment with those platforms,
                and the client work is confidential, so I don&apos;t describe
                specifics.
              </p>
              <p className="mt-6 eyebrow">Working toward</p>
              <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-text-1">
                Internships and roles in AI/ML or full-stack engineering where
                correctness matters — financial systems, evaluation tooling,
                products people depend on.
              </p>
            </motion.div>

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
