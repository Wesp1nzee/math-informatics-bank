import type { CSSProperties } from "react";

import { WorldSection } from "@/components/layout/world-section";
import { SHORT_FACTS } from "@/features/tutor-leads/content";
import { cn } from "@/lib/utils/cn";

const step = (index: number) => ({ "--i": index } as CSSProperties);

const SPANS = ["md:col-span-2", "", "", ""] as const;

export function IncludedBento() {
  return (
    <WorldSection worldState="bento" labelledBy="included-title">
      <h2 id="included-title" data-split-text className="heading-2 heading-scrim mb-8">
        Что входит
      </h2>

      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
        {SHORT_FACTS.map((fact, index) => (
          <li key={fact.title} className={cn("reveal", SPANS[index])} style={step(index)}>
            <div className="lift-card border-line bg-surface h-full rounded-2xl border p-6 shadow-[var(--shadow-elev-1)]">
              <b className="text-ink block text-lg font-semibold">{fact.title}</b>
              <span className="text-ink-soft mt-2 block text-base leading-relaxed">
                {fact.text}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </WorldSection>
  );
}
