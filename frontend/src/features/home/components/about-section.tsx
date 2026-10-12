import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { AboutIllustration } from "@/features/home/components/about-illustration";

const step = (index: number) => ({ "--i": index }) as CSSProperties;

export function AboutSection() {
  return (
    <Section id="about" labelledBy="about-title" className="bg-surface">
      <div className="grid grid-cols-12 items-center gap-4 md:gap-6">
        {/*
          `about-art` also carries `reveal`: once the element becomes visible,
          `data-reveal-in` starts the SVG draw-in animations (see globals.css).
        */}
        <div className="about-art reveal border-line bg-canvas desk:col-span-5 col-span-12 max-w-[480px] overflow-hidden rounded-xl border">
          <AboutIllustration />
        </div>

        <div className="desk:col-span-6 desk:col-start-7 desk:mt-0 col-span-12 mt-12">
          <span className="eyebrow reveal">Подход</span>
          <h2
            id="about-title"
            className="reveal text-[clamp(28px,3.4vw,46px)] leading-[1.15] font-medium tracking-[-0.03em]"
            style={step(1)}
          >
            Хорошее обучение — это не запоминание большего количества формул. Это
            понимание того,{" "}
            <span className="serif-accent text-accent">почему они работают.</span>
          </h2>
          <p className="body-large reveal mt-8" style={step(2)}>
            Поэтому в каждой задаче мы идём от идеи к записи, а не наоборот.
          </p>
        </div>
      </div>
    </Section>
  );
}
