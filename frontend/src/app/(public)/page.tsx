import type { Metadata } from "next";

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
import { siteConfig } from "@/lib/constants/site";
import { webSiteJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Математика и информатика — задачи, разборы и занятия",
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={webSiteJsonLd()} />
      <HeroSection />
      <TryTaskSection />
      <CodeSection />
      <ArticlesSection />
      <TasksSection />
      <TutoringSection />
      <AboutSection />
      <FinalCta />
    </>
  );
}
