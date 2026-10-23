"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { setWorldState } from "@/features/world/bus";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { cn } from "@/lib/utils/cn";

export type PinnedStep = {
  title: string;
  text: string;
  /** World state applied while this step is active. */
  state: string;
};

type PinnedEpisodeProps = {
  id: string;
  titleId: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  steps: readonly PinnedStep[];
  stages?: readonly ReactNode[];
  className?: string;
};

const HEADER_OFFSET = 64;
const PIN_QUERY = "(min-width: 1100px) and (min-height: 700px) and (pointer: fine)";

/**
 * The single pinned scroll episode allowed per page. The markup is fully
 * server-rendered (readable without JS). On the client it sets up the GSAP
 * ScrollTrigger pin in a `useLayoutEffect` scoped to its own root via
 * `gsap.context()`; the cleanup reverts the pin (removing the pin-spacer)
 * before React unmounts the section, which keeps client-side navigation safe.
 */
export function PinnedEpisode({
  id,
  titleId,
  eyebrow,
  title,
  subtitle,
  steps,
  stages,
  className,
}: PinnedEpisodeProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let ctx: { revert: () => void } | null = null;

    (async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (disposed) return;
        gsap.registerPlugin(ScrollTrigger);

        const stepEls = Array.from(
          root.querySelectorAll<HTMLElement>("[data-pinned-step]"),
        );
        const states = stepEls
          .map((step) => step.dataset.stepState ?? "")
          .filter(Boolean);
        const rail = root.querySelector<HTMLElement>("[data-rail-fill]");
        const dots = Array.from(root.querySelectorAll<HTMLElement>("[data-rail-dot]"));
        const stageEls = Array.from(
          root.querySelectorAll<HTMLElement>("[data-pinned-stage]"),
        );
        const stageLabels = Array.from(
          root.querySelectorAll<HTMLElement>("[data-stage-label]"),
        );

        const setStep = (index: number) => {
          const clamped = Math.max(0, Math.min(stepEls.length - 1, index));
          stepEls.forEach((step, i) => {
            if (i === clamped) step.dataset.active = "";
            else delete step.dataset.active;
          });
          const stagePerStep = stageEls.length === stepEls.length;
          stageEls.forEach((stage, i) => {
            if (stagePerStep ? i === clamped : i === 0) stage.dataset.active = "";
            else delete stage.dataset.active;
          });
          dots.forEach((dot, i) => {
            if (i <= clamped) dot.dataset.active = "";
            else delete dot.dataset.active;
          });
          if (rail) {
            rail.style.transform = `scaleX(${clamped / Math.max(1, stepEls.length - 1)})`;
          }
          if (states[clamped]) setWorldState(states[clamped]);
          for (const label of stageLabels) {
            label.textContent = `Фаза ${String(clamped + 1).padStart(2, "0")} / ${String(stepEls.length).padStart(2, "0")}`;
          }
          root.dispatchEvent(
            new CustomEvent("pinned-step", { detail: clamped, bubbles: false }),
          );
        };

        ctx = gsap.context(() => {
          const mm = gsap.matchMedia();
          let viewed = false;
          const markViewed = () => {
            if (viewed) return;
            viewed = true;
            track(ANALYTICS_EVENTS.pinnedViewed, { steps: stepEls.length });
          };

          mm.add(PIN_QUERY, () => {
            setStep(0);
            ScrollTrigger.create({
              trigger: root,
              start: `top top+=${HEADER_OFFSET}`,
              end: () => `+=${Math.round(window.innerHeight * 2.2)}`,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onEnter: markViewed,
              onUpdate: (self: { progress: number }) => {
                const index = Math.floor(self.progress * stepEls.length);
                setStep(index === stepEls.length ? stepEls.length - 1 : index);
              },
            });
          });

          mm.add("(max-width: 1099px), (max-height: 699px), (pointer: coarse)", () => {
            stepEls.forEach((step, index) => {
              const state = states[index];
              if (!state) return;
              ScrollTrigger.create({
                trigger: step,
                start: "top 70%",
                onEnter: () => {
                  markViewed();
                  setStep(index);
                  setWorldState(state);
                },
              });
            });
          });
        }, root);
      } catch {
        // GSAP unavailable — the episode stays a plain vertical list.
      }
    })();

    return () => {
      disposed = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id={id}
      ref={rootRef}
      aria-labelledby={titleId}
      data-pinned=""
      className={cn("pinned-episode", className)}
    >
      <Container>
        <div className="pinned-sticky">
          <div className="pinned-card glass rounded-2xl border border-[var(--color-line)] p-6 md:p-9">
            {eyebrow ? <span className="eyebrow mb-3">{eyebrow}</span> : null}
            <h2 id={titleId} data-split-text className="heading-2">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-ink-soft mt-4 max-w-[30em] text-lg leading-relaxed">
                {subtitle}
              </p>
            ) : null}

            <ol className="m-0 mt-8 list-none space-y-6 p-0">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  data-pinned-step=""
                  data-step-state={step.state}
                  className="pinned-step"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-accent mt-0.5 font-serif text-2xl leading-none italic">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-ink m-0 text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="text-ink-soft mt-1.5 text-base leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="pinned-rail" aria-hidden="true">
              <div className="pinned-rail-track">
                <span className="pinned-rail-fill" data-rail-fill="" />
                <span className="pinned-rail-dot" data-rail-dot="" />
                <span className="pinned-rail-dot" data-rail-dot="" />
                <span className="pinned-rail-dot" data-rail-dot="" />
              </div>
            </div>
          </div>

          <div className="pinned-stage">
            {stages?.length ? (
              stages.map((stage, index) => (
                <div
                  key={index}
                  data-pinned-stage=""
                  data-active={index === 0 ? "" : undefined}
                  className="pinned-stage-panel"
                >
                  <span className="pinned-stage-tag mb-3" data-stage-label="">
                    Фаза 01 / {String(steps.length).padStart(2, "0")}
                  </span>
                  {stage}
                </div>
              ))
            ) : (
              <div className="pinned-stage-panel" data-pinned-stage="" data-active="">
                <div className="glass border-line rounded-2xl border p-6">
                  <p className="mono-label mb-3">Z-INDEX / PROGRESS</p>
                  <p className="text-ink-soft text-base leading-relaxed">
                    Этап {String(steps.length).padStart(2, "0")} из{" "}
                    {String(steps.length).padStart(2, "0")} — маршрут разбора
                    раскрывается по мере прокрутки.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
