import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { DivergenceScene } from "@/features/home/components/divergence-scene";
import { Faq } from "@/features/tutor-leads/components/faq";
import { FactsBento } from "@/features/tutor-leads/components/facts-bento";
import { ProcessTimeline } from "@/features/tutor-leads/components/process-timeline";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { TutorProfile } from "@/features/tutor-leads/components/tutor-profile";
import { TutoringHero } from "@/features/tutor-leads/components/tutoring-hero";
import {
  AI_POSITIONING,
  FAQ_ITEMS,
  TUTORING_INTRO,
} from "@/features/tutor-leads/content";
import { faqPageJsonLd, personJsonLd, serviceJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { hasTutorProfile, siteConfig, telegramHref } from "@/lib/constants/site";

export const metadata: Metadata = buildMetadata({
  title: "Репетиторство: индивидуальные занятия по математике и информатике",
  description:
    "Индивидуальные занятия по математике и информатике для подготовки к ОГЭ и ЕГЭ. Находим пробелы по темам и выстраиваем работу вокруг них.",
  path: "/podgotovka",
});

export default function TutoringPage() {
  const { tutor } = siteConfig;
  const telegram = telegramHref(tutor.telegram);

  return (
    <>
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS)} />
      {hasTutorProfile ? (
        <JsonLd
          data={personJsonLd({
            name: tutor.name,
            description: tutor.about.split("\n")[0],
            image: tutor.photo || undefined,
            sameAs: telegram ? [telegram] : undefined,
          })}
        />
      ) : null}
      <JsonLd
        data={serviceJsonLd({
          name: "Индивидуальные занятия по математике и информатике",
          description: TUTORING_INTRO,
          providerName: hasTutorProfile ? tutor.name : undefined,
        })}
      />

      <TutoringHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Репетиторство" }]}
      />

      <Section labelledBy="divergence-title" className="desk:py-24 py-16 md:py-20">
        <DivergenceScene />
      </Section>

      <Section
        id="how"
        labelledBy="tutoring-how-title"
        className="bg-surface-subtle desk:py-24 py-16 md:py-20"
      >
        <span className="eyebrow">Что входит в работу</span>
        <h2 id="tutoring-how-title" className="heading-2 mb-10">
          Как устроены занятия
        </h2>
        <FactsBento />
      </Section>

      <Section labelledBy="process-title" className="desk:py-24 py-16 md:py-20">
        <ProcessTimeline />
      </Section>

      {hasTutorProfile ? (
        <Section
          id="tutor"
          labelledBy="tutor-title"
          className="bg-surface desk:py-24 border-line border-t py-16 md:py-20"
        >
          <TutorProfile large />
        </Section>
      ) : null}

      <Section
        id="request"
        labelledBy="tutoring-request-title"
        className="desk:py-24 bg-surface-subtle scroll-mt-20 py-16 md:py-20"
      >
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="desk:col-span-5 col-span-12">
            <span className="eyebrow">Первый шаг</span>
            <h2 id="tutoring-request-title" className="heading-2">
              Оставить заявку
            </h2>
            <p className="body-large mt-6">{TUTORING_INTRO}</p>
            <p className="text-ink mt-4 font-medium">{AI_POSITIONING}</p>

            <div className="glass-panel mt-8 p-6">
              <span className="instrument-coord">request / diagnostics</span>
              <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">
                Достаточно контакта и экзамена. После заявки договоримся о времени
                пробного занятия и разберём, с чего начать.
              </p>
            </div>
          </div>

          <div className="desk:col-span-6 desk:col-start-7 desk:mt-0 col-span-12 mt-10">
            <div className="desk:sticky desk:top-24">
              <div className="conic-frame">
                <TutorLeadPanel formClassName="glass-form" />
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section bordered labelledBy="faq-title" className="desk:py-24 py-16 md:py-20">
        <span className="eyebrow">Частые вопросы</span>
        <h2 id="faq-title" className="heading-3 mb-8">
          Коротко о занятиях
        </h2>
        <Faq className="max-w-3xl" />
      </Section>
    </>
  );
}
