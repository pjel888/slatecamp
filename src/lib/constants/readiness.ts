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
  return "Keep Practicing";
}

/** Returns a CSS variable for the readiness arc/color (Campfire: ≥70 success, ≥40 warning, <40 danger). */
export function getReadinessColor(score: number): string {
  if (score >= 70) return "var(--success)";
  if (score >= 40) return "var(--warning)";
  return "var(--danger)";
}

/** CSS variable for delta increase (e.g. "+3"). */
export const READINESS_DELTA_POSITIVE = "var(--success)";
/** CSS variable for delta decrease. */
export const READINESS_DELTA_NEGATIVE = "var(--danger)";
