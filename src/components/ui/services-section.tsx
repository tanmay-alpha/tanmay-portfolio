"use client";

import { motion, useReducedMotion } from "framer-motion";

type Service = {
  title: string;
  body: string;
  evidence: string;
};

const SERVICES: ReadonlyArray<Service> = [
  {
    title: "Web applications",
    body: "Responsive sites, business portals, dashboards and full-stack apps.",
    evidence: "GatePass, FinCalc India",
  },
  {
    title: "Backend & data systems",
    body: "APIs, databases, authentication, data processing and automation.",
    evidence: "GatePass, MAET",
  },
  {
    title: "Applied AI & ML",
    body: "Practical AI integrations, evaluation tooling and data workflows.",
    evidence: "Flight Agent Evaluator, Crucible, Lumint",
  },
  {
    title: "Financial technology",
    body: "Dashboards, research tools, screening interfaces and analytical tools.",
    evidence: "MAET, RegimeShift, TradeVed internship",
  },
];

export function ServicesSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="services"
      className="relative w-full border-t border-border py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-6">
          <div className="col-span-12 md:col-span-2">
            <span className="eyebrow">Services</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h2 className="section-heading">What I can help build.</h2>

            <ul className="mt-10">
              {SERVICES.map((s) => (
                <motion.li
                  key={s.title}
                  className="grid gap-2 border-t border-border py-6 md:grid-cols-[240px_1fr] md:gap-8"
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="text-[17px] font-medium tracking-tight text-text-1">
                    {s.title}
                  </h3>
                  <div>
                    <p className="text-[15px] leading-[1.7] text-text-2">
                      {s.body}
                    </p>
                    <p className="mt-2 font-mono text-[11px] tracking-wide text-text-3">
                      See: {s.evidence}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[15px] leading-[1.7] text-text-2">
                Selected projects, one person, direct communication.
              </p>
              <a href="#contact" className="btn-primary self-start">
                Tell me about your project
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
