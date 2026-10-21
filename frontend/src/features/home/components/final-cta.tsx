import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { FieldCanvas } from "@/components/motion/field-canvas";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { AI_POSITIONING, CTA_CONTENT } from "@/features/tutor-leads/content";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function FinalCta() {
  const copy = CTA_CONTENT["home-final"];

  return (
    <section
      aria-labelledby="final-title"
      className="final-dark sheet-top desk:py-40 relative isolate overflow-clip py-24 md:py-[120px]"
    >
      <FieldCanvas variant="dark" />

      <Container className="relative z-[1]">
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="reveal desk:col-span-6 col-span-12">
            <span className="text-ink-soft mb-2 block text-[12px] font-medium tracking-[0.08em] uppercase">
              {copy.eyebrow}
            </span>
            <h2 id="final-title" className="wordmark-bleed text-balance">
              {copy.title}
            </h2>
            <p className="text-ink-soft mt-7 max-w-[34em] text-xl md:text-2xl">
              {copy.text}
            </p>
            <p className="text-ink-soft mt-4 text-base">{AI_POSITIONING}</p>

            <Link
              href="/zadachi"
              className="text-ink-soft hover:text-ink mt-8 inline-flex min-h-11 items-center gap-2 underline underline-offset-4 transition-colors"
            >
              Или продолжить с банком задач
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>

          <div
            className="reveal desk:col-span-5 desk:col-start-8 desk:mt-0 col-span-12 mt-12 scroll-mt-24"
            style={step(1)}
          >
            <div className="conic-frame">
              <TutorLeadPanel formClassName="glass-form" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
