import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { TaskList } from "@/features/tasks/components/task-list";
import { getFeaturedTasks } from "@/features/tasks/api";
import { Button, ButtonArrow } from "@/components/ui/button";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

/** Home page preview of the task bank — links go to real task pages. */
export async function TasksSection() {
  const tasks = await getFeaturedTasks(3);

  return (
    <section
      id="tasks"
      aria-labelledby="bank-title"
      className="border-line bg-surface-subtle desk:py-[140px] border-t py-20 md:py-[104px]"
    >
      <Container>
        <div className="reveal flex flex-wrap items-end justify-between gap-8">
          <div>
            <span className="eyebrow">Банк задач</span>
            <h2 id="bank-title" className="heading-2">
              Задачи по математике
              <br />и информатике
            </h2>
          </div>
          <p className="body-large m-0">Без регистрации. Бесплатно.</p>
        </div>

        <div className="reveal mt-12 md:mt-16" style={step(1)}>
          <TaskList tasks={tasks} />
        </div>

        <div className="reveal mt-10 md:mt-14" style={step(2)}>
          <Button asChild>
            <Link href="/zadachi">
              Открыть весь банк задач <ButtonArrow />
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
