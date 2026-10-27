import type { CSSProperties } from "react";

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

const ERRORS = [
  {
    code: "E-01",
    title: "Смысл условия теряется",
    expect: "«Я понял, что нужно найти, значит решаю правильно».",
    reality: "Формулировка ЕГЭ проверяет конкретный шаг, а не общее узнавание темы.",
    action:
      "Разбираем, что именно требует критерий, и учимся читать условие по частям.",
  },
  {
    code: "E-02",
    title: "Арифметика под давлением",
    expect: "«Дома получалось, на экзамене тоже получится».",
    reality:
      "Скорость и волнение ломают подстановки и знаки в самый неподходящий момент.",
    action: "Тренируем короткие проверки и доводим операции до автоматизма.",
  },
  {
    code: "E-03",
    title: "Оформление и критерии",
    expect: "«Главное — правильный ответ».",
    reality: "Часть баллов теряется там, где решение не соответствует критериям.",
    action: "Сверяем каждую запись с форматом проверки и фиксируем шаблон.",
  },
] as const;

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function ErrorBreakdown() {
  return (
    <WorldSection
      worldState="error-quiz"
      labelledBy="error-title"
      className="section-frame"
    >
      <div className="desk:grid-cols-12 grid w-full min-w-0 grid-cols-1 items-start gap-8">
        <div className="desk:col-span-5 reveal w-full min-w-0">
          <span className="mono-label mb-4">ERROR / ANATOMY</span>
          <h2 id="error-title" data-split-text className="heading-2 heading-scrim">
            Так выглядит разбор ошибки
          </h2>
          <p className="text-ink-soft heading-scrim mt-5 max-w-[28em] text-lg leading-relaxed">
            Показываю, почему решение не сошлось, и как разбирать похожие задачи.
          </p>

          <div className="mt-8 grid gap-3">
            {ERRORS.map((error, index) => (
              <article
                key={error.code}
                className="bento-cell reveal"
                style={step(index)}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="mono-label">{error.code}</span>
                  <span className="text-ink-faint font-mono text-sm">
                    {String(index + 1).padStart(2, "0")} / 03
                  </span>
                </div>
                <h3 className="text-ink mt-2 mb-3 text-lg font-semibold">
                  {error.title}
                </h3>
                <dl className="m-0 grid gap-2 text-sm leading-relaxed">
                  <div>
                    <dt className="text-ink-faint">Ожидание ученика</dt>
                    <dd className="text-ink-soft m-0">{error.expect}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-faint">Реальность проверки</dt>
                    <dd className="text-ink-soft m-0">{error.reality}</dd>
                  </div>
                  <div>
                    <dt className="text-success">Как закрываем</dt>
                    <dd className="text-ink-soft m-0">{error.action}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>

        <div className="desk:col-span-6 desk:col-start-7 reveal w-full min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="mono-label">LIVE / CHECK</span>
            <span className="metric-chip">
              <b>1</b>
              <span className="text-ink-soft">задача до разбора</span>
            </span>
          </div>
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
