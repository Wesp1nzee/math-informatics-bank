import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { getTaskPath } from "@/features/tasks/api";
import { DifficultyMeter } from "@/features/tasks/components/difficulty-meter";
import type { Task } from "@/features/tasks/types";
import { formatMinutes } from "@/lib/utils/format";

export function TaskCard({ task }: { task: Task }) {
  return (
    <Link
      href={getTaskPath(task.id)}
      className="group border-line bg-surface ease-soft hover:border-ink shadow-card hover:shadow-float flex h-full w-full flex-col gap-3.5 rounded-lg border p-7 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1"
    >
      <span className="text-ink-faint text-sm tabular-nums">#{task.id}</span>
      <h3 className="text-2xl leading-tight font-medium tracking-[-0.02em]">
        {task.title}
      </h3>
      <Badge className="self-start">{task.examLabel}</Badge>
      <p className="text-ink-soft flex-1 text-base">{task.summary}</p>
      <div className="border-line text-ink-soft flex items-center justify-between gap-3 border-t pt-4 text-sm">
        <span className="inline-flex flex-wrap items-center gap-x-1">
          <DifficultyMeter level={task.level} />
          <span aria-hidden="true">·</span>
          <span>{formatMinutes(task.minutes)}</span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
