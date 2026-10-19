import type {
  FaqItem,
  PricingInfo,
  Review,
  TutorLeadExam,
  TutorLeadInput,
  TutorLeadSubject,
} from "@/features/tutor-leads/types";

export const TUTORING_INTRO =
  "Если задач из открытого доступа недостаточно, можно заниматься лично: найдём, где именно теряются баллы, и выстроим работу вокруг этого.";

export const REQUEST_PATH = "/podgotovka#request";

export const AI_POSITIONING = "Нейросеть даёт решение. Я нахожу, почему ошиблись вы.";

export type CtaPlacement =
  | "after-solution"
  | "after-wrong-answers"
  | "article-mid"
  | "article-end"
  | "quiz-success"
  | "home-final";

export type CtaCopy = {
  eyebrow: string;
  title: string;
  text: string;
  action: string;
};

export const CTA_CONTENT: Record<CtaPlacement, CtaCopy> = {
  "after-solution": {
    eyebrow: "Индивидуальные занятия",
    title: "Решение видно. А причина ошибки — нет",
    text: "На занятиях разбираем, где именно вы теряете баллы и как разбирать такие задачи, чтобы не повторять ошибку.",
    action: "Записаться на пробное",
  },
  "after-wrong-answers": {
    eyebrow: "Разбор ошибок",
    title: "Ошибка — это точка роста",
    text: "Покажу, почему решение не сошлось, и научу разбирать похожие задачи самостоятельно.",
    action: "Разобрать на пробном",
  },
  "article-mid": {
    eyebrow: "По вашему случаю",
    title: "Разобрать именно ваши ошибки?",
    text: "Статья объясняет тему в целом. На занятии смотрим на ваши решения и находим слабые места.",
    action: "Записаться на пробное",
  },
  "article-end": {
    eyebrow: "Индивидуальные занятия",
    title: "Дочитать — не то же самое, что научиться",
    text: "Если тема всё ещё не идёт, разберём её на пробном занятии под ваш уровень.",
    action: "Записаться на пробное",
  },
  "quiz-success": {
    eyebrow: "Что дальше",
    title: "Ответ верный",
    text: "На экзамене важна не только правильность, но и скорость. Разберём, как выйти на стабильный результат.",
    action: "Записаться на пробное",
  },
  "home-final": {
    eyebrow: "Пробное занятие",
    title: "Начнём с вашей ошибки",
    text: "Оставьте контакт — проведу диагностику и покажу, где вы теряете баллы.",
    action: "Записаться на пробное",
  },
};

export const TUTORING_FACTS: readonly { title: string; text: string }[] = [
  {
    title: "Разбор причин ошибок",
    text: "Не просто показываю верное решение, а разбираю, почему ошибка возникла именно у вас.",
  },
  {
    title: "Программа под ваш уровень",
    text: "Начинаем с диагностики и двигаемся от того, что не получается сейчас.",
  },
  {
    title: "Математика и информатика",
    text: "Подготовка к ОГЭ и ЕГЭ по обоим предметам — можно заниматься только одним.",
  },
  {
    title: "Домашние задания по делу",
    text: "Посильные задания, чтобы закреплять разобранное, а не заваливать объёмом.",
  },
  {
    title: "Обратная связь",
    text: "После занятия понятно, что получилось и над чем работать дальше.",
  },
  {
    title: "Прогресс по темам",
    text: "Отмечаем, какие темы закрыты, а какие ещё проседают.",
  },
];

export const PRICING: PricingInfo | null = null;

export const PRICING_FALLBACK_NOTE =
  "Стоимость обсуждаем после диагностики — она зависит от цели и количества занятий.";

export const REVIEWS: readonly Review[] = [];

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "В каком формате проходят занятия?",
    answer:
      "Индивидуально, онлайн. Работаем по вашему уровню и цели: от разбора конкретных ошибок до системной подготовки.",
  },
  {
    question: "Как проходит пробное занятие?",
    answer:
      "Начинаем с диагностики: разбираем несколько задач и находим темы, где теряются баллы. По результату понятно, с чего начать.",
  },
  {
    question: "Сколько занятий в неделю нужно?",
    answer:
      "Зависит от цели и запаса времени. После диагностики предложу ритм, который реально выдержать вместе со школой.",
  },
  {
    question: "Что делать с ИИ-решателями?",
    answer:
      "Задача — чтобы вы решали сами. На экзамене готовый ответ не поможет: важен ход мысли, поэтому мы разбираем его, а не копируем.",
  },
  {
    question: "Как отменить или перенести занятие?",
    answer: "Напишите заранее — согласуем другое время.",
  },
];

export const SUBJECT_OPTIONS: readonly {
  value: TutorLeadSubject;
  label: string;
}[] = [
  { value: "matematika", label: "Математика" },
  { value: "informatika", label: "Информатика" },
  { value: "both", label: "Математика и информатика" },
];

export const EXAM_OPTIONS: readonly { value: TutorLeadExam; label: string }[] = [
  { value: "oge", label: "ОГЭ" },
  { value: "ege", label: "ЕГЭ" },
  { value: "other", label: "Другое" },
];

export function subjectLabel(subject: TutorLeadSubject): string {
  return SUBJECT_OPTIONS.find((option) => option.value === subject)?.label ?? subject;
}

export function examLabel(exam: TutorLeadExam): string {
  return EXAM_OPTIONS.find((option) => option.value === exam)?.label ?? exam;
}

export function buildLeadMessage(input: TutorLeadInput): string {
  const lines = ["Заявка на занятия", "", `Экзамен: ${examLabel(input.exam)}`];

  if (input.name?.trim()) lines.push(`Имя: ${input.name.trim()}`);
  lines.push(`Связь: ${input.contact}`);
  if (input.subject) lines.push(`Предмет: ${subjectLabel(input.subject)}`);

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
