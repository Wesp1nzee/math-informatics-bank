import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { ArticleCard } from "@/features/articles/components/article-card";
import { ArticleMeta } from "@/features/articles/components/article-meta";
import { ArticleRenderer } from "@/features/articles/components/renderer/article-renderer";
import type { Article } from "@/features/articles/types";
import { getTaskTypePages, type SeoTaskTypePage } from "@/features/seo/pages";
import { TaskCard } from "@/features/tasks/components/task-card";
import { SUBJECT_LABEL, SUBJECT_PATH } from "@/features/tasks/labels";
import type { Task } from "@/features/tasks/types";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";

const EXAM_LABEL = { oge: "ОГЭ", ege: "ЕГЭ" } as const;

export function TaskTypePageView({
  page,
  article,
  relatedArticles,
  relatedTasks,
}: {
  page: SeoTaskTypePage;
  article: Article;
  relatedArticles: readonly Article[];
  relatedTasks: readonly Task[];
}) {
  const subjectLabel = SUBJECT_LABEL[page.subject];
  const examLabel = EXAM_LABEL[page.exam];
  const examPath = `/${page.subject}/${page.exam}`;
  const taskHubPath = `${examPath}/zadaniya`;
  const crumbs = [
    { name: "Главная", href: "/" },
    { name: subjectLabel, href: SUBJECT_PATH[page.subject] },
    { name: examLabel, href: examPath },
    { name: `Задание ${page.number}` },
  ];
  const siblings = getTaskTypePages(page.subject, page.exam);
  const currentIndex = siblings.findIndex((item) => item.slug === page.slug);
  const previous = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({
            name: crumb.name,
            path: crumb.href ?? page.path,
          })),
        )}
      />
      <JsonLd
        data={articleJsonLd({
          title: article.title,
          description: article.description,
          path: page.path,
          published: article.published,
          modified: article.updated,
        })}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow={`${examLabel} · ${subjectLabel} · задание ${page.number}`}
        title={article.title}
        description={article.description}
      >
        <div className="mt-6">
          <ArticleMeta article={article} />
        </div>
      </PageHero>

      <Section bordered>
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="desk:col-span-8 col-span-12">
            <ArticleRenderer content={article.content} articleSlug={article.slug} />
          </div>
          <aside className="desk:col-span-3 desk:col-start-10 col-span-12 mt-10 md:mt-0">
            <div className="border-line bg-surface rounded-lg border p-5">
              <p className="text-ink-faint text-sm">Навигация</p>
              <ul className="m-0 mt-3 grid list-none gap-2 p-0 text-sm">
                <li>
                  <Link
                    href={examPath}
                    className="text-accent hover:text-accent-strong underline underline-offset-4"
                  >
                    {examLabel} по предмету «{subjectLabel}»
                  </Link>
                </li>
                <li>
                  <Link
                    href={taskHubPath}
                    className="text-accent hover:text-accent-strong underline underline-offset-4"
                  >
                    Все типы заданий
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/zadachi?subject=${page.subject}`}
                    className="text-accent hover:text-accent-strong underline underline-offset-4"
                  >
                    Задачи в банке
                  </Link>
                </li>
                <li>
                  <Link
                    href="/podgotovka"
                    className="text-accent hover:text-accent-strong underline underline-offset-4"
                  >
                    Занятия с репетитором
                  </Link>
                </li>
              </ul>
            </div>
            <p className="text-ink-faint mt-4 text-xs leading-relaxed">
              Это авторский тренировочный разбор в формате экзамена, а не официальное
              задание ФИПИ. Структура экзамена приведена по спецификации 2026 года.
            </p>
          </aside>
        </div>
      </Section>

      {relatedTasks.length > 0 ? (
        <Section bordered labelledBy="task-type-tasks-title">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 id="task-type-tasks-title" className="heading-3">
              Задачи по теме
            </h2>
            <Button asChild variant="secondary" size="sm">
              <Link href={`/zadachi?subject=${page.subject}`}>Все задачи</Link>
            </Button>
          </div>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTasks.map((task) => (
              <li key={task.id} className="flex">
                <TaskCard task={task} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {relatedArticles.length > 0 ? (
        <Section bordered labelledBy="task-type-articles-title">
          <h2 id="task-type-articles-title" className="heading-3 mb-8">
            Связанные разборы
          </h2>
          <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
            {relatedArticles.map((related) => (
              <li key={related.slug} className="flex">
                <ArticleCard article={related} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section bordered={siblings.length > 1} labelledBy="task-type-nav-title">
        <h2 id="task-type-nav-title" className="heading-3 mb-6">
          Другие типы заданий
        </h2>
        <div className="flex flex-wrap gap-3">
          {previous ? (
            <Button asChild variant="secondary">
              <Link href={previous.path}>← {previous.navLabel}</Link>
            </Button>
          ) : null}
          {next ? (
            <Button asChild variant="secondary">
              <Link href={next.path}>{next.navLabel} →</Link>
            </Button>
          ) : null}
          <Button asChild variant="ghost">
            <Link href={taskHubPath}>
              Все разборы <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
