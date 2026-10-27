import Link from "next/link";
import type { CSSProperties } from "react";

import { WorldSection } from "@/components/layout/world-section";
import { RequestCta } from "@/components/ui/request-cta";
import { TiltCard } from "@/components/ui/tilt-card";
import { SHORT_FACTS, TUTORING_INTRO } from "@/features/tutor-leads/content";
import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { cn } from "@/lib/utils/cn";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

const ROUTE = [
  {
    title: "Диагностика пробелов",
    text: "Разбираем несколько задач и находим темы, где теряются баллы.",
  },
  {
    title: "Понимание модели",
    text: "Идём от идеи к записи: видно, почему правило работает, а не только как его применить.",
  },
  {
    title: "Нарешивание банка",
    text: "Закрепляем на задачах разного уровня — от базовых до формата экзамена.",
  },
  {
    title: "Контроль результата",
    text: "Сверяем прогресс по темам и корректируем маршрут до устойчивого результата.",
  },
] as const;

export function TeachingSection() {
  const tutor = siteConfig.tutor;
  const firstParagraph = tutor.about.split("\n")[0]?.trim();
  const initials = tutor.name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("");

  return (
    <WorldSection
      id="tutor"
      worldState="teaching"
      labelledBy="teaching-title"
      className="section-frame"
    >
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="mono-label mb-4">SYSTEM / ROUTE</span>
          <h2 id="teaching-title" data-split-text className="heading-2 heading-scrim">
            Как проходят занятия
          </h2>
        </div>
        <p className="text-ink-soft heading-scrim m-0 max-w-[34em] text-lg leading-relaxed">
          {TUTORING_INTRO}
        </p>
      </div>

      <div className="route-map reveal mt-10" style={step(0)}>
        <span className="route-line" aria-hidden="true" />
        {ROUTE.map((item, index) => (
          <TiltCard key={item.title} className="route-node bento-cell" max={4}>
            <span className="mono-label">0{index + 1}</span>
            <b className="text-ink text-lg font-semibold">{item.title}</b>
            <span className="text-ink-soft text-base leading-relaxed">{item.text}</span>
          </TiltCard>
        ))}
      </div>

      <div
        className={cn(
          "desk:grid-cols-12 mt-8 grid w-full min-w-0 grid-cols-1 items-start gap-8",
          !hasTutorProfile && "desk:grid-cols-1",
        )}
      >
        {hasTutorProfile ? (
          <div className="desk:col-span-5 reveal w-full min-w-0" style={step(0)}>
            <div className="glass overflow-hidden rounded-2xl border border-[var(--color-line)]">
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

        <div
          className={cn(
            "w-full min-w-0",
            hasTutorProfile && "desk:col-span-6 desk:col-start-7",
          )}
        >
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {SHORT_FACTS.map((fact, index) => (
              <li key={fact.title} className="reveal" style={step(index + 1)}>
                <div className="bento-cell h-full">
                  <b className="text-ink block text-base font-semibold">{fact.title}</b>
                  <span className="text-ink-soft mt-2 block text-base leading-relaxed">
                    {fact.text}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div
            className="reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6"
            style={step(3)}
          >
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
