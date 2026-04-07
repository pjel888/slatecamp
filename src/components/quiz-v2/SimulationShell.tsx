'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'
import { BaseQuizShell } from './BaseQuizShell'
import { QuizBody } from './QuizBody'
import { 
  endSession as endSessionAction, 
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
 * SimulationShell: Specialized shell for high-stakes "Full Exam Simulation".
 * - Enforces "Silent Mode" (no feedback, minimal UI).
 * - High-volume pre-fetching (200 questions).
 * - Checkpoint saves every 5 questions.
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
  const directionRef = useRef<'forward' | 'backward'>('forward')

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
  
  // Actions
  const initSession = useQuizStore((s) => s.initSession)
  const addQuestions = useQuizStore((s) => s.addQuestions)
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const submitCurrentAnswer = useQuizStore((s) => s.submitCurrentAnswer)
  const goNext = useQuizStore((s) => s.goNext)
  const goPrevious = useQuizStore((s) => s.goPrevious)
  const endSession = useQuizStore((s) => s.endSession)
  const reset = useQuizStore((s) => s.reset)
  const startTimer = useQuizTimerStore((s) => s.startTimer)
  const stopTimer = useQuizTimerStore((s) => s.stopTimer)
  const resetTimer = useQuizTimerStore((s) => s.resetTimer)

  // 1. Strict Initialization
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

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
      sessionId,
    })

    return () => {
      const state = useQuizStore.getState()
      if (state.status === 'results' || state.status === 'idle') {
        reset()
        resetTimer()
      }
    }
  }, [sessionId, config, questions, allQuestionIds, totalQuestionCount, initialCurrentIndex, restoredAnswers, initSession, startTimer, reset, resetTimer])

  // 2. High-Volume Pre-fetching (Batch of 50)
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

  // 3. Checkpoint Saves (Every 5 questions)
  useEffect(() => {
    if (!_hasHydrated || !sessionId || status === 'results') return
    
    // Always sync progress, but maybe throttled or at checkpoints for Simulation
    void updateSessionProgress(sessionId, currentIndex).catch(() => {})
  }, [_hasHydrated, sessionId, currentIndex, status])

  // 4. Results Delay Redirection
  useEffect(() => {
    if (status === 'results' && results) {
      stopTimer()
      // Enforce the 24h delay routing if configured
      if (config.results.delayHours > 0) {
        router.push(`/quiz/fullexam/session/${sessionId}/debrief`)
      } else {
        router.push(`/quiz/fullexam/session/${sessionId}/results`)
      }
    }
  }, [status, results, sessionId, router, stopTimer, config.results.delayHours])

  // 5. Handlers
  const handleSelectOption = (optionId: string) => {
    if (currentQuestion) selectAnswer(currentQuestion.question_id, optionId)
  }

  const handleSubmit = () => {
    // In Simulation, handleSubmit just records the answer locally and proceeds.
    // Real submission to DB happens at the end or via checkpoints.
    submitCurrentAnswer([]) // No gesture signals in strict proctoring if desired, or empty
    handleNext()
  }

  const handleNext = useCallback(() => {
    directionRef.current = 'forward'
    if (currentIndex === totalQuestions - 1) {
      // Last question - handled by BaseQuizShell's onSubmitAll
      return
    }
    goNext()
  }, [currentIndex, totalQuestions, goNext])

  const handlePrevious = useCallback(() => {
    directionRef.current = 'backward'
    goPrevious()
  }, [goPrevious])

  const handleExit = async () => {
    // High-stakes sessions usually warn more aggressively on exit
    try {
      const result = await endSessionAction({ sessionId, endReason: 'user_exit' })
      stopTimer()
      endSession(result)
    } catch {
      reset()
      resetTimer()
      router.push('/dashboard')
    }
  }

  const handleSubmitAll = async () => {
    useQuizStore.setState(s => ({ ui: { ...s.ui, calculatingResults: true } }))
    try {
      const result = await endSessionAction({ sessionId, endReason: 'completed' })
      endSession(result)
    } catch {
      router.push(`/quiz/fullexam/session/${sessionId}/debrief`)
    }
  }

  return (
    <BaseQuizShell
      config={config}
      direction={directionRef.current}
      onExit={handleExit}
      onSubmitAll={handleSubmitAll}
    >
      <div className="simulation-proctor-overlay pointer-events-none absolute inset-0 border-4 border-primary/10" />
      
      <QuizBody
        question={currentQuestion!}
        selectedOptionId={currentAnswer?.selectedOptionId ?? null}
        confidenceLevel={null} // Simulation disables confidence rating
        feedback={null}        // Simulation disables immediate feedback
        config={config}
        onSelectOption={handleSelectOption}
        onConfidenceChange={() => {}} 
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    </BaseQuizShell>
  )
}
