'use client'

import { useEffect, useRef } from 'react'
import { useQuizTimerStore } from '@/stores/useQuizTimerStore'

/**
 * Isolated component to handle the 1Hz timer tick pulse.
 * This prevents the main QuizShell from re-rendering on every interval 
 * if it were to hold the interval state or subscribe to the tick action.
 */
export const TimerTicker = () => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Select only the stable action and the running state
  const tickTimer = useQuizTimerStore((s) => s.tickTimer)
  const isRunning = useQuizTimerStore((s) => s.isRunning)

  useEffect(() => {
    if (isRunning && !timerRef.current) {
      timerRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    }
    
    if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRunning, tickTimer])

  // This component renders nothing
  return null
}
