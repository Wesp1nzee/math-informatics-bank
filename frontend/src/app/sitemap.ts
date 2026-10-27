import type { MetadataRoute } from "next";

import { getPublishedArticles } from "@/features/articles/api";
import { getTaskIds } from "@/features/tasks/api";
import {
  getContentHubsForSitemap,
  getTutorLandingsForSitemap,
} from "@/features/seo/content-pages";
import {
  SEO_EXAM_HUBS,
  SEO_TASK_TYPE_PAGES,
  isSeoArticleSlug,
} from "@/features/seo/pages";
import { siteConfig } from "@/lib/constants/site";
import { toValidDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [taskIds, articles] = await Promise.all([
    getTaskIds().catch(() => []),
    getPublishedArticles().catch(() => []),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/zadachi`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/matematika`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/informatika`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/articles`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/podgotovka`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/diagnostika`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const examRoutes: MetadataRoute.Sitemap = SEO_EXAM_HUBS.flatMap((hub) => [
    {
      url: `${siteConfig.url}${hub.path}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}${hub.path}/zadaniya`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ]);

  const publishedBySlug = new Map(articles.map((article) => [article.slug, article]));

  const taskTypeRoutes: MetadataRoute.Sitemap = SEO_TASK_TYPE_PAGES.map((page) => {
    const article = publishedBySlug.get(page.slug);
    return {
      url: `${siteConfig.url}${page.path}`,
      lastModified: toValidDate(article?.updated) ?? toValidDate(article?.published),
      changeFrequency: "monthly",
      priority: 0.7,
    };
  });

  const contentHubRoutes: MetadataRoute.Sitemap = getContentHubsForSitemap().map(
    (hub) => ({
      url: `${siteConfig.url}${hub.path}`,
      changeFrequency: "monthly",
      priority: hub.kind === "solutions" ? 0.7 : 0.8,
    }),
  );

  const tutorLandingRoutes: MetadataRoute.Sitemap = getTutorLandingsForSitemap().map(
    (landing) => ({
      url: `${siteConfig.url}${landing.path}`,
      changeFrequency: "monthly",
      priority: 0.8,
    }),
  );

  const taskRoutes: MetadataRoute.Sitemap = taskIds.map((id) => ({
    url: `${siteConfig.url}/zadachi/${id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter((article) => !isSeoArticleSlug(article.slug))
    .map((article) => ({
      url: `${siteConfig.url}/articles/${article.slug}`,
      lastModified: toValidDate(article.updated) ?? toValidDate(article.published),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [
    ...staticRoutes,
    ...examRoutes,
    ...contentHubRoutes,
    ...tutorLandingRoutes,
    ...taskTypeRoutes,
    ...taskRoutes,
    ...articleRoutes,
  ];
}
