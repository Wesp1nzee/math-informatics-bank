export type TutorLeadSubject = "matematika" | "informatika" | "both";
export type TutorLeadExam = "oge" | "ege" | "other";

export type TutorLeadInput = {
  /** Optional: the fast path only requires contact and exam. */
  name?: string;
  contact: string;
  exam: TutorLeadExam;
  subject?: TutorLeadSubject;
  message?: string;
  consent: true;
};

export type ContactChannels = {
  telegramHref: string | null;
  emailHref: string | null;
  apiConfigured: boolean;
};

export type TutorLeadDelivery = "api" | "telegram" | "email";

export type Review = {
  /** Reviewer name. */
  name: string;
  /** Exam the review is about, e.g. "ЕГЭ · профиль". */
  exam: string;
  text: string;
  /** Optional "before" level, only if the reviewer provided it. */
  before?: string;
  /** Optional "after" result, only if the reviewer provided it. */
  after?: string;
  /** Must be true; reviews without consent are never rendered. */
  consentGiven: boolean;
};

export type PricingInfo = {
  /** e.g. "от 2 000 ₽ за занятие". */
  from: string;
  /** e.g. "индивидуально, онлайн". */
  format?: string;
  /** e.g. "60 минут". */
  duration?: string;
  note?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
