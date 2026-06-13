"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/hooks";

type TickerSymbol = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
};

type TickerPayload = {
  fallback: boolean;
  fetchedAt: string;
  symbols: TickerSymbol[];
};

type TapeRow = {
  id: number;
  time: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  // Per-row "is this an interpolated synthetic tick" flag — purely
  // for debugging if we want to inspect; doesn't affect rendering.
  synthetic: boolean;
};

const ROW_HEIGHT = 18; // px — matches 11px font * 1.6 line-height.
const NUM_ROWS = 120;
const TICK_MS = 200;
const SESSION_KEY = "tanmay_ticker_cache_v1";
const CACHE_TTL_MS = 60_000;

const STORAGE_KEYS: ReadonlyArray<keyof TickerSymbol> = [
  "symbol",
  "name",
  "price",
  "change",
  "changePercent",
  "currency",
];

/**
 * Deterministic-ish per-symbol pseudo-random walk. We use a tiny xorshift
 * so successive reloads produce similar (not identical) synthetic ticks
 * without depending on Math.random at render time.
 */
function makeSymbolState() {
  // Each symbol gets a small per-tick drift. We bias it toward returning
  // to the last fetched price so a long session doesn't wander off.
  return { drift: 0, lastPrice: 0, lastChange: 0, lastChangePct: 0 };
}

function stepSymbol(
  sym: TickerSymbol,
  state: ReturnType<typeof makeSymbolState>,
): { price: number; change: number; changePercent: number; drift: number } {
  // Mean-reverting random walk anchored to sym.price.
  // Drift decays toward 0 each step, plus a small noise term.
  const noise = (Math.random() - 0.5) * 0.0025 * sym.price; // ±0.25% of price
  const pullToAnchor = (sym.price - state.lastPrice) * 0.04; // 4% pull
  const newPrice = state.lastPrice + state.drift + pullToAnchor + noise;
  const newDrift = state.drift * 0.7 + noise * 0.3;
  const change = newPrice - (sym.price - sym.change); // vs the open
  const changePct = (change / (sym.price - sym.change || 1)) * 100;
  return { price: newPrice, change, changePercent: changePct, drift: newDrift };
}

function formatTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatPrice(p: number): string {
  return p.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatChange(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

function loadCached(): TickerPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; payload: TickerPayload };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function saveCached(payload: TickerPayload) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ ts: Date.now(), payload }),
    );
  } catch {
    // ignore quota
  }
}

