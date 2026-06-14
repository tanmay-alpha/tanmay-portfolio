"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Project = {
  name: string;
  subtitle: string;
  oneLiner: string;
  stack: ReadonlyArray<string>;
  github: string;
  live?: { label: string; href: string };
};

const PROJECTS: ReadonlyArray<Project> = [
  {
    name: "MAET",
    subtitle: "Market Analytics & Execution Terminal",
    oneLiner:
      "A trading terminal for NSE — WebSocket tick streaming, paper-trading, strategy backtesting.",
    stack: ["next.js 14", "typescript", "python", "fastapi", "websocket", "pandas"],
    github: "https://github.com/tanmay-alpha/maet",
  },
  {
    name: "Lumint",
    subtitle: "AI Fraud Intelligence Platform",
    oneLiner:
      "Cross-modal fraud detection — document, URL, and UPI analysis in one pipeline. Built at Canara Bank SuRaksha Hackathon 2.0.",
    stack: ["python", "fastapi", "next.js", "typescript", "groq (llama 3.3 70b)", "ocr", "opencv"],
    github: "https://github.com/tanmay-alpha/lumint",
  },
  {
    name: "FinCalc India",
    subtitle: "Financial Calculator Suite for Indian Users",
    oneLiner:
      "Six financial calculators for Indian users — SIP, EMI, FD, PPF, tax regime comparison. Live on Vercel.",
    stack: ["next.js 14", "typescript", "tailwind", "postgresql", "prisma", "nextauth v5"],
    github: "https://github.com/tanmay-alpha/fincalc-india",
    live: { label: "live", href: "https://fincalc-india.vercel.app" },
  },
];

export function WorkSection() {
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
      id="work"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-12 gap-y-8 md:mb-16">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-3">
            <span className="eyebrow">Work</span>
            <p className="max-w-[180px] text-[12px] leading-[1.55] text-text-3">
              Work in progress — none of these are finished.
            </p>
          </div>

          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading"
            >
              Things I&apos;ve built.
            </motion.h2>
          </div>
        </div>

        <div>
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              data-reveal
              className="project-row"
            >
              <div className="grid grid-cols-1 items-baseline gap-2 md:grid-cols-12 md:gap-8">
                <h3 className="project-name md:col-span-3">
                  {project.name}
                </h3>
                <div className="md:col-span-6">
                  <p className="font-mono text-[10px] uppercase tracking-[1.5px] text-text-3">
                    {project.subtitle}
                  </p>
                  <p className="project-desc mt-2">{project.oneLiner}</p>
                </div>
                <div className="md:col-span-3 flex flex-col items-start gap-3 md:items-end">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-github"
                  >
                    View on GitHub →
                  </a>
                  {project.live && (
                    <a
                      href={project.live.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-github"
                    >
                      View live →
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((tag) => (
                  <span key={tag} className="tech-badge">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
