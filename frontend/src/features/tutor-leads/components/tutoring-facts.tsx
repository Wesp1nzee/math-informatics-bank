import { TUTORING_FACTS } from "@/features/tutor-leads/content";

/** Definition list of how lessons are organised. */
export function TutoringFacts({ className }: { className?: string }) {
  return (
    <ul className={className}>
      {TUTORING_FACTS.map((fact) => (
        <li
          key={fact.label}
          className="border-line first:border-line flex items-baseline gap-4 border-b py-[18px] first:border-t max-md:flex-col max-md:gap-0.5"
        >
          <b className="min-w-[170px] font-medium max-md:min-w-0">{fact.label}</b>
          <span className="text-ink-soft text-base">{fact.value}</span>
        </li>
      ))}
    </ul>
  );
}
