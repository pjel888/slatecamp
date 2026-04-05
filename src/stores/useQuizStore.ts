// src/stores/useQuizStore.ts — Centralized quiz session state (Zustand)
// Refactored to Sliced Architecture (Phase 2)

import { create, StateCreator } from 'zustand'
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
  QuestionStatus,
  TimerColorState,
  StartSessionResult,
  SubmitAnswerInput,
  EndSessionResult,
  FeedbackData,
  ErrorDiagnostic,
  PressureLevel,
} from '@/types/quiz-config'
import type { GestureSignalEvent } from '@/types/patent'
import { generateBindingTokenSafe } from '@/lib/cage/generateBindingToken'

// ─── Slice Types ────────────────────────────────────────────────────────────

interface TimerState {
  startedAt: number | null
  pausedAt: number | null
  elapsedMs: number
  limitMs: number | null
  isRunning: boolean
  colorState: TimerColorState
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
  closeness: number | undefined
  correctAnswer: string | undefined
  questionType: QuestionType | undefined
  feedbackGateActive: boolean
  feedbackGateRemainingMs: number
}

interface SettingsState {
  hapticEnabled: boolean
  reducedMotion: boolean
}

interface UIState {
  paletteOpen: boolean
  wikiPanelOpen: boolean
  wikiPanelUrl: string | null
  exitModalOpen: boolean
  submitModalOpen: boolean
  microBreakVisible: boolean
  offlineBannerVisible: boolean
  calculatingResults: boolean
}

// ─── Slice Interfaces ───────────────────────────────────────────────────────

interface SessionSlice {
  sessionId: string | null
  config: QuizSessionConfig | null
  status: 'idle' | 'loading' | 'intro' | 'active' | 'feedback' | 'submitting' | 'results' | 'review'
  mode: QuizMode | null
  questions: QuestionForClient[]
  currentIndex: number
  totalQuestions: number
  answers: Record<string, QuizAnswerState>
  eliminatedOptions: Record<string, string[]>
  results: EndSessionResult | null
  pendingSubmissions: SubmitAnswerInput[]
  _hasHydrated: boolean

  // Patent Chain State (Claim 20)
  nonces: Record<string, { nonce: string; expiresAt: string }>
  sessionKey: string | null
  cageSequenceNumber: number
  previousCageTokenHash: string | null
  deviceSensorsAvailable: boolean

