import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/constants/site";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).host;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host,
  };
}
