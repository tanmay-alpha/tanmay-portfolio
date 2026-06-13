"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/lib/hooks";

const BOOT_KEY = "tanmay_booted_v1";

type BootLine = { text: string; delay: number; color: string };

const BOOT_SEQUENCE: readonly BootLine[] = [
  { text: "[ initializing ]", delay: 0, color: "#71717A" },
  { text: "[ ok ] fonts loaded", delay: 100, color: "#71717A" },
  { text: "[ ok ] ticker feed live", delay: 250, color: "#71717A" },
  { text: "[ ok ] websockets connected", delay: 400, color: "#71717A" },
  { text: "[ ok ] gpu accelerated", delay: 600, color: "#71717A" },
  { text: "[ ok ] system online", delay: 800, color: "#4ADE80" },
] as const;

const FADE_OUT_DELAY = 1000;
const FADE_OUT_DURATION = 200;

/**
 * Boot sequence overlay. Renders ONLY on first visit (gated by
 * sessionStorage[BOOT_KEY]). On any keypress or click, jumps straight
 * to the fade-out. Reduced-motion users skip almost immediately.
 */
export function Preloader() {
  const [visible, setVisible] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [skipping, setSkipping] = useState(false);
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    try {
      const booted = sessionStorage.getItem(BOOT_KEY);
      if (booted) {
        setVisible(false);
        return;
      }
    } catch {
      // sessionStorage unavailable — show preloader anyway.
    }
    setVisible(true);
    sessionStorage.setItem(BOOT_KEY, "1");
  }, []);

  // Reveal lines on schedule.
  useEffect(() => {
    if (!visible || skipping) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_SEQUENCE.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setRevealedCount((c) => Math.max(c, i + 1));
        }, line.delay),
      );
    });

    timers.push(
      setTimeout(() => {
        setVisible(false);
      }, FADE_OUT_DELAY + FADE_OUT_DURATION),
    );

    return () => timers.forEach(clearTimeout);
  }, [visible, skipping]);

  // Keyboard / click skip.
  useEffect(() => {
    if (!visible) return;
    const skip = () => {
      setSkipping(true);
      setRevealedCount(BOOT_SEQUENCE.length);
      setTimeout(() => setVisible(false), isReducedMotion ? 50 : FADE_OUT_DURATION);
    };
    const handleKey = () => skip();
    const handleClick = () => skip();

    window.addEventListener("keydown", handleKey, { once: true });
    window.addEventListener("pointerdown", handleClick, { once: true });
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("pointerdown", handleClick);
    };
  }, [visible, isReducedMotion]);

  // Reduced motion: bail fast.
  useEffect(() => {
    if (isReducedMotion && visible) {
      setRevealedCount(BOOT_SEQUENCE.length);
      const t = setTimeout(() => setVisible(false), 50);
      return () => clearTimeout(t);
    }
  }, [isReducedMotion, visible]);

  const handleFinish = useCallback(() => setVisible(false), []);

  return (
    <AnimatePresence onExitComplete={handleFinish}>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isReducedMotion ? 0 : 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
          aria-hidden
        >
          <div className="font-mono text-[11px] leading-relaxed md:text-xs">
            {BOOT_SEQUENCE.slice(0, revealedCount).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.05 }}
                className="block"
                style={{ color: line.color }}
              >
                {line.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
