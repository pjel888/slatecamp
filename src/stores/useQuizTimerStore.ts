import { create } from 'zustand'
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import { endSession as endSessionAction } from '@/lib/actions/quiz-v2'
import type { TimerColorState } from '@/types/quiz-config'
import { useQuizStore } from '@/stores/useQuizStore'

interface QuizTimerState {
  sessionId: string | null
  startedAt: number | null
  endedAt: number | null       // Absolute timestamp when timer should expire
  pausedAt: number | null
  elapsedMs: number            // Kept for count-up (endurance) mode
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
  endedAt: null,
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
          const effectiveLimitMs = limitMs ?? get().limitMs
          set({
            sessionId: sessionId ?? get().sessionId,
            startedAt: now,
            endedAt: effectiveLimitMs ? now + effectiveLimitMs : null,
            pausedAt: null,
            elapsedMs: 0,
            limitMs: effectiveLimitMs,
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
          const { isRunning, pausedAt, endedAt } = get()
          if (isRunning || pausedAt === null) return
          // Shift endedAt forward by the pause duration
          const pauseDuration = Date.now() - pausedAt
          set({
            isRunning: true,
            pausedAt: null,
            endedAt: endedAt ? endedAt + pauseDuration : null,
          })
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
          const { isRunning, endedAt, startedAt, sessionId } = get()

          // Guard: don't tick if not running or no session
          if (!isRunning || sessionId === null) return

          const now = Date.now()

          // Countdown mode (has endedAt)
          if (endedAt !== null) {
            const remaining = Math.max(0, endedAt - now)

            if (remaining <= 0) {
              set({ isRunning: false, colorState: 'critical', elapsedMs: get().limitMs ?? 0 })
              void handleTimerExpiry(sessionId)
              return
            }

            const totalMs = get().limitMs ?? 1
            const percentRemaining = remaining / totalMs
            let colorState: TimerColorState = 'normal'
            if (percentRemaining <= 0.20) colorState = 'critical'
            else if (percentRemaining <= 0.50) colorState = 'warning'

            set({ elapsedMs: now - (startedAt ?? now), colorState })
            return
          }

          // Count-up mode (endurance — no limit)
          set({ elapsedMs: now - (startedAt ?? now) })
        },
      }),
      {
        name: 'slatecamp-quiz-timer',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          sessionId: state.sessionId,
          startedAt: state.startedAt,
          endedAt: state.endedAt,
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
