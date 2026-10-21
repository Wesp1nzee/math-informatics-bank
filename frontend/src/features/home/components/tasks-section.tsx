import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { SpotlightGrid } from "@/components/motion/spotlight-grid";
import { TaskList } from "@/features/tasks/components/task-list";
import { getFeaturedTasks } from "@/features/tasks/api";
import { Button, ButtonArrow } from "@/components/ui/button";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export async function TasksSection() {
  const tasks = await getFeaturedTasks(3);

  return (
    <section
      id="tasks"
      aria-labelledby="bank-title"
      className="border-line bg-surface-subtle sheet-top desk:py-24 border-t py-16 md:py-20"
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
          <SpotlightGrid>
            <TaskList tasks={tasks} className="home-task-list" />
          </SpotlightGrid>
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
