import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TaskTypeHubPage } from "@/features/seo/components/task-type-hub-page";
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
      path: `/matematika/${exam}/zadaniya`,
      noIndex: true,
    });
  }
  const description =
    hub.exam === "oge"
      ? "Карта заданий ОГЭ по математике: вычисления, уравнения, геометрия и вероятность. Что проверяет каждый номер, с чего начать и где есть разборы с тренировкой."
      : "Карта заданий ЕГЭ по математике: база и профиль, планиметрия, производная, вероятность и задачи части 2. Что проверяет каждый номер и с чего начать.";

  return buildMetadata({
    title: `Задания ${hub.exam === "oge" ? "ОГЭ" : "ЕГЭ"} по математике: типы и разборы`,
    description,
    path: `${hub.path}/zadaniya`,
  });
}

export default async function MatematikaTaskTypesPage({ params }: PageProps) {
  const { exam } = await params;
  const hub = getExamHub("matematika", exam);
  if (!hub) notFound();
  return <TaskTypeHubPage hub={hub} />;
}
