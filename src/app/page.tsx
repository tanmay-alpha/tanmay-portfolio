"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMediaQuery } from "@/lib/hooks";
import { Navigation } from "@/components/ui/navigation";
import { Hero } from "@/components/ui/hero";
import { Tape } from "@/components/ui/tape";
import { Kanji } from "@/components/ui/kanji";

// 3D libs (three, drei, postprocessing) are ~300kB on their own.
// Load the diamond client-side only so it doesn't bloat the initial
// JS payload. Renders nothing on the server.
const Hero3D = dynamic(
  () => import("@/components/ui/hero-3d").then((m) => m.Hero3D),
  { ssr: false },
);

gsap.registerPlugin(ScrollTrigger);

const SECTIONS: ReadonlyArray<{
  id: string;
  num: string;
  kanji: string;
  kanjiPosition: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  header: React.ReactNode;
  description: string;
  minHeight: string;
}> = [
  {
    id: "about",
    num: "001 / about",
    kanji: "現在",
    kanjiPosition: "top-right",
    header: (
      <>
        A short note on <em className="italic">who</em> I am.
      </>
    ),
    description: "[ identity — placeholder ]",
    minHeight: "80vh",
  },
  {
    id: "projects",
    num: "002 / work",
    kanji: "解析",
    kanjiPosition: "top-left",
    header: (
      <>
        Things I&apos;ve <em className="italic">built</em>.
      </>
    ),
    description: "[ work — placeholder ]",
    minHeight: "80vh",
  },
  {
    id: "experience",
    num: "003 / trail",
    kanji: "交信",
    kanjiPosition: "bottom-right",
    header: (
      <>
        Where I&apos;ve <em className="italic">been</em>.
      </>
    ),
    description: "[ trail — placeholder ]",
    minHeight: "80vh",
  },
  {
    id: "contact",
    num: "004 / talk",
    kanji: "接触",
    kanjiPosition: "bottom-left",
    header: (
      <>
        Let&apos;s <em className="italic">talk</em>.
      </>
    ),
    description: "[ talk — placeholder ]",
    minHeight: "60vh",
  },
];

export default function Home() {
  const isReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // GSAP ScrollTrigger setup — scroll-linked animations for the hero and
  // section headers. Registered once at mount.
  useEffect(() => {
    if (isReducedMotion) return;
    const ctx = gsap.context(() => {
      // Hero: fade out as we scroll past.
      gsap.to("#top", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: "#top",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Section headers: clip-path reveal on enter.
      const headers = gsap.utils.toArray<HTMLElement>("[data-reveal-header]");
      headers.forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          {
            clipPath: "inset(0 0% 0 0)",
            opacity: 1,
            duration: 1.1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    });
    return () => ctx.revert();
  }, [isReducedMotion]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />

      {/* HERO: tape background + 3D diamond + content layered on top */}
      <div className="relative">
        <Tape />
        <Hero3D />
        <Hero />
      </div>

      {/* MAGAZINE SECTIONS */}
      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="relative flex min-h-[80vh] w-full flex-col items-center justify-center px-6 py-24"
          style={{ minHeight: section.minHeight }}
        >
          <Kanji
            character={section.kanji}
            position={section.kanjiPosition}
            size={320}
            opacity={0.05}
            weight={200}
          />
          <h2
            data-reveal-header
            className="relative z-10 max-w-3xl text-center font-serif text-serif-h2 italic text-text-primary text-balance"
          >
            {section.header}
          </h2>
          <p className="relative z-10 mt-6 font-mono text-xs uppercase tracking-widest text-text-secondary">
            {section.num} — {section.description}
          </p>
        </section>
      ))}
    </main>
  );
}
