import type { Metadata } from "next";

import { LandingPage } from "@/features/landing/landing";
import { siteConfig } from "@/lib/constants/site";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "ОСНОВА — математика и информатика, 7–11 классы",
  description:
    "Индивидуальные занятия по математике и информатике для 7–11 классов. Подготовка к ОГЭ и ЕГЭ.",
  path: "/",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Индивидуальные занятия по математике и информатике",
  description: siteConfig.description,
  areaServed: "RU",
  provider: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  },
  serviceType: ["Математика", "Информатика", "Подготовка к ОГЭ", "Подготовка к ЕГЭ"],
};

export default function HomePage() {
  const { tutor } = siteConfig;
  const teacher =
    tutor.name && tutor.about
      ? {
          name: tutor.name,
          role: "Преподаватель",
          approach: tutor.about,
          photo: tutor.photo || undefined,
        }
      : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage teacher={teacher} />
    </>
  );
}
