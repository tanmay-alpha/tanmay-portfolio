"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { id: "top", label: "Home" },
  { id: "now", label: "Now" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("top");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll state — apply .nav-scrolled after 80px of scroll.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section detection — uses IntersectionObserver with a rootMargin
  // that biases the active state to whichever section is centered in view.
  useEffect(() => {
    const ids = NAV_ITEMS.map((item) => item.id);
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry with the largest intersection ratio.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll when mobile menu is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <a
          href="#top"
          className="font-mono text-[15px] font-semibold tracking-tight text-text-1 transition-colors duration-150 hover:text-accent"
          aria-label="Tanmay Mangal — back to top"
        >
          [T.]
        </a>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`nav-link ${
                  activeId === item.id ? "active" : ""
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Theme toggle + mobile menu button */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center text-text-2 md:hidden"
          >
          {mobileOpen ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
          </button>
        </div>
      </div>

      {/* Mobile menu sheet */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          className="fixed inset-0 z-[200] flex flex-col bg-bg md:hidden"
        >
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
            <a
              href="#top"
              onClick={() => setMobileOpen(false)}
              className="font-mono text-[15px] font-semibold text-text-1"
            >
              [T.]
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center text-text-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-6 w-6"
                  aria-hidden
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <ul className="flex flex-1 flex-col items-center justify-center gap-8">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setMobileOpen(false)}
                  className={`text-2xl font-medium tracking-tight ${
                    activeId === item.id ? "text-accent" : "text-text-1"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
