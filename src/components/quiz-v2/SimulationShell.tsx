'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'
import { BaseQuizShell } from './BaseQuizShell'
import { QuizBody } from './QuizBody'
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

interface SimulationShellProps {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
  allQuestionIds: string[]
  totalQuestionCount?: number
  initialCurrentIndex?: number
  restoredAnswers?: Record<string, Partial<QuizAnswerState>>
}

/**
 * SimulationShell: Specialized shell for "Full Exam Simulation".
 * - No immediate feedback.
 * - Strict countdown timer.
 * - Results delayed (optional).
 */
export const SimulationShell = ({
  sessionId,
  config,
  questions,
  allQuestionIds,
  totalQuestionCount,
  initialCurrentIndex = 0,
  restoredAnswers,
}: SimulationShellProps) => {
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

  // Handlers Hook
  const {
    direction,
    handleSelectOption,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleExit,
    handleSubmitAll,
  } = useQuizShellHandlers({ sessionId, mode: 'fullexam' })

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

    startTimer({
      limitMs: (config.timer.totalSeconds || 14400) * 1000,
      sessionId
    })

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
          console.error('Simulation background fetch failed:', err)
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
      router.push(`/quiz/fullexam/session/${sessionId}/results`)
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
      <QuizBody
        question={currentQuestion!}
        selectedOptionId={currentAnswer?.selectedOptionId ?? null}
        confidenceLevel={null} // Simulation disables immediate feedback
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
