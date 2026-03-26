'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getMedianTimeForDifficulty, type PressureLevel } from '@/lib/quiz/pressure-config'

// ─── Props ────────────────────────────────────────────────────────────────────

interface PacingNudgeProps {
  pressureLevel: PressureLevel
  difficultyLabel: string
  questionTimeMs: number
  onAutoAdvance?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

const PacingNudge = ({
  pressureLevel,
  difficultyLabel,
  questionTimeMs,
  onAutoAdvance,
}: PacingNudgeProps) => {
  const [visible, setVisible] = useState(false)
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const autoAdvanceFired = useRef(false)
  const prevQuestionTimeRef = useRef(questionTimeMs)

  // Only active at pressure level 2+
  const isActive = pressureLevel >= 2
  const medianMs = getMedianTimeForDifficulty(difficultyLabel)
  const softThreshold = medianMs * 2
  const hardThreshold = medianMs * 3

  // Reset state when question changes (detected by questionTimeMs resetting)
  useEffect(() => {
    if (questionTimeMs < prevQuestionTimeRef.current) {
      setVisible(false)
      setAutoAdvancing(false)
      autoAdvanceFired.current = false
    }
    prevQuestionTimeRef.current = questionTimeMs
  }, [questionTimeMs])

  // Show nudge when time exceeds 2x median
  useEffect(() => {
    if (!isActive) return
    if (questionTimeMs >= softThreshold && !visible) {
      setVisible(true)
    }
  }, [isActive, questionTimeMs, softThreshold, visible])

  // Auto-advance at 3x median for Level 3
  const handleAutoAdvance = useCallback(() => {
    if (onAutoAdvance && !autoAdvanceFired.current) {
      autoAdvanceFired.current = true
      setAutoAdvancing(true)
      // Brief visual cue before advancing
      const timer = setTimeout(() => {
        onAutoAdvance()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [onAutoAdvance])

  useEffect(() => {
    if (
      pressureLevel === 3 &&
      questionTimeMs >= hardThreshold &&
      !autoAdvanceFired.current
    ) {
      handleAutoAdvance()
    }
  }, [pressureLevel, questionTimeMs, hardThreshold, handleAutoAdvance])

  if (!isActive || !visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-30',
        'max-w-[360px] w-[calc(100%-32px)]',
        'flex items-center gap-2.5 px-4 py-3',
        'rounded-md border shadow-md',
        'transition-all duration-300 ease-out',
        autoAdvancing
          ? 'border-[#D64545]/30 bg-[#FDF0F0]'
          : 'border-[#D4951A]/30 bg-[#FEF8ED]',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none',
      )}
    >
      <ArrowRight
        size={16}
        weight="bold"
        className={autoAdvancing ? 'text-[#D64545] shrink-0' : 'text-[#D4951A] shrink-0'}
        aria-hidden="true"
      />
      <p className="text-[13px] text-[#1A2332] leading-snug">
        {autoAdvancing
          ? 'Moving to next question...'
          : 'Consider moving on and returning later.'}
      </p>
    </div>
  )
}

PacingNudge.displayName = 'PacingNudge'

export { PacingNudge }
