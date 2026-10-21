"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { useMotionAllowed } from "@/components/motion/use-motion-allowed";
import { FAQ_ITEMS, TUTORING_FACTS } from "@/features/tutor-leads/content";

const STEPS = [
  {
    title: "Диагностика и карта пробелов",
    text: TUTORING_FACTS[1].text,
  },
  {
    title: "Разбор причин ошибок",
    text: TUTORING_FACTS[0].text,
  },
  {
    title: "Математика и информатика",
    text: TUTORING_FACTS[2].text,
  },
  {
    title: "Домашние задания и обратная связь",
    text: `${TUTORING_FACTS[3].text} ${TUTORING_FACTS[4].text}`,
  },
  {
    title: "Прогресс по темам",
    text: TUTORING_FACTS[5].text,
  },
] as const;

function clamp(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Pinned process timeline on desktop, a normal vertical list on mobile. */
export function ProcessTimeline() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const allowed = useMotionAllowed();

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (!allowed) {
      if (railRef.current) railRef.current.style.strokeDashoffset = "0";
      const frame = window.requestAnimationFrame(() => {
        setActive(STEPS.length - 1);
        setProgress(1);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = scene.getBoundingClientRect();
      const span = Math.max(rect.height - window.innerHeight * 0.55, 1);
      const next = clamp((window.innerHeight * 0.32 - rect.top) / span);
      if (railRef.current) {
        railRef.current.style.strokeDashoffset = String(1 - next);
      }
      setProgress(next);
      setActive(Math.min(STEPS.length - 1, Math.floor(next * STEPS.length)));
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
    <div ref={sceneRef} className="process-scene">
      <span className="eyebrow">Как проходит работа</span>
      <h2 id="process-title" className="heading-2 mb-10">
        От диагностики <span className="serif-accent text-accent">к прогрессу.</span>
      </h2>

      <div className="process-grid">
        <div>
          <div className="process-steps">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="process-step reveal"
                data-active={index === active ? "" : undefined}
                data-done={index < active ? "" : undefined}
                style={{ "--i": index } as CSSProperties}
              >
                <span className="process-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-ink text-lg leading-snug font-medium">
                    {step.title}
                  </h3>
                  <p className="text-ink-soft mt-1.5 text-[15px] leading-relaxed">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-panel mt-6 p-6">
            <span className="eyebrow">Ритм занятий</span>
            <p className="text-ink-soft text-[15px] leading-relaxed">
              {FAQ_ITEMS[2].answer}
            </p>
            <p className="text-ink mt-4 text-sm font-medium">{FAQ_ITEMS[4].answer}</p>
          </div>
        </div>

        <div className="process-visual">
          <div className="glass-panel p-4 md:p-5">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="instrument-coord">process / {STEPS.length}</span>
              <span className="instrument-coord tabular-nums">
                {Math.round(progress * 100).toString().padStart(3, "0")}%
              </span>
            </div>

            <div className="flex items-start gap-4">
              <span
                className="font-serif text-accent text-[clamp(56px,8vw,104px)] leading-none italic tabular-nums"
                aria-hidden="true"
              >
                {String(active + 1).padStart(2, "0")}
              </span>

              <svg
                className="process-rail mt-1 h-auto w-full"
                viewBox="0 0 220 430"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  className="process-rail-base"
                  d="M40 22C182 84 22 158 150 218S26 332 150 404"
                />
                <path
                  ref={railRef}
                  className="process-rail-live"
                  d="M40 22C182 84 22 158 150 218S26 332 150 404"
                  pathLength={1}
                  style={{ strokeDasharray: 1 }}
                />
                {[0, 1, 2, 3, 4].map((dot) => {
                  const positions = [
                    [40, 22],
                    [148, 108],
                    [150, 218],
                    [130, 322],
                    [150, 404],
                  ];
                  const [cx, cy] = positions[dot];
                  return (
                    <circle
                      key={dot}
                      cx={cx}
                      cy={cy}
                      r={dot === active ? 5 : 3.2}
                      fill={dot <= active ? "var(--color-accent)" : "var(--color-line-strong)"}
                    />
                  );
                })}
              </svg>
            </div>

            <p className="text-ink-soft mt-4 px-1 text-sm leading-relaxed">
              {STEPS[active].text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
