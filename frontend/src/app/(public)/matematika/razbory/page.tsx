import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentHubPage } from "@/features/seo/components/content-hub-page";
import { getContentHubByPath } from "@/features/seo/content-pages";
import { buildMetadata } from "@/lib/seo/metadata";

const hub = getContentHubByPath("/matematika/razbory");

export const metadata: Metadata = buildMetadata({
  title: hub?.metaTitle ?? "Разборы задач по математике",
  description:
    hub?.metaDescription ??
    "Разборы задач по математике с примерами, типичными ошибками и тренировкой.",
  path: "/matematika/razbory",
});

export default function MatematikaRazboryPage() {
  if (!hub) notFound();
  return <ContentHubPage hub={hub} />;
}
