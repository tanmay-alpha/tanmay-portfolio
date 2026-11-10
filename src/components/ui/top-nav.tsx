"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { id: "top", label: "Home" },
  { id: "work", label: "Work" },
  { id: "services", label: "Services" },
  { id: "experience", label: "Experience" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<string>("top");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const navigateMobile = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.location.pathname === "/") {
      window.location.hash = event.currentTarget.hash;
    } else {
      window.location.assign(event.currentTarget.href);
    }
    setMobileOpen(false);
  };

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

  // Escape closes the menu; focus moves into the dialog and returns on close.
  useEffect(() => {
    if (!mobileOpen) return;
    const opener = openRef.current;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobileOpen(false);
      }
      if (e.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [mobileOpen]);

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

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link
          href="/#top"
          className="font-mono text-[15px] font-semibold tracking-tight text-text-1 transition-colors duration-150 hover:text-accent"
          aria-label="[T.] Tanmay Mangal — back to top"
        >
          [T.]
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <Link
                href={`/#${item.id}`}
                className={`nav-link ${
                  activeId === item.id ? "active" : ""
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Theme toggle + mobile menu button */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            ref={openRef}
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? "mobile-navigation" : undefined}
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
          id="mobile-navigation"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Primary navigation"
          className="fixed inset-0 z-[200] flex flex-col overflow-y-auto bg-bg md:hidden"
        >
          <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4">
            <Link
              href="/#top"
              onClick={navigateMobile}
              className="font-mono text-[15px] font-semibold text-text-1"
            >
              [T.]
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                ref={closeRef}
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
                <Link
                  href={`/#${item.id}`}
                  onClick={navigateMobile}
                  className={`text-2xl font-medium tracking-tight ${
                    activeId === item.id ? "text-accent" : "text-text-1"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
