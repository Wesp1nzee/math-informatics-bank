import { describe, expect, it } from "vitest";

import { isAnswerCorrect, normalizeAnswer } from "@/lib/utils/check-answer";

describe("normalizeAnswer", () => {
  it("strips whitespace and a leading plus for numbers", () => {
    expect(normalizeAnswer("  +12 ", "number")).toBe("12");
  });

  it("accepts a comma as a decimal separator", () => {
    expect(normalizeAnswer("3,5", "number")).toBe("3.5");
  });

  it("normalizes every unicode minus to an ascii hyphen", () => {
    expect(normalizeAnswer("−7", "number")).toBe("-7");
    expect(normalizeAnswer("–7", "number")).toBe("-7");
  });

  it("drops leading zeros but keeps the sign", () => {
    expect(normalizeAnswer("007", "number")).toBe("7");
    expect(normalizeAnswer("-0.5", "number")).toBe("-0.5");
  });

  it("collapses whitespace for text answers", () => {
    expect(normalizeAnswer("  a   b  ", "text")).toBe("a b");
  });
});

describe("isAnswerCorrect", () => {
  it("matches the exact numeric answer", () => {
    expect(isAnswerCorrect("3", "3", "number")).toBe(true);
  });

  it("matches numeric equivalences", () => {
    expect(isAnswerCorrect("3,0", "3", "number")).toBe(true);
    expect(isAnswerCorrect(" 3 ", "3", "number")).toBe(true);
  });

  it("rejects a wrong numeric answer", () => {
    expect(isAnswerCorrect("12", "3", "number")).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(isAnswerCorrect("   ", "3", "number")).toBe(false);
  });

  it("is case-insensitive for text answers", () => {
    expect(isAnswerCorrect("Да", "да", "text")).toBe(true);
  });
});
