import { isApiError } from "@/lib/api/errors";
import { isServerApiConfigured, serverRequest } from "@/lib/api/server";
import { demoArticles } from "@/features/articles/fixtures/articles";
import type { Article } from "@/features/articles/types";
import type { TaskSubject } from "@/features/tasks/types";

export type ArticleListResult = {
  items: Article[];
  isDemo: boolean;
};

export async function getArticles(): Promise<ArticleListResult> {
  if (isServerApiConfigured()) {
    const items = await serverRequest<Article[]>("/articles");
    return { items, isDemo: items.some((article) => article.isDemo) };
  }

  // Build-time / offline fallback only. In development the API origin defaults
  // to localhost, so normally this branch is never taken and articles always
  // come from the backend.
  return { items: [...demoArticles], isDemo: true };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (isServerApiConfigured()) {
    try {
      return await serverRequest<Article>(`/articles/${encodeURIComponent(slug)}`);
    } catch (error) {
      if (isApiError(error) && error.status === 404) return null;
      throw error;
    }
  }

  return demoArticles.find((article) => article.slug === slug) ?? null;
}

export async function getArticlesBySubject(
  subject: TaskSubject,
  limit = 3,
): Promise<Article[]> {
  const { items } = await getArticles();
  return items.filter((article) => article.subject === subject).slice(0, limit);
}

export async function getRelatedArticles(
  article: Article,
  limit = 2,
): Promise<Article[]> {
  const { items } = await getArticles();
  const others = items.filter((candidate) => candidate.slug !== article.slug);

  const matching = others.filter(
    (candidate) =>
      candidate.subject === article.subject || candidate.exam === article.exam,
  );

  const rest = others.filter((candidate) => !matching.includes(candidate));
  return [...matching, ...rest].slice(0, limit);
}

export async function getArticleSlugs(): Promise<string[]> {
  if (!isServerApiConfigured()) {
    return demoArticles.map((article) => article.slug);
  }
  const items = await serverRequest<Article[]>("/articles");
  return items.map((article) => article.slug);
}

export function getArticlePath(slug: string): string {
  return `/articles/${slug}`;
}

export { getArticleToc } from "@/features/articles/toc";
