"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Project = {
  name: string;
  oneLiner: string;
  stack: ReadonlyArray<string>;
  github: string;
  live?: { label: string; href: string };
};

const PROJECTS: ReadonlyArray<Project> = [
  {
    name: "AI Workspace",
    oneLiner:
      "A universal engineering toolkit for AI-assisted development — apply to any project with one command.",
    stack: ["powershell", "ci/cd", "ai-agents", "mcp", "templates"],
    github: "https://github.com/tanmay-alpha/-ai-workspace",
  },
  {
    name: "AI Image Forensic Screener",
    oneLiner:
      "Desktop deepfake detector — ML + EXIF + C2PA provenance in one pipeline.",
    stack: ["python", "pytorch", "opencv", "pyqt6", "c2pa"],
    github: "https://github.com/tanmay-alpha/AI-Image-Forensic-Screener",
  },
  {
    name: "FOSSEE Workshop Booking",
    oneLiner:
      "Workshop booking platform for the FOSSEE Summer Fellowship @ IIT Bombay, 2026.",
    stack: ["react", "vite", "tailwind", "react-router"],
    github: "https://github.com/tanmay-alpha/fossee-workshop-booking",
    live: { label: "live", href: "https://fossee-workshop-platform.vercel.app" },
  },
];

export function MoreWorkSection() {
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
      id="more-work"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-12 gap-y-8 md:mb-16">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-3">
            <span className="eyebrow">More work</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading"
            >
              More things I&apos;ve shipped.
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
                  <p className="project-desc">{project.oneLiner}</p>
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

        <div className="mt-16 text-center">
          <a
            href="https://github.com/tanmay-alpha?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-text-2 transition-colors duration-200 hover:text-accent"
          >
            [ view all repos on github → ]
          </a>
        </div>
      </div>
    </section>
  );
}
