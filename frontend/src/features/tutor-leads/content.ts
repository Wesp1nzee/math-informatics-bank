import type { TutorLeadInput, TutorLeadSubject } from "@/features/tutor-leads/types";

export const TUTORING_INTRO =
  "Если задач из открытого доступа недостаточно, можно заниматься лично: найдём, где именно теряются баллы, и выстроим работу вокруг этого.";

/**
 * Service description taken from the original prototype. These are factual
 * statements about how lessons are organised, not invented achievements or
 * testimonials.
 */
export const TUTORING_FACTS: readonly { label: string; value: string }[] = [
  { label: "Предметы", value: "Математика и информатика" },
  { label: "Экзамены", value: "ОГЭ и ЕГЭ" },
  { label: "Формат", value: "Индивидуальные занятия" },
  { label: "Пробелы", value: "Находим и закрываем по темам" },
  { label: "Ошибки", value: "Разбираем причины, а не только ответы" },
  { label: "Домашние задания", value: "Посильные и по делу" },
  { label: "Прогресс", value: "Отслеживаем по темам" },
];

export const SUBJECT_OPTIONS: readonly {
  value: TutorLeadSubject;
  label: string;
}[] = [
  { value: "matematika", label: "Математика" },
  { value: "informatika", label: "Информатика" },
  { value: "both", label: "Математика и информатика" },
];

export function subjectLabel(subject: TutorLeadSubject): string {
  return SUBJECT_OPTIONS.find((option) => option.value === subject)?.label ?? subject;
}

/** Plain-text message the applicant sends from their own client. */
export function buildLeadMessage(input: TutorLeadInput): string {
  const lines = [
    "Заявка на занятия",
    "",
    `Имя: ${input.name}`,
    `Связь: ${input.contact}`,
    `Предмет: ${subjectLabel(input.subject)}`,
  ];

  if (input.message?.trim()) {
    lines.push(`Комментарий: ${input.message.trim()}`);
  }

  return lines.join("\n");
}

export function buildLeadMailto(mailtoHref: string, input: TutorLeadInput): string {
  const subject = "Заявка на занятия";
  const body = buildLeadMessage(input);
  return `${mailtoHref}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function buildLeadTelegramHref(
  telegramHref: string,
  input: TutorLeadInput,
): string {
  return `${telegramHref}?text=${encodeURIComponent(buildLeadMessage(input))}`;
}
