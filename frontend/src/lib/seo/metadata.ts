import type { Metadata } from "next";

import { siteConfig } from "@/lib/constants/site";

/** Absolute URL for a site-relative path, based on NEXT_PUBLIC_SITE_URL. */
export function absoluteUrl(path: string): string {
  return new URL(
    path.startsWith("/") ? path : `/${path}`,
    `${siteConfig.url}/`,
  ).toString();
}

export type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Set for drafts / service routes that must not be indexed. */
  noIndex?: boolean;
  /**
   * Site-relative path to a real 1200×630 image. Omit it entirely while no
   * image exists — an empty `og:image` is worse than none.
   */
  ogImage?: string;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const images = input.ogImage
    ? [
        {
          url: absoluteUrl(input.ogImage),
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ]
    : undefined;

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: input.type ?? "website",
      locale: siteConfig.locale,
      url,
      siteName: siteConfig.name,
      title: input.title,
      description: input.description,
      ...(images ? { images } : {}),
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title: input.title,
      description: input.description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}
