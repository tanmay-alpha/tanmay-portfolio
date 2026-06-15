"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Level = "primary" | "working" | "familiar";
type Tag = { name: string; level: Level };
type Group = { label: string; tags: ReadonlyArray<Tag> };

const GROUPS: ReadonlyArray<Group> = [
  {
    label: "AI / ML",
    tags: [
      { name: "pytorch", level: "primary" },
      { name: "langchain", level: "primary" },
      { name: "mcp", level: "primary" },
      { name: "groq", level: "working" },
      { name: "opencv", level: "working" },
      { name: "ocr", level: "familiar" },
    ],
  },
  {
    label: "Languages",
    tags: [
      { name: "python", level: "primary" },
      { name: "typescript", level: "primary" },
      { name: "javascript", level: "working" },
      { name: "c++", level: "familiar" },
      { name: "sql", level: "familiar" },
    ],
  },
  {
    label: "Frameworks",
    tags: [
      { name: "next.js", level: "primary" },
      { name: "fastapi", level: "primary" },
      { name: "react", level: "working" },
      { name: "flask", level: "familiar" },
      { name: "tailwind", level: "familiar" },
    ],
  },
  {
    label: "Backend",
    tags: [
      { name: "postgresql", level: "primary" },
      { name: "mongodb", level: "working" },
      { name: "prisma", level: "working" },
      { name: "node.js", level: "familiar" },
      { name: "express", level: "familiar" },
    ],
  },
  {
    label: "Data",
    tags: [
      { name: "numpy", level: "familiar" },
      { name: "pandas", level: "familiar" },
      { name: "sqlite", level: "familiar" },
    ],
  },
  {
    label: "Tools",
    tags: [
      { name: "docker", level: "working" },
      { name: "vercel", level: "familiar" },
      { name: "postman", level: "familiar" },
      { name: "git", level: "familiar" },
      { name: "github", level: "familiar" },
    ],
  },
];

function Dot({ level }: { level: Level }) {
  // 6px filled circles — three intensities of warm-to-cool so the eye
  // can group tags by proficiency at a glance. primary = rust (brand
  // accent), working = secondary text, familiar = dim grey.
  if (level === "primary") {
    return (
      <span
        aria-hidden
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-rust"
      />
    );
  }
  if (level === "working") {
    return (
      <span
        aria-hidden
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-text-2"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-text-3"
    />
  );
}

export function StackSection() {
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
      id="stack"
      aria-label="Stack and tools"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-12 gap-y-8 md:mb-16">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-3">
            <span className="eyebrow">Stack</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="section-heading"
            >
              What I work with.
            </motion.h2>
            <p className="mt-4 max-w-2xl text-[13px] text-text-3">
              <span className="mr-4 inline-flex items-center">
                <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-rust" />
                primary
              </span>
              <span className="mr-4 inline-flex items-center">
                <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-text-2" />
                working
              </span>
              <span className="inline-flex items-center">
                <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-text-3" />
                familiar
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.label} data-reveal>
              <span className="stack-category-label">{group.label}</span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="tech-badge"
                  >
                    <Dot level={tag.level} />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
