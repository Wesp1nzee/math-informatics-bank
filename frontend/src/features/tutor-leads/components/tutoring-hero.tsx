import { CircleCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ContourField } from "@/components/decor/contour-field";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/breadcrumbs";
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
      className="hero-static grain relative isolate overflow-clip pt-[96px] pb-14 md:pt-28 md:pb-20"
    >
      <ContourField muted />

      <Container className="relative z-[1]">
        <Breadcrumbs className="mb-6 text-sm" items={breadcrumbs} />

        <div className="flex flex-col gap-8 desk:grid desk:grid-cols-12 desk:gap-8">
          <div className="desk:col-span-6 desk:row-start-1">
            <h1
              id="tutoring-hero-title"
              className="heading-2 max-w-[16ch] text-balance"
            >
              Индивидуальные занятия по математике и информатике
            </h1>
            <p className="body-large mt-5">{TUTORING_INTRO}</p>
          </div>

          <div
            id="request"
            className="desk:col-span-5 desk:col-start-8 desk:row-span-2 desk:row-start-1 order-2 scroll-mt-24"
          >
            <div className="border-line bg-surface shadow-card rounded-2xl border p-5 md:p-6">
              <h2 className="heading-3 mb-4">Записаться на пробное</h2>
              <TutorLeadPanel />
            </div>
          </div>

          <ul className="desk:col-span-6 desk:row-start-2 order-3 m-0 flex list-none flex-col gap-3 p-0">
            {CHECKS.map((item) => (
              <li key={item} className="text-ink flex items-center gap-2 text-base">
                <CircleCheck aria-hidden className="text-success size-5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
