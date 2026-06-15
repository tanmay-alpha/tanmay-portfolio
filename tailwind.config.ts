import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Themed via CSS variables defined in globals.css :root and
        // html[data-theme="light"]. Every utility class (bg-bg, text-text-1,
        // border-border, etc.) re-resolves when <html data-theme> flips,
        // so a single toggle re-themes the entire site.
        bg: "var(--bg)",
        "bg-subtle": "var(--bg-subtle)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        paper: "var(--paper)",
        accent: "var(--accent)",
        "text-1": "var(--text-1)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        rust: "var(--rust)",
      },
      fontFamily: {
        sans: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(52px, 9vw, 108px)", { lineHeight: "0.93", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(28px, 4vw, 40px)", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(28px, 4vw, 40px)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-sm": ["clamp(22px, 2.4vw, 32px)", { lineHeight: "1.15" }],
      },
      maxWidth: {
        container: "1440px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
