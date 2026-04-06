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

export type PressureLevel = 0 | 1 | 2 | 3

export type AleFrequency =
  | 'very-high'
  | 'high'
  | 'moderate'
  | 'low'
  | 'emerging'

export type QuestionStatus = 'idle' | 'selected' | 'submitted' | 'feedback' | 'reviewed'

export type TimerColorState = 'normal' | 'warning' | 'critical'

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

  pressure_level?: PressureLevel  // Progressive pressure ladder (0–3)

  interleave?: boolean       // default false — mix related taxonomy siblings
  interleave_ratio?: number  // default 0.3 — fraction of questions from sibling topics
}

// ─── Question types (client-facing, stripped of answers) ─────────────────────

export interface QuestionOption {
  id: string
  letter: 'A' | 'B' | 'C' | 'D'
  text: string
  is_correct?: boolean
  distractor_type?: DistractorType | null
}

export type QuestionType = 'mcq' | 'numeric' | 'short_text' | 'formula'

export interface QuestionForClient {
  question_id: string
  topic_id: string
  difficulty: number
  position: number
  stem: string
  image_url: string | null
  image_alt_text: string | null
  taxonomy_breadcrumb: string
  difficulty_label: 'Easy' | 'Medium' | 'Hard'
  is_interleaved?: boolean  // true when question comes from a sibling topic
  question_type: QuestionType  // generation effect: mcq (default) or generation types
  unit?: string | null         // unit label for numeric/formula inputs (e.g. "psi", "ft")
  hint_text?: string | null    // Progressive hint for formative quizzes
  options: Array<{
    id: string
    letter: 'A' | 'B' | 'C' | 'D'
    text: string
  }>
}

// ─── Answer state (per question, client-side) ───────────────────────────────

export interface QuizAnswerState {
  selectedOptionId: string | null
  /** Continuous 0–1 confidence score. 0 = guessing, 1 = confident. null = not set. */
  confidenceLevel: number | null
  isCorrect: boolean | null
  isSkipped: boolean
  isFlagged: boolean
  timeStartedMs: number
  timeSpentMs: number
  submittedAt: string | null
  /** Deterministic per-question state machine: idle → selected → submitted → feedback → reviewed */
  questionStatus: QuestionStatus
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
  /** Pre-fetched CAGE nonces — one per question (Patent Claim 21) */
  nonces?: Record<string, { nonce: string; expiresAt: string }>
  /** Session-derived HMAC signing key for CAGE tokens (hex) */
  sessionKey?: string
}

export interface SubmitAnswerInput {
  sessionId: string
  questionId: string
  selectedOptionId: string
  /** Pre-fetched metadata to avoid server-side re-fetching (Phase 1 Optimization) */
  topicId?: string
  difficulty?: number
  /** Continuous 0–1 confidence score */
  confidenceLevel?: number
  timeSpentMs: number
  /** Patent extension: CAGE binding token (Claims 3, 20, 21) */
  cageToken?: import('@/types/patent').CAGEBindingToken | null
  /** Patent extension: trust level if CAGE generation failed */
  cageTrustLevel?: import('@/types/patent').CAGETrustLevel
  /** Patent extension: raw gesture signal events (Claims 1(b), 6, 7) */
  signalTrace?: import('@/types/patent').GestureSignalEvent[]
  /** Patent extension: gesture duration in ms */
  gestureDurationMs?: number
  /** Patent extension: whether device sensors were available */
  sensorsAvailable?: boolean
}

export interface SubmitAnswerResult {
  isCorrect: boolean
  correctOptionId: string
  rationale: string | null
  wikiArticleUrl: string | null
  answeredCount: number
  correctCount: number
  sessionComplete: boolean
  errorDiagnostic: ErrorDiagnostic | null
  // Generation effect fields (only present for non-MCQ)
  closeness?: number           // 0–1 how close the answer was
  correctAnswer?: string       // display-ready correct answer string
  questionType?: QuestionType  // echoed back so client knows format
}

export interface EndSessionInput {
  sessionId: string
  endReason: EndReason
}

// ─── Feed-Forward Recommendations ────────────────────────────────────────────

export interface Recommendation {
  type: 'quiz' | 'wiki' | 'review' | 'rest'
  priority: number // 0–100
  title: string
  description: string
  action: {
    type: 'start_session' | 'open_wiki' | 'open_srs'
    href: string // Pre-built URL for one-tap navigation
  }
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
  recommendations?: Recommendation[]
}

export interface ReviewQuestionData {
  position: number
  questionId: string
  topicId: string
  difficulty: number
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

// ─── Error Diagnostic (from error classifier) ───────────────────────────────

export interface ErrorDiagnostic {
  category: string
  confidence: number
  message: string
}

// ─── Feedback data (for Zustand store) ──────────────────────────────────────

export interface FeedbackData {
  questionId: string
  isCorrect: boolean
  correctOptionId: string
  rationale: string | null
  wikiUrl: string | null
  errorDiagnostic: ErrorDiagnostic | null
  // Generation effect fields (only present for non-MCQ)
  closeness?: number
  correctAnswer?: string
  questionType?: QuestionType
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
