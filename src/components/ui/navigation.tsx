"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const NAV_LINKS = [
  { label: "Index", href: "#top" },
  { label: "Work", href: "#projects" },
  { label: "Trail", href: "#experience" },
  { label: "Talk", href: "#contact" },
] as const;

export function Navigation() {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 32], [0, 1]);
  const [scrolled, setScrolled] = useState(false);
  const [buildTime, setBuildTime] = useState<string>("");

  useEffect(() => {
    const unsub = scrollY.on("change", (y) => setScrolled(y > 32));
    return () => unsub();
  }, [scrollY]);

  // Display a one-time build timestamp in subscript next to the SYSTEM ONLINE
  // dot. Generated client-side at mount so it stays stable across navigations.
  useEffect(() => {
    const now = new Date();
    const stamp = now
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")
      .slice(0, 16);
    setBuildTime(stamp);
  }, []);

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full"
      style={{
        height: 56,
        backgroundColor: "rgba(8,9,11,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px bg-white/10"
        style={{ opacity: borderOpacity }}
      />
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6">
        {/* Left: monogram */}
        <a
          href="#top"
          data-cursor-hover
          className="font-mono text-xs font-medium uppercase tracking-widest text-text-primary hover:text-accent transition-colors duration-200"
        >
          TM
        </a>

        {/* Desktop: center nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} label={link.label} />
            </li>
          ))}
        </ul>

        {/* Right: SYSTEM ONLINE indicator (with build time) */}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-secondary">
          <motion.span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-ticker-up"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(74,222,128,0.5)",
                "0 0 0 6px rgba(74,222,128,0)",
                "0 0 0 0 rgba(74,222,128,0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
          <span className="text-ticker-up">system online</span>
          {scrolled && buildTime && (
            <span className="hidden lg:inline opacity-50">
              · {buildTime}
            </span>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      data-cursor-hover
      className="group relative font-mono text-[11px] uppercase tracking-widest text-text-secondary transition-colors duration-200 hover:text-text-primary"
    >
      {label}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-text-primary transition-transform duration-200 group-hover:scale-x-100"
      />
    </a>
  );
}
