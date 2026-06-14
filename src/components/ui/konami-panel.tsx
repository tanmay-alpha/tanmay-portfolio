"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { relativeTime } from "./commit-feed";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

const STORAGE_KEY = "tanmay_sticky_notes";
const BUILD_TIMESTAMP = "June 14, 2026 · 00:18 UTC";

type StickyNote = { id: string; text: string; createdAt: number };

type Commit = {
  id: string;
  repo: string;
  message: string;
  url: string;
  sha7: string;
  timestamp: string;
};

export function KonamiPanel() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const seqRef = useRef<string[]>([]);
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [draft, setDraft] = useState("");
  const [commits, setCommits] = useState<Commit[]>([]);

  // Load sticky notes on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StickyNote[];
        if (Array.isArray(parsed)) setNotes(parsed);
      }
    } catch {
      // Corrupt storage — start clean.
    }
  }, []);

  // Save sticky notes on change.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // Storage full / disabled — silently ignore.
    }
  }, [notes]);

  // Keyboard listener for the Konami code + ESC to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      // Don't intercept while typing in an input.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      const key = e.key === " " ? "Space" : e.key;
      const expected = KONAMI[seqRef.current.length];
      if (key === expected) {
        seqRef.current.push(key);
        if (seqRef.current.length === KONAMI.length) {
          setOpen((o) => !o);
          seqRef.current = [];
        }
      } else if (key === KONAMI[0]) {
        seqRef.current = [key];
      } else {
        seqRef.current = [];
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fetch commits when the panel first opens.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/commits", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { commits?: Commit[]; fallback?: boolean };
        if (!cancelled && data.commits && !data.fallback) {
          setCommits(data.commits.slice(0, 3));
        }
      } catch {
        // Quiet degradation.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const addNote = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const text = draft.trim();
      if (!text) return;
      setNotes((prev) => [
        { id: crypto.randomUUID(), text, createdAt: Date.now() },
        ...prev,
      ]);
      setDraft("");
    },
    [draft],
  );

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="Developer panel"
          className="fixed inset-y-0 right-0 z-50 w-[380px] max-w-[100vw] border-l border-zinc-800 bg-[#111111]"
          initial={reduced ? false : { x: "100%" }}
          animate={reduced ? { x: 0 } : { x: 0 }}
          exit={reduced ? { x: 0 } : { x: "100%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">
                DEV PANEL
              </span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close dev panel"
                className="flex h-7 w-7 items-center justify-center rounded text-zinc-500 transition-colors duration-150 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
              <Section label="SITE BUILD">
                <ul className="space-y-1.5 font-sans text-[13px] text-zinc-300">
                  <li>· Next.js 14 · App Router</li>
                  <li>· Tailwind CSS v3</li>
                  <li>· Fraunces + Inter Tight + JetBrains Mono (self-hosted)</li>
                  <li>· Built: {BUILD_TIMESTAMP}</li>
                </ul>
              </Section>

              <Section label="GITHUB ACTIVITY">
                {commits.length === 0 ? (
                  <p className="font-mono text-[11px] text-zinc-500">
                    ● No commits loaded yet
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {commits.map((c) => (
                      <li key={c.id}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded border border-zinc-800 bg-bg p-2.5 transition-colors duration-150 hover:border-zinc-700"
                        >
                          <span className="block font-mono text-[10px] text-zinc-500">
                            {c.repo} · {c.sha7}
                          </span>
                          <span className="mt-0.5 block font-sans text-[12px] text-zinc-100 line-clamp-2">
                            {c.message}
                          </span>
                          <span className="mt-1 block font-mono text-[10px] text-zinc-500">
                            {relativeTime(c.timestamp)}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section label="STICKY NOTES">
                <form onSubmit={addNote} className="flex gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Something to remember…"
                    className="flex-1 rounded-md border border-zinc-800 bg-bg px-3 py-2 font-sans text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    maxLength={200}
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-accent bg-transparent px-3 py-2 font-mono text-[11px] uppercase tracking-widest text-accent transition-colors duration-150 hover:bg-accent hover:text-bg"
                  >
                    Add
                  </button>
                </form>
                {notes.length === 0 ? (
                  <p className="mt-4 font-mono text-[11px] text-zinc-500">
                    ● No notes yet. They&apos;re saved locally — only you can see them.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {notes.map((n) => (
                      <li
                        key={n.id}
                        className="group flex items-start justify-between gap-2 rounded border border-zinc-800 bg-bg p-2.5"
                      >
                        <span className="font-sans text-[13px] text-zinc-300 break-words">
                          {n.text}
                        </span>
                        <button
                          onClick={() => removeNote(n.id)}
                          aria-label="Delete note"
                          className="shrink-0 text-zinc-600 transition-colors duration-150 hover:text-zinc-300"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>

            <footer className="border-t border-zinc-800 px-5 py-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                ESC to close
              </span>
            </footer>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </h2>
      {children}
    </section>
  );
}

// Used by the footer to render the tiny "↑↑↓↓ ←→←→ BA" hint.
export function KonamiHint() {
  return (
    <span
      aria-hidden
      className="ml-3 select-none font-mono text-[10px] text-zinc-700 transition-colors duration-200 hover:text-zinc-400"
    >
      ↑↑↓↓ ←→←→ BA
    </span>
  );
}