  // Actions
  initSession: (result: StartSessionResult) => void
  reset: () => void
  selectAnswer: (questionId: string, optionId: string) => void
  deselectAnswer: (questionId: string) => void
  setConfidence: (questionId: string, level: number) => void
  submitCurrentAnswer: (signalTrace?: GestureSignalEvent[]) => Promise<void>
  skipCurrentQuestion: () => void
  toggleEliminate: (questionId: string, optionId: string) => void
  toggleFlag: (questionId: string) => void
  goToQuestion: (index: number) => void
  goNext: () => void
  goPrevious: () => void
  endSession: (result: EndSessionResult) => void
  queueOfflineSubmission: (input: SubmitAnswerInput) => void
  flushOfflineQueue: () => Promise<void>
  setSensorsAvailable: (available: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
  addQuestions: (newQuestions: QuestionForClient[]) => void
}

interface TimerSlice {
  timer: TimerState
  startTimer: (limitMs?: number) => void
  pauseTimer: () => void
  resumeTimer: () => void
  tickTimer: () => void
}

interface UISlice {
  ui: UIState
  feedback: FeedbackState
  togglePalette: () => void
  openWikiPanel: (url: string) => void
  closeWikiPanel: () => void
  showExitModal: () => void
  hideExitModal: () => void
  showSubmitModal: () => void
  hideSubmitModal: () => void
  showMicroBreak: () => void
  hideMicroBreak: () => void
  showFeedback: (data: FeedbackData) => void
  hideFeedback: () => void
  enableNextButton: () => void
  startFeedbackGate: (durationMs: number) => void
  tickFeedbackGate: () => void
  clearFeedbackGate: () => void
}

interface StatsSlice {
  streakCount: number
  streakBroken: boolean
  clearStreakBroken: () => void
  getCurrentQuestion: () => QuestionForClient | null
  getAnsweredCount: () => number
  getCorrectCount: () => number
  getRunningAccuracy: () => number
  getUnansweredQuestions: () => QuestionForClient[]
  getFlaggedQuestions: () => QuestionForClient[]
  getFlaggedSet: () => Set<string>
  getFeedbackData: () => FeedbackData | null
  getProgress: () => { answered: number; total: number; percent: number }
}

interface SettingsSlice {
  settings: SettingsState
  updateSettings: (partial: Partial<SettingsState>) => void
}

type QuizStore = SessionSlice & TimerSlice & UISlice & StatsSlice & SettingsSlice

// ─── Default States ─────────────────────────────────────────────────────────

const defaultTimer = (): TimerState => ({
  startedAt: null,
  pausedAt: null,
  elapsedMs: 0,
  limitMs: null,
  isRunning: false,
  colorState: 'normal',
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
  feedbackGateActive: false,
  feedbackGateRemainingMs: 0,
})

const defaultUI = (): UIState => ({
  paletteOpen: false,
  wikiPanelOpen: false,
  wikiPanelUrl: null,
  exitModalOpen: false,
  submitModalOpen: false,
  microBreakVisible: false,
  offlineBannerVisible: false,
  calculatingResults: false,
})

const defaultSettings = (): SettingsState => ({
  hapticEnabled: true,
  /**
   * Initialized to false for hydration safety.
   * Synced with browser preference in a useEffect after mount.
   */
  reducedMotion: false,
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
  questionStatus: 'idle',
})

// ─── Slices ─────────────────────────────────────────────────────────────────

const createSessionSlice: StateCreator<QuizStore, [["zustand/subscribeWithSelector", never], ["zustand/persist", unknown]], [], SessionSlice> = (set, get) => ({
  sessionId: null,
  config: null,
  status: 'idle',
  mode: null,
  questions: [],
  currentIndex: 0,
  totalQuestions: 0,
  answers: {},
  eliminatedOptions: {},
  results: null,
  pendingSubmissions: [],
  nonces: {},
  sessionKey: null,
  cageSequenceNumber: 0,
  previousCageTokenHash: null,
  deviceSensorsAvailable: false,
  _hasHydrated: false,

  initSession: (result) => {
    const now = Date.now()
    const answers: Record<string, QuizAnswerState> = {}
    for (const q of result.questions) {
      answers[q.question_id] = makeAnswerState(now)
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
      eliminatedOptions: {},
      timer: { ...defaultTimer(), limitMs },
      feedback: defaultFeedback(),
      ui: defaultUI(),
      nonces: result.nonces ?? {},
      sessionKey: result.sessionKey ?? null,
      cageSequenceNumber: 0,
      previousCageTokenHash: null,
      pendingSubmissions: [],
      results: null,
    })
  },

  reset: () => set({
    sessionId: null,
    config: null,
    status: 'idle',
    mode: null,
    questions: [],
    currentIndex: 0,
    totalQuestions: 0,
    answers: {},
    eliminatedOptions: {},
    timer: defaultTimer(),
    feedback: defaultFeedback(),
    ui: defaultUI(),
    streakCount: 0,
    streakBroken: false,
    nonces: {},
    sessionKey: null,
    cageSequenceNumber: 0,
    previousCageTokenHash: null,
    deviceSensorsAvailable: false,
    pendingSubmissions: [],
    results: null,
  }),

  selectAnswer: (questionId, optionId) => {
    const { answers } = get()
    const prev = answers[questionId]
    if (!prev) return
    set({
      answers: {
        ...answers,
        [questionId]: {
          ...prev,
          selectedOptionId: optionId,
          questionStatus: prev.questionStatus === 'idle' ? 'selected' : prev.questionStatus,
        },
      },
    })
  },

  deselectAnswer: (questionId) => {
    const { answers } = get()
    const prev = answers[questionId]
    if (!prev) return
    set({
      answers: {
        ...answers,
        [questionId]: { ...prev, selectedOptionId: null },
      },
    })
  },

  setConfidence: (questionId, level) => {
    const { answers } = get()
    const prev = answers[questionId]
    if (!prev) return
    set({
      answers: {
        ...answers,
        [questionId]: { ...prev, confidenceLevel: level },
      },
    })
  },

  submitCurrentAnswer: async (signalTrace) => {
    const { sessionId, questions, currentIndex, answers, config,
      nonces, sessionKey, cageSequenceNumber, previousCageTokenHash,
      deviceSensorsAvailable } = get()
    const question = questions[currentIndex]
    if (!question || !sessionId) return

    const answerState = answers[question.question_id]
    if (!answerState?.selectedOptionId) return

    const timeSpentMs = Date.now() - answerState.timeStartedMs

    // Patent: Generate CAGE binding token (Claim 20)
    const questionNonce = nonces[question.question_id]
    const cageResult = await generateBindingTokenSafe(
      { questionId: question.question_id, selectedOptionId: answerState.selectedOptionId },
      signalTrace ?? [],
      questionNonce?.nonce ?? null,
      cageSequenceNumber,
      sessionKey,
      previousCageTokenHash,
    )

    const nextCageState = cageResult.token
      ? { cageSequenceNumber: cageSequenceNumber + 1, previousCageTokenHash: cageResult.token.signature }
      : { cageSequenceNumber: cageSequenceNumber + 1 }

    const gestureDurationMs = (signalTrace && signalTrace.length >= 2)
      ? signalTrace[signalTrace.length - 1].timestamp - signalTrace[0].timestamp
      : 0

    const input: SubmitAnswerInput = {
      sessionId,
      questionId: question.question_id,
      selectedOptionId: answerState.selectedOptionId,
      confidenceLevel: answerState.confidenceLevel ?? undefined,
      timeSpentMs,
      cageToken: cageResult.token,
      cageTrustLevel: cageResult.trustLevel,
      signalTrace: (signalTrace && signalTrace.length > 0) ? signalTrace : undefined,
      gestureDurationMs: gestureDurationMs > 0 ? gestureDurationMs : undefined,
      sensorsAvailable: deviceSensorsAvailable,
    }

    set({ status: 'submitting', ...nextCageState })

    try {
      const result = await submitAnswerAction(input)
      const { answers: currentAnswers } = get()
      const currentAnswerState = currentAnswers[question.question_id]

      if (!currentAnswerState) return

      const updatedAnswers = {
        ...currentAnswers,
        [question.question_id]: {
          ...currentAnswerState,
          isCorrect: result.isCorrect,
          timeSpentMs,
          submittedAt: new Date().toISOString(),
          questionStatus: (config?.feedback.timing === 'immediate' ? 'feedback' : 'reviewed') as QuestionStatus,
        },
      }

      const prevStreak = get().streakCount
      const isLuckyGuess = result.errorDiagnostic?.category === 'lucky_guess'
      const streakUpdate = result.isCorrect && !isLuckyGuess
        ? { streakCount: prevStreak + 1, streakBroken: false }
        : !result.isCorrect
          ? { streakCount: 0, streakBroken: false }
          : {}

      set({
        answers: updatedAnswers,
        status: config?.feedback.timing === 'immediate' ? 'feedback' : 'active',
        ...streakUpdate,
      })

      if (config?.feedback.timing === 'immediate') {
        get().showFeedback({
          questionId: question.question_id,
          isCorrect: result.isCorrect,
          correctOptionId: result.correctOptionId,
          rationale: result.rationale,
          wikiUrl: result.wikiArticleUrl,
          errorDiagnostic: result.errorDiagnostic ?? null,
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
      get().queueOfflineSubmission(input)
      set({ status: 'active', ui: { ...get().ui, offlineBannerVisible: true } })
    }
  },

  skipCurrentQuestion: () => {
    const { questions, currentIndex, answers } = get()
    const question = questions[currentIndex]
    if (!question) return
    const prev = answers[question.question_id]
    if (!prev) return
    set({
      answers: {
        ...answers,
        [question.question_id]: {
          ...prev,
          isSkipped: true,
          timeSpentMs: Date.now() - prev.timeStartedMs,
        },
      },
    })
    get().goNext()
  },

  toggleEliminate: (questionId, optionId) => {
    const { eliminatedOptions } = get()
    const current = eliminatedOptions[questionId] ?? []
    const next = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId]
    set({
      eliminatedOptions: {
        ...eliminatedOptions,
        [questionId]: next,
      },
    })
  },

  toggleFlag: (questionId) => {
    const { answers } = get()
    const prev = answers[questionId]
    if (!prev) return
    set({
      answers: {
        ...answers,
        [questionId]: { ...prev, isFlagged: !prev.isFlagged },
      },
    })
  },

  goToQuestion: (index) => {
    const { totalQuestions, questions, answers } = get()
    if (index < 0 || index >= totalQuestions) return
    const now = Date.now()
    const question = questions[index]
    const answerState = answers[question.question_id]

    if (answerState && answerState.submittedAt === null && !answerState.isSkipped) {
      set({
        currentIndex: index,
        status: 'active',
        answers: {
          ...answers,
          [question.question_id]: { ...answerState, timeStartedMs: now },
        },
      })
    } else {
      set({ currentIndex: index, status: 'active' })
    }
  },

  goNext: () => {
    const { currentIndex, totalQuestions, config } = get()
    const nextIndex = currentIndex + 1
    if (nextIndex >= totalQuestions) return
    if (config?.breaks.enabled && config.breaks.intervalQuestions > 0 && nextIndex % config.breaks.intervalQuestions === 0) {
      set({ ui: { ...get().ui, microBreakVisible: true } })
      return
    }
    get().goToQuestion(nextIndex)
  },

  goPrevious: () => {
    const { currentIndex, config } = get()
    if (!config?.navigation.backAllowed || currentIndex <= 0) return
    get().goToQuestion(currentIndex - 1)
  },

  endSession: (result) => set({
    status: 'results',
    results: result,
    timer: { ...get().timer, isRunning: false },
  }),

  queueOfflineSubmission: (input) => set((state) => ({
    pendingSubmissions: [...state.pendingSubmissions, input],
  })),

  flushOfflineQueue: async () => {
    const { pendingSubmissions, sessionId } = get()
    if (pendingSubmissions.length === 0 || !sessionId) return
    const remaining: SubmitAnswerInput[] = []
    for (const input of pendingSubmissions) {
      try { await submitAnswerAction(input) } catch { remaining.push(input) }
    }
    set({
      pendingSubmissions: remaining,
      ui: { ...get().ui, offlineBannerVisible: remaining.length > 0 },
    })
  },

  setSensorsAvailable: (available) => set({ deviceSensorsAvailable: available }),
  setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
  addQuestions: (newQuestions) => {
    const { questions, answers } = get()
    const now = Date.now()
    const nextAnswers = { ...answers }
    const nextQuestions = [...questions]

    for (const q of newQuestions) {
      if (!nextAnswers[q.question_id]) {
        nextAnswers[q.question_id] = makeAnswerState(now)
        nextQuestions.push(q)
      }
    }

    set({ questions: nextQuestions, answers: nextAnswers })
  },
})

const createTimerSlice: StateCreator<QuizStore, [["zustand/subscribeWithSelector", never], ["zustand/persist", unknown]], [], TimerSlice> = (set, get) => ({
  timer: defaultTimer(),
  startTimer: (limitMs) => {
    const now = Date.now()
    set({
      timer: {
        startedAt: now,
        pausedAt: null,
        elapsedMs: 0,
        limitMs: limitMs ?? get().timer.limitMs,
        isRunning: true,
        colorState: 'normal',
      },
      status: 'active',
    })
  },
  pauseTimer: () => {
    const { timer } = get()
    if (!timer.isRunning) return
    set({ timer: { ...timer, isRunning: false, pausedAt: Date.now() } })
  },
  resumeTimer: () => {
    const { timer } = get()
    if (timer.isRunning || timer.pausedAt === null) return
    set({ timer: { ...timer, isRunning: true, pausedAt: null } })
  },
  tickTimer: () => {
    const { timer, sessionId } = get()
    if (!timer.isRunning) return
    const nextElapsed = timer.elapsedMs + 1000

    if (timer.limitMs !== null && nextElapsed >= timer.limitMs) {
      set({
        timer: { ...timer, elapsedMs: timer.limitMs, isRunning: false, colorState: 'critical' },
        status: 'submitting',
      })
      if (sessionId) {
        endSessionAction({ sessionId, endReason: 'timer_expired' })
          .then((endResult) => get().endSession(endResult))
          .catch(() => {
            get().endSession({
              score: { correct: get().getCorrectCount(), total: get().totalQuestions, percent: Math.round((get().getCorrectCount() / Math.max(1, get().totalQuestions)) * 100) },
              subjectBreakdown: [], readinessScoreBefore: 0, readinessScoreAfter: 0, readinessScoreDelta: 0,
              growthVsPrevious: null, resultsAvailableAt: new Date().toISOString(),
              trailDayCompleted: false, nextTrailDay: null, missedQuestionCount: get().getUnansweredQuestions().length,
            })
          })
      }
      return
    }

    let colorState: TimerColorState = 'normal'
    if (timer.limitMs !== null && timer.limitMs > 0) {
      const percentRemaining = (timer.limitMs - nextElapsed) / timer.limitMs
      if (percentRemaining <= 0.20) colorState = 'critical'
      else if (percentRemaining <= 0.50) colorState = 'warning'
    }
    set({ timer: { ...timer, elapsedMs: nextElapsed, colorState } })
  },
})

const createUISlice: StateCreator<QuizStore, [["zustand/subscribeWithSelector", never], ["zustand/persist", unknown]], [], UISlice> = (set, get) => ({
  ui: defaultUI(),
  feedback: defaultFeedback(),
  togglePalette: () => set((state) => ({ ui: { ...state.ui, paletteOpen: !state.ui.paletteOpen } })),
  openWikiPanel: (url) => set((state) => ({ ui: { ...state.ui, wikiPanelOpen: true, wikiPanelUrl: url } })),
  closeWikiPanel: () => set((state) => ({ ui: { ...state.ui, wikiPanelOpen: false, wikiPanelUrl: null } })),
  showExitModal: () => set((state) => ({ ui: { ...state.ui, exitModalOpen: true } })),
  hideExitModal: () => set((state) => ({ ui: { ...state.ui, exitModalOpen: false } })),
  showSubmitModal: () => set((state) => ({ ui: { ...state.ui, submitModalOpen: true } })),
  hideSubmitModal: () => set((state) => ({ ui: { ...state.ui, submitModalOpen: false } })),
  showMicroBreak: () => set((state) => ({ ui: { ...state.ui, microBreakVisible: true } })),
  hideMicroBreak: () => {
    const { currentIndex } = get()
    set((state) => ({ ui: { ...state.ui, microBreakVisible: false } }))
    get().goToQuestion(currentIndex)
  },
  showFeedback: (data) => set({
    status: 'feedback',
    feedback: {
      ...defaultFeedback(),
      visible: true,
      questionId: data.questionId,
      isCorrect: data.isCorrect,
      correctOptionId: data.correctOptionId,
      rationale: data.rationale,
      wikiUrl: data.wikiUrl,
      errorDiagnostic: data.errorDiagnostic ?? null,
      closeness: data.closeness,
      correctAnswer: data.correctAnswer,
      questionType: data.questionType,
    },
  }),
  hideFeedback: () => {
    const { feedback, answers } = get()
    if (feedback.questionId) {
      const prev = answers[feedback.questionId]
      if (prev) {
        set({
          status: 'active',
          feedback: defaultFeedback(),
          answers: {
            ...answers,
            [feedback.questionId]: { ...prev, questionStatus: 'reviewed' },
          },
        })
        return
      }
    }
    set({ status: 'active', feedback: defaultFeedback() })
  },
  enableNextButton: () => set((state) => ({ feedback: { ...state.feedback, nextButtonEnabled: true } })),
  startFeedbackGate: (durationMs) => set((state) => ({
    feedback: { ...state.feedback, feedbackGateActive: true, feedbackGateRemainingMs: durationMs, nextButtonEnabled: false },
  })),
  tickFeedbackGate: () => {
    const { feedback } = get()
    if (!feedback.feedbackGateActive) return
    const nextRemaining = Math.max(0, feedback.feedbackGateRemainingMs - 100)
    if (nextRemaining <= 0) {
      set((state) => ({ feedback: { ...state.feedback, feedbackGateActive: false, feedbackGateRemainingMs: 0, nextButtonEnabled: true } }))
    } else {
      set((state) => ({ feedback: { ...state.feedback, feedbackGateRemainingMs: nextRemaining } }))
    }
  },
  clearFeedbackGate: () => set((state) => ({ feedback: { ...state.feedback, feedbackGateActive: false, feedbackGateRemainingMs: 0 } })),
})

const createStatsSlice: StateCreator<QuizStore, [["zustand/subscribeWithSelector", never], ["zustand/persist", unknown]], [], StatsSlice> = (set, get) => ({
  streakCount: 0,
  streakBroken: false,
  clearStreakBroken: () => set({ streakBroken: false }),
  getCurrentQuestion: () => {
    const { questions, currentIndex } = get()
    return questions[currentIndex] ?? null
  },
  getAnsweredCount: () => {
    let count = 0
    for (const ans of Object.values(get().answers)) {
      if (ans.submittedAt !== null || ans.isSkipped) count++
    }
    return count
  },
  getCorrectCount: () => {
    let count = 0
    for (const ans of Object.values(get().answers)) {
      if (ans.isCorrect === true) count++
    }
    return count
  },
  getRunningAccuracy: () => {
    const answered = get().getAnsweredCount()
    return answered === 0 ? 0 : get().getCorrectCount() / answered
  },
  getUnansweredQuestions: () => {
    const { questions, answers } = get()
    return questions.filter((q) => {
      const ans = answers[q.question_id]
      return !ans || (ans.submittedAt === null && !ans.isSkipped)
    })
  },
  getFlaggedQuestions: () => {
    const { questions, answers } = get()
    return questions.filter((q) => answers[q.question_id]?.isFlagged === true)
  },
  getFlaggedSet: () => {
    const set = new Set<string>()
    for (const [qid, ans] of Object.entries(get().answers)) {
      if (ans.isFlagged) set.add(qid)
    }
    return set
  },
  getFeedbackData: () => {
    const { feedback } = get()
    if (!feedback.visible || !feedback.questionId) return null
    return {
      questionId: feedback.questionId,
      isCorrect: feedback.isCorrect ?? false,
      correctOptionId: feedback.correctOptionId ?? '',
      rationale: feedback.rationale,
      wikiUrl: feedback.wikiUrl,
      errorDiagnostic: feedback.errorDiagnostic,
      closeness: feedback.closeness,
      correctAnswer: feedback.correctAnswer,
      questionType: feedback.questionType,
    }
  },

  getProgress: () => {
    const answered = get().getAnsweredCount()
    const total = get().totalQuestions
    return { answered, total, percent: total > 0 ? Math.round((answered / total) * 100) : 0 }
  },
})

const createSettingsSlice: StateCreator<QuizStore, [["zustand/subscribeWithSelector", never], ["zustand/persist", unknown]], [], SettingsSlice> = (set) => ({
  settings: defaultSettings(),
  updateSettings: (partial) => set((state) => ({ settings: { ...state.settings, ...partial } })),
})

// ─── The Store ──────────────────────────────────────────────────────────────

export const useQuizStore = create<QuizStore>()(
  subscribeWithSelector(
    persist(
      (...a) => ({
        ...createSessionSlice(...a),
        ...createTimerSlice(...a),
        ...createUISlice(...a),
        ...createStatsSlice(...a),
        ...createSettingsSlice(...a),
      }),
      {
        name: 'slatecamp-quiz-session',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sessionId: state.sessionId,
          config: state.config,
          status: state.status,
          mode: state.mode,
          questions: state.questions,
          currentIndex: state.currentIndex,
          totalQuestions: state.totalQuestions,
          answers: state.answers,
          timer: state.timer,
          pendingSubmissions: state.pendingSubmissions,
          settings: state.settings,
          streakCount: state.streakCount,
        }),
        merge: (persisted, current) => {
          const p = persisted as Record<string, unknown>
          return {
            ...current,
            ...(p as Partial<QuizStore>),
          }
        },
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      },
    ),
  ),
)
