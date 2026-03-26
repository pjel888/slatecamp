// src/stores/useQuizStore.ts — Centralized quiz session state (Zustand)
// Replaces scattered hooks: useQuizState, useQuizPersistence, etc.
// Doc 6 spec: single source of truth for all quiz engine state.

import { create } from 'zustand'
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import {
  submitAnswer as submitAnswerAction,
  endSession as endSessionAction,
} from '@/lib/actions/quiz-v2'
import type {
  QuizMode,
  QuizSessionConfig,
  QuestionForClient,
  QuestionType,
  QuizAnswerState,
  StartSessionResult,
  SubmitAnswerInput,
  EndSessionResult,
  FeedbackData,
  ErrorDiagnostic,
} from '@/types/quiz-config'

// ---------------------------------------------------------------------------
// Sub-state shapes
// ---------------------------------------------------------------------------

interface TimerState {
  startedAt: number | null
  pausedAt: number | null
  elapsedMs: number
  limitMs: number | null
  isRunning: boolean
}

interface FeedbackState {
  visible: boolean
  questionId: string | null
  isCorrect: boolean | null
  correctOptionId: string | null
  rationale: string | null
  wikiUrl: string | null
  errorDiagnostic: ErrorDiagnostic | null
  nextButtonEnabled: boolean
  // Generation effect fields
  closeness: number | undefined
  correctAnswer: string | undefined
  questionType: QuestionType | undefined
}

