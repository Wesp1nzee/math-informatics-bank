import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentHubPage } from "@/features/seo/components/content-hub-page";
import { getContentHubByPath } from "@/features/seo/content-pages";
import { buildMetadata } from "@/lib/seo/metadata";

const hub = getContentHubByPath("/informatika/10-klass");

export const metadata: Metadata = buildMetadata({
  title: hub?.metaTitle ?? "Информатика 10 класс",
  description:
    hub?.metaDescription ??
    "Темы, задачи и подготовка к ЕГЭ по информатике для 10 класса.",
  path: "/informatika/10-klass",
});

export default function Informatika10KlassPage() {
  if (!hub) notFound();
  return <ContentHubPage hub={hub} />;
}
