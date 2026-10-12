"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

export type QuizOption = { value: string; label: string };
export type QuizStep = { note: string; content: ReactNode };

type TaskQuizProps = {
  tag: string;
  title: string;
  /** Server-rendered prompt (may contain formulas). */
  prompt: ReactNode;
  /** Server-rendered formula block. */
  formula: ReactNode;
  options: readonly QuizOption[];
  correctValue: string;
  /** Message shown for each wrong option. */
  hints: Record<string, string>;
  /** Message shown when the answer is correct. */
  successNote: string;
  /** Solution steps; `content` is pre-rendered on the server. */
  steps: readonly QuizStep[];
  moreHref: string;
};

type Answer = { value: string; correct: boolean };

/**
 * "Try it yourself" quiz.
 *
 * The formulas are rendered by the server and passed in as React nodes, so the
 * client bundle does not need KaTeX. Steps are revealed one by one; reduced
 * motion skips the stagger.
 */
export function TaskQuiz({
  tag,
  title,
  prompt,
  formula,
  options,
  correctValue,
  hints,
  successNote,
  steps,
  moreHref,
}: TaskQuizProps) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const timersRef = useRef<number[]>([]);

  /** Pending reveal timers, cleared on unmount. */
  useEffect(() => {
    return () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
    };
  }, []);

  function clearTimers() {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }

  function choose(value: string) {
    if (answer) return;
    clearTimers();
    setAnswer({ value, correct: value === correctValue });

    if (reducedMotion) {
      setVisibleSteps(steps.length);
      return;
    }

    setVisibleSteps(0);
    timersRef.current = steps.map((_, index) =>
      window.setTimeout(() => setVisibleSteps(index + 1), 450 + index * 650),
    );
  }

  function retry() {
    clearTimers();
    setAnswer(null);
    setVisibleSteps(0);
  }

  function stateFor(value: string): "right" | "wrong" | undefined {
    if (!answer) return undefined;
    if (value === correctValue) return "right";
    if (value === answer.value) return "wrong";
    return undefined;
  }

  return (
    <article
      aria-labelledby="try-q"
      className="border-line bg-surface rounded-xl border p-6 md:p-10"
    >
      <Badge>{tag}</Badge>
      <h3 className="heading-3 mt-5 mb-1.5" id="try-q">
        {title}
      </h3>

      <p className="mt-6 mb-2 text-[22px] leading-snug">{prompt}</p>
      <div className="py-[18px] text-[26px]">{formula}</div>

      <div
        role="group"
        aria-label="Варианты ответа"
        className="js-only mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="option"
            disabled={answer !== null}
            data-state={stateFor(option.value)}
            onClick={() => choose(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="no-js-only text-ink-soft mt-4 text-sm">
        Интерактивная проверка требует JavaScript.{" "}
        <Link href={moreHref} className="text-accent underline underline-offset-4">
          Разобрать задачу целиком
        </Link>
        .
      </p>

      <div className="feedback" data-open={answer ? "true" : "false"}>
        <div>
          <div className="border-line mt-6 border-t pt-6 text-base">
            {answer ? (
              <>
                <span
                  className={cn(
                    "mb-2.5 block font-semibold",
                    answer.correct ? "text-success" : "text-danger",
                  )}
                >
                  {answer.correct ? "Верно." : "Не совсем."}
                </span>

                <p className="text-ink-soft">
                  {answer.correct
                    ? successNote
                    : `${hints[answer.value] ?? "Проверьте вычисления."} Правильный ход решения:`}
                </p>

                <div className="my-3 flex flex-col gap-1 text-[18px]">
                  {steps.map((step, index) => (
                    <div
                      key={step.note}
                      className="step"
                      data-visible={visibleSteps > index ? "" : undefined}
                      data-final={index === steps.length - 1 ? "" : undefined}
                    >
                      <small className="text-ink-soft block text-[13px]">
                        {step.note}
                      </small>
                      <span>{step.content}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center">
                  <Link
                    href={moreHref}
                    className="text-accent hover:text-accent-strong inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
                  >
                    Разобрать подробнее
                    <ArrowRight aria-hidden className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={retry}
                    className="text-ink-soft hover:text-ink ml-5 inline-flex min-h-11 items-center underline underline-offset-4 transition-colors"
                  >
                    Попробовать снова
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
