import { Container } from "@/components/layout/container";
import { TaskList } from "@/features/tasks/components/task-list";
import type { Task } from "@/features/tasks/types";

export function RelatedTasks({ tasks }: { tasks: readonly Task[] }) {
  if (tasks.length === 0) return null;

  return (
    <section
      aria-labelledby="related-tasks-title"
      className="border-line desk:py-[140px] border-t py-20 md:py-[104px]"
    >
      <Container>
        <h2 id="related-tasks-title" className="heading-3 mb-10">
          Похожие задачи
        </h2>
        <TaskList tasks={tasks} />
      </Container>
    </section>
  );
}
