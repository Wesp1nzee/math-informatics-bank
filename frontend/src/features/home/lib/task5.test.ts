import { describe, expect, it } from "vitest";

import {
  countOnes,
  highlightPython,
  rOf,
  solveTask5,
  TASK5_CODE,
  TASK5_SOLUTION,
} from "@/features/home/lib/task5";

describe("rOf", () => {
  it("reproduces the program from the statement", () => {
    expect(rOf(1)).toBe(6);
    expect(rOf(21)).toBe(86);
  });

  it("always produces an even number (second appended bit is 0)", () => {
    for (let n = 1; n <= 40; n += 1) {
      expect(rOf(n) % 2).toBe(0);
    }
  });
});

describe("solveTask5", () => {
  it("finds the first R greater than 83 at N = 21", () => {
    const runs = solveTask5();
    const last = runs.at(-1);
    expect(last).toEqual({
      n: TASK5_SOLUTION.n,
      binary: "10101",
      r: TASK5_SOLUTION.r,
      hit: true,
    });
    expect(runs).toHaveLength(TASK5_SOLUTION.n);
    expect(runs.filter((run) => run.hit)).toHaveLength(1);
  });

  it("never reports a hit for R <= 83", () => {
    for (const run of solveTask5()) {
      if (!run.hit) expect(run.r).toBeLessThanOrEqual(83);
    }
  });
});

describe("countOnes", () => {
  it("counts bits in a binary string", () => {
    expect(countOnes("10101")).toBe(3);
    expect(countOnes("0000")).toBe(0);
    expect(countOnes("1111")).toBe(4);
  });
});

describe("highlightPython", () => {
  it("escapes HTML before adding markup", () => {
    expect(highlightPython("while r(n) <= 83:")).toContain("&lt;=");
  });

  it("marks keywords, builtins, strings, numbers and comments", () => {
    expect(highlightPython("def r(n):")).toContain('class="tok-keyword"');
    expect(highlightPython("print(r(n))  # 86")).toContain('class="tok-comment"');
    expect(highlightPython("s = bin(n)[2:]")).toContain('class="tok-fn"');
    expect(highlightPython("s += str(s.count('1') % 2)")).toContain(
      'class="tok-string"',
    );
  });

  it("covers every line of the demo program", () => {
    for (const line of TASK5_CODE) {
      expect(() => highlightPython(line)).not.toThrow();
    }
  });
});
