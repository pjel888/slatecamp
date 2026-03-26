'use client'

import { useEffect, useRef } from 'react'
import { Timer } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { PressureLevel } from '@/types/quiz-config'

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimerDisplayProps {
  pressureLevel: PressureLevel
  totalTimeMs: number | null
  elapsedMs: number
  onTimeUp?: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

const TimerDisplay = ({
  pressureLevel,
  totalTimeMs,
  elapsedMs,
  onTimeUp,
}: TimerDisplayProps) => {
  const firedRef = useRef(false)

  // Level 0: renders nothing
  if (pressureLevel === 0) return null

  const isCountdown = pressureLevel >= 2
  const remainingMs = totalTimeMs !== null ? Math.max(0, totalTimeMs - elapsedMs) : null

  // Fraction remaining for color thresholds (countdown only)
  const fractionRemaining =
    isCountdown && totalTimeMs && totalTimeMs > 0
      ? remainingMs! / totalTimeMs
      : 1

  // Fire onTimeUp exactly once when countdown reaches zero
  useEffect(() => {
    if (
      isCountdown &&
      remainingMs !== null &&
      remainingMs <= 0 &&
      !firedRef.current &&
      onTimeUp
    ) {
      firedRef.current = true
      onTimeUp()
    }
  }, [isCountdown, remainingMs, onTimeUp])

  // Reset the fired flag if time is reset (e.g. new session)
  useEffect(() => {
    if (remainingMs !== null && remainingMs > 0) {
      firedRef.current = false
    }
  }, [remainingMs])

  // Display value
  const displayMs = isCountdown ? (remainingMs ?? 0) : elapsedMs

  // Color logic
  // Level 1 (count-up): always neutral (#4A5568)
  // Level 2/3 (countdown): Amber at <=25%, Warm Red at <=10%
  const getColor = (): string => {
    if (!isCountdown) return '#4A5568'
    if (fractionRemaining <= 0.10) return '#D64545'
    if (fractionRemaining <= 0.25) return '#D4951A'
    return '#4A5568'
  }

  const color = getColor()
  const isProminent = pressureLevel === 3

  const ariaLabel = isCountdown
    ? `Time remaining: ${formatTime(displayMs)}`
    : `Time elapsed: ${formatTime(displayMs)}`

  return (
    <div
      className={cn(
        'flex items-center gap-1 tabular-nums font-medium shrink-0 transition-colors duration-150',
        isProminent ? 'text-sm' : 'text-xs',
      )}
      style={{ color }}
      aria-label={ariaLabel}
      role="timer"
    >
      <Timer
        size={isProminent ? 16 : 14}
        weight={isProminent ? 'bold' : 'regular'}
        aria-hidden="true"
      />
      <span>{formatTime(displayMs)}</span>
    </div>
  )
}

TimerDisplay.displayName = 'TimerDisplay'

export { TimerDisplay }
