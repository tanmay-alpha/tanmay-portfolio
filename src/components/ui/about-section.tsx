"use client";

import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          {/* Left col: section label */}
          <div className="col-span-12 md:col-span-2 flex flex-col gap-6">
            <span className="eyebrow">About</span>
          </div>

          {/* Right col: body */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-10"
          >
            <p className="max-w-3xl text-[20px] leading-[1.55] text-text-1 text-balance md:text-[22px]">
              I&apos;m Tanmay — B.Tech CSE at VIT Bhopal, building trading
              systems and AI tools. My work sits at the intersection of
              full-stack engineering, machine learning, and quant thinking —
              MAET is a real-time NSE terminal I built to scratch my own itch,
              Lumint is an AI fraud platform from a hackathon, and FinCalc is
              what happens when a bored engineer turns Indian income tax law
              into a weekend project. I trade on Zerodha, ship in public, and
              I&apos;m always open to AI/ML or full-stack roles that actually
              move money.
            </p>

            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-text-2 text-pretty md:text-base">
              I got into programming because I wanted to understand how markets
              work. That curiosity led to trading on Zerodha, then to building
              tools I couldn&apos;t find, then to machine learning because the
              questions kept getting harder. Most of my work right now is at the
              intersection of financial data and intelligent systems.
            </p>

            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-text-2 text-pretty md:text-base">
              Outside of code: I&apos;m genuinely obsessed with food — cooking
              it, finding it in new cities, thinking about it too much. I travel
              when I can. I think staying curious about everything makes you a
              better engineer.
            </p>

            {/* Resume link */}
            <a
              href="/resume.pdf"
              className="mt-10 inline-block font-mono text-xs text-text-2 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:text-text-1 hover:decoration-accent"
            >
              [ read the resume → ]
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
