import { describe, expect, it } from "vitest";

import { parsePageParam, parseTaskFilters } from "@/features/tasks/search-params";

describe("parseTaskFilters", () => {
  it("reads valid filters", () => {
    expect(parseTaskFilters({ subject: "matematika", level: "hard" })).toEqual({
      subject: "matematika",
      level: "hard",
    });
  });

  it("uses the first value of a repeated parameter", () => {
    expect(parseTaskFilters({ subject: ["informatika", "matematika"] })).toEqual({
      subject: "informatika",
      level: undefined,
    });
  });

  it("ignores unknown values instead of failing", () => {
    expect(parseTaskFilters({ subject: "physics", level: "impossible" })).toEqual({
      subject: undefined,
      level: undefined,
    });
  });
});

describe("parsePageParam", () => {
  it("defaults to page 1 for missing, invalid or negative values", () => {
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-4")).toBe(1);
  });

  it("parses a valid page", () => {
    expect(parsePageParam("3")).toBe(3);
  });
});
