"use client";

import { useScroll, useTransform, motion, useReducedMotion } from "framer-motion";
import { Home, Briefcase, GraduationCap, Layers, Mail } from "lucide-react";

const ITEMS = [
  { id: "top", label: "Index", Icon: Home },
  { id: "work", label: "Work", Icon: Briefcase },
  { id: "experience", label: "Experience", Icon: GraduationCap },
  { id: "stack", label: "Stack", Icon: Layers },
  { id: "contact", label: "Contact", Icon: Mail },
] as const;

export function DockNav() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // Hidden in hero (scrollY < 600), visible past it.
  const opacity = useTransform(scrollY, [0, 600], [0, 1]);
  const pointerEvents = useTransform(scrollY, (v) => (v < 600 ? "none" : "auto"));

  return (
    <motion.nav
      aria-label="Primary"
      style={{ opacity, pointerEvents }}
      className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <ul className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-[rgba(10,10,10,0.7)] px-3 py-2 backdrop-blur-lg">
        {ITEMS.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-zinc-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <motion.span
                aria-hidden
                className="flex h-4 w-4 items-center justify-center"
                whileHover={reduced ? undefined : { y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Icon className="h-3.5 w-3.5 md:hidden" />
                <span className="hidden md:inline">{label}</span>
              </motion.span>
              <span className="hidden md:inline">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
