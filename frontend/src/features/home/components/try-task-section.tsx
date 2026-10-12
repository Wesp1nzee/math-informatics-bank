import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { Math } from "@/components/ui/math";
import { TaskQuiz, type QuizStep } from "@/features/home/components/task-quiz";
import { getTaskPath } from "@/features/tasks/api";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

const STEPS: readonly QuizStep[] = [
  {
    note: "Производная каждого слагаемого",
    content: <Math tex="f'(x)=3x^{2}-8x+7" />,
  },
  {
    note: "Подставляем x = 2",
    content: <Math tex="f'(2)=3\\cdot 2^{2}-8\\cdot 2+7" />,
  },
  {
    note: "Считаем",
    content: <Math tex="f'(2)=12-16+7=3" />,
  },
];

const HINTS: Record<string, string> = {
  "0": "Похоже, часть слагаемых потерялась при подстановке. Проверьте: производная x³ — это 3x², а не x².",
  "7": "7 — это свободный коэффициент производной, но x = 2 нужно подставить и в 3x², и в −8x.",
  "12": "12 — это только 3·2². Не забудьте слагаемые −8x и +7.",
};

/**
 * "Проверьте себя" section: an interactive quiz whose conclusion links to the
 * full task page (#1042), where the same derivative is solved step by step.
 */
export function TryTaskSection() {
  return (
    <Section labelledBy="try-title">
      <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
        <div className="reveal desk:col-span-5 col-span-12">
          <span className="eyebrow">Проверьте себя</span>
          <h2 id="try-title" className="heading-2">
            Не смотрите решение. Попробуйте <span className="serif-accent">сами.</span>
          </h2>
          <p className="body-large mt-6">
            Выберите ответ — и сразу увидите, как он получается.
          </p>
        </div>

        <div
          className="reveal desk:col-span-6 desk:col-start-7 desk:mt-0 col-span-12 mt-6"
          style={step(1)}
        >
          <TaskQuiz
            tag="ЕГЭ · Профиль"
            title="Производная"
            prompt={
              <>
                Найдите значение <Math tex="f'(2)" />, если
              </>
            }
            formula={<Math tex="f(x)=x^{3}-4x^{2}+7x" />}
            options={[
              { value: "0", label: "0" },
              { value: "3", label: "3" },
              { value: "7", label: "7" },
              { value: "12", label: "12" },
            ]}
            correctValue="3"
            hints={HINTS}
            successNote="Сначала находим производную, затем подставляем x = 2."
            steps={STEPS}
            moreHref={getTaskPath("1042")}
          />
        </div>
      </div>
    </Section>
  );
}
