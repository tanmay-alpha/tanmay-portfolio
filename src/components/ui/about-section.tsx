"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type StatsResponse = {
  stars: number | null;
  fetchedAt: string;
  cached: boolean;
  fallback?: boolean;
};

type Commit = { id: string; timestamp: string };

type CommitsResponse = {
  commits: Commit[];
  fetchedAt: string;
  cached: boolean;
  fallback?: boolean;
};

const STATS_TEMPLATE = [
  { label: "CGPA", suffix: "/ 10" },
  { label: "Active projects", suffix: "" },
  { label: "GitHub stars", suffix: "" },
  { label: "Years trading", suffix: "" },
] as const;

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "—";
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function AboutSection() {
  const [stars, setStars] = useState<number | null>(null);
  const [lastCommit, setLastCommit] = useState<{ iso: string; live: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      try {
        const res = await fetch("/api/commits?stats=1", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as StatsResponse;
        if (!cancelled && data.stars !== null) setStars(data.stars);
      } catch {
        // Quiet degradation.
      }
    };
    const loadCommits = async () => {
      try {
        const res = await fetch("/api/commits", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as CommitsResponse;
        if (cancelled) return;
        if (!data.fallback && data.commits[0]) {
          setLastCommit({ iso: data.commits[0].timestamp, live: true });
        }
      } catch {
        if (cancelled) return;
        setLastCommit({ iso: "", live: false });
      }
    };
    void loadStats();
    void loadCommits();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = STATS_TEMPLATE.map((s) => {
    if (s.label === "GitHub stars") {
      return { ...s, value: stars === null ? "—" : stars.toString() };
    }
    if (s.label === "CGPA") return { ...s, value: "8.49" };
    if (s.label === "Active projects") return { ...s, value: "3" };
    return { ...s, value: "2" }; // Years trading
  });

  return (
    <section
      id="about"
      className="relative w-full border-t border-zinc-800 py-24 md:py-32"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          {/* Left col: section index */}
          <div className="col-span-12 md:col-span-2 flex flex-col gap-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              About
            </span>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif italic text-7xl font-light text-zinc-700 md:text-8xl"
            >
              01
            </motion.span>
          </div>

          {/* Right col: body */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-10"
          >
            <p className="max-w-3xl font-serif text-2xl font-light italic leading-snug text-zinc-100 text-pretty md:text-3xl">
              I&apos;m Tanmay — a 2nd-year CS undergrad at VIT Bhopal, currently building
              trading systems by day and AI tools by night.
            </p>

            <p className="mt-8 max-w-2xl text-base leading-relaxed text-zinc-300 text-pretty md:text-lg">
              My work lives at the intersection of full-stack engineering, machine learning,
              and quant thinking — <span className="text-paper">MAET</span> is a real-time NSE
              terminal I built to scratch my own itch, <span className="text-paper">Lumint</span>{" "}
              is an AI fraud platform I started at a hackathon, and <span className="text-paper">FinCalc</span>{" "}
              is what happens when a bored engineer turns Indian income tax law into a weekend
              project. I trade on Zerodha, ship in public, and I&apos;m always open to AI/ML
              or full-stack roles that actually move money.
            </p>

            {/* Stats */}
            <dl className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="border-t border-zinc-800 pt-4">
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {stat.label}
                  </dt>
                  <dd className="mt-2 font-mono text-2xl text-zinc-100">
                    {stat.value}
                    {stat.suffix && (
                      <span className="ml-1 text-sm text-zinc-500">{stat.suffix}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Live last-commit timestamp */}
            <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {lastCommit && lastCommit.iso ? (
                <>
                  Last commit: {relativeTime(lastCommit.iso)}
                  {lastCommit.live && (
                    <span className="ml-2 text-accent">(live)</span>
                  )}
                </>
              ) : (
                <>Last updated: {formatDate(new Date())}</>
              )}
            </p>

            {/* Resume link */}
            <a
              href="/resume.pdf"
              className="mt-4 inline-block font-mono text-xs text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
            >
              [ read the resume → ]
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
