// Temporal acceptance window per quiz mode — Claim 15
// Server-side config: values will be refined from real gesture data
// These are initial calibration values, NOT hardcoded final thresholds

import type { QuizMode } from '@/types/quiz-config'
import type { TemporalBounds } from '@/types/patent'

/**
 * Acceptable gesture duration range per quiz mode.
 * Below minimum = accidental/programmatic. Above maximum = abandoned/abnormal.
 * Sweet spot for deliberate gestures: 300-2000ms.
 */
export const TEMPORAL_BOUNDS: Record<QuizMode, TemporalBounds> = {
  camp:           { minMs: 200, maxMs: 10000 },
  chill:          { minMs: 200, maxMs: 15000 },  // most relaxed
  subject:        { minMs: 200, maxMs: 10000 },
  focused:        { minMs: 200, maxMs: 10000 },
  custom:         { minMs: 200, maxMs: 10000 },
  storm:          { minMs: 150, maxMs: 5000 },   // tighter for exam mode
  fullexam:       { minMs: 150, maxMs: 5000 },
  extended:       { minMs: 150, maxMs: 8000 },
  article_review: { minMs: 200, maxMs: 10000 },
}

/** Check if a gesture duration falls within acceptable bounds for the given mode */
export const isWithinTemporalBounds = (
  durationMs: number,
  mode: QuizMode,
): { withinBounds: boolean; bounds: TemporalBounds } => {
  const bounds = TEMPORAL_BOUNDS[mode]
  return {
    withinBounds: durationMs >= bounds.minMs && durationMs <= bounds.maxMs,
    bounds,
  }
}
