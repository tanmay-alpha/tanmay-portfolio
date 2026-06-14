"use client";

import { useEffect, useRef } from "react";

const NOW_ITEMS: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Building", value: "trading infrastructure and AI systems" },
  { label: "Reading", value: "market microstructure, ML papers, whatever's interesting" },
  { label: "Eating", value: "best food I can find in Bhopal and Agra" },
  { label: "Based in", value: "VIT Bhopal, Madhya Pradesh" },
];

export function NowSection() {
  const sectionRef = useRef<HTMLElement>(null);

  // Add .reveal to each row, then watch for visibility.
  useEffect(() => {
    const root = sectionRef.current;
    if (!root) return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    rows.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    rows.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="now"
      className="relative w-full border-t border-border py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-6">
            <span className="eyebrow">Now</span>
          </div>

          <div className="col-span-12 md:col-span-10">
            <h2 className="section-heading text-balance">
              Currently.
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] text-text-3">
              Updated as life changes — roughly monthly.
            </p>

            <div className="mt-10">
              {NOW_ITEMS.map((item) => (
                <div
                  key={item.label}
                  data-reveal
                  className="now-row"
                >
                  <span className="now-label">{item.label}</span>
                  <span className="now-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
