/**
 * Inline theme initializer — runs before React hydrates.
 *
 * Reads the persisted theme from localStorage (or falls back to the OS
 * preference) and sets `data-theme="light"` on <html> if the user picked
 * light. Keeps the value consistent with what the ThemeToggle will read
 * on mount, so the button's icon doesn't flash.
 *
 * This string is injected into the document via a <Script
 * strategy="beforeInteractive"> in src/app/layout.tsx.
 */
export const THEME_INIT_SCRIPT = `(() => {
  try {
    var KEY = "tanmay-portfolio-theme";
    var stored = localStorage.getItem(KEY);
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  } catch (e) {
    // localStorage may be disabled (private mode, sandbox). The dark
    // default in :root will still apply cleanly.
  }
})();`;
