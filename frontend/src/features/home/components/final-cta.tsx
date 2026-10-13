import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { AI_POSITIONING, CTA_CONTENT } from "@/features/tutor-leads/content";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

/**
 * Final conversion block. It offers a trial lesson (with the request form) and
 * keeps the task bank as a secondary, non-competing link.
 */
export function FinalCta() {
  const copy = CTA_CONTENT["home-final"];

  return (
    <section
      aria-labelledby="final-title"
      className="bg-ink text-canvas desk:py-40 py-24 md:py-[120px]"
    >
      <Container>
        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="reveal desk:col-span-6 col-span-12">
            <span className="text-canvas/60 mb-2 block text-[12px] font-medium tracking-[0.08em] uppercase">
              {copy.eyebrow}
            </span>
            <h2
              id="final-title"
              className="text-[clamp(48px,8vw,120px)] leading-[0.95] font-medium tracking-[-0.05em] text-balance"
            >
              {copy.title}
            </h2>
            <p className="text-canvas/70 mt-7 max-w-[34em] text-xl md:text-2xl">
              {copy.text}
            </p>
            <p className="text-canvas/70 mt-4 text-base">{AI_POSITIONING}</p>

            <Link
              href="/zadachi"
              className="text-canvas/80 hover:text-canvas mt-8 inline-flex min-h-11 items-center gap-2 underline underline-offset-4 transition-colors"
            >
              Или продолжить с банком задач
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>

          <div
            id="request"
            className="reveal desk:col-span-5 desk:col-start-8 desk:mt-0 col-span-12 mt-12 scroll-mt-24"
            style={step(1)}
          >
            <TutorLeadPanel />
          </div>
        </div>
      </Container>
    </section>
  );
}
