import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskTypeHubPage } from "@/features/seo/components/task-type-hub-page";
import { getExamHub, getExamStaticParams } from "@/features/seo/pages";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ exam: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getExamStaticParams("informatika");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { exam } = await params;
  const hub = getExamHub("informatika", exam);
  if (!hub) {
    return buildMetadata({
      title: "Страница не найдена",
      description: "Такого раздела нет.",
      path: `/informatika/${exam}/zadaniya`,
      noIndex: true,
    });
  }
  const description =
    hub.exam === "oge"
      ? "Карта заданий ОГЭ по информатике: информация, логика, алгоритмы, файлы и практические задания. Что проверяет каждый номер и где есть разборы с тренировкой."
      : "Карта заданий ЕГЭ по информатике: логика, кодирование, алгоритмы, теория игр и программирование. Что проверяет каждый номер и с чего начать подготовку.";

  return buildMetadata({
    title: `Задания ${hub.exam === "oge" ? "ОГЭ" : "ЕГЭ"} по информатике: типы и разборы`,
    description,
    path: `${hub.path}/zadaniya`,
  });
}

export default async function InformatikaTaskTypesPage({ params }: PageProps) {
  const { exam } = await params;
  const hub = getExamHub("informatika", exam);
  if (!hub) notFound();
  return <TaskTypeHubPage hub={hub} />;
}
