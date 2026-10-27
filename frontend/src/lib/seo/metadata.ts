import type { Metadata } from "next";

import { siteConfig } from "@/lib/constants/site";

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
  noIndex?: boolean;
  /**
   * Path to the social preview image. Omit to use the site-wide default.
   * Pass `null` when a route provides its own file-based `opengraph-image`.
   */
  ogImage?: string | null;
  publishedTime?: string;
  modifiedTime?: string;
};

const DEFAULT_OG_IMAGE = "/og/default.png";

export function buildMetadata(input: PageMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const imagePath =
    input.ogImage === null ? undefined : (input.ogImage ?? DEFAULT_OG_IMAGE);
  const images = imagePath
    ? [
        {
          url: absoluteUrl(imagePath),
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
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}
