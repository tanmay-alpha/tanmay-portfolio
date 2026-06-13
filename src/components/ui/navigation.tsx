"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
] as const;

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#top");
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const backdropOpacity = useTransform(scrollY, [0, 32], [0, 0.6]);
  const backdropBlur = useTransform(scrollY, [0, 32], [0, 12]);

  // Track whether user has scrolled past 32px for crisp border show/hide.
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (y) => {
      setScrolled(y > 32);
    });
    return () => unsubscribe();
  }, [scrollY]);

  // Active section via IntersectionObserver
  useEffect(() => {
    const sections = navItems.map((item) => document.querySelector(item.href));
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section closest to the top that's intersecting.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]?.target.id) {
          setActiveSection(`#${visible[0].target.id}`);
        }
      },
      {
        // Trigger when a section's top crosses 30% of the viewport.
        rootMargin: "-30% 0px -50% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.nav
        className="relative px-6 py-4 border-b"
        style={{
          backgroundColor: useTransform(
            backdropOpacity,
            (v) => `rgba(17, 17, 17, ${v})`,
          ),
        }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-md"
          style={{
            opacity: backdropOpacity,
            backdropFilter: useTransform(backdropBlur, (v) => `blur(${v}px)`),
            WebkitBackdropFilter: useTransform(
              backdropBlur,
              (v) => `blur(${v}px)`,
            ),
          }}
        />
        <div className="container mx-auto flex items-center justify-between">
          {/* Monogram */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleClick("#top");
            }}
            className="font-mono text-lg font-medium tracking-tight hover:text-accent transition-colors duration-theme"
          >
            TM
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(item.href);
                }}
                className={`text-sm font-medium transition-colors duration-theme relative ${
                  activeSection === item.href
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {item.label}
                {activeSection === item.href && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            ))}
            <ThemeToggle />
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen((s) => !s)}
              className="p-2 rounded-lg border border-border bg-surface/50 hover:bg-surface transition-colors duration-theme"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-5 h-5 text-text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-text-primary" />
              )}
            </button>
          </div>
        </div>

        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        )}
      </motion.nav>

      {/* Mobile sheet */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 md:hidden bg-bg/95 backdrop-blur-xl pt-20"
        >
          <div className="container mx-auto px-6 py-12 flex flex-col gap-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleClick(item.href);
                }}
                className="text-3xl font-light tracking-tighter text-text-primary hover:text-accent transition-colors duration-theme"
              >
                {item.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
}
