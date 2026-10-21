"use client";

import { useEffect, useRef, useState } from "react";

import { useMotionAllowed } from "@/components/motion/use-motion-allowed";
import { AI_POSITIONING, CTA_CONTENT, FAQ_ITEMS } from "@/features/tutor-leads/content";

const STEPS = [
  AI_POSITIONING,
  CTA_CONTENT["after-solution"].text,
  FAQ_ITEMS[3].answer,
] as const;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Signature scroll scene. The text is pinned with CSS sticky; a tiny rAF
 * listener only moves stroke offsets. No GSAP and no scroll hijacking.
 */
export function DivergenceScene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const pathARef = useRef<SVGPathElement>(null);
  const pathBRef = useRef<SVGPathElement>(null);
  const fixRef = useRef<SVGPathElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const allowed = useMotionAllowed();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const setPaths = (progress: number) => {
      if (pathARef.current) {
        pathARef.current.style.strokeDashoffset = String(1 - clamp(progress * 2));
      }
      if (pathBRef.current) {
        pathBRef.current.style.strokeDashoffset = String(1 - clamp((progress - 0.28) * 2));
      }
      if (fixRef.current) {
        fixRef.current.style.strokeDashoffset = String(1 - clamp((progress - 0.62) * 2.6));
      }
      if (ringRef.current) {
        ringRef.current.style.opacity = String(clamp((progress - 0.24) * 5));
      }
    };

    if (!allowed) {
      setPaths(1);
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = scene.getBoundingClientRect();
      const span = Math.max(rect.height + window.innerHeight * 0.35, 1);
      const progress = clamp((window.innerHeight * 0.86 - rect.top) / span);
      setPaths(progress);
      setActive(progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [allowed]);

  return (
    <div
      ref={sceneRef}
      className="divergence-scene"
      data-active-step={active}
      data-scene-ready={allowed ? "" : undefined}
    >
      <div className="divergence-copy">
        <div>
          <span className="eyebrow">Нейросеть и причина ошибки</span>
          <h2 id="divergence-title" className="heading-2">
            {CTA_CONTENT["after-solution"].title}
          </h2>
          <p className="body-large mt-6">{CTA_CONTENT["after-solution"].text}</p>
        </div>

        <ol className="relative m-0 flex list-none flex-col gap-5 p-0">
          {STEPS.map((text, index) => (
            <li
              key={text}
              className="divergence-step"
              data-active={!allowed || index <= active ? "" : undefined}
              data-signal={index > 0 ? "" : undefined}
            >
              <span className="instrument-coord mb-2 block">
                {String(index + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
              </span>
              <p className="text-ink-soft text-base leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>

        <p className="text-ink text-sm font-medium">{AI_POSITIONING}</p>
      </div>

      <div className="divergence-visual">
        <div className="divergence-sticky">
          <div className="glass-panel p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="instrument-coord">path / divergence</span>
              <span className="instrument-coord">d : 1.00</span>
            </div>

            <svg
              className="divergence-svg"
              viewBox="0 0 640 430"
              aria-hidden="true"
              focusable="false"
            >
              <defs>
                <pattern id="d-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M32 0H0v32" fill="none" stroke="var(--color-line)" strokeWidth="0.6" opacity="0.35" />
                </pattern>
              </defs>
              <rect width="640" height="430" fill="url(#d-grid)" opacity="0.5" />

              <path
                className="dpath dpath-a"
                ref={pathARef}
                d="M112 104C210 66 430 66 528 104"
                pathLength={1}
                style={{ strokeDasharray: 1 }}
              />
              <path
                className="dpath dpath-b"
                ref={pathBRef}
                d="M112 104C192 84 252 118 300 174C346 228 424 296 512 328"
                pathLength={1}
                style={{ strokeDasharray: 1 }}
              />
              <path
                className="dpath dpath-fix"
                ref={fixRef}
                d="M300 174C356 92 454 70 528 104"
                pathLength={1}
                style={{ strokeDasharray: 1 }}
              />

              <g ref={ringRef} style={{ opacity: 0 }}>
                <circle className="d-ring" cx="300" cy="174" r="20" />
                <line x1="300" y1="174" x2="300" y2="210" stroke="var(--signal)" strokeWidth="1" opacity="0.55" />
                <text
                  x="310"
                  y="236"
                  fill="var(--signal)"
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  style={{
                    paintOrder: "stroke",
                    stroke: "var(--color-surface)",
                    strokeWidth: 5,
                    strokeLinejoin: "round",
                  }}
                >
                  здесь расходится ход мысли
                </text>
              </g>

              <g fontFamily="var(--font-sans)">
                <circle cx="112" cy="104" r="7" fill="var(--color-accent)" />
                <text x="88" y="76" fill="var(--color-ink-soft)" fontSize="12">
                  Условие
                </text>
                <circle cx="528" cy="104" r="7" fill="var(--color-accent)" />
                <text x="506" y="76" fill="var(--color-ink-soft)" fontSize="12">
                  Ответ
                </text>
                <circle cx="512" cy="328" r="6" fill="var(--signal)" />
                <text x="488" y="356" fill="var(--signal)" fontSize="12">
                  мимо
                </text>
              </g>

              <g fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-ink-faint)">
                <text x="140" y="58">A / решение</text>
                <text
                  x="398"
                  y="264"
                  fill="var(--signal)"
                  style={{
                    paintOrder: "stroke",
                    stroke: "var(--color-surface)",
                    strokeWidth: 5,
                    strokeLinejoin: "round",
                  }}
                >
                  B / ход мысли
                </text>
                <text x="140" y="210">01 · условие</text>
                <text x="520" y="216">02 · ответ</text>
              </g>
            </svg>

            <p className="text-ink-faint mt-3 px-1 text-xs leading-relaxed">
              Иллюстрация: гладкий путь A приводит к ответу, путь B расходится в
              точке D. Смысл сцены продублирован текстом слева.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
