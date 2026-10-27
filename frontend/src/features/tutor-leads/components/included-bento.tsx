import type { CSSProperties } from "react";

import { WorldSection } from "@/components/layout/world-section";
import { SHORT_FACTS } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

const SPANS = [
  "md:col-span-7 md:row-span-2",
  "md:col-span-5",
  "md:col-span-5",
  "md:col-span-12",
] as const;

function ProgressVisual() {
  return (
    <div className="mt-5" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <span className="mono-label">PROGRESS</span>
        <span className="text-success font-mono text-sm">+32%</span>
      </div>
      <svg
        className="sparkline mt-3 h-24 w-full"
        viewBox="0 0 320 96"
        preserveAspectRatio="none"
      >
        <path
          className="area"
          d="M0 82 C 32 80, 44 66, 70 68 S 118 54, 146 50 S 196 42, 224 30 S 276 22, 320 10 L320 96 L0 96 Z"
        />
        <path d="M0 82 C 32 80, 44 66, 70 68 S 118 54, 146 50 S 196 42, 224 30 S 276 22, 320 10" />
      </svg>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="metric-chip">
          <b>тема</b>
          <span className="text-ink-soft">закрыта</span>
        </span>
        <span className="metric-chip">
          <b>+2</b>
          <span className="text-ink-soft">балла</span>
        </span>
      </div>
    </div>
  );
}

function CodeVisual() {
  return (
    <div className="article-live-preview mt-5" aria-hidden="true">
      <div className="font-mono text-sm leading-7">
        <span className="text-accent">def</span> explain(n):
        <br />
        &nbsp;&nbsp;<span className="text-success">return</span> trace(n)
        <br />
        <span className="text-ink-faint"># причина найдена</span>
      </div>
    </div>
  );
}

function BadgeVisual() {
  return (
    <div className="tag-cloud mt-5" aria-hidden="true">
      <span>ОГЭ</span>
      <span>ЕГЭ</span>
      <span>алгебра</span>
      <span>геометрия</span>
      <span>python</span>
      <span>логика</span>
    </div>
  );
}

function ScheduleVisual() {
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-3" aria-hidden="true">
      {[
        ["01", "диагностика"],
        ["02", "разбор"],
        ["03", "закрепление"],
      ].map(([num, label]) => (
        <div
          key={num}
          className="border-line bg-surface-subtle flex items-center gap-3 rounded-lg border px-3 py-2"
        >
          <span className="text-accent font-mono text-sm">{num}</span>
          <span className="text-ink-soft text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

const VISUALS = [ProgressVisual, CodeVisual, BadgeVisual, ScheduleVisual] as const;

export function IncludedBento() {
  return (
    <WorldSection
      worldState="bento"
      labelledBy="included-title"
      className="section-frame"
    >
      <span className="mono-label mb-4">SYSTEM / INCLUDED</span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          id="included-title"
          data-split-text
          className="heading-2 heading-scrim mb-8"
        >
          Что входит
        </h2>
        <p className="text-ink-soft heading-scrim m-0 max-w-[30em] text-base leading-relaxed">
          Не набор разрозненных уроков, а система: диагностика, объяснение, практика и
          контроль.
        </p>
      </div>

      <ul className="bento-grid m-0 w-full min-w-0 list-none p-0">
        {SHORT_FACTS.map((fact, index) => {
          const Visual = VISUALS[index] ?? ProgressVisual;
          return (
            <li
              key={fact.title}
              className={cn("reveal w-full min-w-0", SPANS[index])}
              style={step(index)}
            >
              <div className="bento-cell tech-corners h-full w-full min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <b className="text-ink block text-lg font-semibold">{fact.title}</b>
                  <span className="text-ink-faint font-mono text-sm">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-ink-soft mt-2 block max-w-[36em] text-base leading-relaxed">
                  {fact.text}
                </span>
                <Visual />
              </div>
            </li>
          );
        })}
      </ul>
    </WorldSection>
  );
}
