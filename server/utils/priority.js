export const UPVOTE_WEIGHT = 2.5;
export const AGE_DAYS_WEIGHT = 1.5;
export const SEVERITY_MULTIPLIER = 3.0;

export function calculatePriorityScore({
  upvoteCount = 0,
  createdAt = new Date(),
  categorySeverity = 5,
  currentTime = new Date(),
}) {
  const safeUpvotes = Math.max(0, Number(upvoteCount) || 0);
  const safeSeverity = Math.min(10, Math.max(1, Number(categorySeverity) || 5));

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
