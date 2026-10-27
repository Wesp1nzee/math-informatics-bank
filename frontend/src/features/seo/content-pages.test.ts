import { describe, expect, it } from "vitest";

import {
  SEO_CONTENT_HUBS,
  SEO_TUTOR_LANDINGS,
  getContentHubByPath,
  getTutorLanding,
} from "@/features/seo/content-pages";
import {
  SEO_ARTICLE_LABELS,
  getTaskTypePage,
  isSeoSubject,
} from "@/features/seo/pages";

describe("SEO content hubs", () => {
  it("has unique paths", () => {
    const paths = [...SEO_CONTENT_HUBS, ...SEO_TUTOR_LANDINGS].map((item) => item.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps paths consistent with subject and exam", () => {
    for (const hub of SEO_CONTENT_HUBS) {
      expect(isSeoSubject(hub.subject)).toBe(true);
      expect(hub.path.startsWith(`/${hub.subject}/`)).toBe(true);
      if (hub.exam) {
        expect(hub.path).toContain(`/${hub.exam}`);
      }
      expect(getContentHubByPath(hub.path)).toEqual(hub);
    }
  });

  it("links to known articles and task pages", () => {
    for (const item of [...SEO_CONTENT_HUBS, ...SEO_TUTOR_LANDINGS]) {
      for (const slug of item.relatedArticleSlugs) {
        expect(SEO_ARTICLE_LABELS[slug], `${item.path} -> ${slug}`).toBeTruthy();
      }
    }

    for (const hub of SEO_CONTENT_HUBS) {
      for (const link of hub.links) {
        const match = /^\/(matematika|informatika)\/(oge|ege)\/zadanie-(\d+)$/.exec(
          link.href,
        );
        if (!match) continue;
        expect(
          getTaskTypePage(match[1], match[2], `zadanie-${match[3]}`),
          `${hub.path} -> ${link.href}`,
        ).not.toBeNull();
      }
    }
  });

  it("provides tutor landings for both subjects", () => {
    for (const subject of ["matematika", "informatika"] as const) {
      const landing = getTutorLanding(subject);
      expect(landing).not.toBeNull();
      expect(landing?.path).toBe(`/repetitor/${subject}`);
      expect(landing?.faq.length).toBeGreaterThan(0);
    }
  });
});
