"use client";

import { motion, useReducedMotion } from "framer-motion";

type Item = { text: string; href?: string };

const ITEMS: ReadonlyArray<Item> = [
  { text: "Indian equities and market-data research" },
  { text: "Company fundamentals and screening (the TradeVed screener is private, so no link)" },
  { text: "Technical indicators and historical price analysis" },
  { text: "Backtesting with explicit no-look-ahead rules and trading costs (MAET)" },
  {
    text: "Quantitative research and regime analysis (RegimeShift)",
    href: "https://github.com/tanmay-alpha/RegimeShift",
  },
];

export function MarketsSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="markets"
      className="relative w-full border-t border-border py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-6">
          <div className="col-span-12 md:col-span-2">
            <span className="eyebrow">Markets</span>
          </div>
          <motion.div
            className="col-span-12 md:col-span-10"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="section-heading">
              Why markets keep showing up in my code.
            </h2>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-text-2">
              I started out curious about how markets actually work. That led
              to trading on Zerodha, then to building my own tools to look at
              the data, and eventually to the data engineering and ML side of
              it. Most of my projects still trace back to that.
            </p>

            <ul className="mt-8 max-w-2xl space-y-3 text-[15px] leading-[1.7] text-text-2">
              {ITEMS.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <span aria-hidden className="mt-[0.7em] h-px w-4 shrink-0 bg-accent" />
                  <span>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-1 underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:decoration-accent"
                      >
                        {item.text}
                      </a>
                    ) : (
                      item.text
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-2xl text-[15px] leading-[1.75] text-text-2">
              RegimeShift&apos;s own finding is that the HMM did not reliably
              beat an equal-weight portfolio. I kept that result in the
              write-up because reporting it straight matters more than a
              flattering chart.
            </p>

            <p className="mt-6 font-mono text-[11px] tracking-wide text-text-3">
              This is research and tooling, not investment advice.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
