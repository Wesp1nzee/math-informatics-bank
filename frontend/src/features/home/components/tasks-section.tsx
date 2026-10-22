import Link from "next/link";

import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { TaskList } from "@/features/tasks/components/task-list";
import { getFeaturedTasks } from "@/features/tasks/api";

export async function TasksSection() {
  const tasks = await getFeaturedTasks(3);

  return (
    <Section id="tasks" labelledBy="bank-title" className="bg-surface-subtle">
      <div className="reveal flex flex-wrap items-end justify-between gap-4">
        <h2 id="bank-title" className="heading-2">
          Банк задач
        </h2>
        <p className="text-ink-soft m-0 text-base">Без регистрации. Бесплатно.</p>
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
    </Section>
  );
}
