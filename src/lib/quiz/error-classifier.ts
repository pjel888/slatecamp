import type { ErrorCategory, ErrorDiagnostic } from '@/types/quiz-config'

export type ErrorClassification = ErrorDiagnostic
export type { ErrorCategory }

export const LUCKY_GUESS_DIAGNOSTIC: ErrorClassification = {
  category: 'lucky_guess',
  confidence: 0.8,
  message: 'You got this right very quickly. Review the rationale once so the answer sticks.',
}

export const classifyError = (
  timeSpentMs: number,
  medianTimeMs: number,
  isCorrect: boolean,
  hasHistory: boolean,
  _totalAttempts: number,
): ErrorClassification | null => {
  if (isCorrect) return null

  if (medianTimeMs <= 0) {
    return {
      category: 'knowledge_gap',
      confidence: 0.3,
      message: 'This topic is new territory. Start with the Wiki article to build a foundation.',
    }
  }

  const timeRatio = timeSpentMs / medianTimeMs

  if (timeRatio < 0.4) {
    return {
      category: 'random_guess',
      confidence: 0.8,
      message: 'Looks like you moved quickly on this one. Take a moment with the rationale.',
    }
  }

  if (!hasHistory && timeRatio > 1.2) {
    return {
      category: 'knowledge_gap',
      confidence: 0.6,
      message: 'This topic is new territory. Start with the Wiki article to build a foundation.',
    }
  }

  if (hasHistory && timeRatio >= 0.4 && timeRatio <= 1.5) {
    return {
      category: 'misremembered_fact',
      confidence: 0.5,
      message: 'You had the right idea but the specific detail was off.',
    }
  }

  if (timeRatio > 2.0) {
    return {
      category: 'computation_error',
      confidence: 0.4,
      message: 'Your work was on the right track. Double-check the calculation steps.',
    }
  }

  return {
    category: 'knowledge_gap',
    confidence: 0.3,
    message: 'This topic is new territory. Start with the Wiki article to build a foundation.',
  }
}
