"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type LeetCodeResponse = {
  totalSolved: number | null;
  easySolved: number | null;
  mediumSolved: number | null;
  hardSolved: number | null;
  ranking: number | null;
  fetchedAt: string;
  fallback: boolean;
};

const HARDCODED_FALLBACK = "100+";

export function AboutSection() {
  const [lc, setLc] = useState<LeetCodeResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/leetcode")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: LeetCodeResponse | null) => {
        if (cancelled) return;
        if (data) setLc(data);
      })
      .catch(() => {
        if (!cancelled) setLc({
          totalSolved: null,
          easySolved: null,
          mediumSolved: null,
          hardSolved: null,
          ranking: null,
          fetchedAt: new Date().toISOString(),
          fallback: true,
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const leetCodeDisplay =
    lc?.totalSolved !== null && lc?.totalSolved !== undefined
      ? lc.totalSolved.toString()
      : HARDCODED_FALLBACK;

  return (
    <section
      id="about"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-6">
            <span className="eyebrow">About</span>
          </div>

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

            <a
              href="/resume.pdf"
              className="mt-10 inline-block font-mono text-xs text-text-2 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:text-text-1 hover:decoration-accent"
            >
              [ read the resume → ]
            </a>
          </motion.div>
        </div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="mt-20 grid grid-cols-2 gap-y-10 md:grid-cols-4 md:gap-y-0"
        >
          <StatTile value="8.49" label="CGPA / 10" suffix="" />
          <StatTile value="6" label="Public repos" suffix="" />
          <StatTile value="600+" label="Tests written" suffix="" />
          <StatTile
            value={leetCodeDisplay}
            label="LeetCode solved"
            breakdown={
              lc &&
              !lc.fallback &&
              lc.easySolved !== null &&
              lc.mediumSolved !== null &&
              lc.hardSolved !== null
                ? `E:M:H = ${lc.easySolved}:${lc.mediumSolved}:${lc.hardSolved}`
                : null
            }
          />
        </motion.div>
      </div>
    </section>
  );
}

function StatTile({
  value,
  label,
  breakdown,
}: {
  value: string;
  label: string;
  suffix?: string;
  breakdown?: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-text-1"
        style={{
          fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
          fontStyle: "italic",
          fontWeight: 300,
          fontSize: "56px",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
      <span
        className="font-mono uppercase text-text-3"
        style={{ fontSize: "10px", letterSpacing: "0.18em" }}
      >
        {label}
      </span>
      {breakdown && (
        <span
          className="text-text-3"
          style={{ fontSize: "12px", fontFamily: "var(--font-inter-tight), system-ui, sans-serif" }}
        >
          {breakdown}
        </span>
      )}
    </div>
  );
}
