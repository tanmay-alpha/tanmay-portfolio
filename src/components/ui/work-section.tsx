"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type Project = {
  name: string;
  subtitle: string;
  problem: string;
  built: string;
  decision: string;
  evidence: string;
  stack: ReadonlyArray<string>;
  github: string;
  live?: string;
  caseStudy?: string;
  liveNote?: string;
};

// Every claim below is taken from the project's own README / repository
// (checked 2026-11-10). Nothing here is a benchmark or user count.
const PROJECTS: ReadonlyArray<Project> = [
  {
    name: "MAET",
    subtitle: "Market analytics & paper-trading terminal · NSE / BSE",
    problem:
      "Retail research tools show numbers without saying where they came from or whether a backtest is honest.",
    built:
      "Screener, charting, a strategy lab (backtests, walk-forward, parameter heatmaps) and a paper-trading engine with OCO brackets and Indian equity charges.",
    decision:
      "Backtest rules are evaluated on bar i−1 and filled at bar i's open, so no look-ahead; paper fills require a fresh live quote. The docs state what is and isn't guaranteed.",
    evidence: "CI on every push; deployed frontend; engineering docs written from the code.",
    stack: ["typescript", "react 19", "postgresql", "drizzle", "bigquery", "sse"],
    github: "https://github.com/tanmay-alpha/MAET",
    live: "https://maet-pi.vercel.app",
    caseStudy: "/work/maet",
  },
  {
    name: "GatePass",
    subtitle: "Event admission system · QR passes",
    problem:
      "A ticket must be admitted exactly once, even with flaky door-staff connections and several scanners at the same gate.",
    built:
      "Organizer dashboard, per-event roles, gates and admission rules, scanner devices with camera scanning, attendee pass pages, audit log and CSV exports.",
    decision:
      "Admission is decided inside one database transaction backed by constraints, and the scanner fails closed: no server answer means “not verified”. Retries reuse a request id, so a dropped connection never turns into a false “already used”.",
    evidence:
      "Live demo (free tier, data resets on restart). Extensive docs: threat model, test matrix, ADRs. Built on top of CompleteTech-LLC/qr-code-toolkit.",
    stack: ["typescript", "node", "sql", "zxing (wasm)", "docker"],
    github: "https://github.com/tanmay-alpha/GatePass",
    live: "https://gatepass-sandy.vercel.app",
    caseStudy: "/work/gatepass",
  },
  {
    name: "Crucible",
    subtitle: "ONNX inference engine from scratch",
    problem:
      "I wanted to understand what actually happens between a .onnx file and a prediction.",
    built:
      "A C++17 engine with its own protobuf parser, graph executor and 20 operators; a FastAPI model-serving service (pybind11), a Rust CLI, and a Rust/WASM interpreter that runs a fraud model in the browser.",
    decision:
      "Unsupported operators and attributes are rejected with an error naming the node, rather than computed wrongly. Output is checked against ONNX Runtime on real models.",
    evidence:
      "Honest about limits: single-threaded and several times slower than ONNX Runtime. Browser demo is live; the hosted API is not deployed.",
    stack: ["c++17", "rust", "webassembly", "fastapi", "pybind11", "react"],
    github: "https://github.com/tanmay-alpha/onnx-inference-engine",
    live: "https://crucible-ivory-three.vercel.app",
    liveNote: "browser demo",
  },
  {
    name: "Flight Agent Evaluator",
    subtitle: "Reliability & safety evaluation for tool-using AI agents",
    problem:
      "Scoring only an agent's final answer misses the failures that matter: acting after approval was denied, duplicating a payment on retry, claiming success when nothing was committed.",
    built:
      "A deterministic, stateful simulated airline back end plus an evaluator that scores the whole trajectory — tools, arguments, order, side effects and whether the answer is backed by what happened.",
    decision:
      "Everything runs offline and deterministically; the same inputs produce byte-identical reports, and the evaluator's own accuracy is measured against labelled traces.",
    evidence: "CI on Python 3.11–3.13; benchmark and validation commands reproduce from the repo.",
    stack: ["python", "pydantic", "pytest", "uv"],
    github: "https://github.com/tanmay-alpha/Flight-Agent-Evaluator",
  },
];

export function WorkSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="work"
      className="relative w-full border-t border-border py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 mb-10 gap-y-6 md:mb-14">
          <div className="col-span-12 md:col-span-2">
            <span className="eyebrow">Selected work</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="section-heading">Four things I&apos;d show you first.</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.75] text-text-2">
              Chosen for engineering substance, not stack length. Each README
              says what works and what doesn&apos;t.
            </p>
          </div>
        </div>

        <div>
          {PROJECTS.map((project) => (
            <motion.article
              key={project.name}
              className="project-row"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-3">
                  <h3 className="project-name">{project.name}</h3>
                  <p className="mt-2 font-mono text-[10px] uppercase leading-[1.6] tracking-[1.5px] text-text-3">
                    {project.subtitle}
                  </p>
                  <div className="mt-4 flex flex-col items-start gap-2">
                    {project.caseStudy && (
                      <Link
                        href={project.caseStudy}
                        className="project-github underline decoration-border-strong underline-offset-4"
                      >
                        Case study →
                      </Link>
                    )}
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-github underline decoration-border-strong underline-offset-4"
                      >
                        Live{project.liveNote ? ` (${project.liveNote})` : ""} →
                      </a>
                    )}
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-github underline decoration-border-strong underline-offset-4"
                    >
                      Source on GitHub →
                    </a>
                  </div>
                </div>

                <dl className="grid gap-4 text-[14px] leading-[1.7] md:col-span-9">
                  <Row term="Problem" text={project.problem} />
                  <Row term="What I built" text={project.built} />
                  <Row term="Key decision" text={project.decision} />
                  <Row term="Evidence" text={project.evidence} />
                </dl>
                <div className="flex flex-wrap gap-1.5 pt-1 md:col-span-9 md:col-start-4">
                  {project.stack.map((tag) => (
                    <span key={tag} className="tech-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ term, text }: { term: string; text: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-4">
      <dt className="font-mono text-[10px] uppercase tracking-[1.5px] text-accent sm:pt-1">
        {term}
      </dt>
      <dd className="text-text-2">{text}</dd>
    </div>
  );
}
