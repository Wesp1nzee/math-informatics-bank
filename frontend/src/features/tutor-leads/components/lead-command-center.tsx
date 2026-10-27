"use client";

import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

import {
  TutorLeadForm,
  type LeadProgressState,
} from "@/features/tutor-leads/components/lead-form";
import { examLabel, subjectLabel } from "@/features/tutor-leads/content";
import type { ContactChannels } from "@/features/tutor-leads/types";

const INITIAL: LeadProgressState = {
  percent: 0,
  contact: "",
  contactReady: false,
  consent: false,
  exam: "ege",
  subject: "both",
  name: "",
};

const STAGES = [0, 34, 67, 100] as const;

export function LeadCommandCenter({ channels }: { channels: ContactChannels }) {
  const [state, setState] = useState<LeadProgressState>(INITIAL);
  const [sent, setSent] = useState(false);
  const percent = sent ? 100 : state.percent;

  return (
    <div className="lead-command w-full max-w-full min-w-0">
      <div className="lead-command-grid w-full min-w-0">
        <aside className="lead-readiness w-full min-w-0" aria-label="Готовность заявки">
          <div className="lead-readiness-head flex items-center justify-between gap-3">
            <span className="mono-label">READINESS</span>
            <span className="metric-chip">
              <b>{percent}%</b>
            </span>
          </div>

          <div className="lead-readiness-orb mt-3" aria-hidden="true">
            <span className="lead-ring" />
            <span className="lead-ring" />
            <span className="lead-ring" />
            <span
              className="lead-crystal"
              style={{ filter: `hue-rotate(${percent * 0.55}deg)` }}
            />
          </div>

          <p className="lead-readiness-title text-ink m-0 mt-2 text-base font-medium">
            {sent
              ? "Кристалл собран"
              : percent === 100
                ? "Заявка готова"
                : percent >= 67
                  ? "Осталось добавить детали"
                  : percent >= 34
                    ? "Подтвердите согласие"
                    : "Заполните контакт"}
          </p>
          <p className="lead-readiness-desc text-ink-soft mt-1 text-sm leading-relaxed">
            {sent
              ? "Свяжусь с вами и предложу время пробного."
              : "Чем больше деталей, тем точнее план диагностики."}
          </p>

          <div className="lead-readiness-progress mt-4">
            <div className="lead-progress-track" aria-hidden="true">
              <span
                className="lead-progress-fill"
                style={{ transform: `scaleX(${percent / 100})` }}
              />
            </div>
            <div className="lead-stage-dots mt-2">
              {STAGES.map((stage) => (
                <span
                  key={stage}
                  className="lead-stage-dot"
                  data-on={percent >= stage ? "" : undefined}
                >
                  {stage}
                </span>
              ))}
            </div>
          </div>

          <dl className="lead-readiness-details border-line mt-4 grid gap-2 border-t pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-faint">Экзамен</dt>
              <dd className="text-ink m-0 font-medium">{examLabel(state.exam)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-faint">Предмет</dt>
              <dd className="text-ink m-0 text-right font-medium">
                {subjectLabel(state.subject)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-faint">Контакт</dt>
              <dd className="text-ink m-0 inline-flex items-center gap-1.5 font-medium">
                {state.contactReady ? (
                  <>
                    <Check aria-hidden className="text-success size-4" />
                    подтверждён
                  </>
                ) : (
                  "не указан"
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-faint">Согласие</dt>
              <dd className="text-ink m-0 inline-flex items-center gap-1.5 font-medium">
                {state.consent ? (
                  <>
                    <ShieldCheck aria-hidden className="text-success size-4" />
                    получено
                  </>
                ) : (
                  "нужно"
                )}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink-faint">Имя</dt>
              <dd className="text-ink m-0 truncate font-medium">
                {state.name || "не указано"}
              </dd>
            </div>
          </dl>

          <p className="lead-readiness-note text-ink-faint mt-3 flex items-start gap-2 text-sm leading-relaxed">
            <Sparkles aria-hidden className="text-accent mt-0.5 size-4 shrink-0" />
            Визуализация меняется по мере заполнения формы.
          </p>
        </aside>

        <div className="w-full min-w-0">
          <TutorLeadForm
            channels={channels}
            onProgress={(next) => {
              if (sent) return;
              setState(next);
            }}
            onSent={() => setSent(true)}
            onReset={() => setSent(false)}
          />
        </div>
      </div>
    </div>
  );
}
