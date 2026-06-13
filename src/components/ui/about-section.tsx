"use client";

import { motion } from "framer-motion";

const STATS = [
  { label: "CGPA", value: "8.49", suffix: "/ 10" },
  { label: "Active projects", value: "3", suffix: "" },
  { label: "GitHub stars", value: "—", suffix: "" },
  { label: "Years trading", value: "2", suffix: "" },
] as const;

export function AboutSection() {
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
              {STATS.map((stat) => (
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

            {/* "Currently" timestamp */}
            <p className="mt-12 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Written 14 June 2026 · Updated weekly
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
