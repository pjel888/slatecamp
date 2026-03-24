import type { TestMode, SessionStatus, Question, QuizSession } from './app'

// ─── Mode Source (maps UI modes to config.source) ─────────────────────────────

export type ModeSource =
  | 'camp_mode'
  | 'chill_mode'
  | 'subject_mode'
  | 'focus_review'
  | 'custom_session'
  | 'storm_mode'
  | 'proof_simulation'
  | 'extended_practice'
  | 'assessment_quiz'
  | 'trail_quiz'
  | 'blindspot_queue'

/** User-facing mode key used in routes and UI logic */
export type UIMode =
  | 'camp'
  | 'chill'
  | 'subject'
  | 'focus-review'
  | 'custom'
  | 'storm'
  | 'simulation'
  | 'endurance'

// ─── Mode Metadata ────────────────────────────────────────────────────────────

export interface ModeDefinition {
  key: UIMode
  source: ModeSource
  dbTestMode: TestMode
  label: string
  character: string
  description: string
  zone: 1 | 2 | 3
  icon: string
  isPro: boolean
  defaultQuestionCount: number | null
  hasFeedbackDuring: boolean
  hasTimer: boolean
  ctaLabel: string
  ctaVariant: 'cobalt' | 'orange'
}

// ─── Hub Data ─────────────────────────────────────────────────────────────────

export interface ModeStats {
  sessionCount: number
  lastAccuracy: number | null
  avgQuestionsPerSession: number | null
  /** Endurance-specific */
  fatigueThreshold: number | null
}

export type SuggestionVariant =
  | 'blindspot'
  | 'exam-countdown'
  | 'weak-subject'
  | 'return'

export interface SmartSuggestion {
  variant: SuggestionVariant
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  /** Blindspot: node names. Weak subject: subject name. Exam countdown: days. */
  metadata?: {
    nodeNames?: string[]
    subjectName?: string
    daysUntilExam?: number
    currentReadiness?: number
  }
}

export interface SimulationGateStatus {
  isUnlocked: boolean
  currentReadiness: number
  requiredReadiness: number
  hasEnduranceCalibration: boolean
  pointsNeeded: number
}

export interface InProgressSessionInfo {
  sessionId: string
  source: ModeSource
  modeLabel: string
  currentIndex: number
  totalQuestions: number
  startedAt: string
}

// ─── Setup Types ──────────────────────────────────────────────────────────────

export type QuestionCountOption = 10 | 20 | 30 | 50 | 100

export type ConfidenceRating = 1 | 2 | 3 | 4 | 5

export interface SubjectConfidence {
  subjectId: string
  subjectName: string
  rating: ConfidenceRating
}

export type FocusOption = 'weakest' | 'single-subject' | 'mixed'

export type FeedbackStyle = 'immediate' | 'deferred'

export type DifficultyBand = 'foundational' | 'intermediate' | 'advanced' | 'expert'

export interface SessionConfig {
  source: ModeSource
  questionCount: number | null
  subjectFilter: string[]
  topicFilter: string[]
  difficultyBands: DifficultyBand[]
  feedbackMode: FeedbackStyle
  timerEnabled: boolean
  timerSeconds: number | null
  focusOption: FocusOption
  preSessionConfidence: SubjectConfidence[]
  isBlindsplotSession: boolean
  blindspotQueueId: string | null
  isProofSimulation: boolean
  isEnduranceSession: boolean
  strippedUi: boolean
  masteryWeightMultiplier: number
}

// ─── Active Session Types ─────────────────────────────────────────────────────

export type ConfidenceTag = 'sure' | 'unsure'

export type ErrorTag =
  | 'knowledge_gap'
  | 'misread'
  | 'similar_options'
  | 'wrong_code_version'
  | 'time_pressure'

export const ERROR_TAG_LABELS: Record<ErrorTag, string> = {
  knowledge_gap: 'Knowledge gap',
  misread: 'Misread',
  similar_options: 'Two similar options',
  wrong_code_version: 'Wrong code version',
  time_pressure: 'Needed more time',
}

export interface AnswerState {
  questionId: string
  selectedOptionId: string | null
  isCorrect: boolean | null
  confidenceTag: ConfidenceTag | null
  errorTags: ErrorTag[]
  eliminatedOptionIds: string[]
  isFlagged: boolean
  timeSpentMs: number
  answerChanges: number
}

export type NavigatorCellState = 'unanswered' | 'answered' | 'flagged' | 'current'

