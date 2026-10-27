import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { WorldSection } from "@/components/layout/world-section";
import { PeekCarousel, PEEK_ITEM } from "@/components/ui/peek-carousel";
import { getArticlePath, getArticles } from "@/features/articles/api";
import { isSeoArticleSlug } from "@/features/seo/pages";
import { SUBJECT_LABEL } from "@/features/tasks/labels";

function FormulaPreview({ variant = 0 }: { variant?: number }) {
  if (variant === 1) {
    return (
      <div className="article-live-preview" aria-hidden="true">
        <span className="mono-label mb-2">ALGORITHM / TRACE</span>
        <div className="text-ink font-mono text-sm leading-7">
          <span className="text-accent">while</span> r(n) &lt;= 83:
          <br />
          &nbsp;&nbsp;n += 1
          <br />
          <span className="text-success">print</span>(r(n)) # 86
        </div>
      </div>
    );
  }

  return (
    <div className="article-live-preview" aria-hidden="true">
      <span className="mono-label mb-2">
        {variant === 0 ? "CALCULUS / SLOPE" : "ALGEBRA / MODEL"}
      </span>
      <svg className="h-16 w-full" viewBox="0 0 260 64" preserveAspectRatio="none">
        <path
          d={
            variant === 0
              ? "M0 54 C 40 52, 56 18, 96 30 S 160 58, 196 26 S 236 12, 260 8"
              : "M0 58 C 58 58, 62 10, 130 10 S 202 58, 260 58"
          }
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="50"
          x2="260"
          y2="50"
          stroke="var(--color-line-strong)"
          strokeDasharray="4 6"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}

export async function ArticlesSection() {
  const { items: allItems } = await getArticles();
  const items = allItems.filter((article) => !isSeoArticleSlug(article.slug));
  const [lead, ...rest] = items;
  const side = rest.slice(0, 2);

  return (
    <WorldSection
      labelledBy="articles-title"
      worldState="materials"
      className="section-frame pt-0 md:pt-0"
    >
      <div className="reveal">
        <span className="mono-label mb-4">READ / THINK / APPLY</span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="articles-title"
            data-split-text
            className="heading-2 heading-scrim mb-8"
          >
            Разборы
          </h2>
          <p className="text-ink-soft heading-scrim m-0 max-w-[30em] text-base leading-relaxed">
            Как думать, а не заучивать: формулы, алгоритмы и причины ошибок.
          </p>
        </div>

        {lead ? (
          <PeekCarousel
            count={1 + side.length}
            label="Разборы"
            className="desk:grid-cols-12 desk:gap-6 items-stretch sm:gap-4"
          >
            <Link
              href={getArticlePath(lead.slug)}
              data-peek-item=""
              className={`${PEEK_ITEM} group glass hover:shadow-float desk:col-span-7 desk:min-h-[420px] flex min-h-[300px] min-w-0 flex-col justify-between rounded-2xl border border-[var(--color-line)] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] sm:p-6 md:p-8`}
            >
              <div>
                <div className="flex items-start justify-between gap-6">
                  <span className="text-accent desk:text-[88px] font-serif text-5xl leading-none italic">
                    1
                  </span>
                  <span className="metric-chip">
                    <b>01</b>
                    <span className="text-ink-soft">лонгрид</span>
                  </span>
                </div>
                <h3 className="my-5 max-w-[13em] text-[clamp(28px,3.4vw,44px)] leading-[1.08] font-medium tracking-[-0.03em] [overflow-wrap:anywhere]">
                  {lead.title}
                </h3>
                <FormulaPreview variant={0} />
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
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

            <div className="desk:col-span-4 desk:col-start-9 desk:mt-0 contents sm:mt-4 sm:flex sm:w-full sm:min-w-0 sm:flex-col sm:gap-4">
              {side.map((article, index) => (
                <Link
                  key={article.slug}
                  href={getArticlePath(article.slug)}
                  data-peek-item=""
                  className={`${PEEK_ITEM} group glass hover:shadow-float flex min-w-0 flex-col rounded-2xl border border-[var(--color-line)] p-5 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)] sm:flex-1 sm:p-6`}
                >
                  <span className="text-ink-soft text-sm">
                    {article.subject ? `${SUBJECT_LABEL[article.subject]} · ` : ""}
                    {article.exam}
                  </span>
                  <h3 className="heading-3 group-hover:text-accent my-3 text-[clamp(20px,2vw,26px)] transition-colors duration-150">
                    {article.title}
                  </h3>
                  <FormulaPreview variant={index + 1} />
                  <span className="text-ink group-hover:text-accent mt-4 inline-flex items-center gap-2 font-medium transition-colors">
                    Читать
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-150 group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              ))}
              {side.length === 0 ? (
                <div className="bento-cell flex-1">
                  <span className="mono-label mb-3">LIBRARY / GROWING</span>
                  <p className="text-ink-soft m-0 text-base leading-relaxed">
                    Новые разборы выходят регулярно. Откройте раздел статей, чтобы
                    выбрать тему.
                  </p>
                </div>
              ) : null}
            </div>
          </PeekCarousel>
        ) : (
          <div className="glass border-line rounded-2xl border p-6 md:p-8">
            <p className="text-ink-soft m-0 text-base leading-relaxed">
              Подборка разборов обновляется. Все материалы доступны в разделе статей.
            </p>
            <Link
              href="/articles"
              className="text-accent hover:text-accent-strong mt-4 inline-flex min-h-11 items-center gap-2 font-medium"
            >
              Перейти к статьям <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </WorldSection>
  );
}
