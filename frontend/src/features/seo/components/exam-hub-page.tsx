import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { TaskTypeTable } from "@/features/seo/components/task-type-table";
import { getArticleLabel, type ExamHub, type SeoSubject } from "@/features/seo/pages";
import { SUBJECT_LABEL, SUBJECT_PATH } from "@/features/tasks/labels";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

const EXAM_LABEL = { oge: "ОГЭ", ege: "ЕГЭ" } as const;

export function ExamHubPage({ hub }: { hub: ExamHub }) {
  const subject = hub.subject as SeoSubject;
  const subjectLabel = SUBJECT_LABEL[subject];
  const examLabel = EXAM_LABEL[hub.exam];
  const crumbs = [
    { name: "Главная", href: "/" },
    { name: subjectLabel, href: SUBJECT_PATH[subject] },
    { name: examLabel },
  ];
  const taskHubPath = `${hub.path}/zadaniya`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({ name: crumb.name, path: crumb.href ?? hub.path })),
        )}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow={hub.eyebrow}
        title={hub.h1}
        description={hub.lead}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={taskHubPath}>
              Карта заданий <ButtonArrow />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/zadachi?subject=${subject}`}>Решать задачи</Link>
          </Button>
        </div>
      </PageHero>

      <Section labelledBy="exam-facts-title">
        <h2 id="exam-facts-title" className="sr-only">
          Экзамен в цифрах
        </h2>
        <dl className="m-0 grid grid-cols-2 gap-3 md:grid-cols-4">
          {hub.facts.map((fact) => (
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

      {hub.sections.map((section, index) => (
        <Section
          key={section.title}
          bordered={index > 0}
          labelledBy={`exam-section-${index}`}
        >
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="desk:col-span-5 col-span-12">
              <h2 id={`exam-section-${index}`} className="heading-3">
                {section.title}
              </h2>
            </div>
            <div className="desk:col-span-6 desk:col-start-7 col-span-12">
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

      <Section bordered labelledBy="exam-map-title">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="exam-map-title" className="heading-3">
              Карта заданий
            </h2>
            <p className="text-ink-soft mt-3 max-w-2xl">
              Номера и темы приведены по спецификации 2026 года. Для части номеров уже
              есть подробные разборы с тренировкой; остальные темы можно отработать в
              банке задач.
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={taskHubPath}>Все типы заданий</Link>
          </Button>
        </div>
        <TaskTypeTable items={hub.taskTypes} className="md:grid-cols-2" />
      </Section>

      {hub.relatedArticleSlugs.length > 0 ? (
        <Section bordered labelledBy="exam-articles-title">
          <h2 id="exam-articles-title" className="heading-3 mb-8">
            Материалы по теме
          </h2>
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
            {hub.relatedArticleSlugs.map((slug) => (
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

      <Section bordered={false} className="pt-0 pb-16 md:pb-24">
        <div className="border-line bg-surface rounded-xl border p-6 md:p-8">
          <h2 className="heading-3">Нужен разбор под ваш уровень?</h2>
          <p className="body-large mt-4 max-w-2xl">
            На индивидуальных занятиях можно разобрать именно те номера, где теряются
            баллы: без случайных тем и лишних заданий.
          </p>
          <Button asChild className="mt-6">
            <Link href="/podgotovka">Узнать про занятия</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
