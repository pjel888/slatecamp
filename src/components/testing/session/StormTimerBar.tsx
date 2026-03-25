'use client'

import { useEffect, useRef } from 'react'
import { TIMER_THRESHOLDS } from '@/lib/constants/testing-modes'

interface StormTimerBarProps {
  totalSeconds: number
  remainingSeconds: number
  onExpire?: () => void
}

export const StormTimerBar = ({
  totalSeconds,
  remainingSeconds,
  onExpire,
}: StormTimerBarProps) => {
  const pct = Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100))
  const hasExpiredRef = useRef(false)

  useEffect(() => {
    if (remainingSeconds <= 0 && !hasExpiredRef.current) {
      hasExpiredRef.current = true
      onExpire?.()
    }
  }, [remainingSeconds, onExpire])

  const barColor =
    pct > 20
      ? TIMER_THRESHOLDS.normal.color   // var(--primary)
      : pct > 10
      ? TIMER_THRESHOLDS.warning.color  // var(--accent)
      : TIMER_THRESHOLDS.critical.color // var(--accent) — NEVER red

  return (
    <div
      role="timer"
      aria-label={remainingSeconds <= 0 ? 'Time expired' : remainingSeconds < 60 ? `${remainingSeconds} seconds remaining` : `${Math.ceil(remainingSeconds / 60)} minutes remaining`}
      aria-live="off"
      className="w-full h-1 bg-primary-50 overflow-hidden"
      style={{ position: 'relative' }}
    >
      <div
        className="h-full transition-all duration-300 linear"
        style={{
          width: `${pct}%`,
          backgroundColor: barColor,
          transitionTimingFunction: 'linear',
        }}
      />
    </div>
  )
}
