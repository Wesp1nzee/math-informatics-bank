import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ArticleMeta } from "@/features/articles/components/article-meta";
import { getArticlePath } from "@/features/articles/api";
import type { Article } from "@/features/articles/types";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="h-full w-full min-w-0">
      <Link
        href={getArticlePath(article.slug)}
        className="group border-line bg-surface ease-soft hover:border-ink shadow-card hover:shadow-float flex h-full w-full min-w-0 flex-col gap-3 rounded-xl border p-5 transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 sm:p-7"
      >
        <ArticleMeta article={article} />
        <h3 className="group-hover:text-accent text-2xl leading-tight font-medium tracking-[-0.02em] break-words transition-colors">
          {article.title}
        </h3>
        <p className="text-ink-soft flex-1 text-base break-words">
          {article.description}
        </p>
        <span className="text-ink inline-flex items-center gap-2 text-sm font-medium">
          Читать
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-150 group-hover:translate-x-1"
          />
        </span>
      </Link>
    </article>
  );
}
