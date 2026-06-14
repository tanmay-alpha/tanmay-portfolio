"use client";

import { motion } from "framer-motion";

type Project = {
  name: string;
  oneLiner: string;
  bullets: ReadonlyArray<string>;
  stack: ReadonlyArray<string>;
  github: string;
  live?: { label: string; href: string };
};

const PROJECTS: ReadonlyArray<Project> = [
  {
    name: "AI Workspace",
    oneLiner:
      "A universal engineering toolkit for AI-assisted development — apply to any project with one command.",
    bullets: [
      "10+ PowerShell scripts: doctor, apply, detect, rollback, scaffold",
      "8 CI/CD templates (Python, Node, fullstack, ML, trading, agentic)",
      "13 prompt playbooks for AI agents (Codex, Claude, Gemini, Cline, Ollama)",
    ],
    stack: ["powershell", "ci/cd", "ai-agents", "mcp", "templates"],
    github: "https://github.com/tanmay-alpha/-ai-workspace",
  },
  {
    name: "AI Image Forensic Screener",
    oneLiner:
      "Desktop deepfake detector — ML + EXIF + C2PA provenance in one pipeline.",
    bullets: [
      "HuggingFace EfficientNet for ML inference (cached offline after first run)",
      "EXIF/XMP/IPTC metadata forensics + C2PA Content Credentials",
      "Optional SynthID watermark check, batch evaluation, PDF reports",
      "Ships as a one-click .exe via PyInstaller",
    ],
    stack: ["python", "pytorch", "opencv", "pyqt6", "c2pa"],
    github: "https://github.com/tanmay-alpha/AI-Image-Forensic-Screener",
  },
  {
    name: "FOSSEE Workshop Booking",
    oneLiner:
      "Workshop booking platform for the FOSSEE Summer Fellowship @ IIT Bombay, 2026.",
    bullets: [
      "Search, filter, detail pages, booking form with validation",
      "Booking confirmation flow",
      "Mobile-first, Vite + React + Tailwind",
    ],
    stack: ["react", "vite", "tailwind", "react-router"],
    github: "https://github.com/tanmay-alpha/fossee-workshop-booking",
    live: { label: "live", href: "https://fossee-workshop-platform.vercel.app" },
  },
] as const;

export function MoreWorkSection() {
  return (
    <section
      id="more-work"
      className="relative w-full border-t border-white/[0.06] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-16 md:mb-24 gap-y-12">
          <div className="col-span-12 md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              More work
            </p>
          </div>
          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif italic text-display-md font-light text-paper"
            >
              More things I&apos;ve shipped.
            </motion.h2>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project, i) => (
            <motion.article
              key={project.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col rounded-lg border border-white/[0.06] bg-surface-2 p-6 transition-colors duration-200 hover:border-accent"
            >
              <h3 className="font-sans text-xl font-medium text-zinc-100 transition-colors duration-200 group-hover:text-paper">
                {project.name}
              </h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-zinc-400">
                {project.oneLiner}
              </p>
              <ul className="mt-5 space-y-2 font-mono text-xs text-zinc-400">
                {project.bullets.map((b) => (
                  <li key={b} className="flex gap-2">
                    <span aria-hidden className="text-zinc-600">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-[10px] text-zinc-500">
                {project.stack.join(" · ")}
              </p>
              <div className="mt-6 flex items-center gap-6 font-mono text-xs text-zinc-300">
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
                >
                  [ github → ]
                </a>
                {project.live && (
                  <a
                    href={project.live.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-zinc-100 hover:decoration-accent"
                  >
                    [ {project.live.label} → ]
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="https://github.com/tanmay-alpha?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-zinc-300 transition-colors duration-200 hover:text-accent"
          >
            [ view all repos on github → ]
          </a>
        </div>
      </div>
    </section>
  );
}
