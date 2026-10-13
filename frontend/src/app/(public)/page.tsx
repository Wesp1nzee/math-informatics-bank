import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { Section } from "@/components/layout/section";
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
import { TutorProfile } from "@/features/tutor-leads/components/tutor-profile";
import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { personJsonLd, webSiteJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

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
      <TryTaskSection />
      <CodeSection />
      {hasTutorProfile ? (
        <Section id="tutor" labelledBy="tutor-title">
          <TutorProfile />
        </Section>
      ) : null}
      <TutoringSection />
      <ArticlesSection />
      <TasksSection />
      <AboutSection />
      <FinalCta />
    </>
  );
}
