import type { Metadata } from "next";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Button, ButtonArrow } from "@/components/ui/button";
import { ErrorBreakdown } from "@/features/tutor-leads/components/error-breakdown";
import { Faq } from "@/features/tutor-leads/components/faq";
import { TrialSteps } from "@/features/tutor-leads/components/trial-steps";
import { TutorProfile } from "@/features/tutor-leads/components/tutor-profile";
import { TutoringHero } from "@/features/tutor-leads/components/tutoring-hero";
import {
  FAQ_ITEMS,
  SHORT_FACTS,
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

      <TrialSteps />

      {hasTutorProfile ? (
        <Section id="tutor" labelledBy="tutor-title" className="bg-surface">
          <div className="reveal">
            <TutorProfile />
          </div>
        </Section>
      ) : null}

      <ErrorBreakdown />

      <Section labelledBy="included-title" className="bg-surface-subtle">
        <h2 id="included-title" className="heading-2 mb-8">
          Что входит
        </h2>
        <ul className="reveal m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
          {SHORT_FACTS.map((fact) => (
            <li key={fact.title} className="border-line bg-surface rounded-2xl border p-5">
              <b className="text-ink block font-semibold">{fact.title}</b>
              <span className="text-ink-soft mt-1 block text-base leading-relaxed">
                {fact.text}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="faq" labelledBy="faq-title">
        <h2 id="faq-title" className="heading-2 mb-8">
          Вопросы и ответы
        </h2>
        <Faq className="max-w-3xl" />
      </Section>

      <Section labelledBy="bottom-cta-title" className="bg-surface-subtle">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 id="bottom-cta-title" className="heading-3">
            Готовы начать?
          </h2>
          <Button asChild>
            <Link href="#request">
              Записаться на пробное <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
