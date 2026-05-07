'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Coffee } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'

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

  useEffect(() => {
    if (secondsLeft <= 0) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsLeft])

  const progressPercent =
    breakDurationSeconds > 0
      ? Math.round(((breakDurationSeconds - secondsLeft) / breakDurationSeconds) * 100)
      : 100

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onContinue()
      }}
    >
      <ModalContent
        size="sm"
        role="dialog"
        aria-describedby="micro-break-desc"
      >
        <ModalHeader closeAriaLabel="Continue quiz">
          <ModalTitle id="micro-break-title">Good momentum — take a moment.</ModalTitle>
          <ModalDescription id="micro-break-desc">
            You&apos;ve completed{' '}
            <span className="font-medium text-foreground">
              {questionsCompleted} question{questionsCompleted !== 1 ? 's' : ''}
            </span>
            . A brief pause helps retention.
          </ModalDescription>
        </ModalHeader>

        <ModalBody className="flex flex-col items-center gap-4 p-6 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-50"
            aria-hidden="true"
          >
            <Coffee size={24} weight="regular" className="text-primary" />
          </div>

          <div className="w-full space-y-2">
            <div
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Break timer: ${secondsLeft} seconds remaining`}
              className="h-1.5 w-full overflow-hidden rounded-sm bg-border"
            >
              <div
                className="h-full rounded-sm bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <p className="text-xs text-muted-foreground" aria-live="polite" aria-atomic="true">
              {secondsLeft > 0
                ? `Resuming in ${secondsLeft}s`
                : 'Ready when you are'}
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="primary"
            size="md"
            onClick={onContinue}
            rightIcon={<ArrowRight size={16} aria-hidden="true" />}
            className="w-full sm:w-auto"
            autoFocus
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
