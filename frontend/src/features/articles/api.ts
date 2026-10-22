import { isApiError } from "@/lib/api/errors";
import { isServerApiConfigured, serverRequest } from "@/lib/api/server";
import { demoArticles } from "@/features/articles/fixtures/articles";
import type { Article } from "@/features/articles/types";
import { getSeoArticlePath, isSeoArticleSlug } from "@/features/seo/pages";
import type { TaskSubject } from "@/features/tasks/types";

export type ArticleListResult = {
  items: Article[];
  isDemo: boolean;
};

export async function getArticles(): Promise<ArticleListResult> {
  if (isServerApiConfigured()) {
    try {
      const items = await serverRequest<Article[]>("/articles");
      return { items, isDemo: items.some((article) => article.isDemo) };
    } catch (error) {
      // Network failures must not break `next build` when the API is not reachable.
      if (
        !isApiError(error) ||
        (error.kind !== "network" && error.kind !== "timeout")
      ) {
        throw error;
      }
      // The API is configured but unavailable: do not link to demo article slugs
      // that are not published by the API.
      return { items: [], isDemo: true };
    }
  }

  return { items: [...demoArticles], isDemo: true };
}

// Sitemap-safe list: never falls back to demo fixtures, because demo slugs are
// not published by the API and would create 404 URLs in sitemap.xml.
export async function getPublishedArticles(): Promise<Article[]> {
  if (!isServerApiConfigured()) return [];
  return serverRequest<Article[]>("/articles");
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
  return items
    .filter((article) => article.subject === subject && !isSeoArticleSlug(article.slug))
    .slice(0, limit);
}

export async function getRelatedArticles(
  article: Article,
  limit = 2,
): Promise<Article[]> {
  const { items } = await getArticles();
  const others = items.filter(
    (candidate) => candidate.slug !== article.slug && !isSeoArticleSlug(candidate.slug),
  );

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
  try {
    const items = await serverRequest<Article[]>("/articles");
    return items
      .map((article) => article.slug)
      .filter((slug) => !isSeoArticleSlug(slug));
  } catch (error) {
    // With no API at build time, skip prerendering; pages render on demand at runtime.
    if (isApiError(error) && (error.kind === "network" || error.kind === "timeout")) {
      return [];
    }
    throw error;
  }
}

export function getArticlePath(slug: string): string {
  return getSeoArticlePath(slug) ?? `/articles/${slug}`;
}

export { getArticleToc } from "@/features/articles/toc";
