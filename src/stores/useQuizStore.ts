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
  StartSessionResult,
  SubmitAnswerInput,
  EndSessionResult,
  FeedbackData,
  ErrorDiagnostic,
} from '@/types/quiz-config'
import type { GestureSignalEvent } from '@/types/patent'
import { generateBindingTokenSafe } from '@/lib/cage/generateBindingToken'

// ─── Slice Types ────────────────────────────────────────────────────────────

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
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' | 'offline'
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
  answersVersion: number
  flaggedSet: Set<string>
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
  initSession: (
    result: StartSessionResult & {
      allQuestionIds?: string[]
      initialCurrentIndex?: number
      restoredAnswers?: Record<string, Partial<QuizAnswerState>>
    },
  ) => void
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
  rebuildDerivedState: () => void
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

type QuizStore = SessionSlice & UISlice & StatsSlice & SettingsSlice

// ─── Default States ─────────────────────────────────────────────────────────

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
  saveStatus: 'idle',
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

const buildFlaggedSet = (answers: Record<string, QuizAnswerState>) => {
  const set = new Set<string>()
  for (const [qid, ans] of Object.entries(answers)) {
    if (ans.isFlagged) set.add(qid)
  }
  return set
}

const updateAnswerEntry = (
  answers: Record<string, QuizAnswerState>,
  questionId: string,
  updater: (prev: QuizAnswerState) => QuizAnswerState,
) => {
  const prev = answers[questionId]
  if (!prev) return false
  const next = updater(prev)
  if (next === prev) return false
  answers[questionId] = next
  return true
}

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
  answersVersion: 0,
  flaggedSet: new Set(),
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
    const questionIds = result.allQuestionIds ?? result.questions.map((question) => question.question_id)

    for (const questionId of questionIds) {
      const restored = result.restoredAnswers?.[questionId]
      answers[questionId] = {
        ...makeAnswerState(now),
        ...restored,
        timeStartedMs:
          restored?.submittedAt == null &&
          (result.initialCurrentIndex ?? 0) === questionIds.indexOf(questionId)
            ? now
            : 0,
      }
    }

    set({
      sessionId: result.sessionId,
      config: result.config,
      status: 'intro',
      mode: result.config.mode,
      questions: result.questions,
      currentIndex: Math.min(
        result.initialCurrentIndex ?? 0,
        Math.max((result.totalQuestions ?? result.questions.length) - 1, 0),
      ),
      totalQuestions: result.totalQuestions,
      answers,
      answersVersion: Object.keys(answers).length,
      flaggedSet: buildFlaggedSet(answers),
      eliminatedOptions: {},
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
    answersVersion: 0,
    flaggedSet: new Set(),
    eliminatedOptions: {},
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
    set((state) => {
      const didUpdate = updateAnswerEntry(state.answers, questionId, (prev) => ({
        ...prev,
        selectedOptionId: optionId,
        questionStatus: prev.questionStatus === 'idle' ? 'selected' : prev.questionStatus,
      }))
      if (!didUpdate) return {}
      return {
        answers: state.answers,
        answersVersion: state.answersVersion + 1,
      }
    })
  },

  deselectAnswer: (questionId) => {
    set((state) => {
      const didUpdate = updateAnswerEntry(state.answers, questionId, (prev) => ({
        ...prev,
        selectedOptionId: null,
      }))
      if (!didUpdate) return {}
      return {
        answers: state.answers,
        answersVersion: state.answersVersion + 1,
      }
    })
  },

  setConfidence: (questionId, level) => {
    set((state) => {
      const didUpdate = updateAnswerEntry(state.answers, questionId, (prev) => ({
        ...prev,
        confidenceLevel: level,
      }))
      if (!didUpdate) return {}
      return {
        answers: state.answers,
        answersVersion: state.answersVersion + 1,
      }
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
      topicId: (question as any).topic_id, // Pass pre-fetched metadata
      difficulty: (question as any).difficulty, // Pass pre-fetched metadata
      confidenceLevel: answerState.confidenceLevel ?? undefined,
      timeSpentMs,
      cageToken: cageResult.token,
      cageTrustLevel: cageResult.trustLevel,
      signalTrace: (signalTrace && signalTrace.length > 0) ? signalTrace : undefined,
      gestureDurationMs: gestureDurationMs > 0 ? gestureDurationMs : undefined,
      sensorsAvailable: deviceSensorsAvailable,
    }

    set({ status: 'submitting', ...nextCageState, ui: { ...get().ui, saveStatus: 'saving' } })

    try {
      const result = await submitAnswerAction(input)
      set({ ui: { ...get().ui, saveStatus: 'saved' } })

      const prevStreak = get().streakCount
      const isLuckyGuess = result.errorDiagnostic?.category === 'lucky_guess'
      const streakUpdate = result.isCorrect && !isLuckyGuess
        ? { streakCount: prevStreak + 1, streakBroken: false }
        : !result.isCorrect
          ? { streakCount: 0, streakBroken: false }
          : {}

      set((state) => {
        const didUpdate = updateAnswerEntry(state.answers, question.question_id, (prev) => ({
          ...prev,
          isCorrect: result.isCorrect,
          timeSpentMs,
          submittedAt: new Date().toISOString(),
          questionStatus: (config?.feedback.timing === 'immediate' ? 'feedback' : 'reviewed') as QuestionStatus,
        }))
        if (!didUpdate) return {}
        return {
          answers: state.answers,
          answersVersion: state.answersVersion + 1,
          status: config?.feedback.timing === 'immediate' ? 'feedback' : 'active',
          ...streakUpdate,
        }
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
      set({ status: 'active', ui: { ...get().ui, offlineBannerVisible: true, saveStatus: 'offline' } })
    }
  },

  skipCurrentQuestion: () => {
    const { questions, currentIndex } = get()
    const question = questions[currentIndex]
    if (!question) return
    set((state) => {
      const didUpdate = updateAnswerEntry(state.answers, question.question_id, (prev) => ({
        ...prev,
        isSkipped: true,
        timeSpentMs: Date.now() - prev.timeStartedMs,
      }))
      if (!didUpdate) return {}
      return {
        answers: state.answers,
        answersVersion: state.answersVersion + 1,
      }
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
    set((state) => {
      const prev = state.answers[questionId]
      if (!prev) return {}
      const nextFlagged = !prev.isFlagged
      const nextSet = new Set(state.flaggedSet)
      if (nextFlagged) nextSet.add(questionId)
      else nextSet.delete(questionId)
      state.answers[questionId] = { ...prev, isFlagged: nextFlagged }
      return {
        answers: state.answers,
        answersVersion: state.answersVersion + 1,
        flaggedSet: nextSet,
      }
    })
  },

  goToQuestion: (index) => {
    const { totalQuestions, questions } = get()
    if (index < 0 || index >= totalQuestions) return
    const now = Date.now()
    const question = questions[index]
    const answerState = get().answers[question.question_id]

    if (answerState && answerState.submittedAt === null && !answerState.isSkipped) {
      set((state) => {
        const didUpdate = updateAnswerEntry(state.answers, question.question_id, (prev) => ({
          ...prev,
          timeStartedMs: now,
        }))
        return {
          currentIndex: index,
          status: 'active',
          ...(didUpdate
            ? { answers: state.answers, answersVersion: state.answersVersion + 1 }
            : {}),
        }
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
    const nextAnswers = answers
    const nextQuestions = [...questions]
    let addedCount = 0

    for (const q of newQuestions) {
      if (!nextAnswers[q.question_id]) {
        nextAnswers[q.question_id] = makeAnswerState(now)
        nextQuestions.push(q)
        addedCount += 1
      }
    }

    if (addedCount === 0) return
    set((state) => ({
      questions: nextQuestions,
      answers: state.answers,
      answersVersion: state.answersVersion + addedCount,
      totalQuestions: Math.max(state.totalQuestions, nextQuestions.length),
    }))
  },

  rebuildDerivedState: () => {
    const { answers } = get()
    set({
      flaggedSet: buildFlaggedSet(answers),
    })
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
    const { feedback } = get()
    if (feedback.questionId) {
      set((state) => {
        const didUpdate = updateAnswerEntry(state.answers, feedback.questionId!, (prev) => ({
          ...prev,
          questionStatus: 'reviewed',
        }))
        if (!didUpdate) return { status: 'active', feedback: defaultFeedback() }
        return {
          status: 'active',
          feedback: defaultFeedback(),
          answers: state.answers,
          answersVersion: state.answersVersion + 1,
        }
      })
      return
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
    const { questions, flaggedSet } = get()
    return questions.filter((q) => flaggedSet.has(q.question_id))
  },
  getFlaggedSet: () => {
    return get().flaggedSet
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
          pendingSubmissions: state.pendingSubmissions,
          settings: state.settings,
          streakCount: state.streakCount,
        }),
        merge: (persisted, current) => {
          const p = persisted as Record<string, unknown>
          const merged = {
            ...current,
            ...(p as Partial<QuizStore>),
          }
          const mergedAnswers = merged.answers ?? {}
          return {
            ...merged,
            answersVersion: Object.keys(mergedAnswers).length,
            flaggedSet: buildFlaggedSet(mergedAnswers),
          }
        },
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      },
    ),
  ),
)
