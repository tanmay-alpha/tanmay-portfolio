"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Lenis smooth scroll provider. Active on desktop only — touch devices
 * (and `prefers-reduced-motion: reduce`) get native scroll for free.
 */
export function SmoothScroll() {
  const isCoarse = useMediaQuery("(pointer: coarse)");
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    if (isCoarse || isReducedMotion) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      // Touch is auto-disabled when isTouch is true, but we already gate
      // on pointer:coarse above, so this is belt-and-suspenders.
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isCoarse, isReducedMotion]);

  return null;
}
