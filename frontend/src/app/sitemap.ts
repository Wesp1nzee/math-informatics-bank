import type { MetadataRoute } from "next";

import { getArticles } from "@/features/articles/api";
import { getTaskIds } from "@/features/tasks/api";
import { siteConfig } from "@/lib/constants/site";
import { toValidDate } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [taskIds, { items: articles }] = await Promise.all([getTaskIds(), getArticles()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/zadachi`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/matematika`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/informatika`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/articles`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/podgotovka`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/diagnostika`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const taskRoutes: MetadataRoute.Sitemap = taskIds.map((id) => ({
    url: `${siteConfig.url}/zadachi/${id}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/articles/${article.slug}`,
    lastModified: toValidDate(article.updated ?? article.published),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...taskRoutes, ...articleRoutes];
}
