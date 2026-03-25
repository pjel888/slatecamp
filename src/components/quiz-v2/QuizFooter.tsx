'use client'

import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import type { QuizSessionConfig } from '@/types/quiz-config'

interface QuizFooterProps {
  config: QuizSessionConfig
  currentPosition: number
  totalQuestions: number
  hasAnswered: boolean
  onPrevious: () => void
  onNext: () => void
}

export const QuizFooter = ({
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
      className="flex items-center justify-between px-4 py-3 border-t border-[#D4DAE3] bg-white"
      aria-label="Quiz navigation"
    >
      {/* Previous */}
      <div className="w-24">
        {showBack && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft size={14} aria-hidden="true" />}
            onClick={onPrevious}
            aria-label="Previous question"
          >
            Previous
          </Button>
        )}
      </div>

      {/* Center fraction */}
      <span className="text-xs text-[#8896A7] tabular-nums">
        {currentPosition} / {totalQuestions}
      </span>

      {/* Next / Submit */}
      <div className="w-24 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          rightIcon={!isLast ? <ArrowRight size={14} aria-hidden="true" /> : undefined}
          onClick={onNext}
          disabled={!hasAnswered}
          aria-label={isLast ? 'Submit quiz' : 'Next question'}
        >
          {isLast ? 'Submit' : 'Next'}
        </Button>
      </div>
    </footer>
  )
}
