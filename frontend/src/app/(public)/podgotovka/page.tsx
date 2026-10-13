import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Faq } from "@/features/tutor-leads/components/faq";
import { Pricing } from "@/features/tutor-leads/components/pricing";
import { Reviews } from "@/features/tutor-leads/components/reviews";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { TutorProfile } from "@/features/tutor-leads/components/tutor-profile";
import { TutoringFacts } from "@/features/tutor-leads/components/tutoring-facts";
import {
  AI_POSITIONING,
  FAQ_ITEMS,
  PRICING,
  PRICING_FALLBACK_NOTE,
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

      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Репетиторство" }]}
        eyebrow="Индивидуальные занятия"
        title="Хотите системный результат?"
        description={TUTORING_INTRO}
      />

      <Section bordered labelledBy="tutoring-how-title">
        <TutorProfile className="mb-16 md:mb-24" />

        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="desk:col-span-6 col-span-12">
            <h2 id="tutoring-how-title" className="heading-3 mb-8">
              Как устроены занятия
            </h2>
            <TutoringFacts />
            <p className="text-ink mt-8 font-medium">{AI_POSITIONING}</p>
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

      <Section bordered labelledBy="pricing-title" className="bg-surface">
        <h2 id="pricing-title" className="heading-3 mb-8">
          Стоимость и отзывы
        </h2>
        {PRICING ? (
          <Pricing className="max-w-md" />
        ) : (
          <p className="body-large">{PRICING_FALLBACK_NOTE}</p>
        )}
        <Reviews className="mt-10" />
      </Section>

      <Section bordered labelledBy="faq-title">
        <span className="eyebrow">Частые вопросы</span>
        <h2 id="faq-title" className="heading-3 mb-8">
          Коротко о занятиях
        </h2>
        <Faq className="max-w-3xl" />
      </Section>
    </>
  );
}
