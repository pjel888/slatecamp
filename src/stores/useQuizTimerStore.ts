import { create } from 'zustand'
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import { endSession as endSessionAction } from '@/lib/actions/quiz-v2'
import type { TimerColorState } from '@/types/quiz-config'
import { useQuizStore } from '@/stores/useQuizStore'

interface QuizTimerState {
  sessionId: string | null
  startedAt: number | null
  pausedAt: number | null
  elapsedMs: number
  limitMs: number | null
  isRunning: boolean
  colorState: TimerColorState
  startTimer: (input: { limitMs?: number | null; sessionId?: string | null }) => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  tickTimer: () => void
}

const defaultTimer = (): Omit<
  QuizTimerState,
  'startTimer' | 'pauseTimer' | 'resumeTimer' | 'stopTimer' | 'resetTimer' | 'tickTimer'
> => ({
  sessionId: null,
  startedAt: null,
  pausedAt: null,
  elapsedMs: 0,
  limitMs: null,
  isRunning: false,
  colorState: 'normal',
})

const buildFallbackResults = () => {
  const quizState = useQuizStore.getState()
  return {
    score: {
      correct: quizState.getCorrectCount(),
      total: quizState.totalQuestions,
      percent: Math.round(
        (quizState.getCorrectCount() / Math.max(1, quizState.totalQuestions)) * 100,
      ),
    },
    subjectBreakdown: [],
    readinessScoreBefore: 0,
    readinessScoreAfter: 0,
    readinessScoreDelta: 0,
    growthVsPrevious: null,
    resultsAvailableAt: new Date().toISOString(),
    trailDayCompleted: false,
    nextTrailDay: null,
    missedQuestionCount: quizState.getUnansweredQuestions().length,
  }
}

const handleTimerExpiry = async (sessionId: string) => {
  useQuizStore.setState({ status: 'submitting' })
  try {
    const endResult = await endSessionAction({ sessionId, endReason: 'timer_expired' })
    useQuizStore.getState().endSession(endResult)
  } catch {
    useQuizStore.getState().endSession(buildFallbackResults())
  }
}

export const useQuizTimerStore = create<QuizTimerState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...defaultTimer(),
        startTimer: ({ limitMs, sessionId }) => {
          const now = Date.now()
          set({
            sessionId: sessionId ?? get().sessionId,
            startedAt: now,
            pausedAt: null,
            elapsedMs: 0,
            limitMs: limitMs ?? get().limitMs,
            isRunning: true,
            colorState: 'normal',
          })
          useQuizStore.setState({ status: 'active' })
        },
        pauseTimer: () => {
          const { isRunning } = get()
          if (!isRunning) return
          set({ isRunning: false, pausedAt: Date.now() })
        },
        resumeTimer: () => {
          const { isRunning, pausedAt } = get()
          if (isRunning || pausedAt === null) return
          set({ isRunning: true, pausedAt: null })
        },
        stopTimer: () => {
          const { isRunning } = get()
          if (!isRunning) return
          set({ isRunning: false })
        },
        resetTimer: () => {
          set(defaultTimer())
        },
        tickTimer: () => {
          const { isRunning, elapsedMs, limitMs, sessionId } = get()
          if (!isRunning) return
          const nextElapsed = elapsedMs + 1000

          if (limitMs !== null && nextElapsed >= limitMs) {
            set({ elapsedMs: limitMs, isRunning: false, colorState: 'critical' })
            if (sessionId) void handleTimerExpiry(sessionId)
            return
          }

          let colorState: TimerColorState = 'normal'
          if (limitMs !== null && limitMs > 0) {
            const percentRemaining = (limitMs - nextElapsed) / limitMs
            if (percentRemaining <= 0.20) colorState = 'critical'
            else if (percentRemaining <= 0.50) colorState = 'warning'
          }
          set({ elapsedMs: nextElapsed, colorState })
        },
      }),
      {
        name: 'slatecamp-quiz-timer',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sessionId: state.sessionId,
          startedAt: state.startedAt,
          pausedAt: state.pausedAt,
          elapsedMs: state.elapsedMs,
          limitMs: state.limitMs,
          isRunning: state.isRunning,
          colorState: state.colorState,
        }),
      },
    ),
  ),
)
