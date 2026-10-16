import { isTaskDifficulty, isTaskSubject } from "@/features/tasks/labels";
import type { TaskFilters } from "@/features/tasks/api";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseTaskFilters(params: RawSearchParams): TaskFilters {
  const subject = first(params.subject);
  const level = first(params.level);

  return {
    subject: isTaskSubject(subject) ? subject : undefined,
    level: isTaskDifficulty(level) ? level : undefined,
  };
}

export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Number(first(value));
  if (!Number.isInteger(raw) || raw < 1) return 1;
  return raw;
}
