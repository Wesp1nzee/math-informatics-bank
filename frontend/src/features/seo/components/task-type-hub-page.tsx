import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { TaskTypeTable } from "@/features/seo/components/task-type-table";
import { getTaskTypePages, type ExamHub, type SeoSubject } from "@/features/seo/pages";
import { SUBJECT_LABEL, SUBJECT_PATH } from "@/features/tasks/labels";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

const EXAM_LABEL = { oge: "ОГЭ", ege: "ЕГЭ" } as const;

export function TaskTypeHubPage({ hub }: { hub: ExamHub }) {
  const subject = hub.subject as SeoSubject;
  const subjectLabel = SUBJECT_LABEL[subject];
  const examLabel = EXAM_LABEL[hub.exam];
  const taskHubPath = `${hub.path}/zadaniya`;
  const crumbs = [
    { name: "Главная", href: "/" },
    { name: subjectLabel, href: SUBJECT_PATH[subject] },
    { name: examLabel, href: hub.path },
    { name: "Задания" },
  ];
  const available = getTaskTypePages(subject, hub.exam);
  const availableNumbers = new Set(available.map((page) => page.number));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          crumbs.map((crumb) => ({
            name: crumb.name,
            path: crumb.href ?? taskHubPath,
          })),
        )}
      />

      <PageHero
        breadcrumbs={crumbs}
        eyebrow={`${subjectLabel} · ${examLabel}`}
        title={`Задания ${examLabel} по ${
          subject === "matematika" ? "математике" : "информатике"
        }: карта и разборы`}
        description={`Карта типов заданий ${examLabel}: что проверяет каждый номер, с чего начать и где уже есть подробный разбор с тренировкой.`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/zadachi?subject=${subject}`}>
              Открыть банк задач <ButtonArrow />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={hub.path}>Структура экзамена</Link>
          </Button>
        </div>
      </PageHero>

      <Section labelledBy="task-hub-how-title">
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="desk:col-span-5 col-span-12">
            <h2 id="task-hub-how-title" className="heading-3">
              Как пользоваться картой
            </h2>
          </div>
          <div className="desk:col-span-6 desk:col-start-7 col-span-12">
            <p className="body-large">
              Не пытайтесь решать всё подряд. Сначала определите, какие номера дают
              базовый балл, затем добавьте темы, где вы уже понимаете условие, но
              теряете баллы на технике.
            </p>
            <ol className="text-ink-soft m-0 mt-5 grid list-decimal gap-3 pl-6">
              <li>
                Пройдите короткий диагностический вариант или проверьте себя по темам.
              </li>
              <li>
                Закройте базовые номера: вычисления, уравнения, простую геометрию.
              </li>
              <li>
                Добавьте по одной сложной теме за раз — без прыжков между разделами.
              </li>
              <li>Возвращайтесь к ошибкам через неделю и решайте похожие задачи.</li>
            </ol>
          </div>
        </div>
      </Section>

      <Section bordered labelledBy="task-hub-list-title">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="task-hub-list-title" className="heading-3">
              Типы заданий
            </h2>
            <p className="text-ink-soft mt-3 max-w-2xl">
              {available.length > 0
                ? `Для ${available.length} номеров уже есть отдельные разборы. Остальные темы можно отрабатывать по задачам банка и материалам статей.`
                : "Отдельных разборов по номерам пока нет. Используйте карту тем, статьи и банк задач: они помогут закрыть базовые темы без поверхностных страниц."}
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={hub.path}>Об экзамене</Link>
          </Button>
        </div>

        <TaskTypeTable
          items={hub.taskTypes.map((item) => ({
            ...item,
            path: availableNumbers.has(item.number)
              ? `${hub.path}/zadanie-${item.number}`
              : item.path,
          }))}
          className="md:grid-cols-2"
        />
      </Section>

      <Section bordered labelledBy="task-hub-next-title">
        <h2 id="task-hub-next-title" className="heading-3 mb-8">
          Что делать дальше
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href={hub.path}
            className="group border-line bg-surface hover:border-ink flex flex-col gap-3 rounded-lg border p-5 transition-colors"
          >
            <span className="text-ink font-medium">Структура экзамена</span>
            <span className="text-ink-soft text-sm">
              Сколько заданий, баллов и минут. Как распределить время.
            </span>
            <ButtonArrow />
          </Link>
          <Link
            href={`/zadachi?subject=${subject}`}
            className="group border-line bg-surface hover:border-ink flex flex-col gap-3 rounded-lg border p-5 transition-colors"
          >
            <span className="text-ink font-medium">Банк задач</span>
            <span className="text-ink-soft text-sm">
              Условия, ответы и пошаговые решения по предмету.
            </span>
            <ButtonArrow />
          </Link>
          <Link
            href="/articles"
            className="group border-line bg-surface hover:border-ink flex flex-col gap-3 rounded-lg border p-5 transition-colors"
          >
            <span className="text-ink font-medium">Статьи и разборы</span>
            <span className="text-ink-soft text-sm">
              Теория и типичные ошибки без повторения ключевых слов.
            </span>
            <ButtonArrow />
          </Link>
        </div>
      </Section>
    </>
  );
}
