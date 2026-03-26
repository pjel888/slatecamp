// ─── Progressive Pressure Ladder Configuration ───────────────────────────────
// IMPL_08: Maps readiness score thresholds to four pressure levels,
// each controlling timer behavior, score visibility, and feedback timing.

export type PressureLevel = 0 | 1 | 2 | 3

export type PressureTimerMode = 'none' | 'count_up' | 'countdown'
export type PressurePerQuestionLimit = null | 'soft_warning' | 'hard_skip'
export type PressureFeedbackTiming = 'immediate' | 'end_of_session' | 'delayed_24h'

export interface PressureLevelConfig {
  name: string
  description: string
  timer: PressureTimerMode
  perQuestionLimit: PressurePerQuestionLimit
  scoreVisible: boolean
  feedbackTiming: PressureFeedbackTiming
}

export const PRESSURE_LEVELS: Record<PressureLevel, PressureLevelConfig> = {
  0: {
    name: 'Learning',
    description: 'No timer, instant feedback. Focus on understanding.',
    timer: 'none',
    perQuestionLimit: null,
    scoreVisible: false,
    feedbackTiming: 'immediate',
  },
  1: {
    name: 'Awareness',
    description: 'Count-up timer so you can observe your pacing.',
    timer: 'count_up',
    perQuestionLimit: null,
    scoreVisible: true,
    feedbackTiming: 'immediate',
  },
  2: {
    name: 'Pacing',
    description: 'Countdown timer with gentle pacing nudges.',
    timer: 'countdown',
    perQuestionLimit: 'soft_warning',
    scoreVisible: true,
    feedbackTiming: 'end_of_session',
  },
  3: {
    name: 'Exam',
    description: 'Full exam conditions. Results after 24 hours.',
    timer: 'countdown',
    perQuestionLimit: 'hard_skip',
    scoreVisible: false,
    feedbackTiming: 'delayed_24h',
  },
} as const

// ─── Unlock thresholds ───────────────────────────────────────────────────────
// RS >= 65 → Level 3 (Exam)
// RS >= 55 → Level 2 (Pacing)
// RS >= 40 → Level 1 (Awareness)
// Default  → Level 0 (Learning)

export const getUnlockedPressureLevel = (readinessScore: number): PressureLevel => {
  if (readinessScore >= 65) return 3
  if (readinessScore >= 55) return 2
  if (readinessScore >= 40) return 1
  return 0
}

// ─── Median time per question by difficulty (ms) ─────────────────────────────
// Used by PacingNudge to determine when a student is spending too long.
// These are baseline medians; a real implementation would use per-user history.

export const MEDIAN_TIME_BY_DIFFICULTY: Record<string, number> = {
  Easy: 45_000,
  Medium: 72_000,
  Hard: 90_000,
}

export const getMedianTimeForDifficulty = (difficultyLabel: string): number =>
  MEDIAN_TIME_BY_DIFFICULTY[difficultyLabel] ?? 72_000
