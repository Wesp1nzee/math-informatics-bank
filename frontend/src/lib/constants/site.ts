/**
 * Central site configuration.
 *
 * Values that were placeholders in the original prototype (tutor name and
 * contacts) are read from the environment and are empty by default. UI must
 * not invent them — blocks that depend on missing data are hidden.
 */

function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

const tutorName = process.env.NEXT_PUBLIC_TUTOR_NAME?.trim() ?? "";
const tutorTelegram = process.env.NEXT_PUBLIC_TUTOR_TELEGRAM?.trim() ?? "";
const tutorEmail = process.env.NEXT_PUBLIC_TUTOR_EMAIL?.trim() ?? "";

export const siteConfig = {
  /** Fallback name used when no real tutor name is configured. */
  name: "Математика и информатика",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "ru_RU",
  description:
    "Бесплатный банк задач по математике и информатике с пошаговыми разборами. Индивидуальные занятия для подготовки к ОГЭ и ЕГЭ.",
  tutor: {
    name: tutorName,
    telegram: tutorTelegram,
    email: tutorEmail,
  },
} as const;

/** True when at least one real contact channel is configured. */
export const hasTutorContacts = tutorTelegram.length > 0 || tutorEmail.length > 0;

/** Header/footer brand. Falls back to the subject name, never to a fake person. */
export const brand: { text: string; accent: string } = tutorName
  ? { text: tutorName, accent: "." }
  : { text: "Математика", accent: "· Информатика" };

/** Turns "@username" or a full URL into a telegram link, or null when unset. */
export function telegramHref(value: string): string | null {
  const handle = value.trim();
  if (!handle) return null;
  if (/^https?:\/\//i.test(handle)) return handle;
  return `https://t.me/${handle.replace(/^@/, "")}`;
}

export function mailHref(value: string): string | null {
  const email = value.trim();
  return email ? `mailto:${email}` : null;
}
