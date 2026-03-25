'use client'

import { useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, SignOut } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExitConfirmModalProps {
  answeredCount: number
  totalCount: number
  onContinue: () => void
  onExit: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ExitConfirmModal = ({
  answeredCount,
  totalCount,
  onContinue,
  onExit,
}: ExitConfirmModalProps) => {
  const continueButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  // Store previous focus, focus primary action on mount
  useEffect(() => {
    previousFocusRef.current = document.activeElement
    continueButtonRef.current?.focus()

    return () => {
      if (
        previousFocusRef.current &&
        'focus' in previousFocusRef.current
      ) {
        (previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [])

  // Focus trap within dialog
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

  // Escape dismisses (same as "Continue Quiz")
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onContinue()
      }
    },
    [onContinue],
  )

  const unansweredCount = totalCount - answeredCount

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="exit-confirm-title"
        aria-describedby="exit-confirm-desc"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="mb-4 space-y-1">
          <h2
            id="exit-confirm-title"
            className="text-sm font-semibold text-[#1A2332]"
          >
            Leave this session?
          </h2>
          <p
            id="exit-confirm-desc"
            className="text-sm text-[#4A5568]"
          >
            Your progress will be saved, but this session will end.
          </p>
        </div>

        {/* Progress summary */}
        <div className="mb-5 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#4A5568]">Answered</span>
            <span className="font-semibold text-[#1A2332]">
              {answeredCount} / {totalCount}
            </span>
          </div>
          {unansweredCount > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-[#4A5568]">Not yet answered</span>
              <span
                className={cn(
                  'font-semibold',
                  unansweredCount > 0 ? 'text-[#D4951A]' : 'text-[#1A2332]',
                )}
              >
                {unansweredCount}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          {/* Secondary — Exit */}
          <Button
            variant="secondary"
            size="md"
            onClick={onExit}
            leftIcon={<SignOut size={16} aria-hidden="true" />}
            className="order-2 sm:order-1"
          >
            Exit session
          </Button>

          {/* Primary — Continue */}
          <Button
            ref={continueButtonRef}
            variant="primary"
            size="md"
            onClick={onContinue}
            leftIcon={<ArrowLeft size={16} aria-hidden="true" />}
            className="order-1 sm:order-2"
          >
            Continue quiz
          </Button>
        </div>
      </div>
    </div>
  )
}
