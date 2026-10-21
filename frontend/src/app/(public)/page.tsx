import type { Metadata } from "next";

import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import {
  AboutSection,
  ArticlesSection,
  CodeSection,
  FinalCta,
  HeroSection,
  TasksSection,
  TryTaskSection,
  TutoringSection,
} from "@/features/home";
import { TopicMarquee } from "@/features/home/components/topic-marquee";
import { Faq } from "@/features/tutor-leads/components/faq";
import { TutorProfile } from "@/features/tutor-leads/components/tutor-profile";
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

export default function HomePage() {
  const { tutor } = siteConfig;

  return (
    <>
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS)} />
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
      <TopicMarquee />
      <TryTaskSection />

      {hasTutorProfile ? (
        <Section id="tutor" labelledBy="tutor-title">
          <TutorProfile />
        </Section>
      ) : null}

      <CodeSection />
      <TasksSection />
      <ArticlesSection />
      <AboutSection />
      <TutoringSection />

      <Section id="faq" labelledBy="home-faq-title">
        <span className="eyebrow">Частые вопросы</span>
        <h2 id="home-faq-title" className="heading-2 mb-8">
          Вопросы и ответы
        </h2>
        <Faq className="max-w-3xl" />
      </Section>

      <FinalCta />
    </>
  );
}
