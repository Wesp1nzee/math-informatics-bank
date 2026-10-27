function normalizeSiteUrl(raw: string | undefined): string {
  const value = raw?.trim();
  if (!value) return "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

const tutorName = process.env.NEXT_PUBLIC_TUTOR_NAME?.trim() ?? "";
const tutorTelegram = process.env.NEXT_PUBLIC_TUTOR_TELEGRAM?.trim() ?? "";
const tutorEmail = process.env.NEXT_PUBLIC_TUTOR_EMAIL?.trim() ?? "";
const tutorPhoto = process.env.NEXT_PUBLIC_TUTOR_PHOTO?.trim() ?? "";
const tutorVideo = process.env.NEXT_PUBLIC_TUTOR_VIDEO?.trim() ?? "";
const tutorAbout = process.env.NEXT_PUBLIC_TUTOR_ABOUT?.trim() ?? "";

export const siteConfig = {
  name: "ОСНОВА",
  tagline: "Математика и информатика",
  url: normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  locale: "ru_RU",
  description:
    "Бесплатный банк задач по математике и информатике с пошаговыми разборами. Индивидуальные занятия для подготовки к ОГЭ и ЕГЭ.",
  tutor: {
    name: tutorName,
    telegram: tutorTelegram,
    email: tutorEmail,
    photo: tutorPhoto,
    video: tutorVideo,
    about: tutorAbout,
  },
} as const;

export const hasTutorContacts = tutorTelegram.length > 0 || tutorEmail.length > 0;

export const hasTutorProfile = tutorName.length > 0 && tutorAbout.length > 0;

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
