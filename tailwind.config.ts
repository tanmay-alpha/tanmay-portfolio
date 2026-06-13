import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Cinematic dark-only palette. Theme toggle is removed in this build.
        bg: "#08090B",
        surface: "#0E1014",
        "text-primary": "#F5F5F4",
        "text-secondary": "#71717A",
        accent: "#7DD3FC",
        "ticker-up": "#4ADE80",
        "ticker-down": "#F87171",
        "ticker-flat": "#A3A3A3",
        border: "rgba(255,255,255,0.06)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        serif: ["var(--font-instrument)", "ui-serif", "Georgia", "serif"],
        jp: ["var(--font-noto-jp)", "var(--font-noto-jp-fallback)", "serif"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        wider2: "0.18em",
      },
      maxWidth: {
        container: "1100px",
      },
      fontSize: {
        "display-xl": ["clamp(80px, 14vw, 180px)", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(56px, 8vw, 96px)", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
        "serif-h2": ["clamp(40px, 6vw, 80px)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
      },
      transitionDuration: {
        theme: "200ms",
        "200ms": "200ms",
      },
      keyframes: {
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "boot-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(74, 222, 128, 0.7)" },
          "50%": { boxShadow: "0 0 0 8px rgba(74, 222, 128, 0)" },
        },
      },
      animation: {
        "pulse-soft": "pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "boot-pulse": "boot-pulse 1.2s ease-out 3",
      },
    },
  },
  plugins: [],
};

export default config;
