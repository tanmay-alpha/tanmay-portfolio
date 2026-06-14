"use client";

import { motion } from "framer-motion";

const PROJECTS = [
  {
    name: "AI Workspace",
    repo: "tanmay-alpha/-ai-workspace",
    href: "https://github.com/tanmay-alpha/-ai-workspace",
    description:
      "A modular workspace for running local LLMs and AI agents — my daily driver for experimenting with model orchestration.",
    stack: ["python", "langchain", "ollama", "mcp", "fastapi"],
  },
  {
    name: "AI Image Forensic Screener",
    repo: "tanmay-alpha/AI-Image-Forensic-Screener",
    href: "https://github.com/tanmay-alpha/AI-Image-Forensic-Screener",
    description:
      "Detects deepfakes and image manipulation — ELA, noise analysis, and metadata forensics in one pipeline.",
    stack: ["python", "opencv", "pytorch", "fastapi", "next.js"],
  },
] as const;

export function MoreWorkSection() {
  return (
    <section
      id="more-work"
      className="relative w-full border-t border-white/[0.06] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          {/* Eyebrow + heading */}
          <div className="col-span-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              More work
            </p>
            <h2 className="mt-4 font-serif italic font-light text-zinc-100 text-3xl md:text-4xl">
              Other things.
            </h2>
          </div>

          {/* Cards */}
          <div className="col-span-12 grid gap-6 sm:grid-cols-2">
            {PROJECTS.map((p, i) => (
              <motion.a
                key={p.repo}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group block rounded-lg border border-zinc-800 bg-transparent p-6 transition-colors duration-200 hover:border-accent"
              >
                <h3 className="font-sans text-xl font-medium text-zinc-100 transition-colors duration-200 group-hover:text-paper">
                  {p.name}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400">
                  {p.description}
                </p>
                <p className="mt-6 font-mono text-[11px] text-zinc-500">
                  {p.stack.join(" · ")}
                </p>
                <p className="mt-4 font-mono text-xs text-zinc-300 transition-colors duration-200 group-hover:text-zinc-100">
                  [ github → ]
                </p>
              </motion.a>
            ))}
          </div>

          {/* View all */}
          <div className="col-span-12 text-center">
            <a
              href="https://github.com/tanmay-alpha?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-zinc-300 transition-colors duration-200 hover:text-zinc-100"
            >
              [ view all repos on github → ]
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
