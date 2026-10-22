import { describe, expect, it } from "vitest";

import {
  SEO_ARTICLE_LABELS,
  SEO_EXAM_HUBS,
  SEO_TASK_TYPE_PAGES,
  getArticleLabel,
  getExamHub,
  getSeoArticlePath,
  getTaskTypePage,
  isSeoArticleSlug,
} from "@/features/seo/pages";

describe("SEO page registry", () => {
  it("has unique paths and article slugs", () => {
    const paths = SEO_TASK_TYPE_PAGES.map((page) => page.path);
    const slugs = SEO_TASK_TYPE_PAGES.map((page) => page.slug);
    expect(new Set(paths).size).toBe(paths.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keeps task type paths consistent with subject, exam and number", () => {
    for (const page of SEO_TASK_TYPE_PAGES) {
      expect(page.path).toBe(`/${page.subject}/${page.exam}/zadanie-${page.number}`);
      expect(
        getTaskTypePage(page.subject, page.exam, `zadanie-${page.number}`),
      ).toEqual(page);
      expect(getSeoArticlePath(page.slug)).toBe(page.path);
      expect(isSeoArticleSlug(page.slug)).toBe(true);
    }
  });

  it("rejects unknown task numbers and exams", () => {
    expect(getTaskTypePage("matematika", "oge", "zadanie-99")).toBeNull();
    expect(getTaskTypePage("matematika", "foo", "zadanie-6")).toBeNull();
    expect(getTaskTypePage("informatika", "oge", "zadanie-2")).toBeNull();
  });

  it("has an exam hub for every subject and exam", () => {
    for (const subject of ["matematika", "informatika"] as const) {
      for (const exam of ["oge", "ege"] as const) {
        const hub = getExamHub(subject, exam);
        expect(hub).not.toBeNull();
        expect(hub?.path).toBe(`/${subject}/${exam}`);
        expect(hub?.taskTypes.length).toBeGreaterThan(0);
      }
    }
  });

  it("links task type pages to known article labels", () => {
    for (const page of SEO_TASK_TYPE_PAGES) {
      for (const slug of page.relatedArticleSlugs) {
        expect(SEO_ARTICLE_LABELS[slug]).toBeTruthy();
        expect(getArticleLabel(slug)).not.toBe(slug);
      }
    }
    for (const hub of SEO_EXAM_HUBS) {
      for (const slug of hub.relatedArticleSlugs) {
        expect(SEO_ARTICLE_LABELS[slug]).toBeTruthy();
      }
    }
  });

  it("has at least one implemented task type page per exam where claimed", () => {
    expect(SEO_TASK_TYPE_PAGES.filter((page) => page.exam === "oge")).not.toHaveLength(
      0,
    );
    expect(SEO_TASK_TYPE_PAGES.filter((page) => page.exam === "ege")).not.toHaveLength(
      0,
    );
  });
});
