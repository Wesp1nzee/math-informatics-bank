import { SUBJECT_LABEL } from "@/features/tasks/labels";
import type { Article } from "@/features/articles/types";
import { formatDate, pluralize } from "@/lib/utils/format";

/** Subject · exam · reading time · date. */
export function ArticleMeta({ article }: { article: Article }) {
  return (
    <p className="text-ink-soft flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span>{SUBJECT_LABEL[article.subject]}</span>
      <span aria-hidden="true">·</span>
      <span>{article.exam}</span>
      <span aria-hidden="true">·</span>
      <span>
        {article.readingMinutes}{" "}
        {pluralize(article.readingMinutes, "минута", "минуты", "минут")} чтения
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.published}>{formatDate(article.published)}</time>
    </p>
  );
}
