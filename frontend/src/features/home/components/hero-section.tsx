import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { RequestCta } from "@/components/ui/request-cta";
import { TiltCard } from "@/components/ui/tilt-card";
import { DerivativeViz } from "@/features/home/components/derivative-viz";
import { getFeaturedTasks, getTaskPath } from "@/features/tasks/api";
import { TUTORING_INTRO } from "@/features/tutor-leads/content";

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
      data-world-state="hero"
      className="relative isolate flex min-h-[90svh] items-center overflow-clip pt-24 pb-16 md:pt-28"
    >
      <div className="hero-scrim" aria-hidden="true" />

      <Container className="relative z-[1]">
        <div className="grid grid-cols-1 items-center gap-10 desk:grid-cols-12 desk:gap-8">
          <div className="desk:col-span-6 ">
            <span className="eyebrow">ОГЭ и ЕГЭ · математика и информатика</span>
            <h1 id="hero-title" className="hero-title rise-lcp">
              Математика начинается с <span className="serif-accent">понимания.</span>
            </h1>
            <p className="text-ink-soft mt-6 max-w-[34em] text-lg font-medium leading-relaxed">
              {TUTORING_INTRO}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Magnetic>
                <RequestCta placement="hero" className="cta-glow w-full sm:w-auto">
                  Записаться на пробное
                </RequestCta>
              </Magnetic>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={taskHref}>Попробовать задачу</Link>
              </Button>
            </div>
          </div>

          <div className="desk:col-span-6 ">
            <TiltCard className="glass rounded-2xl border border-[var(--color-line)]">
              <DerivativeViz />
            </TiltCard>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="depth-chip">Бесплатный банк задач</span>
              <span className="depth-chip depth-chip-high">
                Потяните точку — производная пересчитается
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
