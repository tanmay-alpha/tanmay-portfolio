"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Github, Linkedin, Mail, FileText } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks";

const PHILOSOPHY = [
  "Build to understand.",
  "Trade to learn.",
  "Ship to compound.",
] as const;

const ICON_LINKS = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", icon: Linkedin },
  { label: "Email", href: "mailto:mangaltanmay7@gmail.com", icon: Mail },
  { label: "Resume", href: "/resume.pdf", icon: FileText },
] as const;

export function Hero() {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [isBoot, setIsBoot] = useState(true);

  // 3-second extra-bright boot pulse after mount.
  useEffect(() => {
    const t = setTimeout(() => setIsBoot(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 pt-24"
    >
      {/* System online status row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-ticker-up"
      >
        <motion.span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-ticker-up"
          animate={
            isBoot
              ? {
                  boxShadow: [
                    "0 0 0 0 rgba(74,222,128,0.8)",
                    "0 0 0 12px rgba(74,222,128,0)",
                    "0 0 0 0 rgba(74,222,128,0)",
                  ],
                }
              : {
                  boxShadow: [
                    "0 0 0 0 rgba(74,222,128,0.5)",
                    "0 0 0 6px rgba(74,222,128,0)",
                    "0 0 0 0 rgba(74,222,128,0)",
                  ],
                }
          }
          transition={{
            duration: isBoot ? 1.2 : 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        system online
      </motion.div>

      {/* Name */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="text-center font-sans text-display-xl font-extralight text-text-primary text-balance"
      >
        Tanmay Mangal
      </motion.h1>

      {/* Philosophy lines with subtle chromatic aberration on pointer move */}
      <div className="mt-10 flex flex-col items-center gap-1">
        {PHILOSOPHY.map((line, i) => (
          <PhilosophyLine
            key={line}
            line={line}
            delay={0.35 + i * 0.1}
            disabled={isReducedMotion}
          />
        ))}
      </div>

      {/* Icon buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
        className="mt-14 flex flex-wrap items-center justify-center gap-3"
      >
        {ICON_LINKS.map((link) => (
          <MagneticIconButton key={link.label} {...link} />
        ))}
      </motion.div>
    </section>
  );
}

function PhilosophyLine({
  line,
  delay,
  disabled,
}: {
  line: string;
  delay: number;
  disabled: boolean;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Track pointer velocity globally, then set a CSS variable on this element
  // for a max 2px text-shadow displacement that decays.
  const offset = useMotionValue(0);
  const spring = useSpring(offset, { stiffness: 200, damping: 25 });

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const unsubscribe = spring.on("change", (v) => {
      // Map v (0..1) to 0..2px. Cap at 2px.
      const px = Math.min(v, 1) * 2;
      el.style.setProperty("--ca-x", `${px}px`);
    });

    let last = { x: 0, y: 0, t: performance.now() };
    let target = 0;
    let current = 0;

    const decay = () => {
      target *= 0.92;
      if (target < 0.001) target = 0;
      current += (target - current) * 0.18;
      offset.set(current);
      if (target > 0) requestAnimationFrame(decay);
    };

    const handle = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max((now - last.t) / 1000, 0.001);
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const v = Math.min((dist / dt) / 4000, 1); // normalize to 0..1
      if (v > target) target = v;
      last = { x: e.clientX, y: e.clientY, t: now };
      offset.set(current + (target - current) * 0.3);
      requestAnimationFrame(decay);
    };

    window.addEventListener("pointermove", handle, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handle);
      unsubscribe();
    };
  }, [disabled, offset, spring]);

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="font-mono text-xs uppercase tracking-widest text-text-secondary md:text-sm"
      style={{
        textShadow:
          "calc(var(--ca-x, 0px) * 1) 0 rgba(248,113,113,0.6), calc(var(--ca-x, 0px) * -1) 0 rgba(125,211,252,0.6)",
        transition: "text-shadow 600ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {line}
    </motion.p>
  );
}

function MagneticIconButton({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18 });
  const springY = useSpring(y, { stiffness: 200, damping: 18 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 60;
      if (dist < radius) {
        const pull = (1 - dist / radius) * 0.35;
        x.set(dx * pull);
        y.set(dy * pull);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    const reset = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("mousemove", handle, { passive: true });
    el.addEventListener("mouseleave", reset);
    return () => {
      window.removeEventListener("mousemove", handle);
      el.removeEventListener("mouseleave", reset);
    };
  }, [x, y]);

  return (
    <motion.a
      ref={ref}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-label={label}
      data-cursor-hover
      style={{ x: springX, y: springY }}
      className="group flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition-all duration-200 hover:border-accent hover:bg-[rgba(125,211,252,0.08)]"
    >
      <Icon className="h-5 w-5 text-text-secondary transition-all duration-200 group-hover:text-accent group-hover:rotate-90" />
    </motion.a>
  );
}
