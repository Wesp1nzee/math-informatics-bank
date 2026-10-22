import type { Metadata } from "next";

import { PinnedEpisode, type PinnedStep } from "@/components/pinned/pinned-episode";
import { WorldSection } from "@/components/layout/world-section";
import { JsonLd } from "@/components/seo/json-ld";
import { ErrorBreakdown } from "@/features/tutor-leads/components/error-breakdown";
import { Faq } from "@/features/tutor-leads/components/faq";
import { IncludedBento } from "@/features/tutor-leads/components/included-bento";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { TutorProfile } from "@/features/tutor-leads/components/tutor-profile";
import { TutoringHero } from "@/features/tutor-leads/components/tutoring-hero";
import { FAQ_ITEMS, TUTORING_INTRO } from "@/features/tutor-leads/content";
import { hasTutorProfile, siteConfig, telegramHref } from "@/lib/constants/site";
import { faqPageJsonLd, personJsonLd, serviceJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Репетиторство: индивидуальные занятия по математике и информатике",
  description:
    "Индивидуальные занятия по математике и информатике для подготовки к ОГЭ и ЕГЭ. Находим пробелы по темам и выстраиваем работу вокруг них.",
  path: "/podgotovka",
});

const TRIAL_STEPS: readonly PinnedStep[] = [
  {
    title: "Диагностика",
    text: "Разбираем несколько задач и находим темы, где теряются баллы.",
    state: "trial-1",
  },
  {
    title: "Находим пробелы",
    text: "Смотрим, где именно теряются баллы и почему.",
    state: "trial-2",
  },
  {
    title: "Предлагаю план",
    text: "С чего начать и в каком ритме заниматься.",
    state: "trial-3",
  },
];

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

      <PinnedEpisode
        id="trial"
        titleId="trial-title"
        title="Как проходит пробное"
        steps={TRIAL_STEPS}
      />

      {hasTutorProfile ? (
        <WorldSection id="tutor" worldState="tutor" labelledBy="tutor-title">
          <div className="reveal">
            <TutorProfile />
          </div>
        </WorldSection>
      ) : null}

      <ErrorBreakdown />
      <IncludedBento />

      <WorldSection id="faq" worldState="faq" labelledBy="faq-title">
        <h2 id="faq-title" data-split-text className="heading-2 heading-scrim mb-8">
          Вопросы и ответы
        </h2>
        <div className="reveal">
          <div className="border-line bg-surface rounded-2xl border px-6 py-2 shadow-[var(--shadow-elev-1)]">
            <Faq className="max-w-3xl" />
          </div>
        </div>
      </WorldSection>

      <WorldSection worldState="summit" labelledBy="bottom-cta-title" className="py-20 md:py-32">
        <div className="grid grid-cols-1 items-center gap-10 desk:grid-cols-12">
          <div className="desk:col-span-6 reveal ">
            <h2
              id="bottom-cta-title"
              data-split-text
              className="heading-scrim text-[clamp(36px,5vw,72px)] leading-[1.02] font-medium tracking-[-0.03em]"
            >
              Начнём с диагностики
            </h2>
            <p className="text-ink-soft heading-scrim mt-5 max-w-[30em] text-lg leading-relaxed">
              Оставьте контакт — договоримся о времени и разберём пару задач.
            </p>
          </div>

          <div className="desk:col-span-5 desk:col-start-8 reveal ">
            <div className="glass border-line rounded-2xl border p-5 md:p-6">
              <h3 className="heading-3 mb-4">Записаться на пробное</h3>
              <TutorLeadPanel />
            </div>
          </div>
        </div>
      </WorldSection>
    </>
  );
}
