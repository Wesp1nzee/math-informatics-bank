import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { ArticleCard } from "@/features/articles/components/article-card";
import { getArticlesBySubject } from "@/features/articles/api";
import { getTasks } from "@/features/tasks/api";
import { TaskList } from "@/features/tasks/components/task-list";
import { SUBJECT_LABEL } from "@/features/tasks/labels";
import type { TaskSubject } from "@/features/tasks/types";
import { SUBJECT_CONTENT } from "@/features/topics/content";
import { buildQueryHref } from "@/lib/utils/url";

/**
 * Subject hub template, shared by /matematika and /informatika. Keeps the two
 * pages from duplicating markup while still allowing subject-specific content.
 */
export async function SubjectHub({ subject }: { subject: TaskSubject }) {
  const content = SUBJECT_CONTENT[subject];
  const [{ items: tasks, total }, articles] = await Promise.all([
    getTasks({ subject }, 1),
    getArticlesBySubject(subject, 2),
  ]);

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: content.label }]}
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <Section labelledBy="subject-covers-title">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="desk:col-span-5 col-span-12">
            <h2 id="subject-covers-title" className="heading-3">
              Что разбираем
            </h2>
          </div>
          <ul className="text-ink-soft desk:col-span-6 desk:col-start-7 col-span-12 m-0 grid list-none gap-3 p-0 text-lg sm:grid-cols-2">
            {content.covers.map((item) => (
              <li
                key={item}
                className="border-line bg-surface flex items-start gap-3 rounded-md border px-4 py-3"
              >
                <span
                  aria-hidden="true"
                  className="bg-accent mt-2 size-1.5 shrink-0 rounded-full"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section labelledBy="subject-tasks-title">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <h2 id="subject-tasks-title" className="heading-3">
            Задачи по теме
          </h2>
          <p className="text-ink-soft text-sm">
            {total > 0 ? `Показано ${tasks.length} из ${total}` : "Пока нет задач"}
          </p>
        </div>

        {tasks.length > 0 ? (
          <TaskList tasks={tasks} />
        ) : (
          <p className="text-ink-soft">
            Задачи по этому предмету появятся здесь после подключения банка.
          </p>
        )}

        <div className="mt-10">
          <Button asChild variant="secondary">
            <Link href={buildQueryHref("/zadachi", { subject })}>
              Все задачи по предмету «{SUBJECT_LABEL[subject]}» <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Section>

      {articles.length > 0 ? (
        <Section labelledBy="subject-articles-title">
          <h2 id="subject-articles-title" className="heading-3 mb-10">
            Разборы по теме
          </h2>
          <ul className="desk:grid-cols-3 m-0 grid list-none gap-4 p-0 sm:grid-cols-2 md:gap-6">
            {articles.map((article) => (
              <li key={article.slug} className="flex">
                <ArticleCard article={article} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
