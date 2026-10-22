import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
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
import { FAQ_ITEMS } from "@/features/tutor-leads/content";
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

      <Section labelledBy="showcase-title">
        <div className="reveal">
          <h2 id="showcase-title" className="heading-2 mb-8">
            Попробуйте сами
          </h2>
          <InteractiveShowcase />
        </div>
      </Section>

      <TeachingSection />
      <TasksSection />
      <ArticlesSection />

      <Section id="faq" labelledBy="home-faq-title">
        <div className="reveal">
          <h2 id="home-faq-title" className="heading-2 mb-8">
            Вопросы и ответы
          </h2>
          <Faq items={HOME_FAQ} className="max-w-3xl" />
        </div>
      </Section>

      <FinalCta />
    </>
  );
}
