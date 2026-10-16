import type { Article, ArticleTocItem } from "@/features/articles/types";

export function getArticleToc(article: Article): ArticleTocItem[] {
  const headings = article.blocks.flatMap((block) =>
    block.type === "heading" ? [{ id: block.id, text: block.text }] : [],
  );

  return headings.length >= 3 ? headings : [];
}
