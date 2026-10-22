import "server-only";

import { getArticleBySlug } from "@/features/articles/api";
import type { Article } from "@/features/articles/types";
import type { SeoTaskTypePage } from "@/features/seo/pages";
import { getTasksByTopics } from "@/features/tasks/api";
import type { Task } from "@/features/tasks/types";

export type TaskTypePageData = {
  article: Article;
  relatedArticles: Article[];
  relatedTasks: Task[];
};

export async function loadTaskTypePageData(
  page: SeoTaskTypePage,
): Promise<TaskTypePageData | null> {
  // A missing article is a 404; a network/server failure must stay an error,
  // not be disguised as a missing page.
  const article = await getArticleBySlug(page.slug);
  if (!article) return null;

  const [relatedArticles, relatedTasks] = await Promise.all([
    Promise.all(
      page.relatedArticleSlugs.map(async (slug) => {
        try {
          return await getArticleBySlug(slug);
        } catch {
          return null;
        }
      }),
    ),
    getTasksByTopics(page.subject, page.relatedTaskTopics, 3).catch(() => []),
  ]);

  return {
    article,
    relatedArticles: relatedArticles.filter(
      (item): item is Article => item !== null && item.slug !== page.slug,
    ),
    relatedTasks,
  };
}
