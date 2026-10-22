import { Container } from "@/components/layout/container";
import { TutorLeadPanel } from "@/features/tutor-leads/components/tutor-lead-panel";
import { CTA_CONTENT } from "@/features/tutor-leads/content";

export function FinalCta() {
  const copy = CTA_CONTENT["home-final"];

  return (
    <section
      aria-labelledby="final-title"
      className="final-dark desk:py-[88px] py-14"
    >
      <Container>
        <div className="reveal grid grid-cols-12 items-start gap-8">
          <div className="desk:col-span-6 col-span-12">
            <h2
              id="final-title"
              className="max-w-[11em] text-[clamp(36px,5vw,64px)] leading-[1.04] font-medium tracking-[-0.03em]"
            >
              {copy.title}
            </h2>
            <p className="text-ink-soft mt-5 max-w-[32em] text-lg leading-relaxed">
              {copy.text}
            </p>
          </div>

          <div className="desk:col-span-5 desk:col-start-8 col-span-12">
            <TutorLeadPanel />
          </div>
        </div>
      </Container>
    </section>
  );
}