interface UIState {
  paletteOpen: boolean
  wikiPanelOpen: boolean
  wikiPanelUrl: string | null
  exitModalOpen: boolean
  submitModalOpen: boolean
  microBreakVisible: boolean
  offlineBannerVisible: boolean
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface QuizStore {
  // SESSION STATE
  sessionId: string | null
  config: QuizSessionConfig | null
  status: 'idle' | 'loading' | 'intro' | 'active' | 'feedback' | 'submitting' | 'results' | 'review'
  mode: QuizMode | null

  // QUESTION STATE
  questions: QuestionForClient[]
  currentIndex: number
  totalQuestions: number

  // ANSWER STATE
  answers: Map<string, QuizAnswerState>

  // ELIMINATION STATE — questionId → Set of eliminated optionIds
  eliminatedOptions: Map<string, Set<string>>

  // TIMER STATE
  timer: TimerState

  // FEEDBACK STATE
  feedback: FeedbackState

  // UI STATE
  ui: UIState

  // OFFLINE QUEUE
  pendingSubmissions: SubmitAnswerInput[]

  // RESULTS STATE
  results: EndSessionResult | null

  // -------------------------------------------------------------------------
  // COMPUTED GETTERS
  // -------------------------------------------------------------------------

  getCurrentQuestion: () => QuestionForClient | null
  getAnsweredCount: () => number
  getCorrectCount: () => number
  getRunningAccuracy: () => number
  getUnansweredQuestions: () => QuestionForClient[]
  getFlaggedQuestions: () => QuestionForClient[]
  getProgress: () => { answered: number; total: number; percent: number }

  // -------------------------------------------------------------------------
  // SESSION ACTIONS
  // -------------------------------------------------------------------------

  initSession: (result: StartSessionResult) => void
  reset: () => void

  // -------------------------------------------------------------------------
  // ANSWER ACTIONS
  // -------------------------------------------------------------------------

  selectAnswer: (questionId: string, optionId: string) => void
  deselectAnswer: (questionId: string) => void
  setConfidence: (questionId: string, level: number) => void
  submitCurrentAnswer: () => Promise<void>
  skipCurrentQuestion: () => void

  // -------------------------------------------------------------------------
  // NAVIGATION ACTIONS
  // -------------------------------------------------------------------------

  goToQuestion: (index: number) => void
  goNext: () => void
  goPrevious: () => void

  // -------------------------------------------------------------------------
  // ELIMINATION ACTIONS
  // -------------------------------------------------------------------------

  toggleEliminate: (questionId: string, optionId: string) => void

  // -------------------------------------------------------------------------
  // FLAG / FEEDBACK ACTIONS
  // -------------------------------------------------------------------------

  toggleFlag: (questionId: string) => void
  showFeedback: (data: FeedbackData) => void
  hideFeedback: () => void
  enableNextButton: () => void

  // -------------------------------------------------------------------------
  // TIMER ACTIONS
  // -------------------------------------------------------------------------

  startTimer: (limitMs?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  tickTimer: () => void

  // -------------------------------------------------------------------------
  // UI ACTIONS
  // -------------------------------------------------------------------------

  togglePalette: () => void
  openWikiPanel: (url: string) => void
  closeWikiPanel: () => void
  showExitModal: () => void
  hideExitModal: () => void
  showSubmitModal: () => void
  hideSubmitModal: () => void
  showMicroBreak: () => void
  hideMicroBreak: () => void

  // -------------------------------------------------------------------------
  // RESULTS / OFFLINE ACTIONS
  // -------------------------------------------------------------------------

  endSession: (result: EndSessionResult) => void
  queueOfflineSubmission: (input: SubmitAnswerInput) => void
  flushOfflineQueue: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Default sub-state factories
// ---------------------------------------------------------------------------

const defaultTimer = (): TimerState => ({
  startedAt: null,
  pausedAt: null,
  elapsedMs: 0,
  limitMs: null,
  isRunning: false,
})

const defaultFeedback = (): FeedbackState => ({
  visible: false,
  questionId: null,
  isCorrect: null,
  correctOptionId: null,
  rationale: null,
  wikiUrl: null,
  errorDiagnostic: null,
  nextButtonEnabled: false,
  closeness: undefined,
  correctAnswer: undefined,
  questionType: undefined,
})

const defaultUI = (): UIState => ({
  paletteOpen: false,
  wikiPanelOpen: false,
  wikiPanelUrl: null,
  exitModalOpen: false,
  submitModalOpen: false,
  microBreakVisible: false,
  offlineBannerVisible: false,
})

const makeAnswerState = (now: number): QuizAnswerState => ({
  selectedOptionId: null,
  confidenceLevel: null,
  isCorrect: null,
  isSkipped: false,
  isFlagged: false,
  timeStartedMs: now,
  timeSpentMs: 0,
  submittedAt: null,
})

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useQuizStore = create<QuizStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ── Initial state ────────────────────────────────────────────────────
        sessionId: null,
        config: null,
        status: 'idle',
        mode: null,

        questions: [],
        currentIndex: 0,
        totalQuestions: 0,

        answers: new Map(),
        eliminatedOptions: new Map(),

        timer: defaultTimer(),
        feedback: defaultFeedback(),
        ui: defaultUI(),

        pendingSubmissions: [],
        results: null,

        // ── Computed getters ─────────────────────────────────────────────────

        getCurrentQuestion: () => {
          const { questions, currentIndex } = get()
          return questions[currentIndex] ?? null
        },

        getAnsweredCount: () => {
          const { answers } = get()
          let count = 0
          for (const ans of answers.values()) {
            if (ans.submittedAt !== null || ans.isSkipped) count++
          }
          return count
        },

        getCorrectCount: () => {
          const { answers } = get()
          let count = 0
          for (const ans of answers.values()) {
            if (ans.isCorrect === true) count++
          }
          return count
        },

        getRunningAccuracy: () => {
          const answered = get().getAnsweredCount()
          if (answered === 0) return 0
          return get().getCorrectCount() / answered
        },

        getUnansweredQuestions: () => {
          const { questions, answers } = get()
          return questions.filter((q) => {
            const ans = answers.get(q.question_id)
            return !ans || (ans.submittedAt === null && !ans.isSkipped)
          })
        },

        getFlaggedQuestions: () => {
          const { questions, answers } = get()
          return questions.filter((q) => answers.get(q.question_id)?.isFlagged === true)
        },

        getProgress: () => {
          const answered = get().getAnsweredCount()
          const total = get().totalQuestions
          return {
            answered,
            total,
            percent: total > 0 ? Math.round((answered / total) * 100) : 0,
          }
        },

        // ── Session actions ───────────────────────────────────────────────────

        initSession: (result) => {
          const now = Date.now()
          const answers = new Map<string, QuizAnswerState>()
          for (const q of result.questions) {
            answers.set(q.question_id, makeAnswerState(now))
          }

          const limitMs = result.config.timer.enabled && result.config.timer.totalSeconds
            ? result.config.timer.totalSeconds * 1000
            : null

          set({
            sessionId: result.sessionId,
            config: result.config,
            status: 'intro',
            mode: result.config.mode,
            questions: result.questions,
            currentIndex: 0,
            totalQuestions: result.totalQuestions,
            answers,
            eliminatedOptions: new Map(),
            timer: { ...defaultTimer(), limitMs },
            feedback: defaultFeedback(),
            ui: defaultUI(),
            pendingSubmissions: [],
            results: null,
          })
        },

        reset: () =>
          set({
            sessionId: null,
            config: null,
            status: 'idle',
            mode: null,
            questions: [],
            currentIndex: 0,
            totalQuestions: 0,
            answers: new Map(),
            eliminatedOptions: new Map(),
            timer: defaultTimer(),
            feedback: defaultFeedback(),
            ui: defaultUI(),
            pendingSubmissions: [],
            results: null,
          }),

        // ── Answer actions ────────────────────────────────────────────────────

        selectAnswer: (questionId, optionId) => {
          const { answers } = get()
          const prev = answers.get(questionId)
          if (!prev) return
          const next = new Map(answers)
          next.set(questionId, { ...prev, selectedOptionId: optionId })
          set({ answers: next })
        },

        deselectAnswer: (questionId) => {
          const { answers } = get()
          const prev = answers.get(questionId)
          if (!prev) return
          const next = new Map(answers)
          next.set(questionId, { ...prev, selectedOptionId: null })
          set({ answers: next })
        },

        setConfidence: (questionId, level) => {
          const { answers } = get()
          const prev = answers.get(questionId)
          if (!prev) return
          const next = new Map(answers)
          next.set(questionId, { ...prev, confidenceLevel: level })
          set({ answers: next })
        },

        submitCurrentAnswer: async () => {
          const { sessionId, questions, currentIndex, answers, config } = get()
          const question = questions[currentIndex]
          if (!question || !sessionId) return

          const answerState = answers.get(question.question_id)
          if (!answerState?.selectedOptionId) return

          const timeSpentMs = Date.now() - answerState.timeStartedMs

          const input: SubmitAnswerInput = {
            sessionId,
            questionId: question.question_id,
            selectedOptionId: answerState.selectedOptionId,
            confidenceLevel: answerState.confidenceLevel ?? undefined,
            timeSpentMs,
          }

          set({ status: 'submitting' })

          try {
            const result = await submitAnswerAction(input)

            const updatedAnswers = new Map(get().answers)
            updatedAnswers.set(question.question_id, {
              ...answerState,
              isCorrect: result.isCorrect,
              timeSpentMs,
              submittedAt: new Date().toISOString(),
            })

            set({
              answers: updatedAnswers,
              status: config?.feedback.timing === 'immediate' ? 'feedback' : 'active',
            })

            if (config?.feedback.timing === 'immediate') {
              get().showFeedback({
                questionId: question.question_id,
                isCorrect: result.isCorrect,
                correctOptionId: result.correctOptionId,
                rationale: result.rationale,
                wikiUrl: result.wikiArticleUrl,
                errorDiagnostic: result.errorDiagnostic ?? null,
                // Generation effect fields — forwarded from server result
                closeness: result.closeness,
                correctAnswer: result.correctAnswer,
                questionType: result.questionType,
              })
            }

            if (result.sessionComplete) {
              endSessionAction({ sessionId, endReason: 'completed' })
                .then((endResult) => get().endSession(endResult))
                .catch(() => {
                  get().endSession({
                    score: { correct: get().getCorrectCount(), total: get().totalQuestions, percent: Math.round((get().getCorrectCount() / Math.max(1, get().totalQuestions)) * 100) },
                    subjectBreakdown: [],
                    readinessScoreBefore: 0,
                    readinessScoreAfter: 0,
                    readinessScoreDelta: 0,
                    growthVsPrevious: null,
                    resultsAvailableAt: new Date().toISOString(),
                    trailDayCompleted: false,
                    nextTrailDay: null,
                    missedQuestionCount: get().getUnansweredQuestions().length,
                  })
                })
            }
          } catch {
            // Network failure — queue for retry
            get().queueOfflineSubmission(input)
            set({ status: 'active', ui: { ...get().ui, offlineBannerVisible: true } })
          }
        },

        skipCurrentQuestion: () => {
          const { questions, currentIndex, answers } = get()
          const question = questions[currentIndex]
          if (!question) return

          const prev = answers.get(question.question_id)
          if (!prev) return

          const next = new Map(answers)
          next.set(question.question_id, {
            ...prev,
            isSkipped: true,
            timeSpentMs: Date.now() - prev.timeStartedMs,
          })

          set({ answers: next })
          get().goNext()
        },

        // ── Navigation actions ────────────────────────────────────────────────

        goToQuestion: (index) => {
          const { totalQuestions, questions } = get()
          if (index < 0 || index >= totalQuestions) return

          const now = Date.now()
          const question = questions[index]
          const answers = get().answers
          const answerState = answers.get(question.question_id)

          // Reset timeStartedMs when landing on an unanswered question
          if (answerState && answerState.submittedAt === null && !answerState.isSkipped) {
            const next = new Map(answers)
            next.set(question.question_id, { ...answerState, timeStartedMs: now })
            set({ currentIndex: index, status: 'active', answers: next })
          } else {
            set({ currentIndex: index, status: 'active' })
          }
        },

        goNext: () => {
          const { currentIndex, totalQuestions, config } = get()
          const nextIndex = currentIndex + 1

          if (nextIndex >= totalQuestions) return

          // Check for micro-break trigger
          if (
            config?.breaks.enabled &&
            config.breaks.intervalQuestions > 0 &&
            nextIndex % config.breaks.intervalQuestions === 0
          ) {
            set({ ui: { ...get().ui, microBreakVisible: true } })
            return
          }

          get().goToQuestion(nextIndex)
        },

        goPrevious: () => {
          const { currentIndex, config } = get()
          if (!config?.navigation.backAllowed) return
          if (currentIndex <= 0) return
          get().goToQuestion(currentIndex - 1)
        },

        // ── Elimination actions ───────────────────────────────────────────────

        toggleEliminate: (questionId, optionId) => {
          const { eliminatedOptions } = get()
          const current = eliminatedOptions.get(questionId) ?? new Set<string>()
          const next = new Set(current)
          if (next.has(optionId)) {
            next.delete(optionId)
          } else {
            next.add(optionId)
          }
          const nextMap = new Map(eliminatedOptions)
          nextMap.set(questionId, next)
          set({ eliminatedOptions: nextMap })
        },

        // ── Flag / feedback actions ───────────────────────────────────────────

        toggleFlag: (questionId) => {
          const { answers } = get()
          const prev = answers.get(questionId)
          if (!prev) return
          const next = new Map(answers)
          next.set(questionId, { ...prev, isFlagged: !prev.isFlagged })
          set({ answers: next })
        },

        showFeedback: (data) =>
          set({
            status: 'feedback',
            feedback: {
              visible: true,
              questionId: data.questionId,
              isCorrect: data.isCorrect,
              correctOptionId: data.correctOptionId,
              rationale: data.rationale,
              wikiUrl: data.wikiUrl,
              errorDiagnostic: data.errorDiagnostic ?? null,
              nextButtonEnabled: false,
              closeness: data.closeness,
              correctAnswer: data.correctAnswer,
              questionType: data.questionType,
            },
          }),

        hideFeedback: () =>
          set({
            status: 'active',
            feedback: defaultFeedback(),
          }),

        enableNextButton: () =>
          set((state) => ({
            feedback: { ...state.feedback, nextButtonEnabled: true },
          })),

        // ── Timer actions ─────────────────────────────────────────────────────

        startTimer: (limitMs) => {
          const now = Date.now()
          set({
            timer: {
              startedAt: now,
              pausedAt: null,
              elapsedMs: 0,
              limitMs: limitMs ?? get().timer.limitMs,
              isRunning: true,
            },
            status: 'active',
          })
        },

        pauseTimer: () => {
          const { timer } = get()
          if (!timer.isRunning) return
          set({
            timer: { ...timer, isRunning: false, pausedAt: Date.now() },
          })
        },

        resumeTimer: () => {
          const { timer } = get()
          if (timer.isRunning || timer.pausedAt === null) return
          set({
            timer: { ...timer, isRunning: true, pausedAt: null },
          })
        },

        tickTimer: () => {
          const { timer } = get()
          if (!timer.isRunning) return

          const nextElapsed = timer.elapsedMs + 1000

          // Check countdown expiry
          if (timer.limitMs !== null && nextElapsed >= timer.limitMs) {
            set({
              timer: { ...timer, elapsedMs: timer.limitMs, isRunning: false },
              status: 'submitting',
            })
            const sid = get().sessionId
            if (sid) {
              endSessionAction({ sessionId: sid, endReason: 'timer_expired' })
                .then((endResult) => get().endSession(endResult))
                .catch(() => {
                  get().endSession({
                    score: { correct: get().getCorrectCount(), total: get().totalQuestions, percent: Math.round((get().getCorrectCount() / Math.max(1, get().totalQuestions)) * 100) },
                    subjectBreakdown: [],
                    readinessScoreBefore: 0,
                    readinessScoreAfter: 0,
                    readinessScoreDelta: 0,
                    growthVsPrevious: null,
                    resultsAvailableAt: new Date().toISOString(),
                    trailDayCompleted: false,
                    nextTrailDay: null,
                    missedQuestionCount: get().getUnansweredQuestions().length,
                  })
                })
            }
            return
          }

          set({ timer: { ...timer, elapsedMs: nextElapsed } })
        },

        // ── UI actions ────────────────────────────────────────────────────────

        togglePalette: () =>
          set((state) => ({
            ui: { ...state.ui, paletteOpen: !state.ui.paletteOpen },
          })),

        openWikiPanel: (url) =>
          set((state) => ({
            ui: { ...state.ui, wikiPanelOpen: true, wikiPanelUrl: url },
          })),

        closeWikiPanel: () =>
          set((state) => ({
            ui: { ...state.ui, wikiPanelOpen: false, wikiPanelUrl: null },
          })),

        showExitModal: () =>
          set((state) => ({
            ui: { ...state.ui, exitModalOpen: true },
          })),

        hideExitModal: () =>
          set((state) => ({
            ui: { ...state.ui, exitModalOpen: false },
          })),

        showSubmitModal: () =>
          set((state) => ({
            ui: { ...state.ui, submitModalOpen: true },
          })),

        hideSubmitModal: () =>
          set((state) => ({
            ui: { ...state.ui, submitModalOpen: false },
          })),

        showMicroBreak: () =>
          set((state) => ({
            ui: { ...state.ui, microBreakVisible: true },
          })),

        hideMicroBreak: () => {
          const { currentIndex } = get()
          set((state) => ({
            ui: { ...state.ui, microBreakVisible: false },
          }))
          get().goToQuestion(currentIndex)
        },

        // ── Results / offline actions ─────────────────────────────────────────

        endSession: (result) =>
          set({
            status: 'results',
            results: result,
            timer: { ...get().timer, isRunning: false },
          }),

        queueOfflineSubmission: (input) =>
          set((state) => ({
            pendingSubmissions: [...state.pendingSubmissions, input],
          })),

        flushOfflineQueue: async () => {
          const { pendingSubmissions, sessionId } = get()
          if (pendingSubmissions.length === 0 || !sessionId) return

          const remaining: SubmitAnswerInput[] = []

          for (const input of pendingSubmissions) {
            try {
              await submitAnswerAction(input)
            } catch {
              remaining.push(input)
            }
          }

          set({
            pendingSubmissions: remaining,
            ui: { ...get().ui, offlineBannerVisible: remaining.length > 0 },
          })
        },
      }),
      {
        name: 'slatecamp-quiz-session',
        storage: createJSONStorage(() => localStorage),
        // Persist only what's needed for session recovery — skip derived/transient state
        partialize: (state) => ({
          sessionId: state.sessionId,
          config: state.config,
          status: state.status,
          mode: state.mode,
          questions: state.questions,
          currentIndex: state.currentIndex,
          totalQuestions: state.totalQuestions,
          // Map is not JSON-serializable — serialise as entries array
          answers: Array.from(state.answers.entries()),
          timer: state.timer,
          pendingSubmissions: state.pendingSubmissions,
        }),
        // Re-hydrate answers from entries array back to Map
        merge: (persisted, current) => {
          const p = persisted as Record<string, unknown>
          const rawAnswers = p.answers as Array<[string, QuizAnswerState]> | undefined
          return {
            ...current,
            ...(p as Partial<QuizStore>),
            answers: rawAnswers ? new Map(rawAnswers) : new Map(),
          }
        },
      },
    ),
  ),
)
