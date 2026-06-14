"use client";

import { motion } from "framer-motion";
import { MaetMockup } from "./mockups/maet-mockup";
import { LumintMockup } from "./mockups/lumint-mockup";
import { FincalcMockup } from "./mockups/fincalc-mockup";

type Project = {
  name: string;
  subtitle: string;
  oneLiner: string;
  bullets: ReadonlyArray<string>;
  stack: ReadonlyArray<string>;
  github: string;
  live: { label: string; href: string };
  Mockup: React.ComponentType;
};

const PROJECTS: ReadonlyArray<Project> = [
  {
    name: "MAET",
    subtitle: "Market Analytics & Execution Terminal",
    oneLiner:
      "A real-time NSE trading terminal with WebSocket tick streaming and a paper-trading workflow I actually use to test my own strategies.",
    bullets: [
      "7 modules — trade, markets, charts, portfolio, strategy, risk, journal",
      "5 technical indicators — VWAP, EMA, RSI, MACD, Bollinger Bands",
      "Candlestick pattern detection",
      "600+ automated tests, all green",
    ],
    stack: ["next.js 14", "typescript", "python", "fastapi", "websocket", "pandas"],
    github: "https://github.com/tanmay-alpha/maet",
    live: { label: "live", href: "#" },
    Mockup: MaetMockup,
  },
  {
    name: "Lumint",
    subtitle: "AI Fraud Intelligence Platform",
    oneLiner:
      "Cross-modal fraud detection that scores a document, a URL, and a UPI screenshot in one go — started at Canara Bank SuRaksha Hackathon 2.0.",
    bullets: [
      "4 modules — document forensics, phishing URL, UPI review, fraud clustering",
      "Groq LLaMA 3.3 70B for natural-language fraud explanations",
      "OCR-based extraction, URL risk scoring, QR parsing",
      "Cross-modal risk-fusion engine for unified threat scoring",
    ],
    stack: ["python", "fastapi", "next.js", "typescript", "groq (llama 3.3 70b)", "ocr", "opencv"],
    github: "https://github.com/tanmay-alpha/lumint",
    live: { label: "live", href: "#" },
    Mockup: LumintMockup,
  },
  {
    name: "FinCalc India",
    subtitle: "Financial Calculator Suite for Indian Users",
    oneLiner:
      "Six calculators and an old-vs-new tax regime comparison, deployed and serving real users — built because I was tired of bad Indian finance sites.",
    bullets: [
      "6 calculators — SIP, EMI, FD, PPF, Lumpsum, Income Tax FY 2024-25",
      "Old vs new tax regime comparison",
      "Zod-validated REST APIs, Google OAuth via NextAuth v5",
      "Deployed on Vercel with PostgreSQL + Prisma",
    ],
    stack: ["next.js 14", "typescript", "tailwind", "postgresql", "prisma", "nextauth v5"],
    github: "https://github.com/tanmay-alpha/fincalc-india",
    live: { label: "live", href: "https://fincalc-india.vercel.app" },
    Mockup: FincalcMockup,
  },
];

export function WorkSection() {
  return (
    <section
      id="work"
      className="relative w-full border-t border-white/[0.06] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        {/* Section header */}
        <div className="grid-12 mb-16 md:mb-24">
          <div className="col-span-12 md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              Work
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
              Selected work.
            </motion.h2>
          </div>
        </div>

        {/* Projects */}
        <div className="space-y-24 md:space-y-32">
          {PROJECTS.map((project, i) => (
            <ProjectSpread key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSpread({ project, index }: { project: Project; index: number }) {
  const { Mockup } = project;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid-12 gap-y-10"
    >
      {/* Text: cols 1-5 */}
      <div className="col-span-12 md:col-span-5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
          0{index + 1}
        </span>
        <h3 className="mt-4 font-serif italic text-5xl font-normal text-zinc-100 text-balance md:text-6xl">
          <span aria-hidden className="mr-2 text-accent">—</span>
          {project.name}
        </h3>
        <p className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-500">
          {project.subtitle}
        </p>
        <p className="mt-6 max-w-md text-base leading-relaxed text-zinc-300 text-pretty">
          {project.oneLiner}
        </p>
        <ul className="mt-8 space-y-2 font-mono text-xs text-zinc-400">
          {project.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span aria-hidden className="text-zinc-600">·</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {/* Stack tags */}
        <div className="mt-8 flex flex-wrap gap-1.5">
          {project.stack.map((tag) => (
            <span
              key={tag}
              className="rounded border border-zinc-800 bg-surface px-2.5 py-1 font-mono text-[10px] lowercase text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="mt-8 flex items-center gap-6 font-mono text-xs text-zinc-300">
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
          >
            [ github → ]
          </a>
          <a
            href={project.live.href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
          >
            [ {project.live.label} → ]
          </a>
        </div>
      </div>

      {/* Mockup: cols 7-12 */}
      <div className="col-span-12 md:col-span-6 md:col-start-7">
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-surface">
          <Mockup />
        </div>
      </div>
    </motion.article>
  );
}
