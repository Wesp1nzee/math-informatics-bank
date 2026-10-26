"use client";

import { useEffect, useRef } from "react";

import { LeadForm } from "@/features/landing/lead-form";
import { useHeroScene } from "@/features/landing/use-hero-scene";
import { useLandingMotion } from "@/features/landing/use-landing-motion";

type TeacherProfile = {
  name: string;
  role?: string;
  approach?: string;
  photo?: string;
  facts?: string[];
};

declare global {
  interface Window {
    OSNOVA_TEACHER?: TeacherProfile;
  }
}

export function LandingPage({ teacher }: { teacher?: TeacherProfile }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useHeroScene(hostRef, heroRef);
  useLandingMotion(rootRef);

  useEffect(() => {
    if (teacher) return;
    const profile = window.OSNOVA_TEACHER;
    if (!profile?.name) return;

    const section = document.getElementById("teacher");
    const role = document.getElementById("tRole");
    const name = document.getElementById("tName");
    const text = document.getElementById("tText");
    const facts = document.getElementById("tFacts");
    const figure = document.getElementById("tFig");
    const image = document.getElementById("tImg") as HTMLImageElement | null;

    if (role) role.textContent = profile.role ?? "";
    if (name) name.textContent = profile.name;
    if (text) text.textContent = profile.approach ?? "";
    if (facts) {
      facts.replaceChildren(
        ...(profile.facts ?? []).map((fact) => {
          const item = document.createElement("li");
          item.textContent = fact;
          return item;
        }),
      );
    }
    if (figure && image) {
      if (profile.photo) {
        image.src = profile.photo;
        image.alt = profile.name;
        figure.hidden = false;
      } else {
        figure.hidden = true;
      }
    }
    if (section) section.hidden = false;
  }, [teacher]);

  return (
    <div className="lp" ref={rootRef}>
      <div id="gl" ref={hostRef} aria-hidden="true" />

      <main id="top">
        <section className="hero" ref={heroRef}>
          <div className="wrap heroin">
            <div className="copy">
              <p className="eyebrow mono fa">ОСНОВА · Математика и информатика</p>
              <h1>
                <span className="ln">
                  <span>Сложное</span>
                </span>
                <span className="ln">
                  <span>становится</span>
                </span>
                <span className="ln">
                  <span>
                    <em>понятным.</em>
                  </span>
                </span>
              </h1>
              <p className="lead fa">
                Индивидуальные занятия по математике и информатике для 7–11 классов.
                Разбираемся в пробелах, выстраиваем систему знаний и готовимся к ОГЭ и
                ЕГЭ.
              </p>
              <div className="cta fb">
                <a className="btn" href="#apply">
                  Обсудить занятия
                </a>
                <a className="ghost" href="#process">
                  Как проходит обучение ↓
                </a>
              </div>
              <div className="tags mono fc">
                <span>Математика</span>
                <span>Информатика</span>
                <span>ОГЭ / ЕГЭ</span>
              </div>
            </div>
          </div>
        </section>

        <section className="sub" id="subjects">
          <div className="wrap">
            <h2 data-r>
              Два направления.
              <br />
              Одна система.
            </h2>
            <div className="grid">
              <article className="col" id="math" data-r>
                <div className="n mono">
                  <span>01</span>
                  <span>7–11 класс</span>
                </div>
                <h3>Математика</h3>
                <p>
                  Понимаем темы, а не заучиваем шаблоны. Закрываем пробелы и идём к ОГЭ
                  или ЕГЭ.
                </p>
                <ul className="mono">
                  <li>Алгебра</li>
                  <li>Геометрия</li>
                  <li>ОГЭ</li>
                  <li>ЕГЭ</li>
                </ul>
                <svg
                  className="viz"
                  viewBox="0 0 440 190"
                  fill="none"
                  role="img"
                  aria-label="График функции с отмеченной точкой"
                >
                  <path
                    id="mGrid"
                    d="M130 12V170M230 12V170M330 12V170M30 60H430M30 115H430"
                    stroke="var(--line)"
                    strokeWidth="1"
                  />
                  <path
                    id="mAx"
                    d="M10 170H430M30 10V180"
                    stroke="var(--mut)"
                    strokeWidth="1.2"
                  />
                  <path
                    id="mPv"
                    d="M150 28V170"
                    stroke="var(--mut)"
                    strokeDasharray="3 5"
                  />
                  <path
                    id="mPh"
                    d="M150 28H30"
                    stroke="var(--mut)"
                    strokeDasharray="3 5"
                  />
                  <text
                    id="mLx"
                    x="150"
                    y="186"
                    textAnchor="middle"
                    fill="var(--acc-t)"
                    fontFamily="JetBrains Mono,monospace"
                    fontSize="12"
                  >
                    x
                    <tspan dy="3" fontSize="9">
                      0
                    </tspan>
                  </text>
                  <text
                    id="mLy"
                    x="22"
                    y="32"
                    textAnchor="end"
                    fill="var(--acc-t)"
                    fontFamily="JetBrains Mono,monospace"
                    fontSize="12"
                  >
                    f(x
                    <tspan dy="3" fontSize="9">
                      0
                    </tspan>
                    <tspan dy="-3">)</tspan>
                  </text>
                  <path
                    id="mCurve"
                    d="M30 150C100 150 110 24 165 36S280 176 430 40"
                    stroke="var(--acc)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <g id="mDot" transform="translate(150 28)">
                    <circle r="13" fill="var(--lime)" opacity=".28" />
                    <circle
                      r="6.5"
                      fill="var(--lime)"
                      stroke="var(--ink)"
                      strokeWidth="2"
                    />
                  </g>
                  <text
                    x="260"
                    y="30"
                    fill="var(--acc-t)"
                    fontFamily="JetBrains Mono,monospace"
                    fontSize="15"
                  >
                    ƒ(x)
                  </text>
                </svg>
              </article>

              <article className="col" id="info" data-r>
                <div className="n mono">
                  <span>02</span>
                  <span>7–11 класс</span>
                </div>
                <h3>Информатика</h3>
                <p>
                  Алгоритмы, программирование и разбор экзаменационных задач — шаг за
                  шагом.
                </p>
                <ul className="mono">
                  <li>Алгоритмы</li>
                  <li>Программирование</li>
                  <li>ОГЭ</li>
                  <li>ЕГЭ</li>
                </ul>
                <svg
                  className="viz"
                  viewBox="0 0 440 190"
                  fill="none"
                  role="img"
                  aria-label="Схема алгоритма: дерево решений"
                >
                  <g id="aE" stroke="var(--line)" strokeWidth="2">
                    <path d="M220 20L110 90" />
                    <path d="M220 20L330 90" />
                    <path d="M110 90L55 165" />
                    <path d="M110 90L165 165" />
                    <path d="M330 90L275 165" />
                    <path d="M330 90L385 165" />
                  </g>
                  <g className="rt" stroke="var(--acc)" strokeWidth="3">
                    <path id="aR1" d="M220 20L330 90" />
                    <path id="aR2" d="M330 90L275 165" />
                  </g>
                  <g id="aN" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2">
                    <circle cx="220" cy="20" r="8" />
                    <circle cx="110" cy="90" r="8" />
                    <circle cx="330" cy="90" r="8" />
                    <circle cx="55" cy="165" r="8" />
                    <circle cx="165" cy="165" r="8" />
                    <circle cx="275" cy="165" r="8" />
                    <circle cx="385" cy="165" r="8" />
                  </g>
                  <g id="aL" fill="var(--lime)" stroke="var(--ink)" strokeWidth="2">
                    <circle cx="220" cy="20" r="8" />
                    <circle cx="330" cy="90" r="8" />
                    <circle cx="275" cy="165" r="9" />
                  </g>
                  <circle id="aH" r="13" fill="var(--lime)" opacity="0" />
                  <circle
                    id="aD"
                    r="5"
                    fill="var(--lime)"
                    stroke="var(--ink)"
                    strokeWidth="1.5"
                    opacity="0"
                  />
                </svg>
              </article>
            </div>
          </div>
        </section>

        <section className="proc" id="process">
          <div className="wrap">
            <h2 data-r>Как проходят занятия</h2>
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
              <li className="step">
                <span className="mono">01</span>
                <h3>Разбираемся</h3>
                <p>Определяем цель, текущий уровень и проблемные темы.</p>
              </li>
              <li className="step">
                <span className="mono">02</span>
                <h3>Выстраиваем систему</h3>
                <p>
                  Изучаем материал, разбираем примеры и закрепляем понимание на задачах.
                </p>
              </li>
              <li className="step">
                <span className="mono">03</span>
                <h3>Двигаемся к цели</h3>
                <p>Отслеживаем прогресс и корректируем план занятий.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="teacher" id="teacher" hidden={!teacher}>
          <div className="wrap in">
            <figure id="tFig" data-r hidden={!teacher?.photo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="tImg"
                src={teacher?.photo ?? undefined}
                alt={teacher?.name ?? ""}
              />
            </figure>
            <div data-r>
              <p
                className="mono"
                id="tRole"
                style={{ color: "var(--acc-t)", margin: "0 0 20px" }}
              >
                {teacher?.role ?? ""}
              </p>
              <h2 id="tName">{teacher?.name ?? ""}</h2>
              <p className="lead" id="tText">
                {teacher?.approach ?? ""}
              </p>
              <ul id="tFacts">
                {(teacher?.facts ?? []).map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="final" id="apply">
          <div className="wrap in">
            <div data-r>
              <h2>Давайте разберёмся, с чего начать.</h2>
              <p className="l">
                Расскажите о своей цели — обсудим подходящий формат занятий.
              </p>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>
    </div>
  );
}
