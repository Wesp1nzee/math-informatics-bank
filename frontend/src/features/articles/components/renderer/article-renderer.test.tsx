import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ArticleRenderer } from "@/features/articles/components/renderer/article-renderer";
import type { ArticleBlockV2, ArticleContent } from "@/features/articles/types";

vi.mock(
  "@/features/articles/components/renderer/blocks/interactive-graph-loader",
  () => ({
    InteractiveGraphLoader: () => null,
  }),
);

function content(blocks: unknown[]): ArticleContent {
  return { version: 2, blocks: blocks as ArticleBlockV2[] };
}

describe("ArticleRenderer", () => {
  it("renders structured rich text, links and inline math", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "rt",
            type: "rich_text",
            data: {
              kind: "paragraph",
              children: [
                { type: "text", text: "Привет, " },
                { type: "strong", children: [{ type: "text", text: "мир" }] },
                { type: "text", text: " и " },
                {
                  type: "link",
                  href: "/zadachi",
                  children: [{ type: "text", text: "задачи" }],
                },
                { type: "math", tex: "x^2" },
              ],
            },
          },
        ])}
      />,
    );

    expect(screen.getByText(/Привет/)).toBeInTheDocument();
    expect(screen.getByText("мир").tagName).toBe("STRONG");
    expect(screen.getByRole("link", { name: "задачи" }).getAttribute("href")).toBe(
      "/zadachi",
    );
    expect(document.querySelector(".katex")).toBeTruthy();
  });

  it("renders headings with anchors and lists", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "intro",
            type: "rich_text",
            data: {
              kind: "heading",
              level: 2,
              children: [{ type: "text", text: "Введение" }],
            },
          },
          {
            id: "list",
            type: "rich_text",
            data: {
              kind: "list",
              ordered: true,
              items: [
                [{ type: "text", text: "Первый" }],
                [{ type: "text", text: "Второй" }],
              ],
            },
          },
        ])}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Введение" })).toHaveAttribute(
      "id",
      "intro",
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders display math and falls back on invalid LaTeX", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "m1",
            type: "math",
            data: { tex: "\\frac{1}{2}", display: true, caption: "Дробь" },
          },
          {
            id: "m2",
            type: "math",
            data: { tex: "\\notacommand{", display: true },
          },
        ])}
      />,
    );

    expect(document.querySelector(".katex")).toBeTruthy();
    expect(screen.getByText("Дробь")).toBeInTheDocument();
    const fallback = document.querySelector("[data-katex-fallback='true']");
    expect(fallback).toBeTruthy();
    expect(fallback?.textContent).toContain("\\notacommand");
  });

  it("renders exercises with public data only", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "choice",
            type: "single_choice",
            data: {
              prompt: [{ type: "text", text: "2 + 2?" }],
              options: [
                { id: "a", label: [{ type: "text", text: "4" }] },
                { id: "b", label: [{ type: "text", text: "5" }] },
              ],
            },
          },
          {
            id: "num",
            type: "numeric_input",
            data: {
              prompt: [{ type: "text", text: "2 + 2" }],
              unit: "см",
            },
          },
        ])}
        articleSlug="demo-article"
      />,
    );

    expect(screen.getByText("2 + 2?")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByText("2 + 2")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Проверить" })).toHaveLength(2);
  });

  it("renders solution steps, hints, callouts, images and dividers", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "sol",
            type: "step_solution",
            data: {
              steps: [
                {
                  id: "s1",
                  note: [{ type: "text", text: "Первый шаг" }],
                  math: { tex: "x=1", display: true },
                },
              ],
            },
          },
          {
            id: "hint",
            type: "hint",
            data: {
              title: "Подсказка",
              body: [{ type: "text", text: "Подумайте" }],
            },
          },
          {
            id: "note",
            type: "callout",
            data: {
              kind: "warning",
              title: "Важно",
              body: [{ type: "text", text: "Текст" }],
            },
          },
          {
            id: "img",
            type: "image",
            data: { src: "/media/a.png", alt: "Схема", caption: "Рис. 1" },
          },
          { id: "div", type: "divider", data: { variant: "spaced" } },
        ])}
      />,
    );

    expect(screen.getByText("Первый шаг")).toBeInTheDocument();
    expect(screen.getByText("Подсказка")).toBeInTheDocument();
    expect(screen.getByText("Важно")).toBeInTheDocument();
    expect(screen.getByText("Текст")).toBeInTheDocument();
    expect(screen.getByAltText("Схема")).toBeInTheDocument();
    expect(screen.getByText("Рис. 1")).toBeInTheDocument();
    expect(document.querySelector("hr")).toBeTruthy();
  });

  it("renders the graph shell and expression labels", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "graph",
            type: "interactive_graph",
            data: {
              engine: "svg",
              expressions: [{ id: "f", expr: "a*x", label: "f(x)" }],
              parameters: [
                { id: "a", label: "a", min: 0, max: 2, step: 0.5, default: 1 },
              ],
            },
          },
        ])}
      />,
    );

    expect(screen.getByText("Интерактивный график")).toBeInTheDocument();
    expect(screen.getByText("f(x)")).toBeInTheDocument();
    expect(screen.getByText(/Настройте параметры/)).toBeInTheDocument();
  });

  it("renders a controlled fallback for unknown blocks", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "before",
            type: "rich_text",
            data: {
              kind: "paragraph",
              children: [{ type: "text", text: "До" }],
            },
          },
          { id: "future", type: "future_block", data: { foo: "bar" } },
          {
            id: "after",
            type: "rich_text",
            data: {
              kind: "paragraph",
              children: [{ type: "text", text: "После" }],
            },
          },
        ])}
      />,
    );

    expect(screen.getByText("До")).toBeInTheDocument();
    expect(screen.getByText("После")).toBeInTheDocument();
    expect(
      screen.getByText(/Блок «future_block» пока не поддерживается/),
    ).toBeInTheDocument();
  });

  it("does not crash on malformed blocks", () => {
    const malformed = {
      version: 2,
      blocks: [
        null,
        { id: "broken" },
        { id: "bad-data", type: "rich_text", data: null },
        { id: "bad-math", type: "math", data: {} },
        {
          id: "bad-choice",
          type: "single_choice",
          data: { prompt: [], options: [] },
        },
        { id: "ok", type: "divider", data: {} },
      ],
    } as unknown as ArticleContent;

    expect(() => render(<ArticleRenderer content={malformed} />)).not.toThrow();
    expect(screen.getAllByText(/Некорректный блок/).length).toBeGreaterThan(0);
    expect(screen.getByText("Формула недоступна")).toBeInTheDocument();
    expect(screen.getByText("Варианты ответа недоступны.")).toBeInTheDocument();
  });

  it("renders a fallback for unsupported content versions", () => {
    render(
      <ArticleRenderer
        content={{ version: 3, blocks: [] } as unknown as ArticleContent}
      />,
    );
    expect(screen.getByText("Контент статьи недоступен")).toBeInTheDocument();
  });

  it("does not create javascript: links", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "rt",
            type: "rich_text",
            data: {
              kind: "paragraph",
              children: [
                {
                  type: "link",
                  href: "javascript:alert(1)",
                  children: [{ type: "text", text: "опасно" }],
                },
              ],
            },
          },
        ])}
      />,
    );

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("опасно")).toBeInTheDocument();
  });

  it("rejects unsafe image sources", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "img",
            type: "image",
            data: { src: "javascript:alert(1)", alt: "x" },
          },
        ])}
      />,
    );

    expect(screen.queryByAltText("x")).toBeNull();
    expect(screen.getByText("Изображение недоступно")).toBeInTheDocument();
  });

  it("produces server-rendered HTML with text and formulas", () => {
    const html = renderToStaticMarkup(
      <ArticleRenderer
        content={content([
          {
            id: "p",
            type: "rich_text",
            data: {
              kind: "paragraph",
              children: [{ type: "text", text: "Серверный текст статьи" }],
            },
          },
          { id: "m", type: "math", data: { tex: "x^2 + y^2" } },
        ])}
      />,
    );

    expect(html).toContain("Серверный текст статьи");
    expect(html).toContain("katex");
    expect(html).not.toContain("Некорректный блок");
  });

  it("does not render exercise explanations before checking is available", () => {
    render(
      <ArticleRenderer
        content={content([
          {
            id: "choice",
            type: "single_choice",
            data: {
              prompt: [{ type: "text", text: "Вопрос" }],
              options: [
                { id: "a", label: [{ type: "text", text: "A" }] },
                { id: "b", label: [{ type: "text", text: "B" }] },
              ],
              explanation: [{ type: "text", text: "Секретное пояснение" }],
            },
          },
          {
            id: "num",
            type: "numeric_input",
            data: {
              prompt: [{ type: "text", text: "Число" }],
              explanation: [{ type: "text", text: "Секретное число" }],
            },
          },
        ])}
        articleSlug="demo-article"
      />,
    );

    expect(screen.queryByText("Секретное пояснение")).toBeNull();
    expect(screen.queryByText("Секретное число")).toBeNull();
  });

  it("inserts the conversion slot once around the middle", () => {
    render(
      <ArticleRenderer
        content={content([
          { id: "a", type: "divider", data: {} },
          { id: "b", type: "divider", data: {} },
          { id: "c", type: "divider", data: {} },
        ])}
        midSlot={<div data-testid="mid" />}
      />,
    );

    expect(screen.getAllByTestId("mid")).toHaveLength(1);
  });
});
