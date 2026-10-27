"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientInlineNodes } from "@/features/articles/components/renderer/blocks/client-inline-nodes";
import { checkArticleExercise } from "@/features/articles/exercises-api";
import type { ExerciseCheckResult } from "@/features/articles/exercises-api";
import { describeApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "checking" | "correct" | "wrong";

export type ExerciseFormProps = {
  articleSlug?: string;
  exerciseId: string;
  kind: "choice" | "numeric" | "text";
  name: string;
  inputId?: string;
  unit?: string;
  className?: string;

  children: ReactNode;
};

export function ExerciseForm({
  articleSlug,
  exerciseId,
  kind,
  name,
  inputId,
  unit,
  className,
  children,
}: ExerciseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const statusId = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [explanation, setExplanation] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState("");
  const [textValue, setTextValue] = useState("");
  const [solved, setSolved] = useState<boolean | null>(null);

  const configured = Boolean(articleSlug?.trim());
  const disabled = status === "checking" || status === "correct";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !configured || !articleSlug) return;

    let answer = "";
    if (kind === "choice") {
      const data = formRef.current ? new FormData(formRef.current) : null;
      answer = String(data?.get(name) ?? "").trim();
    } else if (kind === "text") {
      answer = textValue.trim();
    } else {
      answer = numericValue.trim();
    }

    if (!answer) {
      setStatus("idle");
      setError("Выберите или введите ответ.");
      return;
    }

    setStatus("checking");
    setError(null);
    setExplanation(null);

    try {
      const result: ExerciseCheckResult = await checkArticleExercise(
        articleSlug,
        exerciseId,
        answer,
      );
      setStatus(result.isCorrect ? "correct" : "wrong");
      setExplanation(result.explanation);
      setAttempts(result.attempts ?? (attempts ?? 0) + 1);
      setSolved(result.solved);
    } catch (caught) {
      setStatus("idle");
      setError(describeApiError(caught));
    }
  }

  function reset() {
    setStatus("idle");
    setExplanation(null);
    setError(null);
    setSolved(null);
    setNumericValue("");
    setTextValue("");
    formRef.current?.reset();
  }

  const statusMessage =
    status === "checking"
      ? "Проверяем…"
      : status === "correct"
        ? "Верно."
        : status === "wrong"
          ? "Пока неверно. Попробуйте ещё раз."
          : "";

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className={cn("min-w-0", className)}>
      {children}

      {kind === "numeric" || kind === "text" ? (
        <div className="mt-4">
          <label htmlFor={inputId} className="text-ink-soft block text-sm font-medium">
            Ваш ответ{kind === "numeric" && unit ? `, ${unit}` : ""}
          </label>
          <div className="mt-2 flex items-center gap-3">
            <Input
              id={inputId}
              name={name}
              type="text"
              inputMode={kind === "numeric" ? "decimal" : "text"}
              autoComplete="off"
              value={kind === "numeric" ? numericValue : textValue}
              onChange={(event) =>
                kind === "numeric"
                  ? setNumericValue(event.target.value)
                  : setTextValue(event.target.value)
              }
              disabled={disabled}
              aria-invalid={status === "wrong"}
              aria-describedby={statusId}
              className={kind === "numeric" ? "max-w-48" : "max-w-md"}
            />
            {kind === "numeric" && unit ? (
              <span className="text-ink-soft text-sm">{unit}</span>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={disabled || !configured}>
          {status === "checking" ? "Проверяем…" : "Проверить"}
        </Button>
        {status === "wrong" || status === "correct" ? (
          <Button type="button" variant="secondary" onClick={reset}>
            Попробовать снова
          </Button>
        ) : null}
        {attempts !== null ? (
          <span className="text-ink-faint text-sm tabular-nums">
            Попытка {attempts}
          </span>
        ) : null}
      </div>

      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={cn(
          "mt-3 min-h-6 text-sm",
          status === "correct" && "text-success font-medium",
          status === "wrong" && "text-danger",
          status === "checking" && "text-ink-faint",
        )}
      >
        {statusMessage}
      </p>

      {!configured ? (
        <p className="text-ink-faint mt-2 text-sm">
          Проверка ответа доступна только на странице статьи с подключённым API.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-danger mt-2 text-sm">
          {error}
        </p>
      ) : null}

      {status === "correct" && explanation ? (
        <div className="border-line bg-surface-subtle mt-4 rounded-md border px-4 py-3">
          <p className="text-ink text-sm font-medium">Объяснение</p>
          <div className="text-ink-soft mt-2 text-base leading-relaxed">
            <ClientInlineNodes nodes={explanation} />
          </div>
        </div>
      ) : null}

      {solved === true ? (
        <p className="text-success mt-2 text-sm">Прогресс сохранён.</p>
      ) : null}
    </form>
  );
}
