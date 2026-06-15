"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
};

/**
 * Cloudflare Turnstile widget. Loads the script on demand, renders the
 * captcha into the mounted div, and pushes the resulting token back to
 * the parent via `onToken`.
 *
 * Important: do NOT include a nonce on the Turnstile <script> tag if
 * your CSP uses one — we don't use a nonce, so this just works.
 */
export function TurnstileWidget({ siteKey, onToken }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // 1) Load the Turnstile script (once per page).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.turnstile) {
      setScriptReady(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-turnstile]',
    );
    if (existing) {
      existing.addEventListener("load", () => setScriptReady(true), { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = "true";
    s.addEventListener("load", () => setScriptReady(true), { once: true });
    s.addEventListener("error", () => {
      // Script load failed (network, CSP, ad-blocker). Surface to the
      // parent as a missing token so the server's fail-closed path
      // takes over.
      onToken("");
    });
    document.head.appendChild(s);
  }, [onToken]);

  // 2) Render the widget once the script is ready.
  useEffect(() => {
    if (!scriptReady) return;
    const el = containerRef.current;
    if (!el || !window.turnstile) return;

    widgetIdRef.current = window.turnstile.render(el, {
      sitekey: siteKey,
      callback: (token) => onToken(token),
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken(""),
      theme: "auto",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore — the widget may already be gone
        }
        widgetIdRef.current = null;
      }
    };
  }, [scriptReady, siteKey, onToken]);

  return <div ref={containerRef} className="cf-turnstile" />;
}
