import type { Metadata } from "next";

import { PinnedEpisode, type PinnedStep } from "@/components/pinned/pinned-episode";
import { WorldSection } from "@/components/layout/world-section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  ArticlesSection,
  FinalCta,
  HeroSection,
  InteractiveShowcase,
  TasksSection,
  TeachingSection,
} from "@/features/home";
import { Faq } from "@/features/tutor-leads/components/faq";
import { AI_POSITIONING, FAQ_ITEMS } from "@/features/tutor-leads/content";
import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { faqPageJsonLd, personJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

// Content on the home page comes from the live API (featured tasks and articles).
// Rendering it dynamically prevents baking demo/stale links into the static build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Математика и информатика — задачи, разборы и занятия",
  description: siteConfig.description,
  path: "/",
});

const HOME_FAQ = FAQ_ITEMS.slice(0, 4);

const PINNED_STEPS: readonly PinnedStep[] = [
  {
    title: "Нейросеть показывает решение",
    text: "Готовое решение — это ещё не разбор вашей ошибки.",
    state: "pinned",
  },
  {
    title: "Ваш ход мысли расходится с ним",
    text: "Смотрю, где вы свернули не туда.",
    state: "pinned-draw-b",
  },
  {
    title: "Я нахожу причину и убираю её",
    text: "Разбираем, чтобы не повторять ошибку.",
    state: "pinned-healed",
  },
];

export default function HomePage() {
  const { tutor } = siteConfig;

  return (
    <>
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={faqPageJsonLd(HOME_FAQ)} />
      {hasTutorProfile ? (
        <JsonLd
          data={personJsonLd({
            name: tutor.name,
            description: tutor.about.split("\n")[0],
            image: tutor.photo || undefined,
          })}
        />
      ) : null}

      <HeroSection />

      <WorldSection worldState="quiz" labelledBy="showcase-title">
        <h2 id="showcase-title" data-split-text className="heading-2 heading-scrim mb-8">
          Попробуйте сами
        </h2>
        <div className="reveal">
          <InteractiveShowcase />
        </div>
      </WorldSection>

      <PinnedEpisode
        id="method"
        titleId="method-title"
        title="Нейросеть решает. Я нахожу причину ошибки."
        subtitle={AI_POSITIONING}
        steps={PINNED_STEPS}
      />

      <TeachingSection />
      <TasksSection />
      <ArticlesSection />

      <WorldSection id="faq" worldState="faq" labelledBy="home-faq-title">
        <h2 id="home-faq-title" data-split-text className="heading-2 heading-scrim mb-8">
          Вопросы и ответы
        </h2>
        <div className="reveal">
          <div className="border-line bg-surface rounded-2xl border px-6 py-2 shadow-[var(--shadow-elev-1)]">
            <Faq items={HOME_FAQ} className="max-w-3xl" />
          </div>
        </div>
      </WorldSection>

      <FinalCta />
    </>
  );
}
