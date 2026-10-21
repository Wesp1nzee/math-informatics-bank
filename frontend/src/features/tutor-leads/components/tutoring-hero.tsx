import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { FieldCanvas } from "@/components/motion/field-canvas";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/seo/breadcrumbs";
import { Button, ButtonArrow } from "@/components/ui/button";
import { TopicMap } from "@/features/tutor-leads/components/topic-map";
import { TUTORING_INTRO } from "@/features/tutor-leads/content";

export function TutoringHero({
  breadcrumbs,
}: {
  breadcrumbs: readonly BreadcrumbItem[];
}) {
  return (
    <section
      aria-labelledby="tutoring-hero-title"
      className="hero-section grain desk:pt-[146px] desk:pb-20 pt-[104px] pb-12 md:pt-32 md:pb-16"
    >
      <FieldCanvas variant="scan" />

      <Container className="hero-content">
        <Breadcrumbs className="mb-8" items={breadcrumbs} />

        <div className="grid grid-cols-12 items-start gap-4 md:gap-6">
          <div className="hero-parallax desk:col-span-7 col-span-12">
            <span className="eyebrow">Индивидуальные занятия</span>
            <SplitHeading
              as="h1"
              id="tutoring-hero-title"
              animate="load"
              className="heading-2 max-w-[18ch]"
              lines={[
                [{ text: "Хотите" }, { text: "системный" }],
                [{ text: "результат?", accent: true }],
              ]}
            />
            <p className="body-large mt-6">{TUTORING_INTRO}</p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <Button asChild className="cta-glow">
                  <Link href="#request">
                    Записаться на пробное <ButtonArrow />
                  </Link>
                </Button>
              </Magnetic>
              <Button asChild variant="secondary">
                <Link href="/diagnostika">Пройти диагностику</Link>
              </Button>
            </div>

            <div className="border-line text-ink-soft mt-10 grid max-w-[34rem] grid-cols-3 gap-3 border-t pt-5 text-xs">
              <span className="instrument-coord">01 · диагностика</span>
              <span className="instrument-coord">02 · пробелы</span>
              <span className="instrument-coord">03 · работа</span>
            </div>
          </div>

          <div className="desk:col-span-5 desk:col-start-8 desk:mt-0 col-span-12 mt-10">
            <div className="reveal" style={{ "--i": 2 } as CSSProperties}>
              <TopicMap />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
