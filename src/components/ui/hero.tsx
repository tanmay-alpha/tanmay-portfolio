"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Github, Linkedin, FileText } from "lucide-react";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", icon: Linkedin },
  { label: "Resume", href: "/resume.pdf", icon: FileText },
] as const;

export function Hero() {
  const reduced = useReducedMotion();

  const fadeUp = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  return (
    <section
      id="top"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "calc(100svh - 72px)", paddingTop: "72px" }}
    >
      <div className="hero-background" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-12 md:gap-12 md:py-24 lg:grid-cols-[1fr_400px] lg:gap-16 lg:py-28">
          <div className="md:col-span-7 lg:col-span-1">
            <motion.p className="hero-eyebrow" {...fadeUp(0.05)}>
              Engineering · Markets · Curious
            </motion.p>

            <motion.h1 className="hero-name mt-6 text-balance" {...fadeUp(0.1)}>
              Tanmay Mangal
            </motion.h1>

            <motion.p
              className="hero-quote mt-8 max-w-xl text-pretty"
              {...fadeUp(0.2)}
            >
              I build useful software — financial research tools, full-stack
              products and applied ML systems.
            </motion.p>

            <motion.p
              className="mt-5 max-w-xl text-[15px] leading-[1.75] text-text-2 text-pretty"
              {...fadeUp(0.25)}
            >
              B.Tech CSE student at VIT Bhopal (2028). I like projects where
              correctness matters: market data, backtests, event access,
              model inference, agent evaluation.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3"
              {...fadeUp(0.3)}
            >
              <a href="#work" className="btn-primary">
                View my work
              </a>
              <a href="#contact" className="btn-secondary">
                Discuss a project
              </a>
              <div className="flex gap-2" role="list">
                {SOCIAL_LINKS.map((link) => {
                  const Icon = link.icon;
                  const external = link.href.startsWith("http");
                  return (
                    <a
                      key={link.label}
                      role="listitem"
                      href={link.href}
                      target={external ? "_blank" : undefined}
                      rel={external ? "noopener noreferrer" : undefined}
                      aria-label={link.label}
                      className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-text-2 transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  );
                })}
              </div>
            </motion.div>

            <motion.p
              className="mt-8 flex items-start gap-2 text-[14px] text-text-2"
              {...fadeUp(0.35)}
            >
              <span
                className="mt-[7px] h-2 w-2 shrink-0 rounded-full bg-[#4ADE80]"
                aria-hidden
              />
              <span>
                Available for selected freelance projects, and open to
                internships and AI/ML or full-stack roles.
              </span>
            </motion.p>
          </div>

          <motion.div
            className="hero-portrait md:col-span-5 md:col-start-9 lg:col-span-1 lg:col-start-auto flex justify-center md:justify-end"
            {...fadeUp(0.15)}
          >
            <div className="relative aspect-square w-[240px] overflow-hidden rounded-full border border-border-strong bg-surface md:w-[340px] lg:w-[400px]">
              <Image
                src="/tanmay.jpg"
                alt="Tanmay Mangal — portrait"
                width={880}
                height={880}
                priority
                quality={90}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
