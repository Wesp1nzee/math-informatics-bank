import { clientRequest } from "@/lib/api/client";

export type AnswerCheckResult = {
  isCorrect: boolean;
  checkedAt: string;
  explanation: string | null;
};

export async function checkTaskAnswer(
  id: string,
  answer: string,
): Promise<AnswerCheckResult> {
  return clientRequest<AnswerCheckResult>(`/tasks/${encodeURIComponent(id)}/check`, {
    method: "POST",
    body: { answer },
  });
}
