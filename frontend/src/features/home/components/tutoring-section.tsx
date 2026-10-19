import Link from "next/link";
import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { TutoringFacts } from "@/features/tutor-leads/components/tutoring-facts";
import { AI_POSITIONING, TUTORING_INTRO } from "@/features/tutor-leads/content";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function TutoringSection() {
  return (
    <Section id="tutoring" labelledBy="tutoring-title">
      <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
        <div className="reveal desk:col-span-6 col-span-12">
          <span className="eyebrow">Индивидуальные занятия</span>
          <h2 id="tutoring-title" className="heading-2">
            Хотите системный результат?
          </h2>
          <p className="body-large mt-6">{TUTORING_INTRO}</p>
          <p className="text-ink mt-4 font-medium">{AI_POSITIONING}</p>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Button asChild variant="secondary" size="sm">
              <Link href="/podgotovka#request">
                Обсудить занятия <ButtonArrow />
              </Link>
            </Button>
            <Link
              href="/diagnostika"
              className="text-accent hover:text-accent-strong inline-flex min-h-11 items-center gap-2 font-medium transition-colors"
            >
              Пройти диагностику бесплатно →
            </Link>
          </div>
        </div>

        <div
          className="reveal desk:col-span-5 desk:col-start-8 desk:mt-0 col-span-12 mt-12"
          style={step(1)}
        >
          <TutoringFacts />
        </div>
      </div>
    </Section>
  );
}
