"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { CommitFeedPill } from "./commit-feed";

const NAV_LINKS = [
  { label: "Index", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 24], [0, 1]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        height: 56,
        backgroundColor: "rgba(10,10,10,0.7)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #27272A",
      }}
    >
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-px bg-zinc-800"
        style={{ opacity: borderOpacity }}
      />
      <div className="mx-auto flex h-full max-w-container items-center justify-between px-6 lg:px-8">
        {/* Left: monogram */}
        <a
          href="#top"
          aria-label="Tanmay Mangal — home"
          className="font-serif italic text-lg text-zinc-100 transition-colors duration-200 hover:text-paper"
        >
          T<span className="text-accent">.</span>
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} label={link.label} />
            </li>
          ))}
        </ul>

        {/* Mobile: shipping pill + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <CommitFeedPill />
          <button
            onClick={() => setIsOpen((s) => !s)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 text-zinc-400 transition-colors duration-200 hover:border-zinc-700 hover:text-zinc-100"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {isOpen && (
        <div className="fixed inset-0 top-14 z-40 md:hidden bg-bg/98 backdrop-blur-xl">
          <ul className="flex flex-col gap-8 px-6 pt-16">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="font-serif italic text-5xl text-zinc-100 transition-colors duration-200 hover:text-paper"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="group relative font-mono text-[11px] uppercase tracking-widest text-zinc-400 transition-colors duration-200 hover:text-zinc-100"
    >
      {label}
      <span
        aria-hidden
        className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-zinc-100 transition-transform duration-200 group-hover:scale-x-100"
      />
    </a>
  );
}
