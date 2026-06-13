"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", icon: Linkedin },
  { label: "Email", href: "mailto:mangaltanmay7@gmail.com", icon: Mail },
  { label: "Resume", href: "/resume.pdf", icon: FileText },
] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  // Subtle parallax: text moves faster than the photo.
  const textY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -40]);
  const photoY = useTransform(scrollY, [0, 600], [0, reduced ? 0 : -16]);

  return (
    <section
      id="top"
      className="relative w-full"
      style={{ minHeight: "calc(100svh - 56px)" }}
    >
      <div className="mx-auto max-w-container px-6 lg:px-8">
        {/* Eyebrow row */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800">
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            tanmaymangal.portfolio / 2026
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            <motion.span
              aria-hidden
              className="inline-block h-1 w-1 rounded-full bg-zinc-500"
              animate={
                reduced
                  ? { opacity: 0.5 }
                  : { opacity: [0.3, 1, 0.3] }
              }
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            [ scroll ]
          </span>
        </div>

        {/* Hero proper */}
        <motion.div
          className="grid-12 gap-y-12 py-16 md:py-24 lg:py-32"
          style={{ y: textY }}
        >
          {/* Text block: cols 1-7 */}
          <div className="col-span-12 md:col-span-7">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              AI/ML · Full-stack · Quant-adjacent
            </span>

            <h1 className="mt-6 font-serif italic text-display-xl font-light text-paper text-balance">
              Tanmay Mangal
            </h1>

            <p className="mt-10 max-w-xl font-serif text-2xl italic font-normal leading-snug text-zinc-400 text-pretty md:text-3xl">
              <span aria-hidden className="mr-2 text-accent">—</span>
              Build to understand. Trade to learn. Ship to compound.
            </p>

            <div className="mt-12 flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={link.label}
                    className="group flex h-11 w-11 items-center justify-center rounded-md border border-zinc-800 bg-transparent text-zinc-400 transition-all duration-200 ease-editorial hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Photo: cols 9-12 */}
          <motion.div
            className="col-span-12 md:col-span-5 md:col-start-9 flex items-end"
            style={{ y: photoY }}
          >
            <div className="relative w-full max-w-[300px] mx-auto md:mx-0 aspect-[3/4] overflow-hidden md:max-w-none md:w-full">
              <motion.div
                className="relative h-full w-full"
                whileHover={reduced ? undefined : { scale: 1.02 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src="/tanmay.jpg"
                  alt="Tanmay Mangal — portrait"
                  width={600}
                  height={800}
                  priority
                  quality={95}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
