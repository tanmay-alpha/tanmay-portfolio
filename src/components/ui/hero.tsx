"use client";

import Image from "next/image";
import { Github, Linkedin, Mail, FileText } from "lucide-react";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/tanmay-alpha", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/tanmaymangal", icon: Linkedin },
  { label: "Email", href: "mailto:mangaltanmay7@gmail.com", icon: Mail },
  { label: "Resume", href: "/resume.pdf", icon: FileText },
] as const;

export function Hero() {
  return (
    <section
      id="top"
      className="relative w-full overflow-hidden"
      style={{ minHeight: "calc(100svh - 72px)", paddingTop: "72px" }}
    >
      {/* Warm gradient mesh behind the hero content. */}
      <div className="hero-background" aria-hidden />

      <div className="relative z-10 mx-auto max-w-[1100px] px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 py-20 md:grid-cols-12 md:gap-12 md:py-28 lg:py-32">
          {/* Text block: cols 1-7 */}
          <div className="md:col-span-7">
            <p className="hero-eyebrow">
              Engineering · Markets · Curious
            </p>

            <h1 className="hero-name mt-6 hero-name-anim text-balance">
              Tanmay Mangal
            </h1>

            <p className="hero-quote mt-8 max-w-xl text-pretty">
              Building things until I understand them.
            </p>

            <div className="hero-links mt-12 flex flex-wrap gap-3">
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
            </div>
          </div>

          {/* Portrait: cols 9-12 */}
          <div className="hero-portrait md:col-span-5 md:col-start-9 flex justify-center md:justify-end">
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
          </div>
        </div>
      </div>
    </section>
  );
}
