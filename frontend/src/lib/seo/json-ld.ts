import { siteConfig } from "@/lib/constants/site";
import { absoluteUrl } from "@/lib/seo/metadata";

export type JsonLdObject = Record<string, unknown>;

export function webSiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    inLanguage: "ru-RU",
    description: siteConfig.description,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(items: readonly Crumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  published: string;
  modified?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    inLanguage: "ru-RU",
    datePublished: input.published,
    ...(input.modified ? { dateModified: input.modified } : {}),
  };
}

export function learningResourceJsonLd(input: {
  name: string;
  description: string;
  path: string;
  educationalLevel?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    inLanguage: "ru-RU",
    learningResourceType: "Задача с решением",
    ...(input.educationalLevel ? { educationalLevel: input.educationalLevel } : {}),
  };
}

export function personJsonLd(input: {
  name: string;
  description?: string;
  image?: string;
  sameAs?: readonly string[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.sameAs && input.sameAs.length > 0
      ? { sameAs: [...input.sameAs] }
      : {}),
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string;
  providerName?: string;
  areaServed?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    ...(input.providerName
      ? { provider: { "@type": "Person", name: input.providerName } }
      : {}),
    ...(input.areaServed ? { areaServed: input.areaServed } : {}),
  };
}

export function faqPageJsonLd(items: readonly { question: string; answer: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
