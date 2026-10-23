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
      className="relative isolate flex min-h-[92svh] items-center overflow-clip pt-24 pb-16 md:pt-28 md:pb-24"
    >
      <div className="hero-scrim" aria-hidden="true" />

      <Container className="relative z-[1]">
        <div className="desk:grid-cols-12 desk:gap-8 grid grid-cols-1 items-center gap-12">
          <div className="desk:col-span-6">
            <span className="mono-label mb-5">
              ОГЭ / ЕГЭ · математика × информатика
            </span>
            <h1 id="hero-title" className="hero-title rise-lcp">
              Математика начинается с <span className="serif-accent">понимания.</span>
            </h1>
            <p className="text-ink-soft mt-6 max-w-[34em] text-lg leading-relaxed font-medium">
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

            <dl className="border-line mt-10 grid max-w-[34em] grid-cols-3 gap-4 border-t pt-6">
              <div>
                <dt className="mono-label">Формат</dt>
                <dd className="text-ink mt-2 text-base font-medium">Онлайн</dd>
              </div>
              <div>
                <dt className="mono-label">Предметы</dt>
                <dd className="text-ink mt-2 text-base font-medium">2 трека</dd>
              </div>
              <div>
                <dt className="mono-label">Старт</dt>
                <dd className="text-ink mt-2 text-base font-medium">Пробное</dd>
              </div>
            </dl>
          </div>

          <div className="desk:col-span-6">
            <div className="hero-stage" data-parallax="0.09">
              <div className="hero-orb" aria-hidden="true" />
              <div
                className="glass-strong hero-viz-shell relative mx-auto w-[min(100%,560px)] overflow-hidden rounded-[1.35rem] p-2"
                aria-hidden="false"
              >
                <div className="border-line relative overflow-hidden rounded-[1rem] border">
                  <TiltCard className="bg-transparent">
                    <DerivativeViz />
                  </TiltCard>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 pt-3 pb-1">
                  <span className="mono-label">LIVE MODEL</span>
                  <span className="metric-chip">
                    <b>f′(x)</b>
                    <span className="text-ink-soft">касательная</span>
                  </span>
                </div>
              </div>

              <div className="hero-float hero-float-a" aria-hidden="true">
                <span>Точность решения</span>
                <b>f′(2) = 3</b>
                <span>12 − 16 + 7</span>
              </div>
              <div className="hero-float hero-float-b" aria-hidden="true">
                <span>Алгоритм · Задание 5</span>
                <b>N = 21</b>
                <span>R = 86 &gt; 83</span>
              </div>
              <div className="hero-float hero-float-c" aria-hidden="true">
                <span>Смысл вместо зубрёжки</span>
                <b>df / dx</b>
                <span>наклон = скорость</span>
              </div>
            </div>

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
