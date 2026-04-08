'use client'

import { useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'
import { BaseQuizShell } from './BaseQuizShell'
import { QuizBody } from './QuizBody'
import { PacingNudge } from './PacingNudge'
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

interface StandardQuizShellProps {
  sessionId: string
  config: QuizSessionConfig
  questions: QuestionForClient[]
  allQuestionIds: string[]
  totalQuestionCount?: number
  initialCurrentIndex?: number
  restoredAnswers?: Record<string, Partial<QuizAnswerState>>
}

export const StandardQuizShell = ({
  sessionId,
  config,
  questions,
  allQuestionIds,
  totalQuestionCount,
  initialCurrentIndex = 0,
  restoredAnswers,
}: StandardQuizShellProps) => {
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
    handleConfidenceChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleExit,
    handleSubmitAll,
  } = useQuizShellHandlers({ sessionId, mode: config.mode })

  // Actions
  const initSession = useQuizStore((s) => s.initSession)
  const addQuestions = useQuizStore((s) => s.addQuestions)
  const skipCurrentQuestion = useQuizStore((s) => s.skipCurrentQuestion)
  const goNext = useQuizStore((s) => s.goNext)
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

    if (config.timer.enabled) {
      startTimer({
        limitMs: config.timer.totalSeconds ? config.timer.totalSeconds * 1000 : undefined,
        sessionId,
      })
    } else {
      useQuizStore.setState({ status: 'active' })
    }

    return () => {
      const state = useQuizStore.getState()
      if (state.status === 'results' || state.status === 'idle') {
        reset()
        resetTimer()
      }
    }
  }, [sessionId, config, questions, allQuestionIds, totalQuestionCount, initialCurrentIndex, restoredAnswers, initSession, startTimer, reset, resetTimer])

  // 2. Background Pre-fetching
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
          console.error('Background fetch failed:', err)
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
      router.push(`/quiz/${config.mode}/session/${sessionId}/results`)
    }
  }, [status, results, config.mode, sessionId, router, stopTimer])

  const handlePacingAutoAdvance = () => {
    if (!currentQuestion) return
    const ans = useQuizStore.getState().answers[currentQuestion.question_id]
    if (ans && !ans.submittedAt && !ans.isSkipped) {
      skipCurrentQuestion()
    } else {
      goNext()
    }
  }

  // Guard: BaseQuizShell shows skeleton, but children must not receive null question
  if (!currentQuestion) return null

  return (
    <BaseQuizShell
      config={config}
      direction={direction}
      onExit={handleExit}
      onSubmitAll={handleSubmitAll}
      onNext={handleNext}
      onPrevious={handlePrevious}
      showPacingNudge={(config.pressure_level ?? 0) >= 2}
      pacingNudgeSlot={
        currentQuestion && (
          <PacingNudge
            pressureLevel={config.pressure_level ?? 0}
            difficultyLabel={currentQuestion.difficulty_label}
            questionId={currentQuestion.question_id}
            onAutoAdvance={config.pressure_level === 3 ? handlePacingAutoAdvance : undefined}
          />
        )
      }
    >
      <QuizBody
        question={currentQuestion}
        selectedOptionId={currentAnswer?.selectedOptionId ?? null}
        confidenceLevel={(currentAnswer?.confidenceLevel as 1 | 2 | 3) ?? null}
        feedback={feedbackData!}
        config={config}
        onSelectOption={(optId) => handleSelectOption(currentQuestion.question_id, optId)}
        onConfidenceChange={(lvl) => handleConfidenceChange(currentQuestion.question_id, lvl)}
        onSubmit={handleSubmit}
        onNext={handleNext}
      />
    </BaseQuizShell>
  )
}