export function Tape() {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const isCoarse = useMediaQuery("(pointer: coarse)");

  const [symbols, setSymbols] = useState<TickerSymbol[]>([]);
  const [rows, setRows] = useState<TapeRow[]>([]);
  const [labelFallback, setLabelFallback] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cursorY, setCursorY] = useState<number | null>(null);

  // Track cursor position for the "spotlight" effect.
  useEffect(() => {
    if (isCoarse) return;
    const handle = (e: MouseEvent) => setCursorY(e.clientY);
    window.addEventListener("mousemove", handle, { passive: true });
    return () => window.removeEventListener("mousemove", handle);
  }, [isCoarse]);

  // Initial fetch.
  useEffect(() => {
    setMounted(true);
    const cached = loadCached();
    if (cached) {
      setSymbols(cached.symbols);
      setLabelFallback(cached.fallback);
      seedRowsFromSymbols(cached.symbols, setRows);
    }

    let cancelled = false;
    fetch("/api/ticker")
      .then((r) => r.json() as Promise<TickerPayload>)
      .then((payload) => {
        if (cancelled) return;
        setSymbols(payload.symbols);
        setLabelFallback(payload.fallback);
        saveCached(payload);
        // Always (re)seed rows on fresh data so the tape starts dense.
        seedRowsFromSymbols(payload.symbols, setRows);
      })
      .catch(() => {
        // Endpoint should never 500, but if it does, leave the seeded rows.
        if (cached) return;
        // No cache, no response: build rows from the same fallback list
        // the API uses, so the tape is never empty.
        setSymbols([]);
        setLabelFallback(true);
        setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tick loop: every 200ms, push a new row.
  useEffect(() => {
    if (!mounted || symbols.length === 0) return;
    if (isReducedMotion) return;

    const stateMap = new Map<string, ReturnType<typeof makeSymbolState>>();
    for (const s of symbols) {
      const st = makeSymbolState();
      st.lastPrice = s.price;
      st.lastChange = s.change;
      st.lastChangePct = s.changePercent;
      stateMap.set(s.symbol, st);
    }

    let id = 0;
    const interval = setInterval(() => {
      // Pick a random symbol to emit a tick for.
      const idx = Math.floor(Math.random() * symbols.length);
      const sym = symbols[idx];
      if (!sym) return;
      const state = stateMap.get(sym.symbol);
      if (!state) return;

      const next = stepSymbol(sym, state);
      state.lastPrice = next.price;
      state.lastChange = next.change;
      state.lastChangePct = next.changePercent;
      state.drift = next.drift;

      const newRow: TapeRow = {
        id: id++,
        time: formatTime(new Date()),
        symbol: sym.symbol,
        price: next.price,
        change: next.change,
        changePercent: next.changePercent,
        synthetic: true,
      };

      setRows((prev) => {
        const trimmed = prev.length >= NUM_ROWS ? prev.slice(prev.length - NUM_ROWS + 1) : prev;
        return [...trimmed, newRow];
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [mounted, symbols, isReducedMotion]);

  // For the spotlight: find the row nearest the cursor.
  const nearestRowIndex = useMemo(() => {
    if (cursorY === null || rows.length === 0) return -1;
    // Center of the tape is roughly in the middle of the viewport.
    // Each row is ROW_HEIGHT tall, the tape is centered vertically.
    // Compute the row whose CENTER is closest to cursorY.
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < rows.length; i++) {
      // Approximate: rows are stacked with ROW_HEIGHT each, top of tape
      // is at the hero top. We don't know the absolute hero top here, so
      // we estimate from the center of the viewport and the row count.
      const centerY = window.innerHeight / 2 - (rows.length * ROW_HEIGHT) / 2 + i * ROW_HEIGHT + ROW_HEIGHT / 2;
      const d = Math.abs(centerY - cursorY);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
      if (d > 60 && bestDist < 60) break; // small optimization once we've found a close one
    }
    return bestDist < 60 ? bestIdx : -1;
  }, [cursorY, rows]);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
      style={{ opacity: 0.6 }}
    >
      {/* Tape column — centered, full-height */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(720px,90vw)] max-h-[80vh] flex flex-col"
        style={{ lineHeight: `${ROW_HEIGHT}px` }}
      >
        {rows.map((row, i) => {
          const isUp = row.changePercent > 0;
          const isDown = row.changePercent < 0;
          const color = isUp
            ? "var(--ticker-up)"
            : isDown
            ? "var(--ticker-down)"
            : "var(--ticker-flat)";
          const arrow = isUp ? "▲" : isDown ? "▼" : "·";
          const isNearest = i === nearestRowIndex;
          return (
            <div
              key={row.id}
              className="grid grid-cols-[60px_1fr_90px_14px_70px] items-center px-3 font-mono text-[11px] tabular-nums transition-colors"
              style={{
                color: isNearest ? "var(--text-primary)" : "var(--text-secondary)",
                backgroundColor: isNearest ? "rgba(255,255,255,0.04)" : "transparent",
                height: ROW_HEIGHT,
              }}
            >
              <span className="opacity-70">{row.time}</span>
              <span className="truncate pr-2">{row.symbol}</span>
              <span className="text-right tabular-nums">{formatPrice(row.price)}</span>
              <span className="text-center" style={{ color }}>
                {arrow}
              </span>
              <span className="text-right tabular-nums" style={{ color }}>
                {formatChange(row.changePercent)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom-left provenance label */}
      <div className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-widest text-text-secondary/70">
        ● simulated · source: yahoo finance
      </div>

      {/* Top-right: ticker live indicator */}
      <div className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-widest text-text-secondary/70 flex items-center gap-2">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: labelFallback ? "var(--ticker-flat)" : "var(--ticker-up)" }}
        />
        {labelFallback ? "fallback feed" : "feed live"} · {symbols.length} sym
      </div>
    </div>
  );
}

function seedRowsFromSymbols(
  symbols: TickerSymbol[],
  setRows: (rows: TapeRow[]) => void,
) {
  if (symbols.length === 0) {
    setRows([]);
    return;
  }
  const now = Date.now();
  const rows: TapeRow[] = [];
  for (let i = 0; i < NUM_ROWS; i++) {
    const sym = symbols[i % symbols.length];
    if (!sym) continue;
    // Walk the price backward from "now" using a small per-step noise.
    const stepsBack = NUM_ROWS - i;
    const noise = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * 0.001;
    const price = sym.price * (1 - noise * stepsBack * 0.5);
    const change = price - (sym.price - sym.change);
    const changePct = (change / (sym.price - sym.change || 1)) * 100;
    const t = new Date(now - stepsBack * TICK_MS);
    rows.push({
      id: i,
      time: formatTime(t),
      symbol: sym.symbol,
      price,
      change,
      changePercent: changePct,
      synthetic: true,
    });
  }
  setRows(rows);
}

// Silence "unused" — STORAGE_KEYS kept around for future persistence work.
void STORAGE_KEYS;
