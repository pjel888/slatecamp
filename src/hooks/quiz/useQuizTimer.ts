'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

interface UseQuizTimerOptions {
  strictMode: boolean
  totalQuestions: number
  currentIndex: number
  onTimeUp: () => void
}

export function useQuizTimer({
  strictMode,
  totalQuestions,
  currentIndex,
  onTimeUp,
}: UseQuizTimerOptions) {
  const totalTimerSeconds = totalQuestions * 120 // 2 min per question
  const [countdown, setCountdown] = useState<number | null>(() => {
    if (!strictMode) return null
    return totalTimerSeconds
  })
  const [isTimerMinimized, setIsTimerMinimized] = useState(false)

  // ── Countdown tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!strictMode || countdown === null) return
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timer)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [strictMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dwell timer (post-answer reflection pause) ────────────────────────────
  const [dwellTimeRemaining, setDwellTimeRemaining] = useState(0)
  const dwellTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startDwell = useCallback((isCorrect: boolean) => {
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current)
    const duration = isCorrect ? 3 : 5
    setDwellTimeRemaining(duration)
    dwellTimerRef.current = setInterval(() => {
      setDwellTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(dwellTimerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const clearDwell = useCallback(() => {
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current)
    setDwellTimeRemaining(0)
  }, [])

  // Can skip dwell after 1.5s (Phase 2 recommendation)
  const canSkipDwell = dwellTimeRemaining > 0 && dwellTimeRemaining <= (dwellTimeRemaining > 3 ? 3.5 : 1.5)

  // ── Pace calculation ──────────────────────────────────────────────────────
  const isAheadOfPace = useMemo(() => {
    if (countdown === null) return true
    const elapsed = totalTimerSeconds - countdown
    const expected = (currentIndex + 1) * 120
    return elapsed < expected
  }, [countdown, currentIndex, totalTimerSeconds])

  // ── Question-level timing ─────────────────────────────────────────────────
  const questionStartRef = useRef<number>(Date.now())

  const resetQuestionTimer = useCallback(() => {
    questionStartRef.current = Date.now()
  }, [])

  const getQuestionElapsedMs = useCallback(() => {
    return Date.now() - questionStartRef.current
  }, [])

  return {
    countdown,
    totalTimerSeconds,
    isAheadOfPace,
    isTimerMinimized,
    setIsTimerMinimized,
    dwellTimeRemaining,
    canSkipDwell,
    startDwell,
    clearDwell,
    resetQuestionTimer,
    getQuestionElapsedMs,
  }
}
