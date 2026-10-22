import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { ContourField } from "@/components/decor/contour-field";
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
      className="hero-static grain desk:min-h-[85svh] relative isolate flex items-center overflow-clip pt-[104px] pb-14 md:pt-32 md:pb-20"
    >
      <ContourField />

      <Container className="relative z-[1]">
        <div className="grid grid-cols-12 items-center gap-8 md:gap-10">
          <div className="desk:col-span-6 col-span-12">
            <span className="eyebrow rise">ОГЭ и ЕГЭ · математика и информатика</span>
            <h1 id="hero-title" className="display-title">
              Математика{" "}
              <br />
              начинается{" "}
              <br />
              <span className="whitespace-nowrap">
                с <span className="serif-accent">понимания.</span>
              </span>
            </h1>
            <p className="text-ink rise mt-7 mb-8 max-w-[34em] text-lg font-medium" style={step(1)}>
              {AI_POSITIONING}
            </p>
            <div className="rise flex flex-col gap-3 sm:flex-row" style={step(2)}>
              <Button asChild className="w-full sm:w-auto">
                <Link href={REQUEST_PATH}>
                  Записаться на пробное <ButtonArrow />
                </Link>
              </Button>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={taskHref}>Попробовать задачу</Link>
              </Button>
            </div>
          </div>

          <div className="desk:col-span-6 col-span-12">
            <DerivativeViz />
          </div>
        </div>
      </Container>
    </section>
  );
}
