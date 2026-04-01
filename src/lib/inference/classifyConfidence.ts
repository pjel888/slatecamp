// src/lib/inference/classifyConfidence.ts
// CONFIDENTIAL — Trade Secret. Patent Claims 1(g), 11.
// Rule-based confidence classifier — ships before ML model.
// Thresholds derived from internal testing. NEVER expose externally.
// SERVER-ONLY

import './server-only-guard'
import type {
  BehavioralFeatureVector,
  CognitiveStateIndicators,
  ConfidenceClassification,
} from '@/types/patent'

// ─── Threshold Constants (Trade Secret) ──────────────────────────────────────
// These are initial calibration values. Will be refined from real gesture data.
// DO NOT document in public materials.

const VELOCITY_DELIBERATE_MIN = 0.0005
const VELOCITY_DELIBERATE_MAX = 0.05
const VELOCITY_GUESSING_MIN = 0.08      // Very fast → likely guessing
const PATH_DEVIATION_HIGH = 0.15         // High deviation → hesitancy
const REVERSAL_HIGH = 5                  // Many direction changes → uncertainty
const PAUSE_COUNT_HIGH = 3               // Multiple pauses → cognitive load
const TEMPORAL_GUESSING_MAX_MS = 250     // Sub-250ms → reflexive, not deliberate
const TEMPORAL_HESITANT_MIN_MS = 3000    // Over 3s → extended hesitation
const JERK_SMOOTH_MAX = 0.001           // Low jerk → smooth motor control → confidence

// ─── Confidence Classification (Claim 11) ────────────────────────────────────

/**
 * Classify decision confidence from behavioral feature vector.
 *
 * Discrete levels: high, moderate, low, guessing
 *
 * Rule-based Phase 4a implementation. Will be replaced by ML model
 * in Phase 4b after sufficient labeled training data is collected.
 */
function classifyDecisionConfidence(
  features: BehavioralFeatureVector,
): ConfidenceClassification {
  const { velocityProfile, pathDeviation, reversalCount, temporalMetric, micropatterns } = features

  // Guessing detection: extremely fast, minimal engagement
  if (
    temporalMetric < TEMPORAL_GUESSING_MAX_MS ||
    velocityProfile.mean > VELOCITY_GUESSING_MIN
  ) {
    return 'guessing'
  }

  // High confidence: smooth, direct, deliberate
  if (
    velocityProfile.isDeliberate &&
    pathDeviation < PATH_DEVIATION_HIGH * 0.5 &&
    reversalCount <= 1 &&
    micropatterns.pauseCount === 0 &&
    features.jerkMetric < JERK_SMOOTH_MAX
  ) {
    return 'high'
  }

  // Low confidence: hesitant, erratic, many pauses/reversals
  if (
    pathDeviation > PATH_DEVIATION_HIGH ||
    reversalCount > REVERSAL_HIGH ||
    micropatterns.pauseCount > PAUSE_COUNT_HIGH ||
    temporalMetric > TEMPORAL_HESITANT_MIN_MS
  ) {
    return 'low'
  }

  // Default: moderate
  return 'moderate'
}

// ─── Hesitancy Index ─────────────────────────────────────────────────────────

/**
 * 0-1 continuous hesitancy measure.
 * Combines reversal count, pause count, temporal duration, and path deviation.
 */
function computeHesitancyIndex(features: BehavioralFeatureVector): number {
  const reversalFactor = Math.min(1, features.reversalCount / (REVERSAL_HIGH * 2))
  const pauseFactor = Math.min(1, features.micropatterns.pauseCount / (PAUSE_COUNT_HIGH * 2))
  const temporalFactor = Math.min(1, features.temporalMetric / (TEMPORAL_HESITANT_MIN_MS * 2))
  const deviationFactor = Math.min(1, features.pathDeviation / (PATH_DEVIATION_HIGH * 2))

  // Weighted combination
  return (
    reversalFactor * 0.3 +
    pauseFactor * 0.25 +
    temporalFactor * 0.25 +
    deviationFactor * 0.2
  )
}

// ─── Cognitive Load Proxy ────────────────────────────────────────────────────

/**
 * 0-1 proxy for cognitive load from behavioral signals.
 * High jerk + high velocity variance + assessment context difficulty.
 */
function computeCognitiveLoadProxy(features: BehavioralFeatureVector): number {
  const jerkFactor = Math.min(1, features.jerkMetric / (JERK_SMOOTH_MAX * 10))
  const velocityVarianceFactor = Math.min(
    1,
    features.velocityProfile.stdDev / (features.velocityProfile.mean || 1),
  )
  const difficultyFactor = features.assessmentContext.itemDifficulty // Already 0-1
  const answerChangeFactor = Math.min(1, features.assessmentContext.answerChangeCount / 5)

  return (
    jerkFactor * 0.25 +
    velocityVarianceFactor * 0.25 +
    difficultyFactor * 0.3 +
    answerChangeFactor * 0.2
  )
}

// ─── Anomalous Behavior Likelihood ───────────────────────────────────────────

/**
 * 0-1 likelihood of anomalous behavior pattern.
 * Flags: extremely fast submissions, zero engagement, burst patterns.
 */
function computeAnomalousBehaviorLikelihood(features: BehavioralFeatureVector): number {
  let score = 0

  // Extremely fast (programmatic?)
  if (features.temporalMetric < 100) score += 0.4
  else if (features.temporalMetric < 200) score += 0.2

  // Zero path deviation (robotic straight line)
  if (features.pathDeviation < 0.001 && features.interactionPathMetric > 0) score += 0.2

  // Velocity bursts (automated tool)
  if (features.micropatterns.burstCount > 3) score += 0.2

  // No pressure data when expected (emulated touch)
  if (!features.pressureProfile.available && features.temporalMetric > 0) score += 0.1

  // Perfectly consistent velocity (inhuman smoothness)
  if (features.velocityProfile.stdDev < 0.00001 && features.velocityProfile.mean > 0) score += 0.1

  return Math.min(1, score)
}

// ─── Main Export ─────────────────────────────────────────────────────────────

/**
 * Compute all cognitive state indicators from a behavioral feature vector.
 *
 * This is the Phase 4a rule-based engine. It ships first to begin
 * collecting labeled data for the Phase 4b ML model.
 *
 * Labels for future ML training:
 * - Self-reported confidence (post-item survey)
 * - Answer correctness correlation
 * - Admin review flags
 */
export function classifyBehavioralState(
  features: BehavioralFeatureVector,
): CognitiveStateIndicators {
  return {
    decisionConfidence: classifyDecisionConfidence(features),
    hesitancyIndex: computeHesitancyIndex(features),
    cognitiveLoadProxy: computeCognitiveLoadProxy(features),
    anomalousBehaviorLikelihood: computeAnomalousBehaviorLikelihood(features),
    identityConsistencyScore: null, // Populated later by profile comparison (Claim 13)
  }
}
