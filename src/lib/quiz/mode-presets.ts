// ─── Quiz Engine v2: Mode Preset Configs ────────────────────────────────────
// Source: Doc 3 §3.1 — Default configs for each quiz mode
// These are merged with user overrides in startSession

import type { QuizSessionConfig, QuizMode } from '@/types/quiz-config'

export const MODE_PRESETS: Record<QuizMode, QuizSessionConfig> = {
  camp: {
    mode: 'camp',
    setup: {
      questionCount: 20,
      topics: [],
      disciplines: [],
      difficultyMode: 'adaptive',
      initialDifficulty: 'mixed',
      isTrailSession: true,
      trailDayId: null,
    },
    timer: {
      enabled: false,
      visible: false,
      mode: 'hidden',
      totalSeconds: null,
      perQuestion: false,
      pausable: true,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate',
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: true,
      gatedProgressionDelayMs: 3000,
      explanationDepth: 'with-wiki-link',
    },
    navigation: {
      model: 'linear',
      backAllowed: false,
      questionPalette: false,
      bookmarkEnabled: false,
      skipEnabled: false,
      confirmBeforeSubmit: false,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: false,
    },
    breaks: {
      enabled: false,
      intervalQuestions: 0,
      breakDurationSeconds: 0,
    },
  },

  chill: {
    mode: 'chill',
    setup: {
      questionCount: 10,
      topics: [],
      disciplines: [],
      difficultyMode: 'static',
      initialDifficulty: 'mixed',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: false,
      visible: false,
      mode: 'hidden',
      totalSeconds: null,
      perQuestion: false,
      pausable: true,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate',
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: false,
      gatedProgressionDelayMs: 0,
      explanationDepth: 'brief',
    },
    navigation: {
      model: 'free',
      backAllowed: true,
      questionPalette: false,
      bookmarkEnabled: false,
      skipEnabled: true,
      confirmBeforeSubmit: false,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: false,
      showStaminaChart: false,
    },
    breaks: {
      enabled: false,
      intervalQuestions: 0,
      breakDurationSeconds: 0,
    },
  },

  subject: {
    mode: 'subject',
    setup: {
      questionCount: 25,
      topics: [],
      disciplines: [],
      difficultyMode: 'adaptive',
      initialDifficulty: 'mixed',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: false,
      visible: false,
      mode: 'hidden',
      totalSeconds: null,
      perQuestion: false,
      pausable: true,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate',
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: true,
      gatedProgressionDelayMs: 3000,
      explanationDepth: 'full',
    },
    navigation: {
      model: 'linear',
      backAllowed: true,
      questionPalette: false,
      bookmarkEnabled: false,
      skipEnabled: false,
      confirmBeforeSubmit: false,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: false,
    },
    breaks: {
      enabled: false,
      intervalQuestions: 0,
      breakDurationSeconds: 0,
    },
  },

  focused: {
    mode: 'focused',
    setup: {
      questionCount: 15,
      topics: [],
      disciplines: [],
      difficultyMode: 'adaptive',
      initialDifficulty: 'easy',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: false,
      visible: false,
      mode: 'hidden',
      totalSeconds: null,
      perQuestion: false,
      pausable: true,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate',
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: true,
      gatedProgressionDelayMs: 4000,
      explanationDepth: 'with-wiki-link',
    },
    navigation: {
      model: 'linear',
      backAllowed: true,
      questionPalette: false,
      bookmarkEnabled: false,
      skipEnabled: false,
      confirmBeforeSubmit: false,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: false,
    },
    breaks: {
      enabled: false,
      intervalQuestions: 0,
      breakDurationSeconds: 0,
    },
  },

  custom: {
    mode: 'custom',
    setup: {
      questionCount: 20,
      topics: [],
      disciplines: [],
      difficultyMode: 'user-selected',
      initialDifficulty: 'mixed',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: false,
      visible: false,
      mode: 'hidden',
      totalSeconds: null,
      perQuestion: false,
      pausable: true,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate',
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: false,
      gatedProgressionDelayMs: 0,
      explanationDepth: 'full',
    },
    navigation: {
      model: 'free',
      backAllowed: true,
      questionPalette: true,
      bookmarkEnabled: true,
      skipEnabled: true,
      confirmBeforeSubmit: true,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: false,
    },
    breaks: {
      enabled: false,
      intervalQuestions: 0,
      breakDurationSeconds: 0,
    },
  },

  storm: {
    mode: 'storm',
    setup: {
      questionCount: 50,
      topics: [],
      disciplines: [],
      difficultyMode: 'static',
      initialDifficulty: 'mixed',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: true,
      visible: true,
      mode: 'bar',
      totalSeconds: 3000, // 50 min (1 min/Q)
      perQuestion: false,
      pausable: false,
      warningThresholds: [0.75, 0.90, 0.95],
    },
    feedback: {
      timing: 'deferred',
      showExplanation: false,
      showCorrectAnswer: false,
      showConfidenceRating: false,
      gatedProgressionDelayMs: 0,
      explanationDepth: 'full',
    },
    navigation: {
      model: 'free',
      backAllowed: true,
      questionPalette: true,
      bookmarkEnabled: true,
      skipEnabled: true,
      confirmBeforeSubmit: true,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: false,
    },
    breaks: {
      enabled: true,
      intervalQuestions: 25,
      breakDurationSeconds: 30,
    },
  },

  fullexam: {
    mode: 'fullexam',
    setup: {
      questionCount: 200,
      topics: [],
      disciplines: [],
      difficultyMode: 'static',
      initialDifficulty: 'mixed',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: true,
      visible: true,
      mode: 'countdown',
      totalSeconds: 14400, // 4 hours
      perQuestion: false,
      pausable: false,
      warningThresholds: [0.75, 0.90, 0.95],
    },
    feedback: {
      timing: 'none',
      showExplanation: false,
      showCorrectAnswer: false,
      showConfidenceRating: false,
      gatedProgressionDelayMs: 0,
      explanationDepth: 'full',
    },
    navigation: {
      model: 'free',
      backAllowed: true,
      questionPalette: true,
      bookmarkEnabled: true,
      skipEnabled: true,
      confirmBeforeSubmit: true,
    },
    results: {
      showImmediately: false,
      delayHours: 24,
      showPercentile: true,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: true,
    },
    breaks: {
      enabled: true,
      intervalQuestions: 50,
      breakDurationSeconds: 30,
    },
  },

  extended: {
    mode: 'extended',
    setup: {
      questionCount: 100,
      topics: [],
      disciplines: [],
      difficultyMode: 'static',
      initialDifficulty: 'mixed',
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: true,
      visible: true,
      mode: 'countup',
      totalSeconds: null,
      perQuestion: false,
      pausable: true,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate',
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: false,
      gatedProgressionDelayMs: 2000,
      explanationDepth: 'full',
    },
    navigation: {
      model: 'linear',
      backAllowed: true,
      questionPalette: true,
      bookmarkEnabled: true,
      skipEnabled: true,
      confirmBeforeSubmit: false,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: true,
      showGrowthDelta: true,
      showReadinessScoreImpact: true,
      showStaminaChart: true,
    },
    breaks: {
      enabled: true,
      intervalQuestions: 30,
      breakDurationSeconds: 30,
    },
  },

  article_review: {
    mode: 'article_review',
    setup: {
      questionCount: 5,
      topics: [],
      disciplines: [],
      difficultyMode: 'static' as const,
      initialDifficulty: 'mixed' as const,
      isTrailSession: false,
      trailDayId: null,
    },
    timer: {
      enabled: false,
      visible: false,
      mode: 'hidden' as const,
      totalSeconds: null,
      perQuestion: false,
      pausable: false,
      warningThresholds: [],
    },
    feedback: {
      timing: 'immediate' as const,
      showExplanation: true,
      showCorrectAnswer: true,
      showConfidenceRating: false,
      gatedProgressionDelayMs: 2000,
      explanationDepth: 'brief' as const,
    },
    navigation: {
      model: 'linear' as const,
      backAllowed: true,
      questionPalette: false,
      bookmarkEnabled: false,
      skipEnabled: false,
      confirmBeforeSubmit: false,
    },
    results: {
      showImmediately: true,
      delayHours: 0,
      showPercentile: false,
      showSubjectBreakdown: false,
      showGrowthDelta: false,
      showReadinessScoreImpact: false,
      showStaminaChart: false,
    },
    breaks: {
      enabled: false,
      intervalQuestions: 0,
      breakDurationSeconds: 0,
    },
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Deep merge user overrides with mode preset defaults */
export const mergeWithPreset = (
  mode: QuizMode,
  overrides: Partial<QuizSessionConfig>,
): QuizSessionConfig => {
  const preset = MODE_PRESETS[mode]
  return {
    ...preset,
    ...overrides,
    setup: { ...preset.setup, ...overrides.setup },
    timer: { ...preset.timer, ...overrides.timer },
    feedback: { ...preset.feedback, ...overrides.feedback },
    navigation: { ...preset.navigation, ...overrides.navigation },
    results: { ...preset.results, ...overrides.results },
    breaks: { ...preset.breaks, ...overrides.breaks },
    // Top-level optionals — carry through if provided
    pressure_level: overrides.pressure_level ?? preset.pressure_level,
    interleave: overrides.interleave ?? preset.interleave,
    interleave_ratio: overrides.interleave_ratio ?? preset.interleave_ratio,
  }
}

/** Get human-readable mode label */
export const MODE_LABELS: Record<QuizMode, string> = {
  camp: 'Camp Mode',
  chill: 'Chill Mode',
  subject: 'Subject Focus',
  focused: 'Focus Review',
  custom: 'Custom Session',
  storm: 'Storm Mode',
  fullexam: 'Full Exam Simulation',
  extended: 'Extended Practice',
  article_review: 'Article Review',
}

/** Get the score band label and color class for a given percentage */
export const getScoreBand = (percent: number) => {
  if (percent >= 70) return { label: 'Passing', colorClass: 'text-emerald-600' } as const
  if (percent >= 50) return { label: 'Building', colorClass: 'text-ink-primary' } as const
  return { label: 'Needs review', colorClass: 'text-ink-primary' } as const
}

/** Get the adaptive difficulty for next question (Doc 4 §3.3) */
export const getNextDifficulty = (recentWindow: boolean[], currentDifficulty: number): number => {
  if (recentWindow.length === 0) return currentDifficulty
  const windowAccuracy = recentWindow.filter(Boolean).length / recentWindow.length
  if (windowAccuracy >= 0.90) return Math.min(5, currentDifficulty + 1)
  if (windowAccuracy <= 0.60) return Math.max(1, currentDifficulty - 1)
  return currentDifficulty
}
