import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { getArticlePath, getArticles } from "@/features/articles/api";
import { SUBJECT_LABEL } from "@/features/tasks/labels";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export async function ArticlesSection() {
  const { items } = await getArticles();
  const [lead, ...rest] = items;
  if (!lead) return null;

  const side = rest.slice(0, 2);

  return (
    <Section
      labelledBy="articles-title"
      className="desk:py-24 bg-surface py-16 md:py-20"
    >
      <div className="reveal mb-[72px] max-md:mb-12">
        <span className="eyebrow">Разборы и идеи</span>
        <h2 id="articles-title" className="heading-2">
          Как думать, а не заучивать
        </h2>
        <p className="body-large mt-6">
          Разбираю задачи, ошибки и способы мышления, которые помогают решать быстрее и
          увереннее.
        </p>
      </div>

      <div className="grid grid-cols-12 items-stretch gap-4 md:gap-6">
        <Link
          href={getArticlePath(lead.slug)}
          aria-label={`Читать: ${lead.title}`}
          className="group reveal border-line bg-surface hover:border-ink desk:col-span-7 desk:min-h-[480px] col-span-12 flex min-h-[340px] flex-col justify-between rounded-xl border p-6 transition-colors duration-300 md:p-10"
        >
          <div>
            <span className="text-accent desk:text-[96px] font-serif text-6xl leading-none italic">
              1
            </span>
            <h3 className="my-6 max-w-[11em] text-[clamp(32px,4vw,52px)] leading-[1.05] font-medium tracking-[-0.035em]">
              {lead.title}
            </h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-soft text-sm">
              {lead.subject ? `${SUBJECT_LABEL[lead.subject]} · ` : ""}
              {lead.exam}
            </span>
            <span className="inline-flex items-center gap-2 font-medium">
              Читать
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-150 group-hover:translate-x-1"
              />
            </span>
          </div>
        </Link>

        <div
          className="reveal desk:col-span-4 desk:col-start-9 desk:mt-0 col-span-12 mt-4 flex flex-col"
          style={step(1)}
        >
          {side.map((article) => (
            <Link
              key={article.slug}
              href={getArticlePath(article.slug)}
              className="group border-line desk:py-8 flex flex-1 flex-col border-t py-6 first:border-t-0 first:pt-0"
            >
              <span className="text-ink-soft text-sm">
                {article.subject ? `${SUBJECT_LABEL[article.subject]} · ` : ""}
                {article.exam}
              </span>
              <h3 className="heading-3 group-hover:text-accent my-3 transition-colors duration-150">
                {article.title}
              </h3>
              <span className="inline-flex items-center gap-2 font-medium">
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
    </Section>
  );
}
