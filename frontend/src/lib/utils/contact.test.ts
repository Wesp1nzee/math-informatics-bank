import { describe, expect, it } from "vitest";

import { isValidContact } from "@/lib/utils/contact";

describe("isValidContact", () => {
  it.each(["@ivan_petrov", "ivan_petrov", "https://t.me/ivan_petrov", "+7 (999) 123-45-67", "a@b.co"])(
    "accepts %s",
    (contact) => {
      expect(isValidContact(contact)).toBe(true);
    },
  );

  it.each(["abc", "@a", "12345", "a@", "@@@@@"])("rejects %s", (contact) => {
    expect(isValidContact(contact)).toBe(false);
  });
});
