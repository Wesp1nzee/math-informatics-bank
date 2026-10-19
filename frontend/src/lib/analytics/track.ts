export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export const ANALYTICS_EVENTS = {
  quizAnswer: "quiz_answer",
  taskAnswerAttempt: "task_answer_attempt",
  solutionOpen: "solution_open",
  ctaView: "cta_view",
  ctaClick: "cta_click",
  leadFormStart: "lead_form_start",
  leadFormSubmit: "lead_form_submit",
  leadFormError: "lead_form_error",
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

declare global {
  interface Window {
    ym?: (
      counterId: number,
      action: string,
      event: string,
      params?: AnalyticsParams,
    ) => void;
  }
}

const PRIVATE_KEYS = new Set([
  "name",
  "contact",
  "email",
  "phone",
  "message",
  "comment",
  "answer",
]);

const MAX_VALUE_LENGTH = 64;

function sanitize(params?: AnalyticsParams): AnalyticsParams | undefined {
  if (!params) return undefined;

  const clean: AnalyticsParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (PRIVATE_KEYS.has(key.toLowerCase())) continue;
    clean[key] = typeof value === "string" ? value.slice(0, MAX_VALUE_LENGTH) : value;
  }
  return clean;
}

export function isAnalyticsEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_YM_ID?.trim());
}

export function track(event: AnalyticsEvent, params?: AnalyticsParams): void {
  if (typeof window === "undefined") return;

  const rawId = process.env.NEXT_PUBLIC_YM_ID?.trim();
  if (!rawId) return;

  const counterId = Number(rawId);
  if (!Number.isFinite(counterId)) return;

  const ym = window.ym;
  if (typeof ym !== "function") return;

  ym(counterId, "reachGoal", event, sanitize(params));
}
