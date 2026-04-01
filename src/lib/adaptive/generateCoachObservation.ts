// src/lib/adaptive/generateCoachObservation.ts
// Patent Claims 22, 23, 24 — Adaptive feedback generation
// SERVER-ONLY — generates insights from behavioral analysis

import 'server-only'
import type {
  CognitiveStateIndicators,
  ConfidenceClassification,
  CoachObservation,
  SessionBehavioralSummary,
} from '@/types/patent'

// ─── Confidence × Correctness Matrix (Claim 22) ─────────────────────────────
//
//                     Correct         Incorrect
// High Confidence    ✅ Mastery      ⚠️ Overconfidence
// Low Confidence     🔍 Fragile     📌 Blindspot

type QuadrantLabel = 'mastery' | 'overconfidence' | 'fragile' | 'blindspot'

function classifyQuadrant(
  confidence: ConfidenceClassification,
  isCorrect: boolean,
): QuadrantLabel {
  const isHighConf = confidence === 'high' || confidence === 'moderate'
  if (isHighConf && isCorrect) return 'mastery'
  if (isHighConf && !isCorrect) return 'overconfidence'
  if (!isHighConf && isCorrect) return 'fragile'
  return 'blindspot'
}

// ─── Coach Observation Generator ─────────────────────────────────────────────

interface ItemResult {
  questionId: string
  topicName: string
  isCorrect: boolean
  confidence: ConfidenceClassification
}

/**
 * Generate a coach-voiced behavioral observation for the student.
 *
 * Rules (from patent UX plan):
 * - Never use word "confidence" as metric label
 * - Always pair observation with actionable next step
 * - Max 4 sentences
 * - Only surface when signal is strong
 * - Never surface integrity flags to student
 * - Frame hesitation as useful information, not weakness
 */
export function generateCoachObservation(
  items: ItemResult[],
): CoachObservation | null {
  if (items.length < 5) {
    return null // Insufficient signal for meaningful observation
  }

  const quadrants = items.map((item) => ({
    ...item,
    quadrant: classifyQuadrant(item.confidence, item.isCorrect),
  }))

  const mastery = quadrants.filter((q) => q.quadrant === 'mastery')
  const overconfident = quadrants.filter((q) => q.quadrant === 'overconfidence')
  const fragile = quadrants.filter((q) => q.quadrant === 'fragile')
  const blindspots = quadrants.filter((q) => q.quadrant === 'blindspot')

  // Determine signal strength
  const totalClassified = items.length
  const strongSignalThreshold = 0.6 // At least 60% of items have clear classification
  const classifiedCount = mastery.length + overconfident.length + fragile.length + blindspots.length
  const signalStrength: CoachObservation['signalStrength'] =
    classifiedCount / totalClassified >= strongSignalThreshold
      ? 'strong'
      : classifiedCount / totalClassified >= 0.3
        ? 'moderate'
        : 'insufficient'

  if (signalStrength === 'insufficient') return null

  // Build observation message (coach voice)
  const lines: string[] = []
  const recommendations: CoachObservation['recommendations'] = []

  // Celebrate mastery
  if (mastery.length >= 3) {
    const topics = [...new Set(mastery.map((m) => m.topicName))].slice(0, 2)
    lines.push(
      `You were decisive on ${mastery.length} items and got ${mastery.filter((m) => m.isCorrect).length} right — strong signal.`,
    )
    topics.forEach((t) => recommendations.push({ topicName: t, action: 'celebrate' }))
  }

  // Flag overconfidence (the most dangerous quadrant)
  if (overconfident.length >= 2) {
    const topics = [...new Set(overconfident.map((o) => o.topicName))].slice(0, 2)
    lines.push(
      `On ${overconfident.length} items, you moved quickly but the answer wasn't right. Worth a closer look.`,
    )
    topics.forEach((t) => recommendations.push({ topicName: t, action: 'revisit' }))
  }

  // Surface fragile knowledge
  if (fragile.length >= 2) {
    const topics = [...new Set(fragile.map((f) => f.topicName))].slice(0, 2)
    lines.push(
      `You hesitated on some items but still got them right — your instinct is good, but the knowledge feels shaky.`,
    )
    topics.forEach((t) => recommendations.push({ topicName: t, action: 'reinforce' }))
  }

  // Blindspots
  if (blindspots.length >= 2) {
    const topics = [...new Set(blindspots.map((b) => b.topicName))].slice(0, 2)
    lines.push(
      `There are ${blindspots.length} items where you were unsure and got them wrong — these are your growth areas.`,
    )
    topics.forEach((t) => recommendations.push({ topicName: t, action: 'revisit' }))
  }

  // Fallback if no strong pattern
  if (lines.length === 0) {
    return null
  }

  // Cap at 4 sentences
  const message = lines.slice(0, 4).join(' ')

  return { message, recommendations, signalStrength }
}

// ─── Session Behavioral Summary (Claim 24) ───────────────────────────────────

/**
 * Generate aggregate session behavioral summary for admin review.
 * Stored in session_behavioral_summaries table.
 */
export function generateSessionSummary(
  items: Array<{
    questionId: string
    indicators: CognitiveStateIndicators
  }>,
): SessionBehavioralSummary {
  const itemConfidenceLevels: Record<string, ConfidenceClassification> = {}
  let consistencySum = 0
  let engagementSum = 0
  let cageFailures = 0
  let temporalAnomalies = 0
  let behavioralAnomalies = 0

  for (const item of items) {
    itemConfidenceLevels[item.questionId] = item.indicators.decisionConfidence

    // Consistency: inverse of hesitancy (low hesitancy = high consistency)
    consistencySum += 1 - item.indicators.hesitancyIndex

    // Engagement: inverse of anomalous behavior (low anomaly = high engagement)
    engagementSum += 1 - item.indicators.anomalousBehaviorLikelihood

    // Flag counts
    if (item.indicators.anomalousBehaviorLikelihood > 0.7) behavioralAnomalies++
    if (item.indicators.hesitancyIndex > 0.8) temporalAnomalies++
  }

  const count = Math.max(1, items.length)

  return {
    itemConfidenceLevels,
    sessionConsistencyScore: consistencySum / count,
    sessionEngagementScore: engagementSum / count,
    integrityFlags: {
      cageFailures,
      temporalAnomalies,
      behavioralAnomalies,
    },
  }
}

// ─── Disengagement Detection (Claim 23) ──────────────────────────────────────

const CONSECUTIVE_LOW_ENGAGEMENT_THRESHOLD = 5

/**
 * Check if a disengagement intervention should be triggered.
 * Only fires after 5+ consecutive low-engagement items.
 * Max 1 intervention per session.
 */
export function shouldTriggerIntervention(
  recentIndicators: CognitiveStateIndicators[],
  interventionAlreadyFired: boolean,
): boolean {
  if (interventionAlreadyFired) return false
  if (recentIndicators.length < CONSECUTIVE_LOW_ENGAGEMENT_THRESHOLD) return false

  const lastN = recentIndicators.slice(-CONSECUTIVE_LOW_ENGAGEMENT_THRESHOLD)
  return lastN.every(
    (ind) =>
      ind.decisionConfidence === 'guessing' ||
      (ind.anomalousBehaviorLikelihood > 0.5 && ind.hesitancyIndex < 0.1),
  )
}
