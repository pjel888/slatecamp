import type { ModeDefinition } from '@/types/testing'

export const MODE_DEFINITIONS: Record<string, ModeDefinition> = {
  camp: {
    key: 'camp',
    source: 'camp_mode',
    dbTestMode: 'camp',
    label: 'Camp Mode',
    character: 'Guided Study',
    description:
      'Instant feedback after each answer. Full explanations on every question. No timer, no pressure.',
    zone: 1,
    icon: 'book',
    isPro: false,
    defaultQuestionCount: 20,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Start Camp Mode',
    ctaVariant: 'cobalt',
  },
  chill: {
    key: 'chill',
    source: 'chill_mode',
    dbTestMode: 'chill',
    label: 'Chill Mode',
    character: 'Relaxed',
    description:
      'Browse questions at your own pace. Skip any you want. Low stakes, real learning.',
    zone: 1,
    icon: 'leaf',
    isPro: false,
    defaultQuestionCount: null,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Start Chill Mode',
    ctaVariant: 'cobalt',
  },
  subject: {
    key: 'subject',
    source: 'subject_mode',
    dbTestMode: 'camp',
    label: 'Subject Mode',
    character: 'Focused',
    description:
      'Deep-dive into one LEA subject. Questions matched to your current mastery level.',
    zone: 2,
    icon: 'target',
    isPro: true,
    defaultQuestionCount: 20,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Start Subject Mode',
    ctaVariant: 'cobalt',
  },
  'focus-review': {
    key: 'focus-review',
    source: 'focus_review',
    dbTestMode: 'camp',
    label: 'Focus Review',
    character: 'Targeted',
    description:
      'Targets your weakest areas with the highest-impact questions. Driven by your mastery data.',
    zone: 2,
    icon: 'search',
    isPro: true,
    defaultQuestionCount: 12,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Start Focus Review',
    ctaVariant: 'cobalt',
  },
  custom: {
    key: 'custom',
    source: 'custom_session',
    dbTestMode: 'camp',
    label: 'Custom Session',
    character: 'Flexible',
    description:
      'Full control. Pick topics, difficulty, question count, and feedback style.',
    zone: 2,
    icon: 'settings',
    isPro: true,
    defaultQuestionCount: 20,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Build Custom Session',
    ctaVariant: 'cobalt',
  },
  storm: {
    key: 'storm',
    source: 'storm_mode',
    dbTestMode: 'storm',
    label: 'Storm Mode',
    character: 'Timed',
    description:
      'Exam conditions. No feedback until you\'re done. Timer runs as a bar, not a countdown.',
    zone: 3,
    icon: 'zap',
    isPro: true,
    defaultQuestionCount: 50,
    hasFeedbackDuring: false,
    hasTimer: true,
    ctaLabel: 'Start Storm Mode',
    ctaVariant: 'orange',
  },
  simulation: {
    key: 'simulation',
    source: 'proof_simulation',
    dbTestMode: 'storm',
    label: 'Full Exam Simulation',
    character: 'Exam Day',
    description:
      '200 questions. Real exam conditions. Your score is delivered 24 hours later.',
    zone: 3,
    icon: 'shield',
    isPro: true,
    defaultQuestionCount: 200,
    hasFeedbackDuring: false,
    hasTimer: true,
    ctaLabel: 'Begin Simulation',
    ctaVariant: 'orange',
  },
  endurance: {
    key: 'endurance',
    source: 'extended_practice',
    dbTestMode: 'camp',
    label: 'Design Endurance Training',
    character: 'Design Endurance Training',
    description:
      'Design is 40% of the LEA — and it\'s 3+ hours under pressure. Build your cognitive stamina window to handle the full exam.',
    zone: 3,
    icon: 'dumbbell',
    isPro: true,
    defaultQuestionCount: 100,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Start Design Training',
    ctaVariant: 'orange',
  },
  'article-review': {
    key: 'article-review',
    source: 'article_review',
    dbTestMode: 'camp',
    label: 'Article Review',
    character: 'Quick Check',
    description:
      '5 quick questions to verify your understanding after reading an article.',
    zone: 1,
    icon: 'book',
    isPro: false,
    defaultQuestionCount: 5,
    hasFeedbackDuring: true,
    hasTimer: false,
    ctaLabel: 'Start Review',
    ctaVariant: 'cobalt',
  },
} as const

export const ZONE_LABELS = {
  1: { number: '01', name: 'Foundations' },
  2: { number: '02', name: 'Deliberate Practice' },
  3: { number: '03', name: 'Exam Readiness' },
} as const

export const MODES_BY_ZONE = {
  1: ['camp', 'chill', 'article-review'] as const,
  2: ['subject', 'focus-review', 'custom'] as const,
  3: ['storm', 'simulation', 'endurance'] as const,
} as const

/** Seconds per question for timed modes */
export const SECONDS_PER_QUESTION = 60

/** Storm mode timer color thresholds */
export const TIMER_THRESHOLDS = {
  normal: { min: 0.2, color: 'var(--primary)' },
  warning: { min: 0.1, color: 'var(--accent)' },
  critical: { min: 0, color: 'var(--accent)' }, // NEVER red
} as const

/** Question count options per mode */
export const QUESTION_COUNT_OPTIONS: Record<string, number[]> = {
  camp: [10, 20, 30, 50],
  storm: [25, 50, 100],
  subject: [10, 20, 30],
  custom: [5, 10, 20, 30, 50, 100],
}
