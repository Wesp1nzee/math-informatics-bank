export type AnswerKind = "number" | "text";

const MINUS_CHARS = /[−–—]/g;

/**
 * Normalizes a free-form answer before comparison.
 *
 * - accepts `,` and `.` as decimal separators;
 * - accepts any unicode minus, `-` and a leading `+`;
 * - ignores whitespace and a trailing `.0`.
 *
 * This is intentionally forgiving: a student should not lose a point over
 * formatting, only over a wrong value.
 */
export function normalizeAnswer(value: string, kind: AnswerKind): string {
  let result = value.trim().toLowerCase().replace(MINUS_CHARS, "-");

  if (kind === "number") {
    result = result.replace(/\s+/g, "").replace(/,/g, ".").replace(/^\+/, "");
    result = result.replace(/^(-?)0+(?=\d)/, "$1");
    result = result.replace(/\.0+$/, "");
  } else {
    result = result.replace(/\s+/g, " ");
  }

  return result;
}

export function isAnswerCorrect(
  input: string,
  expected: string,
  kind: AnswerKind,
): boolean {
  const actual = normalizeAnswer(input, kind);
  if (!actual) return false;

  const target = normalizeAnswer(expected, kind);
  if (actual === target) return true;

  if (kind === "number") {
    const a = Number(actual);
    const b = Number(target);
    if (Number.isFinite(a) && Number.isFinite(b)) {
      return Math.abs(a - b) < 1e-9;
    }
  }

  return false;
}
