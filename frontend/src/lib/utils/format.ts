/** Russian plural form helper: 1 задача / 2 задачи / 5 задач. */
export function pluralize(
  count: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function formatMinutes(minutes: number): string {
  return `~${minutes} ${pluralize(minutes, "минута", "минуты", "минут")}`;
}

export function formatTaskCount(count: number): string {
  return `${count} ${pluralize(count, "задача", "задачи", "задач")}`;
}

export function formatArticleCount(count: number): string {
  return `${count} ${pluralize(count, "статья", "статьи", "статей")}`;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** ISO date → "10 февраля 2026 г." */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return DATE_FORMATTER.format(date);
}
