"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { buildDiagnosticReport } from "@/features/diagnostics/scoring";
import type {
  DiagnosticAnswer,
  DiagnosticItem,
  DiagnosticReport,
} from "@/features/diagnostics/types";
import { REQUEST_PATH } from "@/features/tutor-leads/content";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import { triggerHaptic } from "@/lib/utils/haptics";

function answerList(
  items: readonly DiagnosticItem[],
  answers: Record<string, string>,
): DiagnosticAnswer[] {
  return Object.entries(answers).map(([id, value]) => ({ id, value }));
}

export function DiagnosticsRunner({ items }: { items: readonly DiagnosticItem[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportHeadingRef = useRef<HTMLHeadingElement>(null);

  const answeredCount = Object.keys(answers).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (answeredCount < items.length) {
      setError("Ответьте на все вопросы, чтобы увидеть результат.");
      return;
    }

    setError(null);
    setReport(buildDiagnosticReport(items, answerList(items, answers)));
    triggerHaptic([10, 22, 10]);
    window.requestAnimationFrame(() => reportHeadingRef.current?.focus());
  }

  function reset() {
    setAnswers({});
    setReport(null);
    setError(null);
  }

  if (report) {
    const weak = new Set(report.weakTopics);

    return (
      <div>
        <h2
          ref={reportHeadingRef}
          tabIndex={-1}
          className="heading-3 scroll-mt-24 outline-none"
        >
          Результат: {report.correct} из {report.total}
        </h2>
        <p className="text-ink-soft mt-4 max-w-[42em] text-lg">
          {report.weakTopics.length > 0
            ? "Ниже — темы, где вы теряете баллы. Начните разбор с них."
            : "Ошибок нет. Обсудим, как держать этот уровень на экзамене."}
        </p>

        <ul className="mt-8 grid w-full min-w-0 gap-3 sm:grid-cols-2">
          {report.topics.map((topic) => (
            <li
              key={topic.topic}
              className={cn(
                "border-line bg-surface flex items-center justify-between gap-4 rounded-lg border px-4 py-3",
                weak.has(topic.topic) && "border-danger/40 bg-danger-soft",
              )}
            >
              <span className="text-ink">{topic.topic}</span>
              <span
                className={cn(
                  "tabular-nums",
                  weak.has(topic.topic) ? "text-danger" : "text-success",
                )}
              >
                {topic.correct} / {topic.total}
              </span>
            </li>
          ))}
        </ul>

        <details className="border-line mt-8 rounded-md border px-4 py-3">
          <summary className="text-ink cursor-pointer text-sm font-medium">
            Посмотреть разбор ответов
          </summary>
          <ul className="mt-4 flex flex-col gap-4">
            {items.map((item, index) => {
              const isCorrect = answers[item.id] === item.correct;
              return (
                <li key={item.id} className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2
                      aria-hidden
                      className="text-success mt-0.5 size-5 shrink-0"
                    />
                  ) : (
                    <XCircle
                      aria-hidden
                      className="text-danger mt-0.5 size-5 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-ink font-medium [overflow-wrap:anywhere]">
                      {index + 1}. {item.prompt}
                    </p>
                    <p className="text-ink-soft mt-1 text-sm">{item.explanation}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </details>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link
              href={REQUEST_PATH}
              onClick={() =>
                track(ANALYTICS_EVENTS.ctaClick, { placement: "diagnostics-result" })
              }
            >
              Разобрать результат на пробном
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
          <Button type="button" variant="secondary" onClick={reset}>
            <RotateCcw aria-hidden className="size-4" />
            Пройти заново
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full min-w-0 flex-col gap-6"
    >
      {items.map((item, index) => (
        <fieldset
          key={item.id}
          className="border-line bg-surface w-full min-w-0 rounded-xl border p-4 sm:p-5 md:p-6"
        >
          <legend className="text-ink px-1 text-lg leading-snug font-medium">
            {index + 1}. {item.prompt}
          </legend>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {item.options.map((option) => {
              const id = `${item.id}-${option.value}`;
              const selected = answers[item.id] === option.value;
              return (
                <label
                  key={option.value}
                  htmlFor={id}
                  className={cn(
                    "flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 transition-[background-color,border-color,transform] duration-150 ease-out motion-safe:active:scale-[0.99]",
                    selected
                      ? "border-accent bg-accent-soft"
                      : "border-line-strong hover:border-ink hover:bg-surface-subtle",
                  )}
                >
                  <input
                    id={id}
                    type="radio"
                    name={item.id}
                    value={option.value}
                    checked={selected}
                    onChange={() => {
                      triggerHaptic(8);
                      setAnswers((previous) => ({
                        ...previous,
                        [item.id]: option.value,
                      }));
                    }}
                    className="accent-accent size-4"
                  />
                  <span className="text-ink">{option.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit">Показать результат</Button>
        <span className="text-ink-soft text-sm tabular-nums">
          Отвечено {answeredCount} из {items.length}
        </span>
      </div>
    </form>
  );
}
