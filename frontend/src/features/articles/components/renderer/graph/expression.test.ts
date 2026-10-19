import { describe, expect, it } from "vitest";

import {
  compileExpression,
  ExpressionError,
} from "@/features/articles/components/renderer/graph/expression";

function evaluate(
  expr: string,
  x: number,
  parameters: Record<string, number> = {},
  parameterIds: string[] = [],
): number {
  return compileExpression(expr, parameterIds).evaluate(x, parameters);
}

describe("compileExpression", () => {
  it("respects precedence and right-associative powers", () => {
    expect(evaluate("1 + 2 * 3", 0)).toBe(7);
    expect(evaluate("2 ^ 3 ^ 2", 0)).toBe(512);
    expect(evaluate("-2 ^ 2", 0)).toBe(-4);
    expect(evaluate("(1 + 2) * 3", 0)).toBe(9);
  });

  it("supports constants, functions and parameters", () => {
    expect(evaluate("sin(pi / 2)", 0)).toBeCloseTo(1);
    expect(evaluate("sqrt(9) + abs(-2)", 0)).toBe(5);
    expect(evaluate("ln(e)", 0)).toBeCloseTo(1);
    expect(evaluate("log2(8) + log10(100)", 0)).toBe(5);
    expect(evaluate("a * x ^ 2 + b", 2, { a: 1, b: 3 }, ["a", "b"])).toBe(7);
  });

  it("supports implicit multiplication", () => {
    expect(evaluate("2x", 3)).toBe(6);
    expect(evaluate("2(x + 1)", 3)).toBe(8);
    expect(evaluate("(x + 1)(x - 1)", 3)).toBe(8);
    expect(evaluate("2sin(pi / 2)", 0)).toBeCloseTo(2);
  });

  it("rejects unknown identifiers and arbitrary code", () => {
    expect(() => compileExpression("alert(1)")).toThrow(ExpressionError);
    expect(() => compileExpression("globalThis.__x")).toThrow(ExpressionError);
    expect(() => compileExpression("x; alert(1)")).toThrow(ExpressionError);
    expect(() => compileExpression("a", [])).toThrow(ExpressionError);
    expect(() => compileExpression("", [])).toThrow(ExpressionError);
  });

  it("rejects malformed expressions", () => {
    expect(() => compileExpression("1 +")).toThrow(ExpressionError);
    expect(() => compileExpression("(1 + 2", [])).toThrow(ExpressionError);
    expect(() => compileExpression("1 2 )", [])).toThrow(ExpressionError);
    expect(() => compileExpression("x".repeat(513), [])).toThrow(ExpressionError);
  });

  it("returns non-finite values for division by zero (plot skips them)", () => {
    expect(Number.isFinite(evaluate("1 / 0", 0))).toBe(false);
  });

  it("treats missing parameter values as NaN instead of throwing in the hot loop", () => {
    const compiled = compileExpression("a * x + b", ["a", "b"]);
    expect(compiled.evaluate(2, { a: 3 })).toBeNaN();
    expect(compiled.evaluate(2, { a: 3, b: 1 })).toBe(7);
  });
});
