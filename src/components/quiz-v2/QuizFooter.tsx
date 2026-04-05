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
}

export const QuizFooter = memo(({
  config,
  currentPosition,
  totalQuestions,
  hasAnswered,
  onPrevious,
  onNext,
}: QuizFooterProps) => {
  const isFirst = currentPosition === 1
  const isLast = currentPosition === totalQuestions
  const showBack = config.navigation.backAllowed && !isFirst

  return (
    <footer
      className="flex items-center justify-between px-4 py-3 border-t border-border bg-white"
      aria-label="Quiz navigation"
    >
      {/* Previous — ghost text button */}
      <div className="w-24">
        {showBack && (
          <button
            type="button"
            onClick={onPrevious}
            className={cn(
              'inline-flex items-center gap-1 text-[13px] text-text-secondary',
              'hover:text-foreground transition-colors duration-150',
              'min-h-[44px] px-1',
              'focus-visible:outline-none focus-visible:underline',
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
          className={cn(
            'inline-flex items-center gap-1 text-[13px]',
            'min-h-[44px] px-1',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:underline',
            'text-primary hover:text-primary-700',
          )}
          aria-label={isLast ? 'See results' : 'Next question'}
        >
          {isLast ? 'See results' : 'Next'}
          {!isLast && <ArrowRight size={14} aria-hidden="true" />}
        </button>
      </div>
    </footer>
  )
})

QuizFooter.displayName = 'QuizFooter'
