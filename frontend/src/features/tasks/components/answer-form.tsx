"use client";

import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TutorCta } from "@/features/tutor-leads/components/tutor-cta";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { isAnswerCorrect, type AnswerKind } from "@/lib/utils/check-answer";
import { cn } from "@/lib/utils/cn";

type AnswerFormProps = {
  expected: string;
  kind: AnswerKind;
  answerNote: string;
  solution: ReactNode;
};

type Status = "idle" | "correct" | "wrong";

export function AnswerForm({ expected, kind, answerNote, solution }: AnswerFormProps) {
  const inputId = useId();
  const statusId = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) track(ANALYTICS_EVENTS.solutionOpen);
  }, [revealed]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) {
      setStatus("wrong");
      setAttempts((count) => count + 1);
      track(ANALYTICS_EVENTS.taskAnswerAttempt, {
        correct: false,
        attempt: attempts + 1,
      });
      return;
    }
    const correct = isAnswerCorrect(value, expected, kind);
    setStatus(correct ? "correct" : "wrong");
    setAttempts((count) => count + 1);
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
    <div className="border-line bg-surface rounded-xl border p-6 md:p-8">
      <form onSubmit={handleSubmit} noValidate>
        <Label htmlFor={inputId}>Ваш ответ</Label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
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
          />
          <Button
            type="submit"
            className="shrink-0 sm:w-auto"
            disabled={status === "correct"}
          >
            Проверить
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
