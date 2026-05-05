'use client'

import { useEffect, useMemo, useState } from 'react'
import { ReviewFilterBar, type ReviewFilter } from './ReviewFilterBar'
import { ReviewCard } from './ReviewCard'
import { cn } from '@/lib/utils'
import type { ReviewQuestionData, QuestionHistoryStats } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewCardListProps {
  questions: ReviewQuestionData[]
  questionHistory?: Record<string, QuestionHistoryStats>
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReviewCardList = ({
  questions,
  questionHistory,
}: ReviewCardListProps) => {
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  // Compute counts
  const incorrectCount = useMemo(
    () => questions.filter((q) => !q.isCorrect && !q.isSkipped).length,
    [questions],
  )
  const flaggedCount = useMemo(
    () => questions.filter((q) => q.isFlagged).length,
    [questions],
  )
  const lowConfidenceCount = useMemo(
    () => questions.filter((q) => q.confidenceLevel !== null && q.confidenceLevel <= 1).length,
    [questions],
  )

  // Filter questions based on active filter
  const filtered = useMemo(() => {
    switch (activeFilter) {
      case 'incorrect':
        return questions.filter((q) => !q.isCorrect && !q.isSkipped)
      case 'flagged':
        return questions.filter((q) => q.isFlagged)
      case 'low-confidence':
        return questions.filter((q) => q.confidenceLevel !== null && q.confidenceLevel <= 1)
      default:
        return questions
    }
  }, [questions, activeFilter])

  useEffect(() => {
    setActiveIndex(0)
  }, [activeFilter])

  useEffect(() => {
    if (activeIndex > Math.max(filtered.length - 1, 0)) {
      setActiveIndex(Math.max(filtered.length - 1, 0))
    }
  }, [activeIndex, filtered.length])

  const activeQuestion = filtered[activeIndex]
  const canGoPrevious = activeIndex > 0
  const canGoNext = activeIndex < filtered.length - 1

  const goPrevious = () => setActiveIndex((index) => Math.max(0, index - 1))
  const goNext = () => setActiveIndex((index) => Math.min(filtered.length - 1, index + 1))

  return (
    <div className="rounded-2xl border border-border bg-card/90 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
      <ReviewFilterBar
        totalCount={questions.length}
        incorrectCount={incorrectCount}
        flaggedCount={flaggedCount}
        lowConfidenceCount={lowConfidenceCount}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {filtered.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-text-secondary">No questions match this filter.</p>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Show all questions
          </button>
        </div>
      ) : (
        <div className="mt-3" role="region" aria-label="Question review carousel">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background/70 px-3 py-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Review one question at a time
              </p>
              <p className="text-sm font-medium text-foreground">
                Question {activeIndex + 1} of {filtered.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrevious}
                disabled={!canGoPrevious}
                className={cn(
                  'rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors',
                  canGoPrevious
                    ? 'bg-card text-foreground hover:bg-surface-light'
                    : 'cursor-not-allowed bg-surface-light text-muted-foreground/60',
                )}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={!canGoNext}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                  canGoNext
                    ? 'bg-primary text-white hover:bg-primary-700'
                    : 'cursor-not-allowed bg-surface-light text-muted-foreground/60',
                )}
              >
                Next
              </button>
            </div>
          </div>

          <div role="list" aria-label="Question review cards">
            {activeQuestion && (
              <ReviewCard
                key={activeQuestion.questionId}
                question={activeQuestion}
                historyStats={questionHistory?.[activeQuestion.questionId]}
                defaultExpanded
                compact
              />
            )}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5" aria-label="Jump to question">
            {filtered.map((question, index) => (
              <button
                key={question.questionId}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show question ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={cn(
                  'h-2.5 rounded-full transition-all',
                  index === activeIndex
                    ? 'w-6 bg-primary'
                    : question.isCorrect
                      ? 'w-2.5 bg-success/45 hover:bg-success/70'
                      : 'w-2.5 bg-warning/55 hover:bg-warning/80',
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
