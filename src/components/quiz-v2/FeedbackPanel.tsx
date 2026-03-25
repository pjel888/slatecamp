'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, ArrowRight, ArrowSquareOut } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { FeedbackData, QuestionForClient } from '@/types/quiz-config'

interface FeedbackPanelProps {
  feedback: FeedbackData
  question: QuestionForClient
  selectedOptionId: string
  gatedDelayMs: number
  onNext: () => void
}

export const FeedbackPanel = ({
  feedback,
  question,
  selectedOptionId,
  gatedDelayMs,
  onNext,
}: FeedbackPanelProps) => {
  const [nextReady, setNextReady] = useState(gatedDelayMs === 0)

  useEffect(() => {
    setNextReady(gatedDelayMs === 0)
    if (gatedDelayMs > 0) {
      const timer = setTimeout(() => setNextReady(true), gatedDelayMs)
      return () => clearTimeout(timer)
    }
  }, [gatedDelayMs, feedback.questionId])

  const selectedOption = question.options.find(o => o.id === selectedOptionId)
  const correctOption = question.options.find(o => o.id === feedback.correctOptionId)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'rounded-md border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-150',
        feedback.isCorrect
          ? 'bg-[#EDFAF4] border-[#2D9F6F]/20'
          : 'bg-[#FEF8ED] border-[#D4951A]/20',
      )}
    >
      {/* Heading row */}
      <div className="flex items-center gap-2">
        {feedback.isCorrect ? (
          <CheckCircle
            size={18}
            weight="fill"
            className="text-[#2D9F6F] shrink-0"
            aria-hidden="true"
          />
        ) : (
          <ArrowRight
            size={18}
            weight="bold"
            className="text-[#D4951A] shrink-0"
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            'text-sm font-semibold',
            feedback.isCorrect ? 'text-[#2D9F6F]' : 'text-[#D4951A]',
          )}
        >
          {feedback.isCorrect ? 'Correct' : 'Not quite'}
        </span>
      </div>

      {/* Wrong-answer context */}
      {!feedback.isCorrect && (
        <p className="text-xs text-[#4A5568] leading-relaxed">
          {selectedOption && (
            <>
              You chose <span className="font-medium text-[#1A2332]">{selectedOption.letter}. {selectedOption.text}</span>.{' '}
            </>
          )}
          {correctOption && (
            <>
              The correct answer is <span className="font-medium text-[#1A2332]">{correctOption.letter}. {correctOption.text}</span>.
            </>
          )}
        </p>
      )}

      {/* Rationale */}
      {feedback.rationale && (
        <p className="text-sm text-[#4A5568] leading-relaxed">{feedback.rationale}</p>
      )}

      {/* Wiki link */}
      {feedback.wikiUrl && (
        <a
          href={feedback.wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#1B3FC4] hover:underline"
        >
          <ArrowSquareOut size={12} aria-hidden="true" />
          Read more
        </a>
      )}

      {/* Next button — gated */}
      <div className="pt-1">
        <Button
          variant="primary"
          size="sm"
          disabled={!nextReady}
          onClick={onNext}
          className={cn(
            'transition-opacity duration-150',
            !nextReady && 'opacity-0 pointer-events-none',
          )}
        >
          Next question
        </Button>
      </div>
    </div>
  )
}
