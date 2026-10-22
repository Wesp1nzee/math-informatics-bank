import { WorldSection } from "@/components/layout/world-section";
import { TaskQuiz, type QuizStep } from "@/features/home/components/task-quiz";

const STEPS: readonly QuizStep[] = [
  {
    note: "Производная каждого слагаемого",
    content: <span className="formula-inline">f′(x) = 3x² − 8x + 7</span>,
  },
  {
    note: "Подставляем x = 2",
    content: <span className="formula-inline">f′(2) = 3·2² − 8·2 + 7</span>,
  },
  {
    note: "Считаем",
    content: <span className="formula-inline">f′(2) = 12 − 16 + 7 = 3</span>,
  },
];

const HINTS: Record<string, string> = {
  "0": "Похоже, часть слагаемых потерялась при подстановке. Проверьте: производная x³ — это 3x², а не x².",
  "7": "7 — это свободный коэффициент производной, но x = 2 нужно подставить и в 3x², и в −8x.",
  "12": "12 — это только 3·2². Не забудьте слагаемые −8x и +7.",
};

export function ErrorBreakdown() {
  return (
    <WorldSection worldState="error-quiz" labelledBy="error-title">
      <div className="grid grid-cols-1 items-start gap-8 desk:grid-cols-12">
        <div className="desk:col-span-5 reveal ">
          <h2 id="error-title" data-split-text className="heading-2 heading-scrim">
            Так выглядит разбор ошибки
          </h2>
          <p className="text-ink-soft heading-scrim mt-5 max-w-[28em] text-lg leading-relaxed">
            Показываю, почему решение не сошлось, и как разбирать похожие задачи.
          </p>
        </div>

        <div className="desk:col-span-6 desk:col-start-7 reveal ">
          <TaskQuiz
            tag="ЕГЭ · Профиль"
            title="Производная"
            prompt={
              <>
                Найдите значение <span className="formula-inline">f′(2)</span>, если
              </>
            }
            formula={<span className="formula-block">f(x) = x³ − 4x² + 7x</span>}
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
            moreHref="/zadachi"
          />
        </div>
      </div>
    </WorldSection>
  );
}
