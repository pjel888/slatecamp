export interface SrsResult {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

export function calculateNextReview(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
): SrsResult {
  let newEF =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEF = Math.max(1.3, newEF);

  if (quality < 3) {
    return { interval: 1, easeFactor: newEF, repetitions: 0 };
  }

  let newInterval: number;
  if (repetitions === 0) newInterval = 1;
  else if (repetitions === 1) newInterval = 6;
  else newInterval = Math.round(interval * newEF);

  return {
    interval: newInterval,
    easeFactor: newEF,
    repetitions: repetitions + 1,
  };
}

export function getQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  confidence?: number | null
): number {
  if (!isCorrect) return 1;
  if (responseTimeMs < 5000 && (confidence ?? 0) >= 4) return 5;
  if (responseTimeMs < 10000) return 4;
  if (responseTimeMs < 20000) return 3;
  return 3;
}

export function getNextReviewDate(intervalDays: number): Date {
  const now = new Date();
  now.setTime(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return now;
}
