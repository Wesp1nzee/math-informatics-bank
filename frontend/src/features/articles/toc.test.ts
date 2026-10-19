import { describe, expect, it } from "vitest";

import { getArticleToc } from "@/features/articles/toc";
import type { Article } from "@/features/articles/types";

function makeArticle(overrides: Partial<Article> = {}): Article {
  return {
    slug: "article",
    title: "Article",
    description: "",
    subject: "matematika",
    exam: "ЕГЭ",
    readingMinutes: 5,
    published: "2026-01-01",
    blocks: [],
    isDemo: false,
    ...overrides,
  };
}

describe("getArticleToc", () => {
  it("builds a table of contents from v2 rich_text headings", () => {
    const toc = getArticleToc(
      makeArticle({
        content: {
          version: 2,
          blocks: [
            {
              id: "h1",
              type: "rich_text",
              data: {
                kind: "heading",
                level: 2,
                children: [{ type: "text", text: "Первый" }],
              },
            },
            {
              id: "h2",
              type: "rich_text",
              data: {
                kind: "heading",
                level: 3,
                children: [
                  { type: "strong", children: [{ type: "text", text: "Второй" }] },
                ],
              },
            },
            {
              id: "h3",
              type: "rich_text",
              data: {
                kind: "heading",
                level: 2,
                children: [{ type: "text", text: "Третий" }],
              },
            },
          ],
        },
      }),
    );

    expect(toc).toEqual([
      { id: "h1", text: "Первый" },
      { id: "h2", text: "Второй" },
      { id: "h3", text: "Третий" },
    ]);
  });

  it("falls back to v1 headings for legacy articles", () => {
    const toc = getArticleToc(
      makeArticle({
        blocks: [
          { type: "heading", id: "a", text: "A" },
          { type: "heading", id: "b", text: "B" },
          { type: "heading", id: "c", text: "C" },
        ],
      }),
    );

    expect(toc.map((item) => item.id)).toEqual(["a", "b", "c"]);
  });

  it("returns an empty table of contents for fewer than three headings", () => {
    const toc = getArticleToc(
      makeArticle({
        content: {
          version: 2,
          blocks: [
            {
              id: "h1",
              type: "rich_text",
              data: {
                kind: "heading",
                level: 2,
                children: [{ type: "text", text: "Один" }],
              },
            },
          ],
        },
      }),
    );

    expect(toc).toEqual([]);
  });

  it("does not fall back to v1 blocks when v2 content is present", () => {
    const toc = getArticleToc(
      makeArticle({
        blocks: [
          { type: "heading", id: "a", text: "A" },
          { type: "heading", id: "b", text: "B" },
          { type: "heading", id: "c", text: "C" },
        ],
        content: {
          version: 2,
          blocks: [
            {
              id: "h1",
              type: "rich_text",
              data: {
                kind: "heading",
                level: 2,
                children: [{ type: "text", text: "Один" }],
              },
            },
          ],
        },
      }),
    );

    expect(toc).toEqual([]);
  });
});
