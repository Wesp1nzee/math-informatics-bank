import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExamHubPage } from "@/features/seo/components/exam-hub-page";
import { getExamHub, getExamStaticParams } from "@/features/seo/pages";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ exam: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getExamStaticParams("matematika");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { exam } = await params;
  const hub = getExamHub("matematika", exam);
  if (!hub) {
    return buildMetadata({
      title: "Страница не найдена",
      description: "Такого раздела нет.",
      path: `/matematika/${exam}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: hub.metaTitle,
    description: hub.metaDescription,
    path: hub.path,
  });
}

export default async function MatematikaExamPage({ params }: PageProps) {
  const { exam } = await params;
  const hub = getExamHub("matematika", exam);
  if (!hub) notFound();
  return <ExamHubPage hub={hub} />;
}
