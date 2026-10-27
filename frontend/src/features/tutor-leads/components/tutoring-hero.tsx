import { CircleCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/breadcrumbs";
import { HeroScan } from "@/features/tutor-leads/components/hero-scan";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { TUTORING_INTRO } from "@/features/tutor-leads/content";

const CHECKS = [
  "Разбор причин ошибок",
  "Программа под ваш уровень",
  "Онлайн, индивидуально",
] as const;

export function TutoringHero({
  breadcrumbs,
}: {
  breadcrumbs: readonly BreadcrumbItem[];
}) {
  return (
    <section
      aria-labelledby="tutoring-hero-title"
      data-world-state="tutoring-hero"
      className="relative isolate overflow-clip pt-[96px] pb-14 md:pt-28 md:pb-20"
    >
      <div className="hero-scrim" aria-hidden="true" />
      <HeroScan />

      <Container className="relative z-[1]">
        <Breadcrumbs className="mb-6 text-sm" items={breadcrumbs} />

        <div className="desk:grid desk:grid-cols-12 desk:gap-8 flex flex-col gap-8">
          <div className="desk:col-span-5 desk:row-start-1">
            <span className="mono-label mb-4">X-RAY / KNOWLEDGE MAP</span>
            <h1
              id="tutoring-hero-title"
              className="heading-2 max-w-[16ch] text-balance"
            >
              Индивидуальные занятия по математике и информатике
            </h1>
            <p className="body-large mt-5">{TUTORING_INTRO}</p>

            <ul className="m-0 mt-8 flex list-none flex-col gap-3 p-0">
              {CHECKS.map((item) => (
                <li key={item} className="text-ink flex items-center gap-2 text-base">
                  <CircleCheck aria-hidden className="text-success size-5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="metric-chip">
                <b>4</b>
                <span className="text-ink-soft">оси диагностики</span>
              </span>
              <span className="metric-chip">
                <b>1</b>
                <span className="text-ink-soft">пробное занятие</span>
              </span>
            </div>
          </div>

          <div
            id="request"
            className="desk:col-span-7 desk:col-start-6 desk:row-start-1 order-2 scroll-mt-24"
          >
            <div className="glass-strong tech-corners rounded-2xl border border-[var(--glass-border)] p-4 md:p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
                <div>
                  <span className="mono-label mb-2">REQUEST / CONFIGURATOR</span>
                  <h2 className="heading-3">Записаться на пробное</h2>
                </div>
                <span className="metric-chip">
                  <b>2 мин</b>
                  <span className="text-ink-soft">на заявку</span>
                </span>
              </div>
              <TutorLeadPanel />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
