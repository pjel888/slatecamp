// ─── Wrong Answer Taxonomy: Error Classifier ─────────────────────────────────
// Classifies incorrect answers into pedagogical categories based on
// behavioral signals (time, history, attempts). No shame language.

export type ErrorCategory =
  | 'concept_confusion'
  | 'misremembered_fact'
  | 'computation_error'
  | 'misread_question'
  | 'random_guess'
  | 'knowledge_gap'

export interface ErrorClassification {
  category: ErrorCategory
  confidence: number // 0–1
  message: string // Student-facing coaching message (growth-framed)
}

/**
 * Classify a wrong answer into a pedagogical error category.
 * Returns null for correct answers — there's no error to classify.
 */
export const classifyError = (
  timeSpentMs: number,
  medianTimeMs: number,
  isCorrect: boolean,
  hasHistory: boolean,
  _totalAttempts: number,
): ErrorClassification | null => {
  if (isCorrect) return null

  // Guard against division by zero — treat 0 median as "no data" and
  // fall through to the knowledge_gap default.
  if (medianTimeMs <= 0) {
    return {
      category: 'knowledge_gap',
      confidence: 0.3,
      message: 'This topic is new territory. Start with the Wiki article to build a foundation.',
    }
  }

  const timeRatio = timeSpentMs / medianTimeMs

  // Very fast answer → likely random guess
  if (timeRatio < 0.4) {
    return {
      category: 'random_guess',
      confidence: 0.8,
      message: 'Looks like you moved quickly on this one. Take a moment with the rationale.',
    }
  }

  // No prior history + slow → knowledge gap
  if (!hasHistory && timeRatio > 1.2) {
    return {
      category: 'knowledge_gap',
      confidence: 0.6,
      message: 'This topic is new territory. Start with the Wiki article to build a foundation.',
    }
  }

  // Has history + normal-to-moderate time → misremembered fact
  if (hasHistory && timeRatio >= 0.4 && timeRatio <= 1.5) {
    return {
      category: 'misremembered_fact',
      confidence: 0.5,
      message: 'You had the right idea but the specific detail was off.',
    }
  }

  // Very slow → computation / process error
  if (timeRatio > 2.0) {
    return {
      category: 'computation_error',
      confidence: 0.4,
      message: 'Your work was on the right track. Double-check the calculation steps.',
    }
  }

  // Default fallback
  return {
    category: 'knowledge_gap',
    confidence: 0.3,
    message: 'This topic is new territory. Start with the Wiki article to build a foundation.',
  }
}
