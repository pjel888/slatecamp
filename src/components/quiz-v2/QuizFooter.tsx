'use client'

import { memo } from 'react'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { QuizSessionConfig } from '@/types/quiz-config'

interface QuizFooterProps {
  config: QuizSessionConfig
  currentPosition: number
  totalQuestions: number
  hasAnswered: boolean
  onPrevious: () => void
  onNext: () => void
  isBusy?: boolean
}

export const QuizFooter = memo(({
  config,
  currentPosition,
  totalQuestions,
  hasAnswered: _hasAnswered,
  onPrevious,
  onNext,
  isBusy = false,
}: QuizFooterProps) => {
  const isFirst = currentPosition === 1
  const isLast = currentPosition === totalQuestions
  const showBack = config.navigation.backAllowed && !isFirst
  const nextLabel = isLast ? (isBusy ? 'Preparing...' : 'See results') : 'Next'
  const nextAriaLabel = isLast ? (isBusy ? 'Preparing results' : 'See results') : 'Next question'

  return (
    <footer
      className="flex items-center justify-between px-4 py-3 border-t border-border bg-card"
      aria-label="Quiz navigation"
    >
      {/* Previous — ghost text button */}
      <div className="w-24">
        {showBack && (
          <button
            type="button"
            onClick={onPrevious}
            disabled={isBusy}
            className={cn(
              'inline-flex items-center gap-1 text-[13px] text-text-secondary',
              'hover:text-foreground transition-colors duration-150',
              'min-h-[44px] px-1',
              'focus-visible:outline-none focus-visible:underline',
              isBusy && 'cursor-not-allowed opacity-50',
            )}
            aria-label="Previous question"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Previous
          </button>
        )}
      </div>

      {/* Center fraction */}
      <span className="text-xs text-muted-foreground tabular-nums">
        {currentPosition} / {totalQuestions}
      </span>

      {/* Next — ghost text button */}
      <div className="w-24 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={isBusy}
          className={cn(
            'inline-flex items-center gap-1 text-[13px]',
            'min-h-[44px] px-1',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:underline',
            'text-primary hover:text-primary-700',
            isBusy && 'cursor-wait opacity-70',
          )}
          aria-label={nextAriaLabel}
          aria-busy={isBusy || undefined}
        >
          {nextLabel}
          {!isLast && !isBusy && <ArrowRight size={14} aria-hidden="true" />}
        </button>
      </div>
    </footer>
  )
})

QuizFooter.displayName = 'QuizFooter'
