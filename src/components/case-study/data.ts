export type Shot = {
  src: string;
  alt: string;
  caption: string;
};

export type Section = {
  heading: string;
  /** Plain paragraphs, rendered first. */
  paragraphs?: ReadonlyArray<string>;
  /** Bulleted points, rendered after the paragraphs. */
  points?: ReadonlyArray<string>;
};

export type CaseStudy = {
  slug: string;
  name: string;
  title: string;
  description: string;
  lede: string;
  live: string;
  github: string;
  stack: ReadonlyArray<string>;
  shots: ReadonlyArray<Shot>;
  sections: ReadonlyArray<Section>;
  sources: string;
};

// Every statement below comes from the project's own docs (cited in
// `sources`), read on 2026-11-10, or from the live pages when the screenshots
// were taken. No user counts, no benchmarks, no "production-ready" claims.
export const CASE_STUDIES: ReadonlyArray<CaseStudy> = [
  {
    slug: "maet",
    name: "MAET",
    title: "MAET: an honest paper-trading and backtesting workspace for NSE equities",
    description:
      "Case study of MAET: how quotes, a paper-trading engine and a backtest runner are built so fills and results can be trusted, and where they still fall short.",
    lede: "A research terminal for Indian equities with a screener, charts, a strategy lab and a paper-trading engine. The interesting work is in the parts that decide whether a fill or a backtest result is believable.",
    live: "https://maet-pi.vercel.app",
    github: "https://github.com/tanmay-alpha/MAET",
    stack: [
      "typescript",
      "react 19",
      "tanstack start",
      "nitro",
      "postgresql",
      "drizzle",
      "redis",
      "angel one smartapi",
    ],
    shots: [
      {
        src: "/screenshots/maet-home.webp",
        alt: "MAET landing page with an NSE market watch table and index tiles, marked market closed with last available quotes.",
        caption:
          "Public landing page, captured 10 Nov 2026 outside market hours. The page labels the quotes as the last available ones and shows their timestamps.",
      },
      {
        src: "/screenshots/maet-screener.webp",
        alt: "MAET stock screener listing NSE companies with price, change, volume and ISIN, with a notice that the database is offline.",
        caption:
          "Screener, same day. The page itself reported “Database offline: NSE company list with live quotes only”: the documented fallback when Postgres is unreachable, not a mock-up.",
      },
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "Retail research tools tend to show a number without saying where it came from, and backtests that quietly peek at the future. I wanted a workspace where every quote carries its provenance and where a paper fill or a backtest trade has to earn its price.",
          "MAET is that workspace for NSE and BSE cash equities: screener, charts, a strategy lab with backtests, parameter sweeps and walk-forward runs, and a paper-trading engine. It is research and execution practice. No code path sends orders to a broker.",
        ],
      },
      {
        heading: "Architecture",
        points: [
          "Frontend: React 19 with TanStack Start, built with Vite and served from Vercel.",
          "Backend: one Nitro server on a single Render free-plan web service. A health check hits /api/health; no worker services are declared.",
          "State: PostgreSQL through Drizzle (pool of 5, transaction-pooler friendly). Redis holds the candle cache, the daily-processor lock and paper-notification pub/sub. It is not in the quote path.",
          "Market data: Angel One REST and a WebSocket feed for live NSE ticks, with Yahoo Finance as a delayed fallback and the source of historical candles.",
          "One process runs the orchestrator: an in-memory quote store, a tick bus, the paper order matcher and 2-second margin monitor, an alert evaluator and a daily processor that runs after 18:30 IST on trading days.",
          "Quote path: a fresh streamed tick first, then Angel One REST, then Yahoo. A quote cached during the session is relabelled “delayed” once the market is no longer open, so the UI never presents it as live.",
          "The paper-trading arithmetic (price, charges, position reconciliation, margin) is pure code in shared/. The server layer adds locking, persistence and quote sourcing, which is what lets the arithmetic be unit-tested without a database.",
        ],
      },
      {
        heading: "Constraints and tradeoffs",
        points: [
          "Free-plan hosting means everything that would normally be a worker runs inside the one web process. The cost: an idle service sleeps, queued backtest jobs wait until it wakes, and CPU-heavy work shares an event loop with tick matching.",
          "It is a margin account, not a cash account. A fill never debits the trade’s notional; cash moves only by realised P&L and fees, and margin limits buying power. Short selling is allowed.",
          "A paper fill is refused unless the quote is fresh (15 s by default), not stale, not synthetic and not delayed. So when only Yahoo is available, MARKET orders are refused rather than filled at a price nobody could have traded at. Delayed fills can be enabled by config.",
          "Resting orders fill at most 10% of the volume traded since the previous tick, with a one-share floor, so a huge limit order cannot fill entirely on a single quote. Market-order slippage is tiered: 0.05%, 0.15% and 0.30% of price by order value.",
          "Backtests take the conservative side: when a bar touches both the stop and the target, the stop wins.",
        ],
      },
      {
        heading: "Hard parts",
        points: [
          "Look-ahead in backtests. Rules are evaluated at bar i−1 and filled at bar i’s open, a position closed on a bar cannot re-enter on it, and position sizing uses ATR at the signal bar. Because the indicator cache is computed over the whole series, correctness depends on every indicator being causal, which the docs call out as an assumption rather than a guarantee.",
          "Concurrent money-moving work. Every write path locks the account row first, then the order, positions and bracket relatives. Transactions are SERIALIZABLE and retry on serialization failure or deadlock, up to three attempts. The quote is loaded before the transaction opens so no network I/O happens while locks are held.",
          "Racing the matcher. The tick matcher reads its candidate orders without locks, then re-reads each one under lock and re-checks status, generation and fingerprint, because a cancel, fill or reset may have committed in between.",
          "Reset without rewriting history. Resetting an account bumps a generation counter and writes a new initial-cash ledger row. Positions, fills, ledger rows and idempotency keys are scoped by generation, so old rows stay as history. Fills and ledger entries are append-only by database trigger.",
        ],
      },
      {
        heading: "Testing",
        points: [
          "Pure paper-trading arithmetic is unit-tested without a database (financial-invariants.test.ts). Integrity properties are tested against real PostgreSQL in the engine-integrity, concurrency and risk-liquidation integration suites, including “cancel racing a fill never leaves fills behind a cancellation”.",
          "For look-ahead, truncated-history.test.ts checks that a run which never saw bars after time T agrees with the full-history run on every trade and equity point before T. fill-bar-look-ahead.test.ts perturbs the fill bar’s high, low, close and volume and checks that decisions made at its open do not change.",
          "CI runs typecheck, lint, a test-wiring check and the unit tests, plus three jobs against a postgres:16 service for the paper-trading integration, concurrency and advanced-feature suites. A separate workflow polls production /api/health until it reports the pushed commit.",
        ],
      },
      {
        heading: "Limitations and what I’d do next",
        points: [
          "Every fill is charged at delivery rates because orders have no CNC/MIS product field. The docs’ own example: an intraday round trip of ₹1,00,000 costs ₹222.24 here against ₹35.24 at intraday rates. Adding a product field is the first fix.",
          "The live feed covers NSE cash only. BSE orders get no executable quote, so BSE MARKET orders are refused and BSE resting orders never match.",
          "An account in LIQUIDATION_PENDING can stay stuck when a position has no executable quote; the only user-side exit is a reset.",
          "Research jobs and synchronous backtests run inside the web process. The portfolio engine, the spread and market-impact execution model, point-in-time fundamentals and corporate-action adjustment exist in the repository but are not used by production backtests yet.",
          "State such as the quote cache and rate-limit buckets lives in process memory, so a second instance would split it. There is no metrics exporter or tracing, only logs and health endpoints.",
          "Next, in order: the product field, a separate worker for research jobs, and wiring corporate actions into backtests.",
        ],
      },
    ],
    sources:
      "Source: the repository’s docs/ARCHITECTURE.md, docs/PAPER_TRADING_ENGINE.md and docs/RESEARCH_ENGINE.md, which describe the code at commit ca8b1bb.",
  },
  {
    slug: "gatepass",
    name: "GatePass",
    title: "GatePass: single-use event passes with an atomic admission check",
    description:
      "Case study of GatePass: how a one-process, SQLite-backed event check-in system guarantees a pass admits only once, how it was tested, and what the live demo does not do.",
    lede: "QR passes for events and a scanner page for door staff. The core promise is small and strict: a pass is admitted at most once, even when several scanners hit it at the same instant.",
    live: "https://gatepass-sandy.vercel.app",
    github: "https://github.com/tanmay-alpha/gatepass",
    stack: [
      "typescript",
      "node.js",
      "express",
      "sqlite",
      "react",
      "zxing wasm",
      "docker",
    ],
    shots: [
      {
        src: "/screenshots/gatepass-login.webp",
        alt: "GatePass sign-in page with a banner saying this is a demo environment whose data is erased whenever the server restarts.",
        caption:
          "The public sign-in page, captured 10 Nov 2026. The banner is real: the live demo’s data is erased whenever its server restarts. I did not create an account to capture anything behind it.",
      },
    ],
    sections: [
      {
        heading: "Problem",
        paragraphs: [
          "At a door, the same pass can be scanned by several devices: a forwarded screenshot, two gates, two people arriving together. Exactly one scan of a pass may admit, and a time-slot with a capacity may never admit more than that capacity.",
          "GatePass is built on CompleteTech-LLC/qr-code-toolkit (MIT). Upstream stored everything in a JSON file that was rewritten in place and replaced by an empty store on any parse error. I kept the upstream history and QR renderer and rebuilt the persistence, admission and access-control layers around a real database.",
        ],
      },
      {
        heading: "Architecture",
        points: [
          "One Node.js process: an Express API, a server-rendered attendee pass page, and the built React bundle (an admin app, and a scanner app at /scan).",
          "Everything lives in one SQLite file opened through node:sqlite, with WAL, foreign keys, STRICT tables and synchronous = FULL. Migrations are an append-only list tracked by PRAGMA user_version, with a verified backup taken before an upgrade.",
          "Each event has gates and admission policies (an entry window, an optional capacity, optional allowed gates). Admission is decided by a pure function, evaluateAdmission, in a fixed order of checks, so the rules can be tested without I/O.",
          "Tokens are 32 random bytes and only their SHA-256 hash is stored. The QR encodes a URL, and opening that URL never changes state.",
          "Recommended hosting is Docker Compose with Caddy on one VM. Vercel is an optional static front that proxies /api and /p to the API host with a shared origin secret. The server itself never runs on Vercel because SQLite needs a persistent disk.",
        ],
      },
      {
        heading: "Constraints and tradeoffs",
        points: [
          "One process, one writer. All writes are serialised through SQLite, which is exactly the property the redemption logic relies on, and it is also the throughput ceiling. There is no horizontal scaling and no high availability, and rate-limit state is in that process’s memory.",
          "node:sqlite is still marked experimental in Node, and its calls are synchronous, so the redeem path is limited to indexed single-row lookups.",
          "No offline scanning. Single use needs the server, so a venue network or server outage stops admission.",
          "The hash-only token design means a lost pass link cannot be recovered, only reissued or revoked.",
        ],
      },
      {
        heading: "Hard parts",
        points: [
          "Atomic redemption. A redeem runs in one transaction that starts with BEGIN IMMEDIATE, so any other writer waits and then reads committed state. It reads the pass, the event window and the policy, evaluates the rules, claims capacity with a conditional UPDATE (zero changed rows means capacity_full), inserts the redemption and logs the scan. Any error rolls all of it back together.",
          "The database as a backstop. redemptions.pass_id is the primary key and admission_policies carries CHECK (capacity IS NULL OR admitted_count <= capacity), so double admission and capacity overrun are refused even if the application rules were wrong.",
          "Durability story. Every commit syncs the WAL; the CLI has backup, verify and restore commands, and a database newer than the build or a corrupt file stops startup instead of being replaced.",
          "Roles and secrets. Accounts use a Host-prefixed, HttpOnly session cookie with a CSRF header; scanner devices use a per-device key. Scanner setup links carry that key in the URL fragment, which browsers do not send to servers.",
        ],
      },
      {
        heading: "Testing",
        points: [
          "The test matrix maps each requirement to a test and records the last run. The recorded full run was 21 files, 256 passed and 1 skipped (the SIGTERM test, which cannot run on Windows), on one Windows laptop. That is the doc’s figure for that run, not a CI result.",
          "Concurrency tests run each redemption in its own worker thread with its own SQLite connection, released together, at 2, 25 and 100 threads. The history is checked against the sequential specification “the first redemption admits, every later one is already_redeemed”, using the real-time-order condition from Herlihy and Wing. The doc is explicit that this is evidence about observed histories, not a proof of linearizability.",
          "The suite also covers process-recovery tests with real server processes killed and restarted, Playwright end-to-end runs on Chromium, Firefox and WebKit, and a Docker restart check where a redeemed pass stays redeemed afterwards.",
        ],
      },
      {
        heading: "Limitations and what I’d do next",
        points: [
          "The live demo is not durable. Its backend is a Render free instance with no persistent disk, so all data is erased on every restart, deploy or idle spin-down. The demo shows a warning, and the docs say not to run a real event on it. A durable setup (the same container on a persistent disk) is designed but not enabled.",
          "Camera scanning on real iPhone or Android devices has not been verified; tests use fakes and a generated frame. The test matrix includes a manual checklist for it.",
          "The doc records that GitHub-hosted CI had no recorded result yet when it was written, and that the free Render instance has not been load-tested. All performance figures come from my laptop.",
          "Recorded security gaps include: no MFA or email verification, only a short local list of weak passwords, failed operator-token attempts not audited, and an open question about closing sign-up still allowing invited organizers.",
          "Next: run on a durable host and verify a physical-device scan end to end before calling it event-ready.",
        ],
      },
    ],
    sources:
      "Sources: the repository’s docs/architecture.md, docs/security-and-threat-model.md, docs/test-matrix.md and docs/decisions/ (ADRs 0001, 0003, 0007, 0009), plus its README for the upstream attribution and hosting status.",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
