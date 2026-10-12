import type { Article, ArticleTocItem } from "@/features/articles/types";

/**
 * Table of contents derived from the article's headings. Returns an empty list
 * when there are fewer than three headings — a two-item TOC is noise.
 *
 * Kept in its own module (no server-only imports) so it stays unit-testable.
 */
export function getArticleToc(article: Article): ArticleTocItem[] {
  const headings = article.blocks.flatMap((block) =>
    block.type === "heading" ? [{ id: block.id, text: block.text }] : [],
  );

  return headings.length >= 3 ? headings : [];
}
