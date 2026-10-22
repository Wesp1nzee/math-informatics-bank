import { Section } from "@/components/layout/section";
import { TaskQuiz, type QuizStep } from "@/features/home/components/task-quiz";
import { AI_POSITIONING } from "@/features/tutor-leads/content";

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
    <Section labelledBy="error-title" className="bg-surface">
      <div className="grid grid-cols-12 items-start gap-8">
        <div className="desk:col-span-5 col-span-12">
          <h2 id="error-title" className="heading-2">
            Так выглядит разбор ошибки
          </h2>
          <p className="text-ink mt-5 text-lg font-medium">{AI_POSITIONING}</p>
        </div>

        <div className="desk:col-span-6 desk:col-start-7 col-span-12">
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
    </Section>
  );
}
