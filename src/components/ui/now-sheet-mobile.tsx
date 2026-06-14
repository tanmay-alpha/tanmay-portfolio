"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import nowData from "@/data/now.json";

function NowSheetContent({ onClose }: { onClose: () => void }) {
  const reduced = useReducedMotion();
  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : 0.2 }}
        onClick={onClose}
      />
      <motion.div
        role="dialog"
        aria-label="What I'm working on now"
        className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-zinc-800 bg-bg p-5 md:hidden"
        initial={reduced ? false : { y: "100%" }}
        animate={reduced ? { y: 0 } : { y: 0 }}
        exit={reduced ? { y: 0 } : { y: "100%" }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-800" aria-hidden />
        <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-2">
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
            NOW
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-500 transition-colors duration-150 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="space-y-4">
          {nowData.items.map((item) => (
            <li key={item.label}>
              <p className="font-mono text-[10px] text-zinc-500">{item.date}</p>
              <p className="mt-1 font-sans text-[13px] leading-snug text-zinc-200">
                {item.label}
                {item.href && (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 text-zinc-500 transition-colors duration-150 hover:text-accent"
                  >
                    ↗
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-white/[0.06] pt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            LOOKING FOR
          </p>
          <p className="mt-2 font-sans text-[12px] leading-relaxed text-zinc-300">
            AI/ML or full-stack roles @ fintech, trading, or YC-stage. Open to
            internships (Fall 2026) and full-time (post-grad).
          </p>
          <a
            href="#contact"
            onClick={onClose}
            className="mt-3 inline-block font-mono text-[11px] text-zinc-300 transition-colors duration-200 hover:text-accent"
          >
            [ get in touch → ]
          </a>
        </div>
      </motion.div>
    </>
  );
}

export function NowSheetMobile() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open what I'm working on"
        className="fixed top-4 left-4 z-40 flex h-9 items-center gap-2 rounded-md border border-white/[0.08] bg-transparent px-3 text-zinc-400 transition-colors duration-200 hover:border-zinc-700 hover:text-zinc-100 md:hidden"
      >
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
        <span className="font-mono text-[10px] uppercase tracking-widest">Now</span>
      </button>
      <AnimatePresence>
        {open && <NowSheetContent onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
