"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Delay in seconds (useful when stacking multiple reveals). */
  delay?: number;
  /** Vertical offset in pixels. Default 16. */
  y?: number;
  /** Animation duration in seconds. Default 0.5. */
  duration?: number;
  /** Class name passthrough. */
  className?: string;
  /** Render as a different HTML element. Default "div". */
  as?: "div" | "section" | "article" | "header" | "li";
};

/**
 * Reveal — wraps a chunk of content with a Framer Motion fade-up that
 * triggers when the element scrolls into view. Honors prefers-reduced-motion
 * (renders the final state instantly). Use it to upgrade the
 * CSS-based `.reveal`/`.reveal.is-visible` mechanism where smoother,
 * spring-based motion is desired (hero copy, section headings, etc.).
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.5,
  className,
  as = "div",
}: Props) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={
        reduced
          ? { duration: 0 }
          : { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
      className={className}
    >
      {children}
    </MotionTag>
  );
}
