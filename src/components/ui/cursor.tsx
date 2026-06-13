"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/lib/hooks";

/**
 * 16px circle with `mix-blend-mode: difference`. Follows the cursor with a
 * spring. Scales to 3x over `[data-cursor-hover]` elements (nav links and
 * the 4 hero icon buttons carry that attribute).
 *
 * Hidden on coarse pointers (touch) and `prefers-reduced-motion: reduce`.
 */
export function Cursor() {
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [hovering, setHovering] = useState(false);
  const [mounted, setMounted] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const springConfig = { damping: 35, stiffness: 500, mass: 0.4 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCoarse || isReducedMotion || !mounted) return;

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target as HTMLElement | null;
      const isHover = !!target?.closest("[data-cursor-hover]");
      setHovering(isHover);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [isCoarse, isReducedMotion, mounted, x, y]);

  if (!mounted || isCoarse || isReducedMotion) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-text-primary/40 mix-blend-difference"
      style={{
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        width: 16,
        height: 16,
      }}
      animate={{
        scale: hovering ? 3 : 1,
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    />
  );
}
