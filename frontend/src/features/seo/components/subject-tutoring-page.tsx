import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import type { SeoTutorLanding } from "@/features/seo/content-pages";
import { getArticleLabel } from "@/features/seo/pages";
import { SUBJECT_LABEL, SUBJECT_PATH } from "@/features/tasks/labels";
import { breadcrumbJsonLd, faqPageJsonLd, serviceJsonLd } from "@/lib/seo/json-ld";

export function SubjectTutoringPage({ landing }: { landing: SeoTutorLanding }) {
  const subjectLabel = SUBJECT_LABEL[landing.subject];
  const crumbs = [
    { name: "Главная", href: "/" },
    { name: subjectLabel, href: SUBJECT_PATH[landing.subject] },
    { name: "Репетитор" },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({
            name: crumb.name,
            path: crumb.href ?? landing.path,
          })),
        )}
      />
      <JsonLd
        data={serviceJsonLd({
          name: landing.h1,
          description: landing.metaDescription,
          areaServed: "Онлайн",
        })}
      />
      <JsonLd data={faqPageJsonLd(landing.faq)} />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow={landing.eyebrow}
        title={landing.h1}
        description={landing.lead}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/podgotovka#request">
              Записаться на пробное <ButtonArrow />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/diagnostika">Пройти диагностику</Link>
          </Button>
        </div>
      </PageHero>

      <Section labelledBy="tutor-facts-title">
        <h2 id="tutor-facts-title" className="sr-only">
          Формат занятий
        </h2>
        <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-4">
          {landing.facts.map((fact) => (
            <div
              key={fact.label}
              className="border-line bg-surface rounded-lg border p-5"
            >
              <dt className="text-ink-faint text-sm">{fact.label}</dt>
              <dd className="text-ink mt-2 text-xl font-medium tracking-[-0.02em]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {landing.sections.map((section, index) => (
        <Section key={section.title} bordered labelledBy={`tutor-section-${index}`}>
          <div className="desk:grid-cols-12 grid w-full min-w-0 grid-cols-1 gap-4 md:gap-6">
            <div className="desk:col-span-5 col-span-1 min-w-0">
              <h2 id={`tutor-section-${index}`} className="heading-3">
                {section.title}
              </h2>
            </div>
            <div className="desk:col-span-6 desk:col-start-7 col-span-1 min-w-0">
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="body-large mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="text-ink-soft m-0 mt-4 grid list-none gap-3 p-0">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-accent mt-2.5 size-1.5 shrink-0 rounded-full"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </Section>
      ))}

      {landing.relatedArticleSlugs.length > 0 ? (
        <Section bordered labelledBy="tutor-articles-title">
          <h2 id="tutor-articles-title" className="heading-3 mb-8">
            Материалы по предмету
          </h2>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {landing.relatedArticleSlugs.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/articles/${slug}`}
                  className="group border-line bg-surface hover:border-ink flex items-center justify-between gap-4 rounded-lg border p-5 transition-colors"
                >
                  <span className="text-ink font-medium">{getArticleLabel(slug)}</span>
                  <ButtonArrow />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section bordered labelledBy="tutor-faq-title">
        <div className="desk:grid-cols-12 grid w-full min-w-0 grid-cols-1 gap-4 md:gap-6">
          <div className="desk:col-span-5 col-span-1 min-w-0">
            <h2 id="tutor-faq-title" className="heading-3">
              Вопросы и ответы
            </h2>
          </div>
          <div className="desk:col-span-6 desk:col-start-7 col-span-1 min-w-0">
            <div className="grid gap-3">
              {landing.faq.map((item) => (
                <details
                  key={item.question}
                  className="border-line bg-surface rounded-lg border p-5"
                >
                  <summary className="text-ink cursor-pointer font-medium">
                    {item.question}
                  </summary>
                  <p className="text-ink-soft mt-3">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section bordered={false} className="pt-0 pb-16 md:pb-24">
        <div className="border-line bg-surface rounded-xl border p-6 md:p-8">
          <h2 className="heading-3">Начнём с диагностики</h2>
          <p className="body-large mt-4 max-w-2xl">
            Оставьте контакт — договоримся о времени и разберём задачи. По результату
            будет понятно, с чего начать и какой ритм занятий подойдёт.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/podgotovka#request">Оставить заявку</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/diagnostika">Сначала диагностика</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
