'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'
import { BaseQuizShell } from './BaseQuizShell'
import { QuizBody } from './QuizBody'
import { analyzeStamina, detectFatigue } from '@/lib/quiz/stamina-analysis'
import { cn } from '@/lib/utils'
import { useQuizShellHandlers } from '@/hooks/useQuizShellHandlers'
import { 
  getSessionQuestions, 
  updateSessionProgress 
} from '@/lib/actions/quiz-v2'
import type { 
  QuizSessionConfig, 
  QuestionForClient,
  QuizAnswerState
} from '@/types/quiz-config'

interface EnduranceShellProps {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
  allQuestionIds: string[]
  totalQuestionCount?: number
  initialCurrentIndex?: number
  restoredAnswers?: Record<string, Partial<QuizAnswerState>>
}

/**
 * EnduranceShell: Specialized shell for "Design Endurance Training".
 * - Real-time stamina tracking (accuracy-by-block).
 * - Fatigue nudges when accuracy drops > 15%.
 */
export const EnduranceShell = ({
  sessionId,
  config,
  questions,
  allQuestionIds,
  totalQuestionCount,
  initialCurrentIndex = 0,
  restoredAnswers,
}: EnduranceShellProps) => {
  const router = useRouter()
  const initializedRef = useRef(false)

  // Store Selectors
  const status = useQuizStore((s) => s.status)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const totalQuestions = useQuizStore((s) => s.totalQuestions)
  const results = useQuizStore((s) => s.results)
  const _hasHydrated = useQuizStore((s) => s._hasHydrated)
  
  const currentQuestion = useQuizStore((s) => s.questions[s.currentIndex])
  const currentAnswer = useQuizStore((s) => 
    currentQuestion ? s.answers[currentQuestion.question_id] : null
  )
  
  const answers = useQuizStore((s) => s.answers)
  const answersVersion = useQuizStore((s) => s.answersVersion)
  const feedback = useQuizStore((s) => s.feedback)
  const feedbackData = useMemo(() => {
    if (!feedback.visible || !feedback.questionId) return null
    return {
      questionId: feedback.questionId,
      isCorrect: feedback.isCorrect ?? false,
      correctOptionId: feedback.correctOptionId ?? '',
      rationale: feedback.rationale,
      wikiUrl: feedback.wikiUrl,
      errorDiagnostic: feedback.errorDiagnostic,
      closeness: feedback.closeness,
    }
  }, [feedback])

  // Stamina Analysis (Memoized)
  const staminaMetrics = useMemo(() => {
    const answerList = Object.values(answers).map(a => ({
      is_correct: a.isCorrect,
      time_spent_ms: a.timeSpentMs
    }))
    const blocks = analyzeStamina(answerList, 10)
    return {
      blocks,
      fatigue: detectFatigue(blocks)
    }
  }, [answers, answersVersion])

  // Handlers Hook
  const {
    direction,
    handleSelectOption,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleExit,
    handleSubmitAll,
  } = useQuizShellHandlers({ sessionId, mode: 'extended' })

  // Actions
  const initSession = useQuizStore((s) => s.initSession)
  const addQuestions = useQuizStore((s) => s.addQuestions)
  const reset = useQuizStore((s) => s.reset)
  const startTimer = useQuizTimerStore((s) => s.startTimer)
  const stopTimer = useQuizTimerStore((s) => s.stopTimer)
  const resetTimer = useQuizTimerStore((s) => s.resetTimer)

  // 1. Initialization
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    // Always re-init with fresh server data — persist may have stale/empty questions
    initSession({
      success: true,
      sessionId,
      config,
      questions,
      totalQuestions: totalQuestionCount ?? allQuestionIds.length,
      readinessScoreBefore: 0,
      allQuestionIds,
      initialCurrentIndex,
      restoredAnswers,
    })

    startTimer({ sessionId }) // Count-up timer for endurance

    return () => {
      const state = useQuizStore.getState()
      if (state.status === 'results' || state.status === 'idle') {
        reset()
        resetTimer()
      }
    }
  }, [sessionId, config, questions, allQuestionIds, totalQuestionCount, initialCurrentIndex, restoredAnswers, initSession, startTimer, reset, resetTimer])

  // 2. Pre-fetching
  useEffect(() => {
    if (!_hasHydrated) return
    const remainingIds = allQuestionIds.slice(questions.length)
    if (remainingIds.length === 0) return

    const fetchRemaining = async () => {
      const BATCH_SIZE = 50
      for (let i = 0; i < remainingIds.length; i += BATCH_SIZE) {
        try {
          const batchData = await getSessionQuestions({
            sessionId,
            offset: questions.length + i,
            limit: Math.min(BATCH_SIZE, remainingIds.length - i),
          })
          addQuestions(batchData)
        } catch (err) {
          console.error('Endurance background fetch failed:', err)
        }
      }
    }
    void fetchRemaining()
  }, [_hasHydrated, sessionId, allQuestionIds, questions.length, addQuestions])

  // 3. Navigation & Progress Sync (Throttled to every 5 questions or last)
  useEffect(() => {
    if (!_hasHydrated || !sessionId || status === 'results') return
    
    const isLast = currentIndex === totalQuestions - 1
    if (currentIndex % 5 === 0 || isLast) {
      void updateSessionProgress(sessionId, currentIndex).catch(() => {})
    }
  }, [_hasHydrated, sessionId, currentIndex, status, totalQuestions])

  useEffect(() => {
    if (status === 'results' && results) {
      stopTimer()
      router.push(`/quiz/extended/session/${sessionId}/results`)
    }
  }, [status, results, sessionId, router, stopTimer])

  return (
    <BaseQuizShell
      config={config}
      direction={direction}
      onExit={handleExit}
      onSubmitAll={handleSubmitAll}
      onNext={handleNext}
      onPrevious={handlePrevious}
    >
      {/* Stamina Dashboard / Overlay */}
      {staminaMetrics.blocks.length > 0 && (
        <div className="absolute right-4 top-20 z-20 flex flex-col items-end gap-2 pointer-events-none">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2 shadow-sm text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity pointer-events-auto">
            <span className="text-muted-foreground mr-2">STAMINA:</span>
            <span className={cn(
              "font-bold",
              staminaMetrics.fatigue.hasFatigue ? "text-accent" : "text-primary"
            )}>
              {Math.round(staminaMetrics.blocks[staminaMetrics.blocks.length - 1].accuracy * 100)}%
            </span>
          </div>
          {staminaMetrics.fatigue.hasFatigue && (
            <div className="bg-accent text-white rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg animate-pulse pointer-events-auto">
              FATIGUE DETECTED: Check Posture
            </div>
          )}
        </div>
      )}

      <QuizBody
        question={currentQuestion!}
        selectedOptionId={currentAnswer?.selectedOptionId ?? null}
        confidenceLevel={null}
        feedback={feedbackData!}
        config={config}
        onSelectOption={(optId) => handleSelectOption(currentQuestion!.question_id, optId)}
        onConfidenceChange={() => {}}
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    </BaseQuizShell>
  )
}
