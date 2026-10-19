const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_USERNAME = "[A-Za-z][A-Za-z0-9_]{4,31}";
const TELEGRAM_RE = new RegExp(
  `^(?:@?${TELEGRAM_USERNAME}|(?:https?://)?(?:www\\.)?t\\.me/${TELEGRAM_USERNAME}/?)$`,
);

export const CONTACT_FORMAT_MESSAGE = "Укажите Telegram, телефон или e-mail";
export const CONTACT_MAX_LENGTH = 256;

/** Mirrors the backend rule: e-mail, Telegram username/link, or a 10–15 digit phone. */
export function isValidContact(value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned) return false;

  if (cleaned.includes("@") && !cleaned.startsWith("@") && EMAIL_RE.test(cleaned)) {
    return true;
  }

  if (TELEGRAM_RE.test(cleaned)) return true;

  const digits = cleaned.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
