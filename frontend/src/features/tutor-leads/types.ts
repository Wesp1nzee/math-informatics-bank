export type TutorLeadSubject = "matematika" | "informatika" | "both";

export type TutorLeadInput = {
  name: string;
  /** How to reach the applicant: telegram handle, email or phone. */
  contact: string;
  subject: TutorLeadSubject;
  message?: string;
  consent: true;
};

export type ContactChannels = {
  /** Ready-to-use https://t.me/... link, or null when not configured. */
  telegramHref: string | null;
  /** Ready-to-use mailto: link, or null when not configured. */
  emailHref: string | null;
  /** True when NEXT_PUBLIC_API_BASE_URL is set and a POST is possible. */
  apiConfigured: boolean;
};

export type TutorLeadDelivery = "api" | "telegram" | "email";
