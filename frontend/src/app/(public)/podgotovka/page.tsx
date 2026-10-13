import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { TutoringFacts } from "@/features/tutor-leads/components/tutoring-facts";
import { TUTORING_INTRO } from "@/features/tutor-leads/content";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Репетиторство: индивидуальные занятия по математике и информатике",
  description:
    "Индивидуальные занятия по математике и информатике для подготовки к ОГЭ и ЕГЭ. Находим пробелы по темам и выстраиваем работу вокруг них.",
  path: "/podgotovka",
});

export default function TutoringPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Репетиторство" }]}
        eyebrow="Индивидуальные занятия"
        title="Хотите системный результат?"
        description={TUTORING_INTRO}
      />

      <Section bordered labelledBy="tutoring-how-title">
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="desk:col-span-6 col-span-12">
            <h2 id="tutoring-how-title" className="heading-3 mb-8">
              Как устроены занятия
            </h2>
            <TutoringFacts />
          </div>

          <div
            id="request"
            className="desk:col-span-5 desk:col-start-8 desk:mt-0 col-span-12 mt-12 scroll-mt-24"
          >
            <h2 id="tutoring-request-title" className="heading-3 mb-8">
              Оставить заявку
            </h2>
            <TutorLeadPanel />
          </div>
        </div>
      </Section>
    </>
  );
}
