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
      className="rounded-md border border-[#1B3FC4]/20 bg-[#EEF2FC] px-4 py-3"
      role="alert"
      aria-label="Account mode transition"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#1B3FC4' }}
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
            <p className="text-sm font-medium text-[#1A2332]">
              Your exam has passed. How would you like to use SlateCamp?
            </p>
            <p className="text-xs text-[#4A5568] mt-0.5">
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
            className="rounded-sm border border-[#D4DAE3] bg-white px-3 py-1.5 text-xs font-medium text-[#4A5568] transition-colors duration-150 ease-out hover:border-[#1B3FC4] hover:text-[#1B3FC4] disabled:opacity-60"
          >
            {isDismissing ? 'Saving…' : "I'm reviewing for the next cycle"}
          </button>
          <button
            type="button"
            onClick={handleActivate}
            disabled={isLoading}
            className="rounded-sm bg-[#1B3FC4] px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8] disabled:opacity-60"
          >
            {isActivating ? 'Saving…' : 'I passed — take me to Professional Mode'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransitionPrompt
