"use client";

import { motion } from "framer-motion";

const STACK: ReadonlyArray<{ label: string; tags: ReadonlyArray<string> }> = [
  { label: "Languages", tags: ["python", "typescript", "javascript", "c++", "sql", "html", "css"] },
  { label: "Frameworks", tags: ["next.js", "react", "fastapi", "flask", "tailwind"] },
  { label: "AI / ML", tags: ["pytorch", "langchain", "groq (llama 3.3 70b)", "ocr", "opencv", "numpy", "pandas"] },
  { label: "Backend", tags: ["fastapi", "node.js", "express", "rest", "websocket", "nextauth"] },
  { label: "Data", tags: ["postgresql", "mongodb", "prisma", "sqlite"] },
  { label: "Tools", tags: ["git", "github", "vercel", "docker", "postman"] },
];

export function StackSection() {
  return (
    <section
      aria-label="Stack and tools"
      className="relative w-full border-t border-zinc-800 py-20"
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        <div className="grid-12 gap-y-8">
          <div className="col-span-12 md:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              Stack
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8"
          >
            {STACK.map((group) => (
              <div key={group.label}>
                <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                  {group.label}
                </span>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {group.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-zinc-800 bg-surface px-2.5 py-1 font-mono text-[10px] lowercase text-zinc-300 transition-colors duration-200 hover:border-accent hover:text-zinc-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
