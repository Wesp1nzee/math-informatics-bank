"use client";

import { useRef } from "react";

import { LeadForm } from "@/features/landing/lead-form";
import { useHeroScene } from "@/features/landing/use-hero-scene";
import { useLandingMotion } from "@/features/landing/use-landing-motion";
import {
  FAQ_ITEMS,
  TUTORING_FACTS,
  TUTORING_INTRO,
} from "@/features/tutor-leads/content";

const TRIAL_STEPS = [
  {
    number: "01",
    title: "Диагностика",
    text: "Разбираем несколько задач и находим темы, где теряются баллы.",
  },
  {
    number: "02",
    title: "Пробелы",
    text: "Смотрим, почему решение не сходится и что мешает на экзамене.",
  },
  {
    number: "03",
    title: "План",
    text: "С чего начать, в каком ритме заниматься и как проверять прогресс.",
  },
] as const;

export function TutoringPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useHeroScene(hostRef, heroRef);
  useLandingMotion(rootRef);

  return (
    <div className="lp" ref={rootRef}>
      <div id="gl" ref={hostRef} aria-hidden="true" />

      <main>
        <section className="hero hero--tutoring" ref={heroRef}>
          <div className="wrap heroin">
            <div className="copy">
              <p className="eyebrow mono fa">ОСНОВА · Репетиторство</p>
              <h1>
                <span className="ln">
                  <span>Занятия</span>
                </span>
                <span className="ln">
                  <span>по математике</span>
                </span>
                <span className="ln">
                  <span>
                    <em>и информатике.</em>
                  </span>
                </span>
              </h1>
              <p className="lead fa">{TUTORING_INTRO}</p>
              <div className="cta fb">
                <a className="btn" href="#request">
                  Обсудить занятия
                </a>
                <a className="ghost" href="#trial">
                  Как проходит пробное ↓
                </a>
              </div>
              <div className="tags mono fc">
                <span>Математика</span>
                <span>Информатика</span>
                <span>ОГЭ / ЕГЭ</span>
                <span>Онлайн</span>
              </div>
            </div>
          </div>
        </section>

        <section className="proc" id="trial">
          <div className="wrap">
            <h2 data-r>Как проходит пробное</h2>
            <div className="track" id="track">
              <svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
                <path id="pb" d="" stroke="var(--line)" strokeWidth="2" />
                <path
                  id="pl"
                  d=""
                  stroke="var(--acc)"
                  strokeWidth="3"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                />
              </svg>
              <span className="node" data-x="167" />
              <span className="node" data-x="500" />
              <span className="node" data-x="833" />
              <span id="pdot" aria-hidden="true" />
            </div>
            <ol className="steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {TRIAL_STEPS.map((step) => (
                <li key={step.number} className="step">
                  <span className="mono">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="sub" id="about">
          <div className="wrap">
            <h2 data-r>
              Что разбираем
              <br />
              на занятиях.
            </h2>
            <div className="tutor-cards">
              {TUTORING_FACTS.map((fact, index) => (
                <article className="col" data-r key={fact.title}>
                  <div className="n mono">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>7–11 класс</span>
                  </div>
                  <h3>{fact.title}</h3>
                  <p>{fact.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="proc tutor-faq-section" id="faq">
          <div className="wrap">
            <h2 data-r>Вопросы и ответы</h2>
            <div className="tutor-faq" data-r>
              {FAQ_ITEMS.map((item) => (
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="final" id="request">
          <div className="wrap in">
            <div data-r>
              <h2>Начнём с диагностики.</h2>
              <p className="l">
                Оставьте контакт — договоримся о времени и разберём задачи.
              </p>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>
    </div>
  );
}
