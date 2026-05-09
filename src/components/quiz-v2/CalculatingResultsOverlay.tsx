'use client'

import { useEffect, useState } from 'react'
import { SlatecampLoader } from '@/components/shared/SlatecampLoader'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'

// ─── Component ───────────────────────────────────────────────────────────────

const MESSAGES = [
  'Syncing final interactions...',
  'Analyzing subject mastery...',
  'Computing Readiness Score...',
  'Curating recommendations...',
]

/**
 * Full-screen transition dialog shown after the final answer is saved.
 * Provides clear feedback while the server completes the session and the
 * results dashboard route loads.
 */
export const CalculatingResultsOverlay = () => {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Modal open onOpenChange={() => {}}>
      <ModalContent
        size="sm"
        data-testid="quiz-results-loading"
        role="dialog"
        aria-describedby="calculating-results-description"
        className="text-center"
      >
        <ModalHeader showCloseButton={false}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Final answer received
            </p>
            <ModalTitle id="calculating-results-title" className="mt-2 text-2xl">
              Preparing your results
            </ModalTitle>
            <ModalDescription
              id="calculating-results-description"
              className="mt-2 text-sm leading-relaxed"
            >
              We&apos;re saving the last interaction, checking your answers, and opening the results page.
            </ModalDescription>
          </div>
        </ModalHeader>

        <ModalBody className="relative p-6 pt-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-success to-warning" />
          <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary-50/80 shadow-inner">
            <SlatecampLoader />
          </div>

          <div className="mt-6 grid gap-2 text-left text-sm">
            <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-50/80 px-3 py-2.5 text-success">
              <span className="flex size-6 items-center justify-center rounded-full bg-success text-xs font-bold text-white">
                ✓
              </span>
              <span className="font-medium">Final answer saved</span>
            </div>
            <div
              className="rounded-xl border border-primary/25 bg-primary-50/80 px-3 py-2.5 text-primary"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="block text-xs font-medium uppercase tracking-wide">
                Now
              </span>
              <span className="font-medium">{MESSAGES[messageIndex]}</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-background/60 px-3 py-2.5 text-muted-foreground">
              <span className="flex size-6 items-center justify-center rounded-full border border-border bg-card text-xs font-bold">
                3
              </span>
              <span>Results dashboard next</span>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
