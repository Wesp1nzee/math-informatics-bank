import Link from "next/link";

import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { SHORT_FACTS, TUTORING_INTRO } from "@/features/tutor-leads/content";
import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

export function TeachingSection() {
  const tutor = siteConfig.tutor;
  const firstParagraph = tutor.about.split("\n")[0]?.trim();
  const initials = tutor.name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <Section id="tutor" labelledBy="teaching-title">
      <h2 id="teaching-title" className="heading-2 mb-8">
        Как проходят занятия
      </h2>

      <div
        className={cn(
          "reveal grid grid-cols-12 items-start gap-8",
          !hasTutorProfile && "desk:grid-cols-1",
        )}
      >
        {hasTutorProfile ? (
          <div className="desk:col-span-5 col-span-12">
            <div className="border-line overflow-hidden rounded-2xl border">
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
              <p className="text-ink-soft mt-1 text-base leading-relaxed">
                {firstParagraph}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className={cn("col-span-12", hasTutorProfile && "desk:col-span-6 desk:col-start-7")}>
          <p className="body-large mb-6">{TUTORING_INTRO}</p>
          <ul className="border-line m-0 list-none divide-y divide-[var(--color-line)] border-y p-0">
            {SHORT_FACTS.map((fact) => (
              <li key={fact.title} className="py-4">
                <b className="text-ink block font-semibold">{fact.title}</b>
                <span className="text-ink-soft mt-1 block text-[15px] leading-relaxed">
                  {fact.text}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Button asChild>
              <Link href="/podgotovka#request">
                Записаться на пробное <ButtonArrow />
              </Link>
            </Button>
            <Link
              href="/podgotovka"
              className="text-accent hover:text-accent-strong inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
            >
              Подробнее о занятиях →
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
