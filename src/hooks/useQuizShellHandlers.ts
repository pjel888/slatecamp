'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuizStore } from '@/stores/useQuizStore'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'
import { 
  endSession as endSessionAction,
} from '@/lib/actions/quiz-v2'
import { withMinimumDuration } from '@/lib/utils/promise'
import type { GestureSignalEvent } from '@/types/patent'

interface UseQuizShellHandlersProps {
  sessionId: string
  mode: string
}

/**
 * useQuizShellHandlers: Unified logic for quiz navigation and session termination.
 * Reduces duplication across Standard, Simulation, and Endurance shells.
 */
export const useQuizShellHandlers = ({ sessionId, mode }: UseQuizShellHandlersProps) => {
  const router = useRouter()
  const directionRef = useRef<'forward' | 'backward'>('forward')

  // Actions
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const setConfidence = useQuizStore((s) => s.setConfidence)
  const submitCurrentAnswer = useQuizStore((s) => s.submitCurrentAnswer)
  const goNext = useQuizStore((s) => s.goNext)
  const goPrevious = useQuizStore((s) => s.goPrevious)
  const endSession = useQuizStore((s) => s.endSession)
  const reset = useQuizStore((s) => s.reset)
  const hideFeedback = useQuizStore((s) => s.hideFeedback)
  const stopTimer = useQuizTimerStore((s) => s.stopTimer)
  const resetTimer = useQuizTimerStore((s) => s.resetTimer)

  const handleSelectOption = (questionId: string, optionId: string) => {
    selectAnswer(questionId, optionId)
  }

  const handleConfidenceChange = (questionId: string, level: 1 | 2 | 3) => {
    setConfidence(questionId, level)
  }

  const handleSubmit = (signalTrace?: GestureSignalEvent[]) => {
    submitCurrentAnswer(signalTrace)
  }

  const handleNext = useCallback(() => {
    directionRef.current = 'forward'
    const state = useQuizStore.getState()
    const { currentIndex, totalQuestions, results, feedback } = state
    const isLast = currentIndex === totalQuestions - 1
    const answeredCount = state.getAnsweredCount()

    // 1. If feedback is visible, handle transition
    if (feedback.visible) {
      if (isLast) {
        if (answeredCount < totalQuestions) {
          state.showSubmitModal()
        } else {
          useQuizStore.setState(s => ({ ui: { ...s.ui, calculatingResults: true } }))
          if (results) endSession(results)
        }
      }
      hideFeedback()
      if (isLast) return
    }

    // 2. If it's the last question, check if we can submit
    if (isLast) {
      if (answeredCount < totalQuestions) {
        state.showSubmitModal()
      } else if (results) {
        useQuizStore.setState(s => ({ ui: { ...s.ui, calculatingResults: true } }))
        endSession(results)
      }
      return
    }

    goNext()
  }, [hideFeedback, endSession, goNext])

  const handlePrevious = useCallback(() => {
    directionRef.current = 'backward'
    goPrevious()
  }, [goPrevious])

  const handleExit = async () => {
    try {
      const result = await withMinimumDuration(
        endSessionAction({ sessionId, endReason: 'user_exit' }),
        800,
      )
      stopTimer()
      endSession(result)
    } catch {
      reset()
      resetTimer()
      router.push('/dashboard')
    }
  }

  const handleSubmitAll = async () => {
    const state = useQuizStore.getState()
    if (state.ui.calculatingResults || state.status === 'finalizing') {
      return
    }

    useQuizStore.setState((s) => ({
      status: 'finalizing',
      ui: { ...s.ui, calculatingResults: true },
    }))
    try {
      const result = await withMinimumDuration(
        endSessionAction({ sessionId, endReason: 'completed' }),
        800,
      )
      endSession(result)
    } catch {
      router.push(`/quiz/${mode}/session/${sessionId}/results`)
    }
  }

  return {
    direction: directionRef.current,
    handleSelectOption,
    handleConfidenceChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleExit,
    handleSubmitAll,
  }
}
