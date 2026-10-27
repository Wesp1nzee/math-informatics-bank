import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getArticleBySlug } from "@/features/articles/api";
import { ContentHubPage } from "@/features/seo/components/content-hub-page";
import { TaskTypePageView } from "@/features/seo/components/task-type-page";
import { getContentHubByPath } from "@/features/seo/content-pages";
import { loadTaskTypePageData } from "@/features/seo/load-task-type-page";
import { getTaskTypePage } from "@/features/seo/pages";
import { buildMetadata } from "@/lib/seo/metadata";

type PageProps = { params: Promise<{ exam: string; taskType: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { exam, taskType } = await params;
  const contentHub = getContentHubByPath(`/matematika/${exam}/${taskType}`);
  if (contentHub) {
    return buildMetadata({
      title: contentHub.metaTitle,
      description: contentHub.metaDescription,
      path: contentHub.path,
    });
  }

  const page = getTaskTypePage("matematika", exam, taskType);
  if (!page) {
    return buildMetadata({
      title: "Страница не найдена",
      description: "Такого разбора нет.",
      path: `/matematika/${exam}/${taskType}`,
      noIndex: true,
    });
  }

  const article = await getArticleBySlug(page.slug);
  if (!article) {
    return buildMetadata({
      title: "Разбор готовится",
      description: "Материал по этому типу задания ещё не опубликован.",
      path: page.path,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.description,
    path: page.path,
    type: "article",
    publishedTime: article.published,
    modifiedTime: article.updated ?? article.published,
  });
}

export default async function MatematikaTaskTypePage({ params }: PageProps) {
  const { exam, taskType } = await params;
  const contentHub = getContentHubByPath(`/matematika/${exam}/${taskType}`);
  if (contentHub) return <ContentHubPage hub={contentHub} />;

  const page = getTaskTypePage("matematika", exam, taskType);
  if (!page) notFound();

  const data = await loadTaskTypePageData(page);
  if (!data) notFound();

  return (
    <TaskTypePageView
      page={page}
      article={data.article}
      relatedArticles={data.relatedArticles}
      relatedTasks={data.relatedTasks}
    />
  );
}
