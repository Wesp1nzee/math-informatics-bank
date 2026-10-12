import { TaskCard } from "@/features/tasks/components/task-card";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils/cn";

export function TaskList({
  tasks,
  columns = 3,
  className,
}: {
  tasks: readonly Task[];
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "m-0 grid list-none gap-4 p-0 md:gap-6",
        columns === 3 ? "desk:grid-cols-3 sm:grid-cols-2" : "sm:grid-cols-2",
        className,
      )}
    >
      {tasks.map((task) => (
        <li key={task.id} className="flex">
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}
