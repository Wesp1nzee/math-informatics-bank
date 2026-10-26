import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { TutoringPage } from "@/features/landing/tutoring-page";
import { FAQ_ITEMS, TUTORING_INTRO } from "@/features/tutor-leads/content";
import { hasTutorProfile, siteConfig } from "@/lib/constants/site";
import { faqPageJsonLd, personJsonLd, serviceJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Репетиторство: индивидуальные занятия по математике и информатике",
  description:
    "Индивидуальные занятия по математике и информатике для подготовки к ОГЭ и ЕГЭ. Находим пробелы по темам и выстраиваем работу вокруг них.",
  path: "/podgotovka",
});

export default function TutoringRoute() {
  const { tutor } = siteConfig;

  return (
    <>
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
      <JsonLd
        data={serviceJsonLd({
          name: "Индивидуальные занятия по математике и информатике",
          description: TUTORING_INTRO,
          providerName: hasTutorProfile ? tutor.name : undefined,
        })}
      />
      <TutoringPage />
    </>
  );
}
