"use client";

import { ArrowRight, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { TutorCta } from "@/features/tutor-leads/components/tutor-cta";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/lib/utils/use-prefers-reduced-motion";

export type QuizOption = { value: string; label: string };
export type QuizStep = { note: string; content: ReactNode };

type TaskQuizProps = {
  tag: string;
  title: string;
  prompt: ReactNode;
  formula: ReactNode;
  options: readonly QuizOption[];
  correctValue: string;
  hints: Record<string, string>;
  successNote: string;
  steps: readonly QuizStep[];
  moreHref: string;
};

type Answer = { value: string; correct: boolean };

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
    const correct = value === correctValue;
    setAnswer({ value, correct });
    track(ANALYTICS_EVENTS.quizAnswer, { correct });

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
                    "mb-2.5 flex items-center gap-2 font-semibold",
                    answer.correct ? "text-success" : "text-danger",
                  )}
                >
                  {answer.correct ? (
                    <CircleCheck aria-hidden className="quiz-check size-5" />
                  ) : null}
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

                {answer.correct ? (
                  <TutorCta placement="quiz-success" size="compact" className="mt-6" />
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
