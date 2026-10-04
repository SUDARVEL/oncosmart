/** Admin walk-through of the real onboarding screens. Does not reset progress. */
export function isOnboardingReview(from: string | string[] | undefined): boolean {
  if (Array.isArray(from)) return from.includes('review');
  return from === 'review';
}

export function onboardingReviewHref(path: string): string {
  return path.includes('?') ? `${path}&from=review` : `${path}?from=review`;
}
