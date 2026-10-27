"use client";

import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TutorCta } from "@/features/tutor-leads/components/tutor-cta";
import { checkTaskAnswer } from "@/features/tasks/api-client";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { isPublicApiConfigured } from "@/lib/api/config";
import { describeApiError } from "@/lib/api/errors";
import { isAnswerCorrect, type AnswerKind } from "@/lib/utils/check-answer";
import { cn } from "@/lib/utils/cn";
import { triggerHaptic } from "@/lib/utils/haptics";

type AnswerFormProps = {
  taskId: string;
  expected: string;
  kind: AnswerKind;
  answerNote: string;
  solution: ReactNode;
};

type Status = "idle" | "correct" | "wrong";

export function AnswerForm({
  taskId,
  expected,
  kind,
  answerNote,
  solution,
}: AnswerFormProps) {
  const inputId = useId();
  const statusId = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [checking, setChecking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    if (revealed) track(ANALYTICS_EVENTS.solutionOpen);
  }, [revealed]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setStatus("wrong");
      setAttempts((count) => count + 1);
      triggerHaptic(18);
      track(ANALYTICS_EVENTS.taskAnswerAttempt, {
        correct: false,
        attempt: attempts + 1,
      });
      return;
    }

    let correct: boolean;
    if (isPublicApiConfigured()) {
      setChecking(true);
      setFailure(null);
      try {
        const result = await checkTaskAnswer(taskId, trimmed);
        correct = result.isCorrect;
      } catch (error) {
        setChecking(false);
        setFailure(describeApiError(error));
        triggerHaptic(20);
        track(ANALYTICS_EVENTS.taskAnswerAttempt, {
          correct: false,
          attempt: attempts + 1,
        });
        return;
      }
      setChecking(false);
    } else {
      correct = isAnswerCorrect(trimmed, expected, kind);
    }

    setStatus(correct ? "correct" : "wrong");
    setAttempts((count) => count + 1);
    triggerHaptic(correct ? [10, 26, 12] : 20);
    track(ANALYTICS_EVENTS.taskAnswerAttempt, {
      correct,
      attempt: attempts + 1,
    });
    if (correct) setRevealed(true);
  }

  function handleReset() {
    setValue("");
    setStatus("idle");
    setAttempts(0);
    setRevealed(false);
    setFailure(null);
  }

  const statusMessage =
    status === "idle"
      ? ""
      : status === "correct"
        ? "Верно."
        : attempts >= 2
          ? "Пока неверно. Можно посмотреть решение."
          : "Пока неверно. Проверьте вычисления и попробуйте ещё раз.";

  return (
    <div className="border-line bg-surface w-full min-w-0 rounded-xl border p-5 sm:p-6 md:p-8">
      <form onSubmit={handleSubmit} noValidate>
        <Label htmlFor={inputId}>Ваш ответ</Label>
        <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
          <Input
            id={inputId}
            name="answer"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            inputMode={kind === "number" ? "decimal" : "text"}
            autoComplete="off"
            aria-describedby={statusId}
            disabled={status === "correct"}
            placeholder={kind === "number" ? "Число" : "Ответ"}
            className="min-h-11 w-full min-w-0 sm:flex-1"
          />
          <Button
            type="submit"
            className="min-h-11 w-full shrink-0 sm:w-auto"
            disabled={status === "correct" || checking}
          >
            {checking ? "Проверяем…" : "Проверить"}
          </Button>
        </div>
      </form>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-3 min-h-6 text-sm",
          status === "correct" && "text-success font-medium",
          status === "wrong" && "text-danger",
          status === "idle" && "text-ink-faint",
        )}
      >
        {statusMessage}
      </p>

      {failure ? (
        <p role="alert" className="text-danger mt-2 text-sm">
          {failure}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          className="solution-toggle js-only text-accent hover:text-accent-strong inline-flex min-h-11 items-center gap-2 text-sm font-medium transition-colors"
          aria-expanded={revealed}
        >
          {revealed ? (
            <EyeOff aria-hidden className="size-4" />
          ) : (
            <Eye aria-hidden className="size-4" />
          )}
          {revealed ? "Скрыть решение" : "Показать решение"}
        </button>

        {status !== "idle" || revealed ? (
          <button
            type="button"
            onClick={handleReset}
            className="text-ink-soft hover:text-ink inline-flex min-h-11 items-center gap-2 text-sm underline underline-offset-4 transition-colors"
          >
            <RotateCcw aria-hidden className="size-4" />
            Попробовать снова
          </button>
        ) : null}
      </div>

      <p className="no-js-only text-ink-soft mt-3 text-sm">
        Проверка ответа работает при включённом JavaScript. Решение показано ниже.
      </p>

      <div
        className="cta-reveal mt-6"
        data-open={attempts >= 2 && !revealed ? "true" : "false"}
      >
        <div>
          <TutorCta placement="after-wrong-answers" />
        </div>
      </div>

      <div
        data-solution=""
        data-open={revealed ? "true" : undefined}
        className="solution-panel border-line mt-6 border-t pt-6"
      >
        <h2 className="heading-3 mb-4">Решение</h2>
        {solution}
        <p className="text-ink-soft mt-5">{answerNote}</p>
        <p className="text-ink-faint mt-4 text-sm">
          Ответ: <span className="text-ink font-medium">{expected}</span>
        </p>
        <TutorCta placement="after-solution" className="mt-6" />
      </div>
    </div>
  );
}
