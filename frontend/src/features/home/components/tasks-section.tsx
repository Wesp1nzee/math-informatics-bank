import Link from "next/link";

import { WorldSection } from "@/components/layout/world-section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/components/task-list";
import { getFeaturedTasks } from "@/features/tasks/api";

export async function TasksSection() {
  const tasks = await getFeaturedTasks(3);

  return (
    <WorldSection id="tasks" worldState="materials" labelledBy="bank-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="bank-title" data-split-text className="heading-2 heading-scrim">
          Банк задач
        </h2>
        <p className="text-ink-soft heading-scrim m-0 text-base">
          Без регистрации. Бесплатно.
        </p>
      </div>

      <div className="reveal mt-8">
        <TaskList tasks={tasks} />
      </div>

      <div className="mt-8">
        <Button asChild>
          <Link href="/zadachi">
            Открыть весь банк <ButtonArrow />
          </Link>
        </Button>
      </div>
    </WorldSection>
  );
}
