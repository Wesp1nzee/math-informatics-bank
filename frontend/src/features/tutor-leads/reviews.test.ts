import { describe, expect, it } from "vitest";

import { selectPublishedReviews } from "@/features/tutor-leads/reviews";
import type { Review } from "@/features/tutor-leads/types";

const base: Omit<Review, "name" | "text" | "consentGiven"> = {
  exam: "ЕГЭ · профиль",
};

const withConsent: Review = {
  ...base,
  name: "A",
  text: "Понравилось.",
  consentGiven: true,
};

const withoutConsent: Review = {
  ...base,
  name: "B",
  text: "Тоже отзыв.",
  consentGiven: false,
};

const blank: Review = {
  ...base,
  name: "C",
  text: "   ",
  consentGiven: true,
};

describe("selectPublishedReviews", () => {
  it("keeps only consented reviews", () => {
    expect(selectPublishedReviews([withConsent, withoutConsent])).toEqual([
      withConsent,
    ]);
  });

  it("drops blank texts even with consent", () => {
    expect(selectPublishedReviews([blank])).toEqual([]);
  });

  it("returns an empty list for no reviews", () => {
    expect(selectPublishedReviews([])).toEqual([]);
  });
});
