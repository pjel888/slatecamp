'use client'

import { useTransition } from 'react'
import { activateProfessionalMode, stayInReviewMode } from '@/lib/actions/professional-mode'

interface TransitionPromptProps {
  /** 'passed' shows auto-prompt; 'failed' shows opt-in prompt (30-day gate) */
  variant: 'passed' | 'opt-in'
}

const TransitionPrompt = ({ variant }: TransitionPromptProps) => {
  const [isActivating, startActivate] = useTransition()
  const [isDismissing, startDismiss] = useTransition()

  const isLoading = isActivating || isDismissing

  const handleActivate = () => {
    startActivate(async () => {
      await activateProfessionalMode()
    })
  }

  const handleStay = () => {
    startDismiss(async () => {
      await stayInReviewMode()
    })
  }

  return (
    <div
      className="rounded-md border border-primary/20 bg-primary-50 px-4 py-3"
      role="alert"
      aria-label="Account mode transition"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary"
            aria-hidden
          >
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Your exam has passed. How would you like to use SlateCamp?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {variant === 'passed'
                ? 'You can switch modes at any time from Settings.'
                : 'This is optional — continue reviewing or switch when ready.'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleStay}
            disabled={isLoading}
            className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-out hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {isDismissing ? 'Saving…' : "I'm reviewing for the next cycle"}
          </button>
          <button
            type="button"
            onClick={handleActivate}
            disabled={isLoading}
            className="rounded-sm bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700 disabled:opacity-60"
          >
            {isActivating ? 'Saving…' : 'I passed — take me to Professional Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransitionPrompt
