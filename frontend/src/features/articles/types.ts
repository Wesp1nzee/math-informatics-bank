import type { TaskSubject } from "@/features/tasks/types";

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
  exam: string;
  readingMinutes: number;
  published: string;
  updated?: string;
  blocks: ArticleBlock[];
  isDemo: boolean;
};

export type ArticleTocItem = {
  id: string;
  text: string;
};
