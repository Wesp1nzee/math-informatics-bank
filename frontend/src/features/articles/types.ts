import type { TaskSubject } from "@/features/tasks/types";

/** A block of article content. `$...$` inside text is inline math. */
export type ArticleBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string; id: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "formula"; tex: string; caption?: string }
  | { type: "quote"; text: string };

export type Article = {
  slug: string;
  title: string;
  description: string;
  subject: TaskSubject;
  /** Exam the article is aimed at, e.g. "ЕГЭ". */
  exam: string;
  readingMinutes: number;
  /** ISO publication date. */
  published: string;
  updated?: string;
  blocks: ArticleBlock[];
  /** Marks the built-in demo dataset. */
  isDemo: boolean;
};

export type ArticleTocItem = {
  id: string;
  text: string;
};
