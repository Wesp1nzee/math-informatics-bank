import type { Metadata } from "next";
import { Suspense } from "react";

import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/layout/section";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { DemoNotice } from "@/components/ui/demo-notice";
import { StateMessage } from "@/components/ui/state-message";
import { getTasks, type TaskFilters } from "@/features/tasks/api";
import { Pagination } from "@/features/tasks/components/pagination";
import { TaskFilters as TaskFiltersBar } from "@/features/tasks/components/task-filters";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskListSkeleton } from "@/features/tasks/components/task-list-skeleton";
import {
  parsePageParam,
  parseTaskFilters,
  type RawSearchParams,
} from "@/features/tasks/search-params";
import { describeApiError } from "@/lib/api/errors";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatTaskCount } from "@/lib/utils/format";
import { buildQueryHref } from "@/lib/utils/url";
import Link from "next/link";

export const metadata: Metadata = buildMetadata({
  title: "Банк задач по математике и информатике",
  description:
    "Задачи ОГЭ и ЕГЭ по математике и информатике с ответами и пошаговыми решениями. Фильтры по предмету и сложности, без регистрации.",
  path: "/zadachi",
});

const BASE_PATH = "/zadachi";

function catalogueHref(filters: TaskFilters, page: number): string {
  return buildQueryHref(BASE_PATH, {
    subject: filters.subject,
    level: filters.level,
    page: page > 1 ? page : undefined,
  });
}

async function TaskCatalogue({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const filters = parseTaskFilters(params);
  const page = parsePageParam(params.page);

  let result;
  try {
    result = await getTasks(filters, page);
  } catch (error) {
    return (
      <StateMessage
        title="Не удалось загрузить задачи"
        description={describeApiError(error)}
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href={BASE_PATH}>Сбросить фильтры</Link>
          </Button>
        }
      />
    );
  }

  const isFiltered = Boolean(filters.subject || filters.level);

  return (
    <div>
      <TaskFiltersBar basePath={BASE_PATH} filters={filters} />

      {result.items.length === 0 ? (
        <StateMessage
          title="Ничего не найдено"
          description="По выбранным фильтрам задач нет. Попробуйте изменить условия."
          action={
            isFiltered ? (
              <Button asChild variant="secondary" size="sm">
                <Link href={BASE_PATH}>Показать все задачи</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <p className="text-ink-soft mb-6 text-sm">
            {formatTaskCount(result.total)}
            {result.pageCount > 1
              ? ` · страница ${result.page} из ${result.pageCount}`
              : null}
          </p>

          <TaskList tasks={result.items} />

          <Pagination
            className="mt-12"
            page={result.page}
            pageCount={result.pageCount}
            hrefForPage={(targetPage) => catalogueHref(filters, targetPage)}
          />
        </>
      )}

      {result.isDemo ? (
        <div className="mt-10">
          <DemoNotice>
            Показан встроенный демонстрационный набор задач. Он будет заменён содержимым
            банка, как только будет подключён API.
          </DemoNotice>
        </div>
      ) : null}
    </div>
  );
}

export default function TasksPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Главная", path: "/" },
          { name: "Задачи", path: "/zadachi" },
        ])}
      />
      <PageHero
        breadcrumbs={[{ name: "Главная", href: "/" }, { name: "Задачи" }]}
        eyebrow="Банк задач"
        title="Задачи по математике и информатике"
        description="Условие, ответ и решение по шагам. Фильтруйте по предмету и сложности — ссылку можно сохранить или отправить."
      />
      <Section bordered>
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskCatalogue searchParams={searchParams} />
        </Suspense>
      </Section>
    </>
  );
}
