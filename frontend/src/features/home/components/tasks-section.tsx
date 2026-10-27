import Link from "next/link";

import { WorldSection } from "@/components/layout/world-section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { PeekCarousel, PEEK_ITEM } from "@/components/ui/peek-carousel";
import { TaskCard } from "@/features/tasks/components/task-card";
import { getFeaturedTasks } from "@/features/tasks/api";

function PreviewGraph() {
  return (
    <svg
      className="sparkline h-14 w-full"
      viewBox="0 0 220 56"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 46 L26 40 L48 42 L72 30 L96 33 L120 20 L146 24 L170 12 L196 16 L220 4" />
    </svg>
  );
}

export async function TasksSection() {
  const tasks = await getFeaturedTasks(3);

  return (
    <WorldSection
      id="tasks"
      worldState="materials"
      labelledBy="bank-title"
      className="section-frame"
    >
      <div className="desk:grid-cols-12 grid w-full min-w-0 grid-cols-1 items-end gap-6">
        <div className="desk:col-span-7 w-full min-w-0">
          <span className="mono-label mb-4">TASK BANK / LIVE</span>
          <h2 id="bank-title" data-split-text className="heading-2 heading-scrim">
            Банк задач
          </h2>
          <p className="text-ink-soft heading-scrim mt-4 max-w-[32em] text-lg leading-relaxed">
            Без регистрации. Бесплатно. Каждая задача — с пошаговым разбором и проверкой
            ответа.
          </p>
        </div>

        <div className="desk:col-span-5 w-full min-w-0">
          <div className="bento-cell">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="mono-label">PROGRESS / 01</span>
                <p className="text-ink mt-2 text-base font-medium">
                  Живая траектория разбора
                </p>
              </div>
              <span className="metric-chip">
                <b>∞</b>
                <span className="text-ink-soft">попыток</span>
              </span>
            </div>
            <PreviewGraph />
          </div>
        </div>
      </div>

      <div className="reveal mt-8">
        {tasks.length > 0 ? (
          <PeekCarousel
            as="ul"
            count={tasks.length}
            label="Задачи"
            className="desk:grid-cols-3 items-stretch sm:grid-cols-2 md:gap-6"
          >
            {tasks.map((task) => (
              <li key={task.id} data-peek-item="" className={`${PEEK_ITEM} flex`}>
                <TaskCard task={task} />
              </li>
            ))}
          </PeekCarousel>
        ) : (
          <div className="glass border-line rounded-2xl border p-6 md:p-8">
            <p className="text-ink-soft m-0 text-base leading-relaxed">
              Подборка обновляется. Откройте банк, чтобы выбрать тему и уровень
              сложности.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button asChild>
          <Link href="/zadachi">
            Открыть весь банк <ButtonArrow />
          </Link>
        </Button>
        <span className="mono-label">математика · информатика · ОГЭ · ЕГЭ</span>
      </div>
    </WorldSection>
  );
}
