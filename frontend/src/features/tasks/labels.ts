import type { TaskDifficulty, TaskSubject } from "@/features/tasks/types";

export const DIFFICULTY_ORDER: Record<TaskDifficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const DIFFICULTY_LABEL: Record<TaskDifficulty, string> = {
  easy: "Лёгкая",
  medium: "Средняя",
  hard: "Сложная",
};

export const SUBJECT_LABEL: Record<TaskSubject, string> = {
  matematika: "Математика",
  informatika: "Информатика",
};

export const SUBJECT_PATH: Record<TaskSubject, string> = {
  matematika: "/matematika",
  informatika: "/informatika",
};

export const SUBJECTS: readonly TaskSubject[] = ["matematika", "informatika"];
export const DIFFICULTIES: readonly TaskDifficulty[] = ["easy", "medium", "hard"];

export function isTaskSubject(value: unknown): value is TaskSubject {
  return value === "matematika" || value === "informatika";
}

export function isTaskDifficulty(value: unknown): value is TaskDifficulty {
  return value === "easy" || value === "medium" || value === "hard";
}
