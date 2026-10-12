import { describe, expect, it } from "vitest";

import { demoArticles } from "@/features/articles/fixtures/articles";
import { getArticleToc } from "@/features/articles/toc";
import { demoTasks } from "@/features/tasks/fixtures/tasks";

describe("demo task fixtures", () => {
  it("have unique ids", () => {
    const ids = demoTasks.map((task) => task.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("are complete enough to render a task page", () => {
    for (const task of demoTasks) {
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.statement.length).toBeGreaterThan(0);
      expect(task.steps.length).toBeGreaterThan(0);
      expect(task.answer.value.length).toBeGreaterThan(0);
      expect(task.summary.length).toBeGreaterThan(0);
    }
  });

  it("uses numeric answers that parse as finite numbers", () => {
    for (const task of demoTasks) {
      if (task.answer.kind !== "number") continue;
      expect(Number.isFinite(Number(task.answer.value))).toBe(true);
    }
  });

  it("features exactly the three tasks shown on the home page", () => {
    expect(demoTasks.filter((task) => task.featured)).toHaveLength(3);
  });
});

describe("demo article fixtures", () => {
  it("have unique slugs and resolvable headings", () => {
    const slugs = demoArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("builds a table of contents only when there are enough headings", () => {
    for (const article of demoArticles) {
      const headings = article.blocks.filter((block) => block.type === "heading");
      const toc = getArticleToc(article);
      if (headings.length >= 3) {
        expect(toc.length).toBeGreaterThanOrEqual(3);
      } else {
        expect(toc).toHaveLength(0);
      }
    }
  });

  it("uses unique heading ids inside an article", () => {
    for (const article of demoArticles) {
      const ids = article.blocks.flatMap((block) =>
        block.type === "heading" ? [block.id] : [],
      );
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
