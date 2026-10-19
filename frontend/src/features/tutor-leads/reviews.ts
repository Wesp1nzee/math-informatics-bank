import type { Review } from "@/features/tutor-leads/types";

export function selectPublishedReviews(reviews: readonly Review[]): Review[] {
  return reviews.filter(
    (review) => review.consentGiven && review.text.trim().length > 0,
  );
}
