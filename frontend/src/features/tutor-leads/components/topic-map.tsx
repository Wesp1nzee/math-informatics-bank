"use client";

import { useState } from "react";

import { cn } from "@/lib/utils/cn";

const TOPICS = [
  "Алгебра",
  "Геометрия",
  "Производная",
  "Логарифмы",
  "Вероятность",
  "Двоичная запись",
  "Логика",
  "Графы",
  "Алгоритмы",
  "Параметры",
  "Дроби",
  "Планиметрия",
] as const;

const INITIAL_WEAK = new Set(["Логарифмы", "Вероятность", "Параметры"]);

export function TopicMap({ className }: { className?: string }) {
  const [weak, setWeak] = useState<Set<string>>(() => new Set(INITIAL_WEAK));

  function toggle(topic: string) {
    setWeak((previous) => {
      const next = new Set(previous);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  return (
    <div className={cn("glass-panel p-4 md:p-5", className)}>
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <span className="instrument-coord">карта тем · пример</span>
        <span className="instrument-coord">tap / hover</span>
      </div>

      <div className="topic-map" role="group" aria-label="Карта тем — интерактивный пример">
        {TOPICS.map((topic) => {
          const isWeak = weak.has(topic);
          return (
            <button
              key={topic}
              type="button"
              className="topic-tile"
              data-state={isWeak ? "weak" : "closed"}
              aria-pressed={isWeak}
              onClick={(event) => {
                // Mouse hover already toggles; keep click for touch and keyboard.
                if (event.detail === 0 || !window.matchMedia("(pointer: fine)").matches) {
                  toggle(topic);
                }
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") toggle(topic);
              }}
            >
              <span>{topic}</span>
              <span className="topic-dot" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="text-ink-soft mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className="topic-dot bg-signal" aria-hidden="true" />
          проседает
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="topic-dot bg-success" aria-hidden="true" />
          закрыто
        </span>
        <span className="text-ink-faint">
          Иллюстрация: прогресс по темам отмечаем на занятиях.
        </span>
      </div>
    </div>
  );
}
