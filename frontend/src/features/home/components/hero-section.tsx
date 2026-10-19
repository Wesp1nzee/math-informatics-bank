import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
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
  } catch {
    // The catalogue is the safe fallback when no published task can be loaded.
  }

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="grain desk:pt-[150px] desk:pb-[110px] pt-[104px] pb-[72px] md:pt-32 md:pb-[88px]"
    >
      <Container>
        <div className="grid grid-cols-12 items-center gap-4 md:gap-6">
          <div className="desk:col-span-6 col-span-12">
            <span className="eyebrow rise">ОГЭ и ЕГЭ · математика и информатика</span>
            <h1 id="hero-title" className="display-title rise-lcp" style={step(1)}>
              Математика
              <br />
              начинается
              <br />с <span className="serif-accent">понимания.</span>
            </h1>
            <p className="body-large rise mt-9 mb-6" style={step(2)}>
              Готовлю к ОГЭ и ЕГЭ по математике и информатике. Разбираю причины
              ошибок — чтобы вы понимали не только ответ, но и способ решения.
            </p>
            <p className="text-ink-soft rise mt-0 mb-10 font-medium" style={step(2)}>
              {AI_POSITIONING}
            </p>
            <div className="rise flex flex-wrap gap-3" style={step(3)}>
              <Button asChild>
                <Link href={REQUEST_PATH}>
                  Записаться на пробное <ButtonArrow />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={taskHref}>Попробовать задачу</Link>
              </Button>
            </div>
          </div>

          <div className="desk:col-span-6 desk:mt-0 col-span-12 mt-12">
            <DerivativeViz />
          </div>
        </div>
      </Container>
    </section>
  );
}
