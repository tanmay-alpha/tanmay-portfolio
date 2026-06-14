"use client";

import { motion } from "framer-motion";

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
  if (level === "primary") {
    return (
      <span
        aria-hidden
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent"
      />
    );
  }
  if (level === "working") {
    return (
      <span
        aria-hidden
        className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full border border-paper"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full border border-zinc-600"
    />
  );
}

export function StackSection() {
  return (
    <section
      id="stack"
      aria-label="Stack and tools"
      className="relative w-full border-t border-white/[0.06] py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        <div className="grid-12 mb-16 md:mb-24 gap-y-12">
          <div className="col-span-12 md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              Stack
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
              What I work with.
            </motion.h2>
            <p className="mt-4 max-w-2xl font-sans text-sm text-zinc-500">
              <span className="mr-3 inline-flex items-center">
                <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                primary
              </span>
              <span className="mr-3 inline-flex items-center">
                <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full border border-paper" />
                working
              </span>
              <span className="inline-flex items-center">
                <span aria-hidden className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full border border-zinc-600" />
                familiar
              </span>
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {GROUPS.map((group) => (
            <div key={group.label}>
              <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {group.label}
              </span>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className="flex items-center rounded border border-white/[0.06] bg-surface px-2.5 py-1 font-mono text-[10px] lowercase text-zinc-300 transition-colors duration-200 hover:border-accent hover:text-zinc-100"
                  >
                    <Dot level={tag.level} />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
