export type TutorLeadSubject = "matematika" | "informatika" | "both";
export type TutorLeadExam = "oge" | "ege" | "other";

export type TutorLeadInput = {
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
  name: string;

  exam: string;
  text: string;

  before?: string;

  after?: string;

  consentGiven: boolean;
};

export type PricingInfo = {
  from: string;

  format?: string;

  duration?: string;
  note?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
