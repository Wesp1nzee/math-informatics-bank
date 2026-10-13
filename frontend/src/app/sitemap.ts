import type { MetadataRoute } from "next";

import { getArticleSlugList } from "@/features/articles/api";
import { getTaskIdList } from "@/features/tasks/api";
import { siteConfig } from "@/lib/constants/site";

const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}/`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/zadachi`,
      lastModified: BUILD_DATE,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/matematika`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/informatika`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/articles`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/podgotovka`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteConfig.url}/diagnostika`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const taskRoutes: MetadataRoute.Sitemap = getTaskIdList().map((id) => ({
    url: `${siteConfig.url}/zadachi/${id}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = getArticleSlugList().map((slug) => ({
    url: `${siteConfig.url}/articles/${slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...taskRoutes, ...articleRoutes];
}
