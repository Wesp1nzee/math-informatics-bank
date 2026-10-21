"use client";

import { domAnimation, LazyMotion, m } from "motion/react";
import type { PointerEvent } from "react";

import type { Answer, QuizOption } from "@/features/home/components/task-quiz";

export type QuizOptionsProps = {
  options: readonly QuizOption[];
  answer: Answer | null;
  correctValue: string;
  motionAllowed: boolean;
  onChoose: (value: string) => void;
  onSpotlight: (event: PointerEvent<HTMLButtonElement>) => void;
};

/**
 * Motion is deliberately kept in its own async chunk: the quiz is below the
 * fold, so 15+ KB of animation runtime must not sit on the LCP path.
 */
export function QuizOptions({
  options,
  answer,
  correctValue,
  motionAllowed,
  onChoose,
  onSpotlight,
}: QuizOptionsProps) {
  function stateFor(value: string): "right" | "wrong" | undefined {
    if (!answer) return undefined;
    if (value === correctValue) return "right";
    if (value === answer.value) return "wrong";
    return undefined;
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        role="group"
        aria-label="Варианты ответа"
        className="js-only mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-4"
      >
        {options.map((option) => (
          <m.button
            key={option.value}
            type="button"
            className="option"
            disabled={answer !== null}
            data-state={stateFor(option.value)}
            onClick={() => onChoose(option.value)}
            onPointerMove={onSpotlight}
            whileHover={motionAllowed ? { y: -2, scale: 1.012 } : undefined}
            whileTap={motionAllowed ? { scale: 0.985 } : undefined}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {option.label}
          </m.button>
        ))}
      </div>
    </LazyMotion>
  );
}
