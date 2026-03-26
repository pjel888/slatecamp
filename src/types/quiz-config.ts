// ─── Quiz Engine v2: Unified Config Types ───────────────────────────────────
// Source: Doc 3 — Data Schema & API Contract Spec

export type QuizMode =
  | 'camp'
  | 'chill'
  | 'subject'
  | 'focused'
  | 'custom'
  | 'storm'
  | 'fullexam'
  | 'extended'
  | 'article_review'

export type SessionStatus =
  | 'configuring'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'abandoned'
  | 'auto_submitted'

export type FeedbackTiming = 'immediate' | 'deferred' | 'none'

export type TimerMode = 'countdown' | 'countup' | 'bar' | 'hidden'

export type NavigationModel = 'linear' | 'free' | 'linear-with-skip'

export type ExplanationDepth = 'brief' | 'full' | 'with-wiki-link'

export type DifficultyInit = 'easy' | 'medium' | 'hard' | 'mixed'

export type DifficultyMode = 'static' | 'adaptive' | 'user-selected'

export type EndReason = 'completed' | 'user_exit' | 'timer_expired' | 'auto_submitted'

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create'

export type AleFrequency =
  | 'very-high'
  | 'high'
  | 'moderate'
  | 'low'
  | 'emerging'

export type DistractorType =
  | 'common-misconception'
  | 'adjacent-value'
  | 'different-context'
  | 'partial-truth'
  | 'plausible-fabrication'

export type ScoreBand =
  | 'passing'
  | 'building'
  | 'needs-review'

// ─── The Config Object (JSONB stored on quiz_sessions.config) ────────────────

export interface QuizSessionConfig {
  mode: QuizMode

  setup: {
    questionCount: number
    topics: string[]
    disciplines: string[]
    difficultyMode: DifficultyMode
    initialDifficulty: DifficultyInit
    isTrailSession: boolean
    trailDayId: string | null
  }

  timer: {
    enabled: boolean
    visible: boolean
    mode: TimerMode
    totalSeconds: number | null
    perQuestion: boolean
    pausable: boolean
    warningThresholds: number[]
  }

  feedback: {
    timing: FeedbackTiming
    showExplanation: boolean
    showCorrectAnswer: boolean
    showConfidenceRating: boolean
    gatedProgressionDelayMs: number
    explanationDepth: ExplanationDepth
  }

  navigation: {
    model: NavigationModel
    backAllowed: boolean
    questionPalette: boolean
    bookmarkEnabled: boolean
    skipEnabled: boolean
    confirmBeforeSubmit: boolean
  }

  results: {
    showImmediately: boolean
    delayHours: number
    showPercentile: boolean
    showSubjectBreakdown: boolean
    showGrowthDelta: boolean
    showReadinessScoreImpact: boolean
    showStaminaChart: boolean
  }

  breaks: {
    enabled: boolean
    intervalQuestions: number
    breakDurationSeconds: number
  }
}

// ─── Question types (client-facing, stripped of answers) ─────────────────────

export interface QuestionOption {
  id: string
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
  is_correct?: boolean
  distractor_type?: DistractorType | null
}

export interface QuestionForClient {
  question_id: string
  position: number
  stem: string
  image_url: string | null
  image_alt_text: string | null
  taxonomy_breadcrumb: string
  difficulty_label: 'Easy' | 'Medium' | 'Hard'
  options: Array<{
    id: string
    letter: 'A' | 'B' | 'C' | 'D'
    text: string
  }>
}

// ─── Answer state (per question, client-side) ───────────────────────────────

export interface QuizAnswerState {
  selectedOptionId: string | null
  confidenceLevel: 1 | 2 | 3 | null
  isCorrect: boolean | null
  isSkipped: boolean
  isFlagged: boolean
  timeStartedMs: number
  timeSpentMs: number
  submittedAt: string | null
}

// ─── Server Action types ─────────────────────────────────────────────────────

export interface StartSessionInput {
  mode: QuizMode
  config: Partial<QuizSessionConfig>
  trailDayId?: string
}

export interface StartSessionResult {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
  totalQuestions: number
  readinessScoreBefore: number
}

export interface SubmitAnswerInput {
  sessionId: string
  questionId: string
  selectedOptionId: string
  confidenceLevel?: 1 | 2 | 3
  timeSpentMs: number
}

export interface SubmitAnswerResult {
  isCorrect: boolean
  correctOptionId: string
  rationale: string | null
  wikiArticleUrl: string | null
  answeredCount: number
  correctCount: number
  sessionComplete: boolean
}

export interface EndSessionInput {
  sessionId: string
  endReason: EndReason
}

export interface EndSessionResult {
  score: {
    correct: number
    total: number
    percent: number
  }
  subjectBreakdown: Array<{
    disciplineId: string
    disciplineName: string
    correct: number
    total: number
    percent: number
  }>
  readinessScoreBefore: number
  readinessScoreAfter: number
  readinessScoreDelta: number
  growthVsPrevious: number | null
  resultsAvailableAt: string
  trailDayCompleted: boolean
  nextTrailDay: { id: string; title: string; topic: string } | null
  missedQuestionCount: number
}

export interface ReviewQuestionData {
  position: number
  questionId: string
  stem: string
  imageUrl: string | null
  taxonomyBreadcrumb: string
  options: Array<{
    id: string
    text: string
    letter: 'A' | 'B' | 'C' | 'D'
    isCorrect: boolean
    isUserChoice: boolean
  }>
  isCorrect: boolean
  isSkipped: boolean
  isFlagged: boolean
  confidenceLevel: number | null
  rationale: string
  wikiArticleUrl: string | null
  wrongAnswerExplanation: string | null
}

export interface QuestionHistoryStats {
  timesSeen: number
  timesCorrect: number
  timesWrong: number
  lastSeenAt: string | null
}

export interface ReviewDataResult {
  sessionId: string
  mode: QuizMode
  score: { correct: number; total: number; percent: number }
  questions: ReviewQuestionData[]
  /** Per-question history keyed by question_id (Pro users only) */
  questionHistory?: Record<string, QuestionHistoryStats>
}

// ─── Taxonomy data for topic picker ─────────────────────────────────────────

export interface TaxonomySubject {
  nodeId: string
  name: string
  aleId: string | null
  masteryWeight: number | null
  interactionCount: number
  subtopics: TaxonomySubtopic[]
}

export interface TaxonomySubtopic {
  nodeId: string
  name: string
  aleId: string | null
  isLeaf: boolean
  masteryWeight: number | null
  interactionCount: number
}

// ─── Feedback data (for Zustand store) ──────────────────────────────────────

export interface FeedbackData {
  questionId: string
  isCorrect: boolean
  correctOptionId: string
  rationale: string | null
  wikiUrl: string | null
}

// ─── Stamina analysis ───────────────────────────────────────────────────────

export interface StaminaBlock {
  blockNumber: number
  questionRange: [number, number]
  accuracy: number
  avgTimePerQuestion: number
}

// ─── Adaptive difficulty ────────────────────────────────────────────────────

export interface AdaptiveState {
  recentWindow: boolean[]
  currentAccuracy: number
  targetAccuracy: number
  currentDifficulty: number
}
