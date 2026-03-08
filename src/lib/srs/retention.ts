/**
 * Ebbinghaus-style retention estimate: R(t) = e^(-t / S)
 * t = days since last review, S = stability (interval_days from SM-2).
 * Returns 0–1 (use * 100 for percentage).
 */
export function retentionAfterDays(
  daysSinceLastReview: number,
  intervalDays: number
): number {
  if (intervalDays <= 0) return 0;
  return Math.exp(-daysSinceLastReview / intervalDays);
}

export function formatRetentionPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
