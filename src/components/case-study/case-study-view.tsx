import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "./data";

export function CaseStudyView({ study }: { study: CaseStudy }) {
  return (
    <main id="top" className="relative w-full pb-20 pt-28 md:pb-28 md:pt-36">
      <article className="mx-auto max-w-[1100px] px-6 lg:px-8">
        <Link
          href="/#work"
          className="inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[1.5px] text-text-3 transition-colors duration-200 hover:text-text-1"
        >
          ← Back to selected work
        </Link>

        <header className="mt-6 grid grid-cols-12 gap-y-6">
          <div className="col-span-12 md:col-span-2">
            <span className="eyebrow">Case study</span>
          </div>
          <div className="col-span-12 md:col-span-10">
            <h1 className="section-heading">{study.title}</h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.75] text-text-2">
              {study.lede}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
              <a
                href={study.live}
                target="_blank"
                rel="noopener noreferrer"
                className="project-github inline-flex min-h-[44px] items-center underline decoration-border-strong underline-offset-4"
              >
                Live demo →
              </a>
              <a
                href={study.github}
                target="_blank"
                rel="noopener noreferrer"
                className="project-github inline-flex min-h-[44px] items-center underline decoration-border-strong underline-offset-4"
              >
                Source on GitHub →
              </a>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {study.stack.map((tag) => (
                <span key={tag} className="tech-badge">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {study.shots.map((shot) => (
            <figure key={shot.src} className="min-w-0">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={1200}
                height={750}
                sizes="(min-width: 768px) 520px, 100vw"
                className="h-auto w-full rounded-md border border-border"
              />
              <figcaption className="mt-2 text-[12px] leading-[1.6] text-text-3">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        {study.sections.map((section) => (
          <section
            key={section.heading}
            className="mt-12 grid grid-cols-12 gap-y-4 border-t border-border pt-10"
          >
            <div className="col-span-12 md:col-span-2">
              <h2 className="font-mono text-[10px] uppercase tracking-[1.5px] text-accent">
                {section.heading}
              </h2>
            </div>
            <div className="col-span-12 min-w-0 md:col-span-10">
              {section.paragraphs?.map((p) => (
                <p
                  key={p}
                  className="mb-4 max-w-2xl text-[15px] leading-[1.75] text-text-2"
                >
                  {p}
                </p>
              ))}
              {section.points && (
                <ul className="flex max-w-2xl list-disc flex-col gap-3 pl-5 text-[15px] leading-[1.75] text-text-2 marker:text-text-3">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        <p className="mt-12 border-t border-border pt-6 font-mono text-[11px] leading-[1.7] text-text-3">
          {study.sources}
        </p>
        <Link
          href="/#work"
          className="mt-4 inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[1.5px] text-text-3 transition-colors duration-200 hover:text-text-1"
        >
          ← Back to selected work
        </Link>
      </article>
    </main>
  );
}
