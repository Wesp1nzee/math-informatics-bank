import type { Review } from "@/features/tutor-leads/types";

/**
 * Reviews may only be published with explicit consent. Kept as a pure function
 * so the filtering rule is covered by a unit test and cannot be bypassed in the
 * component.
 */
export function selectPublishedReviews(reviews: readonly Review[]): Review[] {
  return reviews.filter((review) => review.consentGiven && review.text.trim().length > 0);
}
