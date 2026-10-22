import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { WorldSection } from "@/components/layout/world-section";
import { getArticlePath, getArticles } from "@/features/articles/api";
import { isSeoArticleSlug } from "@/features/seo/pages";
import { SUBJECT_LABEL } from "@/features/tasks/labels";

export async function ArticlesSection() {
  const { items: allItems } = await getArticles();
  const items = allItems.filter((article) => !isSeoArticleSlug(article.slug));
  const [lead, ...rest] = items;
  if (!lead) return null;

  const side = rest.slice(0, 2);

  return (
    <WorldSection labelledBy="articles-title" worldState="materials" className="pt-0 md:pt-0">
      <div className="reveal">
        <h2 id="articles-title" data-split-text className="heading-2 heading-scrim mb-8">
          Разборы
        </h2>

        <div className="grid grid-cols-1 items-stretch gap-4 desk:grid-cols-12 desk:gap-6">
          <Link
            href={getArticlePath(lead.slug)}
            className="group border-line bg-surface shadow-card hover:shadow-float desk:col-span-7 desk:min-h-[420px]  flex min-h-[300px] flex-col justify-between rounded-2xl border p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-accent)] md:p-8"
          >
            <div>
              <span className="text-accent desk:text-[80px] font-serif text-5xl leading-none italic">
                1
              </span>
              <h3 className="my-5 max-w-[13em] text-[clamp(28px,3.4vw,44px)] leading-[1.08] font-medium tracking-[-0.03em]">
                {lead.title}
              </h3>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-ink-soft text-sm">
                {lead.subject ? `${SUBJECT_LABEL[lead.subject]} · ` : ""}
                {lead.exam}
              </span>
              <span className="text-ink group-hover:text-accent inline-flex items-center gap-2 font-medium transition-colors">
                Читать
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-150 group-hover:translate-x-1"
                />
              </span>
            </div>
          </Link>

          <div className="desk:col-span-4 desk:col-start-9 desk:mt-0  mt-4 flex flex-col">
            {side.map((article) => (
              <Link
                key={article.slug}
                href={getArticlePath(article.slug)}
                className="group border-line bg-surface shadow-card hover:shadow-float desk:py-8 flex flex-1 flex-col rounded-2xl border p-6 transition-all duration-200 first:mt-0 hover:-translate-y-1 hover:border-[var(--color-accent)] [&:not(:first-child)]:mt-4"
              >
                <span className="text-ink-soft text-sm">
                  {article.subject ? `${SUBJECT_LABEL[article.subject]} · ` : ""}
                  {article.exam}
                </span>
                <h3 className="heading-3 group-hover:text-accent my-3 transition-colors duration-150">
                  {article.title}
                </h3>
                <span className="text-ink group-hover:text-accent inline-flex items-center gap-2 font-medium transition-colors">
                  Читать
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-150 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </WorldSection>
  );
}
