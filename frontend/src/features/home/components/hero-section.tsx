import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/layout/container";
import { Button, ButtonArrow } from "@/components/ui/button";
import { DerivativeViz } from "@/features/home/components/derivative-viz";
import { HeroParallax } from "@/features/home/components/hero-parallax";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function HeroSection() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="desk:pt-[150px] desk:pb-[110px] pt-[104px] pb-[72px] md:pt-32 md:pb-[88px]"
    >
      <Container>
        <div className="grid grid-cols-12 items-center gap-4 md:gap-6">
          <div className="desk:col-span-6 col-span-12">
            <span className="eyebrow rise">Математика · Информатика</span>
            <h1 id="hero-title" className="display-title rise" style={step(1)}>
              Математика
              <br />
              начинается
              <br />с <span className="serif-accent">понимания.</span>
            </h1>
            <p className="body-large rise mt-9 mb-10" style={step(2)}>
              Разбираю математику и информатику так, чтобы вы понимали не только ответ,
              но и способ мышления.
            </p>
            <div className="rise flex flex-wrap gap-3" style={step(3)}>
              <Button asChild>
                <Link href="/zadachi">
                  Попробовать задачи <ButtonArrow />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/podgotovka">О репетиторстве</Link>
              </Button>
            </div>
          </div>

          <div className="desk:col-span-6 desk:mt-0 col-span-12 mt-12">
            <HeroParallax>
              <DerivativeViz />
            </HeroParallax>
          </div>
        </div>
      </Container>
    </section>
  );
}
