import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Editorial palette. Dark only.
        bg: "#0A0A0A",
        surface: "#111111",
        "surface-2": "#0F0F0F",
        paper: "#FAFAF7",
        // Zinc grays (Tailwind already has these; we map to our semantic
        // names via Tailwind utilities but the design tokens live here).
        accent: "#D97757",
      },
      fontFamily: {
        sans: ["var(--font-inter-tight)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        "display-xl": ["clamp(72px, 9vw, 144px)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(40px, 5vw, 80px)", { lineHeight: "1.0", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(28px, 3.5vw, 56px)", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
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
