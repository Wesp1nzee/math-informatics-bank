import { WorldSection } from "@/components/layout/world-section";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { CTA_CONTENT } from "@/features/tutor-leads/content";

export function FinalCta() {
  const copy = CTA_CONTENT["home-final"];

  return (
    <WorldSection
      worldState="summit"
      labelledBy="final-title"
      className="relative isolate overflow-clip py-20 md:py-32"
    >
      <div className="final-halo" aria-hidden="true" />

      <div className="desk:grid-cols-12 relative grid grid-cols-1 items-center gap-10">
        <div className="reveal desk:col-span-6">
          <span className="mono-label mb-5">CONVERSION / PORTAL</span>
          <h2
            id="final-title"
            data-split-text
            className="heading-scrim max-w-[11em] text-[clamp(40px,6.5vw,88px)] leading-[0.98] font-medium tracking-[-0.03em]"
          >
            {copy.title}
          </h2>
          <p className="text-ink-soft heading-scrim mt-5 max-w-[32em] text-lg leading-relaxed">
            {copy.text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="metric-chip">
              <b>01</b>
              <span className="text-ink-soft">диагностика</span>
            </span>
            <span className="metric-chip">
              <b>02</b>
              <span className="text-ink-soft">план</span>
            </span>
            <span className="metric-chip">
              <b>03</b>
              <span className="text-ink-soft">результат</span>
            </span>
          </div>
        </div>

        <div className="reveal desk:col-span-5 desk:col-start-8">
          <div className="glass-strong rounded-2xl border border-[var(--glass-border)] p-5 md:p-6">
            <h3 className="heading-3 mb-4">Записаться на пробное</h3>
            <TutorLeadPanel />
          </div>
        </div>
      </div>
    </WorldSection>
  );
}
