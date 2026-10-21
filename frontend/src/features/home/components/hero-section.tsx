import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { FieldCanvas } from "@/components/motion/field-canvas";
import { Magnetic } from "@/components/motion/magnetic";
import { SplitHeading } from "@/components/motion/split-heading";
import { Button, ButtonArrow } from "@/components/ui/button";
import { DerivativeViz } from "@/features/home/components/derivative-viz";
import { getFeaturedTasks, getTaskPath } from "@/features/tasks/api";
import { AI_POSITIONING, REQUEST_PATH } from "@/features/tutor-leads/content";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export async function HeroSection() {
  let taskHref = "/zadachi";
  try {
    const [featuredTask] = await getFeaturedTasks(1);
    if (featuredTask) taskHref = getTaskPath(featuredTask.id);
  } catch {}

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="hero-section desk:pt-[150px] desk:pb-[110px] grain pt-[104px] pb-[72px] md:pt-32 md:pb-[88px]"
    >
      <FieldCanvas variant="hero" />

      <Container className="hero-content">
        <div className="grid grid-cols-12 items-center gap-4 md:gap-6">
          <div className="hero-parallax desk:col-span-6 col-span-12">
            <span className="eyebrow">ОГЭ и ЕГЭ · математика и информатика</span>
            <SplitHeading
              as="h1"
              id="hero-title"
              animate="load"
              className="display-title"
              lineClassNames={[undefined, undefined, "whitespace-nowrap"]}
              lines={[
                [{ text: "Математика" }],
                [{ text: "начинается" }],
                [{ text: "с" }, { text: "понимания.", accent: true, stroke: true }],
              ]}
            />
            <p className="body-large mt-9 mb-6" style={step(2)}>
              Готовлю к ОГЭ и ЕГЭ по математике и информатике. Разбираю причины ошибок —
              чтобы вы понимали не только ответ, но и способ решения.
            </p>
            <p className="text-ink-soft mt-0 mb-10 font-medium" style={step(2)}>
              {AI_POSITIONING}
            </p>
            <div className="rise flex flex-wrap gap-3" style={step(3)}>
              <Magnetic>
                <Button asChild className="cta-glow">
                  <Link href={REQUEST_PATH}>
                    Записаться на пробное <ButtonArrow />
                  </Link>
                </Button>
              </Magnetic>
              <Button asChild variant="secondary">
                <Link href={taskHref}>Попробовать задачу</Link>
              </Button>
            </div>
          </div>

          <div className="desk:col-span-6 desk:mt-0 col-span-12 mt-12">
            <div className="instrument-panel reveal" style={step(4)}>
              <div className="mb-1 flex items-center justify-between px-2 pt-1 pb-2">
                <span className="instrument-coord">instrument / 01</span>
                <span className="instrument-coord">x : 0.3 — 3.7</span>
              </div>
              <DerivativeViz />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
