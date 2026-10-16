export type AnswerKind = "number" | "text";

const MINUS_CHARS = /[−–—]/g;

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
