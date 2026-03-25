'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowRight, Coffee } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MicroBreakOverlayProps {
  questionsCompleted: number
  breakDurationSeconds: number
  onContinue: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const MicroBreakOverlay = ({
  questionsCompleted,
  breakDurationSeconds,
  onContinue,
}: MicroBreakOverlayProps) => {
  const [secondsLeft, setSecondsLeft] = useState(breakDurationSeconds)
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  // Store previous focus and focus continue button on mount
  useEffect(() => {
    previousFocusRef.current = document.activeElement
    continueButtonRef.current?.focus()

    return () => {
      // Restore focus on unmount
      if (
        previousFocusRef.current &&
        'focus' in previousFocusRef.current
      ) {
        (previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [])

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft])

  // Focus trap
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleFocusTrap = (e: FocusEvent) => {
      if (!dialog.contains(e.target as Node)) {
        continueButtonRef.current?.focus()
      }
    }

    document.addEventListener('focusin', handleFocusTrap)
    return () => document.removeEventListener('focusin', handleFocusTrap)
  }, [])

  // Escape closes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onContinue()
      }
    },
    [onContinue],
  )

  const progressPercent =
    breakDurationSeconds > 0
      ? Math.round(((breakDurationSeconds - secondsLeft) / breakDurationSeconds) * 100)
      : 100

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  return (
    // Gentle overlay — semi-transparent, not blocking
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/20 backdrop-blur-[2px]',
        !prefersReducedMotion && 'animate-in fade-in duration-150 ease-out',
      )}
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="micro-break-title"
        aria-describedby="micro-break-desc"
        className={cn(
          'w-full max-w-sm rounded-lg bg-white p-6 shadow-lg',
          'flex flex-col items-center gap-4 text-center',
          !prefersReducedMotion && 'animate-in zoom-in-95 duration-150 ease-out',
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-md bg-[#EEF2FC]"
          aria-hidden="true"
        >
          <Coffee size={24} weight="regular" className="text-[#1B3FC4]" />
        </div>

        {/* Message */}
        <div className="space-y-1">
          <h2
            id="micro-break-title"
            className="text-sm font-semibold text-[#1A2332]"
          >
            Good momentum — take a moment.
          </h2>
          <p
            id="micro-break-desc"
            className="text-sm text-[#4A5568]"
          >
            You've completed{' '}
            <span className="font-medium text-[#1A2332]">
              {questionsCompleted} question{questionsCompleted !== 1 ? 's' : ''}
            </span>
            . A brief pause helps retention.
          </p>
        </div>

        {/* Countdown */}
        <div className="w-full space-y-2">
          {/* Progress bar */}
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Break timer: ${secondsLeft} seconds remaining`}
            className="h-1.5 w-full overflow-hidden rounded-sm bg-[#D4DAE3]"
          >
            <div
              className={cn(
                'h-full bg-[#1B3FC4] rounded-sm',
                !prefersReducedMotion && 'transition-all duration-1000 ease-linear',
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-xs text-[#8896A7]" aria-live="polite" aria-atomic="true">
            {secondsLeft > 0
              ? `Resuming in ${secondsLeft}s`
              : 'Ready when you are'}
          </p>
        </div>

        {/* Continue button — always available */}
        <Button
          ref={continueButtonRef}
          variant="primary"
          size="md"
          onClick={onContinue}
          rightIcon={<ArrowRight size={16} aria-hidden="true" />}
          className="w-full"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
