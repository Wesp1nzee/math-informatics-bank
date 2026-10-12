import Link from "next/link";
import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { Button, ButtonArrow } from "@/components/ui/button";
import { TUTORING_INTRO } from "@/features/tutor-leads/content";
import { TutoringFacts } from "@/features/tutor-leads/components/tutoring-facts";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

/** Home page preview of individual lessons. */
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
          <Button asChild className="mt-10">
            <Link href="/podgotovka">
              Обсудить занятия <ButtonArrow />
            </Link>
          </Button>
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
