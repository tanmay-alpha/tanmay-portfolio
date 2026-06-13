"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

type Position =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center"
  | "center";

type KanjiProps = {
  character: string;
  position?: Position;
  size?: number;
  opacity?: number;
  /** Use a CSS variable for the font weight (200 or 400). */
  weight?: 200 | 400;
  /** When true, animates in when the section enters the viewport. */
  scrollIn?: boolean;
  className?: string;
};

const POSITION_STYLES: Record<Position, React.CSSProperties> = {
  "top-left": { top: "8%", left: "6%" },
  "top-right": { top: "8%", right: "6%" },
  "top-center": { top: "8%", left: "50%", transform: "translateX(-50%)" },
  "bottom-left": { bottom: "8%", left: "6%" },
  "bottom-right": { bottom: "8%", right: "6%" },
  "bottom-center": { bottom: "8%", left: "50%", transform: "translateX(-50%)" },
  center: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
};

export function Kanji({
  character,
  position = "top-right",
  size = 360,
  opacity = 0.05,
  weight = 200,
  scrollIn = true,
  className = "",
}: KanjiProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.2 });

  const content = (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute select-none font-jp leading-none text-text-primary ${className}`}
      style={{
        ...POSITION_STYLES[position],
        fontSize: size,
        fontWeight: weight,
        opacity,
        zIndex: 0,
        whiteSpace: "nowrap",
      }}
    >
      {character}
    </div>
  );

  if (!scrollIn) return content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? opacity : 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="pointer-events-none absolute inset-0"
    >
      {content}
    </motion.div>
  );
}
