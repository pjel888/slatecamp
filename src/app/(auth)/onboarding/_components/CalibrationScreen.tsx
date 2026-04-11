'use client'

import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface CalibrationScreenProps {
  status: 'pending' | 'error'
  errorMessage?: string | null
  onRetry: () => void
  onBack: () => void
}

const PENDING_STEPS = [
  'Saving your setup...',
  'Syncing your LEA profile...',
  'Preparing your dashboard...',
]

export const CalibrationScreen = ({
  status,
  errorMessage,
  onRetry,
  onBack,
}: CalibrationScreenProps) => {
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <WarningCircle className="h-8 w-8" weight="fill" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">We could not finish setup</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {errorMessage ?? 'Your answers are still here. Check your connection and try again.'}
          </p>
        </div>
        <div className="flex w-full max-w-sm gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-muted"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-sm bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary/10 border-t-primary" />
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-[280px] space-y-4">
        {PENDING_STEPS.map((label, index) => (
          <div
            key={label}
            className={cn(
              'flex items-center gap-3 text-foreground transition-all duration-300',
              index > 0 && 'opacity-80',
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              {index === 0 ? (
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              ) : (
                <CheckCircle className="h-5 w-5 text-primary/40" weight="fill" />
              )}
            </div>
            <span className={cn('text-[13px] font-medium tracking-wide', index === 0 && 'animate-pulse')}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
        Saving your profile
      </p>
    </div>
  )
}
