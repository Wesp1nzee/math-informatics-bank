import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-notice";
import { JsonLd } from "@/components/seo/json-ld";
import { AnswerForm } from "@/features/tasks/components/answer-form";
import { DifficultyMeter } from "@/features/tasks/components/difficulty-meter";
import { RelatedTasks } from "@/features/tasks/components/related-tasks";
import { SolutionSteps } from "@/features/tasks/components/solution-steps";
import { TaskStatement } from "@/features/tasks/components/task-statement";
import { getRelatedTasks, getTaskById, getTaskIdList } from "@/features/tasks/api";
import { SUBJECT_LABEL, SUBJECT_PATH } from "@/features/tasks/labels";
import { learningResourceJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatMinutes } from "@/lib/utils/format";

type TaskPageProps = { params: Promise<{ id: string }> };


export function generateStaticParams() {
  return getTaskIdList().map((id) => ({ id }));
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return buildMetadata({
      title: "Задача не найдена",
      description: "Запрашиваемая задача не найдена в банке.",
      path: `/zadachi/${id}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: `${task.title} — задача #${task.id}`,
    description: `${task.summary} ${SUBJECT_LABEL[task.subject]}, ${task.examLabel}. Ответ и решение по шагам.`,
    path: `/zadachi/${task.id}`,
    type: "article",
  });
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;
  const task = await getTaskById(id);
  if (!task) notFound();

  const related = await getRelatedTasks(task, 3);

  return (
    <>
      <JsonLd
        data={learningResourceJsonLd({
          name: `${task.title} — задача #${task.id}`,
          description: task.summary,
          path: `/zadachi/${task.id}`,
          educationalLevel: task.examLabel,
        })}
      />

      <PageHero
        breadcrumbs={[
          { name: "Главная", href: "/" },
          { name: "Задачи", href: "/zadachi" },
          { name: `#${task.id}` },
        ]}
        eyebrow={`Задача #${task.id}`}
        title={task.title}
      >
        <div className="text-ink-soft mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
          <Badge>{task.examLabel}</Badge>
          <Link
            href={SUBJECT_PATH[task.subject]}
            className="hover:text-accent transition-colors"
          >
            {SUBJECT_LABEL[task.subject]}
          </Link>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <DifficultyMeter level={task.level} />
            <span aria-hidden="true">·</span>
            <span>{formatMinutes(task.minutes)}</span>
          </span>
        </div>
      </PageHero>

      <Section bordered>
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="desk:col-span-7 col-span-12">
            <h2 className="heading-3 mb-6">Условие</h2>
            <TaskStatement blocks={task.statement} />

            {task.topics.length > 0 ? (
              <p className="text-ink-soft mt-6 flex flex-wrap items-center gap-2 text-sm">
                <span>Темы:</span>
                {task.topics.map((topic) => (
                  <Badge key={topic} tone="neutral">
                    {topic}
                  </Badge>
                ))}
              </p>
            ) : null}

            {task.isDemo ? (
              <div className="mt-8">
                <DemoNotice>
                  Это тестовая задача из встроенного набора. Ответ проверен вручную и
                  помечен как демонстрационный.
                </DemoNotice>
              </div>
            ) : null}
          </div>

          <div className="desk:col-span-5 col-span-12">
            <AnswerForm
              expected={task.answer.value}
              kind={task.answer.kind}
              answerNote={task.answer.explanation}
              solution={<SolutionSteps steps={task.steps} />}
            />
          </div>
        </div>
      </Section>

      <RelatedTasks tasks={related} />

      <Section bordered={false} className="py-12 md:py-16">
        <Button asChild variant="secondary">
          <Link href="/zadachi">Вернуться в банк задач</Link>
        </Button>
      </Section>
    </>
  );
}
