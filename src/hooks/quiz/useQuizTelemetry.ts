'use client'

import { useCallback, useRef } from 'react'
import { saveInteraction } from '@/lib/actions/quiz'
import type { Question } from '@/types/app'
import { getCorrectOptionId } from '@/lib/utils/question'
import type { ConfidenceLevel } from '@/components/quiz/ConfidenceToggle'

interface UseQuizTelemetryOptions {
  sessionId: string
  questions: Question[]
  isOnline: boolean
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error' | 'offline') => void
}

interface NavigationEvent {
  from: number
  to: number
  ts: number
}

export function useQuizTelemetry({
  sessionId,
  questions,
  isOnline,
  setSaveStatus,
}: UseQuizTelemetryOptions) {
  const navigationEvents = useRef<NavigationEvent[]>([])
  const rationaleOpenTime = useRef<number | null>(null)

  // ── Navigation pattern tracking ───────────────────────────────────────────
  const trackNavigation = useCallback((from: number, to: number) => {
    navigationEvents.current.push({ from, to, ts: Date.now() })
  }, [])

  // ── Rationale view duration ───────────────────────────────────────────────
  const startRationaleTimer = useCallback(() => {
    rationaleOpenTime.current = Date.now()
  }, [])

  const getRationaleViewMs = useCallback((): number => {
    if (rationaleOpenTime.current === null) return 0
    const elapsed = Date.now() - rationaleOpenTime.current
    rationaleOpenTime.current = null
    return elapsed
  }, [])

  // ── Persist interaction to Supabase ───────────────────────────────────────
  const persistInteraction = useCallback(
    async (data: {
      questionId: string
      optionId: string | null
      isFlagged: boolean
      eliminatedCount: number
      confidence: ConfidenceLevel
      answerChanges: number
      timeSpentMs: number
      rationaleViewMs?: number
    }) => {
      if (!isOnline) return

      const q = questions.find((q) => q.question_id === data.questionId)
      if (!q) return

      setSaveStatus('saving')
      try {
        await saveInteraction({
          session_id: sessionId,
          question_id: data.questionId,
          topic_id: q.topic_id,
          selected_option_id: data.optionId,
          is_correct: (data.optionId || null) === getCorrectOptionId(q),
          time_spent_ms: data.timeSpentMs,
          is_flagged: data.isFlagged,
          answer_changes: data.answerChanges,
          options_eliminated: data.eliminatedCount,
        })
        setSaveStatus('saved')
      } catch (err) {
        console.error('saveInteraction failed:', err)
        setSaveStatus('error')
      }
    },
    [sessionId, questions, isOnline, setSaveStatus],
  )

  // ── Get navigation summary (for session config JSONB) ─────────────────────
  const getNavigationSummary = useCallback(() => {
    return navigationEvents.current
  }, [])

  return {
    trackNavigation,
    startRationaleTimer,
    getRationaleViewMs,
    persistInteraction,
    getNavigationSummary,
  }
}
