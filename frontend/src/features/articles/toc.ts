import { inlineNodesToText } from "@/features/articles/runtime";
import type { Article, ArticleTocItem } from "@/features/articles/types";

export function getArticleToc(article: Article): ArticleTocItem[] {
  const v2Blocks =
    article.content && Array.isArray(article.content.blocks)
      ? article.content.blocks
      : null;

  const headings = v2Blocks
    ? v2Blocks.flatMap((block) => {
        if (block.type !== "rich_text" || block.data.kind !== "heading") {
          return [];
        }
        const text = inlineNodesToText(block.data.children);
        return block.id && text ? [{ id: block.id, text }] : [];
      })
    : article.blocks.flatMap((block) =>
        block.type === "heading" ? [{ id: block.id, text: block.text }] : [],
      );

  return headings.length >= 3 ? headings : [];
}
