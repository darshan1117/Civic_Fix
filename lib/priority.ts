export const UPVOTE_WEIGHT = 2.5;
export const AGE_DAYS_WEIGHT = 1.5;
export const SEVERITY_MULTIPLIER = 3.0;

export interface PriorityParams {
  upvoteCount: number;
  createdAt: string | Date;
  categorySeverity: number; // 1 to 10
  currentTime?: Date;
}

/**
 * Pure function to calculate dynamic priority score:
 * (upvotes × weight) + (age in days × weight) + (category severity × weight)
 */
export function calculatePriorityScore({
  upvoteCount,
  createdAt,
  categorySeverity,
  currentTime = new Date(),
}: PriorityParams): number {
  const safeUpvotes = Math.max(0, upvoteCount || 0);
  const safeSeverity = Math.min(10, Math.max(1, categorySeverity || 5));

  const createdTime = new Date(createdAt).getTime();
  const now = currentTime.getTime();
  const ageMs = Math.max(0, now - createdTime);
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  const score =
    safeUpvotes * UPVOTE_WEIGHT +
    ageDays * AGE_DAYS_WEIGHT +
    safeSeverity * SEVERITY_MULTIPLIER;

  return Math.round(score * 100) / 100;
}
