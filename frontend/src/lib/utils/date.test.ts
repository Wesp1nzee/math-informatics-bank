import { describe, expect, it } from "vitest";

import { toValidDate } from "@/lib/utils/date";

describe("toValidDate", () => {
  it("returns the parsed date for a valid ISO value", () => {
    expect(toValidDate("2026-01-15")?.toISOString()).toBe("2026-01-15T00:00:00.000Z");
  });

  it("returns undefined for null or undefined", () => {
    expect(toValidDate(null)).toBeUndefined();
    expect(toValidDate(undefined)).toBeUndefined();
  });

  it("returns undefined for an invalid value", () => {
    expect(toValidDate("not-a-date")).toBeUndefined();
  });
});
