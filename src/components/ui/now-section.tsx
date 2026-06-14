"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/reveal";

const NOW_ITEMS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Building", value: "trading infrastructure and AI systems" },
  { label: "Reading", value: "market microstructure, ML papers, whatever's interesting" },
  { label: "Eating", value: "best food I can find in Bhopal and Agra" },
  { label: "Based in", value: "VIT Bhopal, Madhya Pradesh" },
];

export function NowSection() {
  const reduced = useReducedMotion();

  return (
    <section
      id="now"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-6">
            <Reveal as="div">
              <span className="eyebrow">Now</span>
            </Reveal>
          </div>

          <div className="col-span-12 md:col-span-10">
            <Reveal>
              <h2 className="section-heading text-balance">Currently.</h2>
              <p className="mt-2 max-w-2xl text-[13px] text-text-3">
                Updated as life changes — roughly monthly.
              </p>
            </Reveal>

            <motion.div
              className="mt-10"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
              variants={{
                hidden: {},
                show: {
                  transition: reduced
                    ? { staggerChildren: 0 }
                    : { staggerChildren: 0.08, delayChildren: 0.05 },
                },
              }}
            >
              {NOW_ITEMS.map((item) => (
                <motion.div
                  key={item.label}
                  className="now-row"
                  variants={{
                    hidden: reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
                    },
                  }}
                >
                  <span className="now-label">{item.label}</span>
                  <span className="now-value">{item.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
