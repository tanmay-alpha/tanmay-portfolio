import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // New amber-on-midnight palette
        bg: "#07080E",
        "bg-subtle": "#0D0F18",
        surface: "#111420",
        "surface-2": "#181C2A",
        paper: "#F0F2F8",
        accent: "#E8B84B",
        "text-1": "#F0F2F8",
        "text-2": "#8892A4",
        "text-3": "#4A5166",
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
