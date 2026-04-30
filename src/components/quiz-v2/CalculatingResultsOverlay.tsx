'use client'

import { useEffect, useState } from 'react'
import { SlatecampLoader } from '@/components/shared/SlatecampLoader'

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 px-4 backdrop-blur-md transition-opacity duration-300"
      data-testid="quiz-results-loading"
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculating-results-title"
      aria-describedby="calculating-results-description"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-xl">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-50">
          <SlatecampLoader />
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Session complete
        </p>
        <h2
          id="calculating-results-title"
          className="mt-2 text-xl font-semibold text-foreground"
        >
          Preparing your results
        </h2>
        <p
          id="calculating-results-description"
          className="mt-2 text-sm leading-relaxed text-text-secondary"
        >
          We&apos;re saving your final answer and building your readiness snapshot.
        </p>

        <div className="mt-5 space-y-2 text-left text-sm">
          <div className="flex items-center gap-2 rounded-md bg-success-50 px-3 py-2 text-success">
            <span className="flex size-5 items-center justify-center rounded-full bg-success text-[11px] font-bold text-white">
              ✓
            </span>
            <span className="font-medium">Final answer saved</span>
          </div>
          <div
            className="rounded-md border border-primary/20 bg-primary-50 px-3 py-2 text-primary"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="block text-xs font-medium uppercase tracking-wide">
              Now
            </span>
            <span className="font-medium">{MESSAGES[messageIndex]}</span>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full border border-border text-[11px] font-bold">
              3
            </span>
            <span>Results dashboard next</span>
          </div>
        </div>
      </div>
    </div>
  )
}
