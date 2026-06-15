"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Github, Linkedin, Mail, FileText } from "lucide-react";
import { AuroraOrb } from "@/components/ui/aurora-orb";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", icon: Linkedin },
  { label: "Email", href: "mailto:mangaltanmay7@gmail.com", icon: Mail },
  { label: "Resume", href: "/resume.pdf", icon: FileText },
] as const;

/** Per-child stagger, expressed in seconds. */
const FADE_UP_STAGGER = {
  eyebrow: 0.05,
  name: 0.10,
  quote: 0.20,
  links: 0.30,
  portrait: 0.15,
} as const;

export function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // Subtle parallax: text drifts up at half scroll speed, portrait
  // drifts up at full speed. Capped to ±40px / ±80px so it never feels
  // detached. Disabled when the user prefers reduced motion.
  const textY = useTransform(scrollY, [0, 600], [0, -40]);
  const portraitY = useTransform(scrollY, [0, 600], [0, -80]);
  const orbY = useTransform(scrollY, [0, 600], [0, 60]);

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
      {/* Warm gradient mesh behind the hero content. */}
      <div className="hero-background" aria-hidden />

      {/* WebGL aurora orb — slow-drifting amber + cyan radial blobs. */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-screen opacity-90"
        aria-hidden
        style={reduced ? undefined : { y: orbY }}
      >
        <AuroraOrb />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 py-20 md:grid-cols-12 md:gap-12 md:py-28 lg:py-32">
          {/* Text block: cols 1-7. Wrapped in motion.p for parallax. */}
          <motion.div
            className="md:col-span-7"
            style={reduced ? undefined : { y: textY }}
          >
            <motion.p className="hero-eyebrow" {...fadeUp(FADE_UP_STAGGER.eyebrow)}>
              Engineering · Markets · Curious
            </motion.p>

            <motion.h1
              className="hero-name mt-6 text-balance"
              {...fadeUp(FADE_UP_STAGGER.name)}
            >
              Tanmay Mangal
            </motion.h1>

            <motion.p
              className="hero-quote mt-8 max-w-xl text-pretty"
              {...fadeUp(FADE_UP_STAGGER.quote)}
            >
              Building things until I understand them.
            </motion.p>

            <motion.div
              {...fadeUp(FADE_UP_STAGGER.links)}
            >
              <a
                href="#contact"
                className="open-to-callout inline-flex items-center gap-2 mt-6 text-text-2 hover:text-text-1 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-[#4ADE80]" aria-hidden />
                <span className="text-[14px]">Open to AI/ML or full-stack roles @ fintech, trading, YC-stage.</span>
              </a>
            </motion.div>

            <motion.div
              className="hero-links mt-12 flex flex-wrap gap-3"
              {...fadeUp(FADE_UP_STAGGER.links)}
            >
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={link.label}
                    className="group flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-[rgba(255,255,255,0.05)] text-text-2 transition-all duration-200 hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Portrait: cols 9-12, parallax at a different rate. */}
          <motion.div
            className="hero-portrait md:col-span-5 md:col-start-9 flex justify-center md:justify-end"
            style={reduced ? undefined : { y: portraitY }}
            {...fadeUp(FADE_UP_STAGGER.portrait)}
          >
            <div className="relative aspect-square w-[220px] overflow-hidden rounded-full border border-border-strong bg-surface md:w-[260px]">
              <Image
                src="/tanmay.jpg"
                alt="Tanmay Mangal — portrait"
                width={520}
                height={520}
                priority
                quality={95}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