/** Storm-mode only: navigator never shows correctness */
export type StormNavigatorCellState = 'unanswered' | 'answered' | 'flagged' | 'current'

// ─── Debrief Types ────────────────────────────────────────────────────────────

export type ScoreBand = 'excellent' | 'strong' | 'good' | 'developing' | 'building' | 'foundation'

export const SCORE_BAND_THRESHOLDS: Record<ScoreBand, { min: number; color: string; copy: string }> = {
  excellent: {
    min: 90,
    color: 'var(--success)',
    copy: 'Outstanding. You\'re building real mastery here.',
  },
  strong: {
    min: 80,
    color: 'var(--success)',
    copy: 'Strong session. You\'re locking this in.',
  },
  good: {
    min: 70,
    color: 'var(--primary)',
    copy: 'Good work. The areas you missed are clear — that\'s progress.',
  },
  developing: {
    min: 60,
    color: 'var(--warning)',
    copy: 'Every question you got wrong just showed you what to study next.',
  },
  building: {
    min: 50,
    color: 'var(--warning)',
    copy: 'Tough session. The good news: now you know exactly where to focus.',
  },
  foundation: {
    min: 0,
    color: 'var(--warm-red)',
    copy: 'This is where the learning happens. The topics you struggled with are now your roadmap.',
  },
}

export const getScoreBand = (percentage: number): ScoreBand => {
  if (percentage >= 90) return 'excellent'
  if (percentage >= 80) return 'strong'
  if (percentage >= 70) return 'good'
  if (percentage >= 60) return 'developing'
  if (percentage >= 50) return 'building'
  return 'foundation'
}

export interface NodeMasteryDelta {
  nodeId: string
  nodeName: string
  aleId: string
  previousMastery: number
  currentMastery: number
  pointDelta: number
  previousState: 'grey' | 'red' | 'amber' | 'green'
  currentState: 'grey' | 'red' | 'amber' | 'green'
}

export interface QuestionReviewItem {
  questionId: string
  questionIndex: number
  questionText: string
  selectedOptionId: string | null
  selectedOptionText: string | null
  correctOptionId: string
  correctOptionText: string
  isCorrect: boolean
  isFlagged: boolean
  timeSpentMs: number
  errorTags: ErrorTag[]
  rationale: string | null
  codeCitation: string | null
  modelId: string | null
  confidenceTag: ConfidenceTag | null
}

export interface CalibrationSubject {
  subjectName: string
  predictedLevel: ConfidenceRating
  actualAccuracy: number
  gapDirection: 'overconfident' | 'underconfident' | 'calibrated'
  gapText: string
}

export interface CalibrationResult {
  subjects: CalibrationSubject[]
  overallScore: number
}

export interface AccuracyBlock {
  block: number
  accuracy: number
  questionCount: number
}

export interface PressureGap {
  readinessScore: number
  simulationScore: number
  gap: number
  interpretation: string
}

export interface SessionDebriefData {
  sessionId: string
  source: ModeSource
  totalQuestions: number
  correctCount: number
  percentage: number
  scoreBand: ScoreBand
  readinessBefore: number
  readinessAfter: number
  readinessDelta: number
  nodeMasteryDeltas: NodeMasteryDelta[]
  questionReview: QuestionReviewItem[]
  calibration: CalibrationResult | null
  accuracyBlocks: AccuracyBlock[] | null
  pressureGap: PressureGap | null
  avgTimePerQuestion: number
  wrongQuestionIds: string[]
}

// ─── ALE Subjects ─────────────────────────────────────────────────────────────

export const ALE_SUBJECTS = [
  { id: 'ALE-HIST', name: 'History of Architecture', short: 'History' },
  { id: 'ALE-THEO', name: 'Theory of Architecture', short: 'Theory' },
  { id: 'ALE-PLAN', name: 'Planning & Site Development', short: 'Planning' },
  { id: 'ALE-PRAC', name: 'Architecture Practice', short: 'Practice' },
  { id: 'ALE-STRC', name: 'Structural Design', short: 'Structures' },
  { id: 'ALE-MATL', name: 'Building Materials', short: 'Materials' },
  { id: 'ALE-UTIL', name: 'Utilities & Building Systems', short: 'Utilities' },
  { id: 'ALE-DSGN', name: 'Building Laws & Codes', short: 'Building Laws' },
] as const

export type ALESubjectId = typeof ALE_SUBJECTS[number]['id']
