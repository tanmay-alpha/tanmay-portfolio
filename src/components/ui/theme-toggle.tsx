"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";
const STORAGE_KEY = "tanmay-portfolio-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  // Trust the live <html> attribute (set by the inline init script on
  // first paint). This is the same source of truth the rest of the app
  // uses, so the toggle never disagrees with what the user sees.
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light") return "light";
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    // Dark is the default; remove the attribute so :root applies.
    root.removeAttribute("data-theme");
  }
}

export function ThemeToggle() {
  // SSR-safe default: dark. After mount we read the actual value.
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(readTheme());
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private mode, etc.)
    }
    // Notify other instances of the toggle (mobile sheet has its own).
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };

  // Listen for theme changes from other components (mobile sheet).
  useEffect(() => {
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === "light" || detail === "dark") {
        setTheme(detail);
      }
    };
    window.addEventListener("themechange", onChange as EventListener);
    return () => window.removeEventListener("themechange", onChange as EventListener);
  }, []);

  // Render a fixed-width placeholder while not mounted to avoid layout shift.
  const label = !mounted
    ? "Toggle theme"
    : theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-[rgba(255,255,255,0.04)] text-text-2 transition-colors duration-200 hover:border-accent hover:text-accent"
    >
      {mounted && theme === "dark" ? (
        <Sun className="h-[16px] w-[16px]" aria-hidden />
      ) : (
        <Moon className="h-[16px] w-[16px]" aria-hidden />
      )}
    </button>
  );
}

