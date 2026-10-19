import type { InlineNode } from "@/features/articles/types";
import { clientRequest } from "@/lib/api/client";

export type ExerciseCheckResult = {
  isCorrect: boolean;
  checkedAt: string;
  explanation: InlineNode[] | null;
  attempts: number | null;
  solved: boolean | null;
};

/** Backend-authoritative check for a published article exercise. */
export async function checkArticleExercise(
  slug: string,
  exerciseId: string,
  answer: string,
): Promise<ExerciseCheckResult> {
  return clientRequest<ExerciseCheckResult>(
    `/articles/${encodeURIComponent(slug)}/exercises/${encodeURIComponent(exerciseId)}/check`,
    { method: "POST", body: { answer } },
  );
}
