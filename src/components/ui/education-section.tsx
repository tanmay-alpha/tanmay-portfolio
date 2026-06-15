"use client";

import { motion } from "framer-motion";

const COURSEWORK = [
  "Data Structures & Algorithms",
  "Object-Oriented Programming",
  "Operating Systems",
  "Computer Networks",
  "Database Systems",
  "Linear Algebra",
  "Probability & Statistics",
  "Machine Learning",
];

const ACTIVITIES = [
  {
    role: "ECell VIT Bhopal — Operations",
    detail: "(Nov 2024 – Dec 2025), ran ops for 2 flagship events.",
  },
  {
    role: "Techfest IIT Bombay Campus Ambassador",
    detail: "— top 4,000 of 50,000+ nationwide (May 2025 – Dec 2025).",
  },
];

export function EducationSection() {
  return (
    <section
      id="education"
      className="relative w-full border-t border-border py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-2 flex flex-col gap-6">
            <span className="eyebrow">Education</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-12 md:col-span-10"
          >
            <div
              className="rounded-lg p-8 mx-auto"
              style={{
                background: "#0F0F0F",
                border: "1px solid rgba(255,255,255,0.06)",
                maxWidth: "720px",
              }}
            >
              <p
                className="font-mono uppercase tracking-widest text-text-3"
                style={{ fontSize: "10px", letterSpacing: "0.18em" }}
              >
                Education
              </p>

              <h3
                className="mt-3"
                style={{
                  fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: "28px",
                  color: "var(--text-1)",
                }}
              >
                VIT Bhopal
              </h3>

              <p className="mt-2 text-[14px] text-text-2">
                B.Tech Computer Science &amp; Engineering · 2024 – 2028 ·
                CGPA 8.49 / 10
              </p>

              <p
                className="mt-8 font-mono uppercase tracking-widest text-text-3"
                style={{ fontSize: "10px", letterSpacing: "0.18em" }}
              >
                Relevant Coursework
              </p>

              <p className="mt-3 text-[13px] text-text-1 flex flex-wrap gap-x-2 gap-y-1">
                {COURSEWORK.map((course, i) => (
                  <span key={course} className="inline-flex items-center">
                    {i > 0 && (
                      <span className="text-text-3 mr-2" aria-hidden>
                        ·
                      </span>
                    )}
                    {course}
                  </span>
                ))}
              </p>

              <p
                className="mt-8 font-mono uppercase tracking-widest text-text-3"
                style={{ fontSize: "10px", letterSpacing: "0.18em" }}
              >
                Activities
              </p>

              <ul className="mt-3 space-y-2 text-[14px] text-text-1">
                {ACTIVITIES.map((a) => (
                  <li key={a.role} className="leading-[1.6]">
                    {a.role} <span className="text-text-2">{a.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
