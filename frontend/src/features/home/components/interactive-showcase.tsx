"use client";

import Link from "next/link";
import { useId, useState, type KeyboardEvent } from "react";

import { CodeDemo } from "@/features/home/components/code-demo";
import { TaskQuiz, type QuizStep } from "@/features/home/components/task-quiz";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

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

const TABS = [
  { id: "math", label: "Математика" },
  { id: "cs", label: "Информатика" },
] as const;

export function InteractiveShowcase() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("math");
  const baseId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = TABS.findIndex((tab) => tab.id === active);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = TABS[(index + step + TABS.length) % TABS.length];
    setActive(next.id);
    track(ANALYTICS_EVENTS.tabSwitch, { tab: next.id });
    document.getElementById(`${baseId}-${next.id}-tab`)?.focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Примеры задач" className="tab-list">
        {TABS.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-${tab.id}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${tab.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                setActive(tab.id);
                track(ANALYTICS_EVENTS.tabSwitch, { tab: tab.id });
              }}
              onKeyDown={onKeyDown}
              className={cn("tab-button", selected && "tab-button-active")}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-math-panel`}
        aria-labelledby={`${baseId}-math-tab`}
        data-active={active === "math"}
        className="tab-panel"
      >
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

      <div
        role="tabpanel"
        id={`${baseId}-cs-panel`}
        aria-labelledby={`${baseId}-cs-tab`}
        data-active={active === "cs"}
        className="tab-panel"
      >
        <div className="grid gap-4">
          <p className="text-ink-soft m-0 text-base leading-relaxed">
            По числу N строится R: дважды дописываем остаток суммы цифр на 2.
            Найдите наименьшее R, большее 83.
          </p>
          <CodeDemo />
        </div>
      </div>

      <Link
        href="/zadachi"
        className="text-accent hover:text-accent-strong mt-6 inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
      >
        Больше задач →
      </Link>
    </div>
  );
}
