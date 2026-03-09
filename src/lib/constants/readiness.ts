/**
 * Readiness score thresholds, labels, and colors (Rams Standard: CSS variables).
 * Use these instead of hardcoded hex in ReadinessGauge and getReadinessScore.
 */

export const READINESS_THRESHOLDS = {
  EXAM_READY: 90,
  STRONG: 75,
  GETTING_THERE: 60,
  BUILDING_MOMENTUM: 40,
} as const;

export function getReadinessLabel(score: number): string {
  if (score >= READINESS_THRESHOLDS.EXAM_READY) return "Exam Ready";
  if (score >= READINESS_THRESHOLDS.STRONG) return "Strong";
  if (score >= READINESS_THRESHOLDS.GETTING_THERE) return "Getting There";
  if (score >= READINESS_THRESHOLDS.BUILDING_MOMENTUM) return "Building Momentum";
  return "Needs Work";
}

/** Returns a CSS variable for the readiness arc/color (Rams Standard). */
export function getReadinessColor(score: number): string {
  if (score >= READINESS_THRESHOLDS.EXAM_READY) return "var(--color-signal-green)";
  if (score >= READINESS_THRESHOLDS.STRONG) return "var(--color-signal-green)";
  if (score >= READINESS_THRESHOLDS.GETTING_THERE) return "var(--color-signal-green)";
  if (score >= READINESS_THRESHOLDS.BUILDING_MOMENTUM) return "var(--color-signal-amber)";
  return "var(--color-signal-red)";
}

/** CSS variable for delta increase (e.g. "+3"). */
export const READINESS_DELTA_POSITIVE = "var(--color-signal-green)";
/** CSS variable for delta decrease. */
export const READINESS_DELTA_NEGATIVE = "var(--color-signal-red)";
