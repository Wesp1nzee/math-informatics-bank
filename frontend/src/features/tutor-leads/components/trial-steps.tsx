import { Section } from "@/components/layout/section";

const STEPS = [
  {
    title: "Диагностика",
    text: "Разбираем несколько задач и находим темы, где теряются баллы.",
  },
  {
    title: "Находим пробелы",
    text: "Смотрим, где именно теряются баллы и почему.",
  },
  {
    title: "Предлагаю план",
    text: "С чего начать и в каком ритме заниматься.",
  },
] as const;

export function TrialSteps() {
  return (
    <Section labelledBy="trial-title">
      <h2 id="trial-title" className="heading-2 mb-8">
        Как проходит пробное
      </h2>

      <div className="reveal trial-steps relative">
        <svg
          className="trial-connector"
          viewBox="0 0 1000 24"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M40 12H960" pathLength={1} />
        </svg>

        <div className="relative z-[1] grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="border-line bg-surface rounded-2xl border p-5 md:p-6"
            >
              <span className="text-accent font-serif text-3xl italic">
                {index + 1}
              </span>
              <h3 className="text-ink mt-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-ink-soft mt-1.5 text-base leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
