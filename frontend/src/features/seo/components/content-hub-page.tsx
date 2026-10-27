import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getArticleLabel,
  getExamHub,
  getTaskTypePages,
  type SeoExam,
  type SeoSubject,
} from "@/features/seo/pages";
import { TaskTypeTable } from "@/features/seo/components/task-type-table";
import type { SeoContentHub } from "@/features/seo/content-pages";
import { SUBJECT_LABEL, SUBJECT_PATH } from "@/features/tasks/labels";
import { breadcrumbJsonLd, learningResourceJsonLd } from "@/lib/seo/json-ld";

const EXAM_LABEL = { oge: "ОГЭ", ege: "ЕГЭ" } as const;

const SECTION_LABEL: Record<SeoContentHub["kind"], string> = {
  theory: "Теория",
  solutions: "Разборы",
  grade: "Класс",
};

function taskEntries(hub: SeoContentHub) {
  const exams: SeoExam[] = hub.exam ? [hub.exam] : ["oge", "ege"];
  return exams.flatMap((exam) => {
    const examHub = getExamHub(hub.subject, exam);
    const entries = new Map(
      examHub?.taskTypes.map((item) => [item.number, item]) ?? [],
    );
    return getTaskTypePages(hub.subject, exam).map((page) => {
      const entry = entries.get(page.number);
      return {
        number: page.number,
        label: entry?.label ?? `Задание ${page.number}`,
        note: hub.exam
          ? (entry?.note ?? "Разбор формата задания с примерами и тренировкой.")
          : `${EXAM_LABEL[exam]} · ${entry?.note ?? "Разбор формата задания."}`,
        path: page.path,
      };
    });
  });
}

function sectionTitle(kind: SeoContentHub["kind"]): string {
  return SECTION_LABEL[kind];
}

export function ContentHubPage({ hub }: { hub: SeoContentHub }) {
  const subjectLabel = SUBJECT_LABEL[hub.subject as SeoSubject];
  const examLabel = hub.exam ? EXAM_LABEL[hub.exam] : null;
  const crumbs = [
    { name: "Главная", href: "/" },
    { name: subjectLabel, href: SUBJECT_PATH[hub.subject as SeoSubject] },
    ...(hub.exam && examLabel
      ? [{ name: examLabel, href: `/${hub.subject}/${hub.exam}` }]
      : []),
    { name: sectionTitle(hub.kind) },
  ];
  const tasks = hub.showTasks ? taskEntries(hub) : [];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({
            name: crumb.name,
            path: crumb.href ?? hub.path,
          })),
        )}
      />
      <JsonLd
        data={learningResourceJsonLd({
          name: hub.h1,
          description: hub.metaDescription,
          path: hub.path,
          educationalLevel: hub.kind === "grade" ? "10 класс" : undefined,
        })}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow={hub.eyebrow}
        title={hub.h1}
        description={hub.lead}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={hub.showTasks && tasks.length > 0 ? tasks[0].path : "/zadachi"}>
              {hub.kind === "solutions" ? "К первому разбору" : "Начать с практики"}{" "}
              <ButtonArrow />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/repetitor/${hub.subject}`}>Занятия с репетитором</Link>
          </Button>
        </div>
      </PageHero>

      {hub.facts && hub.facts.length > 0 ? (
        <Section labelledBy="content-hub-facts">
          <h2 id="content-hub-facts" className="sr-only">
            Коротко о разделе
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
      ) : null}

      {hub.sections.map((section, index) => (
        <Section
          key={section.title}
          bordered={index > 0 || Boolean(hub.facts?.length)}
          labelledBy={`content-hub-section-${index}`}
        >
          <div className="desk:grid-cols-12 grid w-full min-w-0 grid-cols-1 gap-4 md:gap-6">
            <div className="desk:col-span-5 col-span-1 min-w-0">
              <h2 id={`content-hub-section-${index}`} className="heading-3">
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

      {tasks.length > 0 ? (
        <Section bordered labelledBy="content-hub-tasks">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 id="content-hub-tasks" className="heading-3">
                {hub.kind === "solutions" ? "Разборы по заданиям" : "Задания по теме"}
              </h2>
              <p className="text-ink-soft mt-3 max-w-2xl">
                Для этих номеров уже есть отдельные страницы с теорией, примерами,
                типичными ошибками и тренировкой.
              </p>
            </div>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/zadachi?subject=${hub.subject}`}>Все задачи</Link>
            </Button>
          </div>
          <TaskTypeTable items={tasks} className="md:grid-cols-2" />
        </Section>
      ) : null}

      <Section bordered labelledBy="content-hub-links">
        <h2 id="content-hub-links" className="heading-3 mb-8">
          Материалы и следующие шаги
        </h2>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {hub.links.map((item) => (
            <li key={`${item.href}-${item.label}`}>
              <Link
                href={item.href}
                className="group border-line bg-surface hover:border-ink flex h-full flex-col justify-between gap-3 rounded-lg border p-5 transition-colors"
              >
                <span>
                  <span className="text-ink block font-medium">{item.label}</span>
                  <span className="text-ink-soft mt-1 block text-sm">{item.note}</span>
                </span>
                <ButtonArrow />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {hub.relatedArticleSlugs.length > 0 ? (
        <Section bordered labelledBy="content-hub-articles">
          <h2 id="content-hub-articles" className="heading-3 mb-8">
            Статьи по теме
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
            На индивидуальных занятиях можно разобрать именно те темы и номера, где
            теряются баллы: без случайных заданий и лишней теории.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/repetitor/${hub.subject}`}>Узнать про занятия</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/diagnostika">Пройти диагностику</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
