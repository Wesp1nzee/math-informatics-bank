import Link from "next/link";
import type { CSSProperties } from "react";

import { WorldSection } from "@/components/layout/world-section";
import { RequestCta } from "@/components/ui/request-cta";
import { SHORT_FACTS, TUTORING_INTRO } from "@/features/tutor-leads/content";
import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

const step = (index: number) => ({ "--i": index } as CSSProperties);

export function TeachingSection() {
  const tutor = siteConfig.tutor;
  const firstParagraph = tutor.about.split("\n")[0]?.trim();
  const initials = tutor.name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <WorldSection id="tutor" worldState="teaching" labelledBy="teaching-title">
      <h2 id="teaching-title" data-split-text className="heading-2 heading-scrim mb-10">
        Как проходят занятия
      </h2>

      <div
        className={cn(
          "grid grid-cols-1 items-start gap-8 desk:grid-cols-12",
          !hasTutorProfile && "desk:grid-cols-1",
        )}
      >
        {hasTutorProfile ? (
          <div className="desk:col-span-5 reveal " style={step(0)}>
            <div className="lift-card border-line overflow-hidden rounded-2xl border shadow-[var(--shadow-elev-2)]">
              {tutor.photo ? (
                <img
                  src={tutor.photo}
                  alt={`${tutor.name} — преподаватель`}
                  width={480}
                  height={600}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                />
              ) : (
                <div className="tutor-monogram" aria-hidden="true">
                  <span>{initials}</span>
                </div>
              )}
            </div>
            <p className="text-ink mt-4 text-lg font-medium">{tutor.name}</p>
            {firstParagraph ? (
              <p className="text-ink-soft mt-1 text-base leading-relaxed">{firstParagraph}</p>
            ) : null}
          </div>
        ) : null}

        <div
          className={cn(hasTutorProfile && "desk:col-span-6 desk:col-start-7")}
        >
          <p className="body-large reveal mb-8" style={step(0)}>
            {TUTORING_INTRO}
          </p>

          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {SHORT_FACTS.map((fact, index) => (
              <li key={fact.title} className="reveal" style={step(index + 1)}>
                <div className="lift-card border-line bg-surface h-full rounded-2xl border p-5 shadow-[var(--shadow-elev-1)]">
                  <b className="text-ink block font-semibold">{fact.title}</b>
                  <span className="text-ink-soft mt-1.5 block text-base leading-relaxed">
                    {fact.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6" style={step(3)}>
            <RequestCta placement="teaching">Записаться на пробное</RequestCta>
            <Link
              href="/podgotovka"
              className="text-accent hover:text-accent-strong inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
            >
              Подробнее о занятиях →
            </Link>
          </div>
        </div>
      </div>
    </WorldSection>
  );
}
