'use client'

import { useState, useMemo } from 'react'
import { ReviewFilterBar, type ReviewFilter } from './ReviewFilterBar'
import { ReviewCard } from './ReviewCard'
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

  return (
    <div>
      {/* Sticky filter bar */}
      <ReviewFilterBar
        totalCount={questions.length}
        incorrectCount={incorrectCount}
        flaggedCount={flaggedCount}
        lowConfidenceCount={lowConfidenceCount}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Question cards */}
      <div className="mt-4 flex flex-col gap-3" role="list" aria-label="Question review cards">
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#4A5568]">No questions match this filter.</p>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className="mt-2 text-sm font-medium text-[#1B3FC4] hover:underline"
            >
              Show all questions
            </button>
          </div>
        ) : (
          filtered.map((question) => (
            <ReviewCard
              key={question.questionId}
              question={question}
              historyStats={questionHistory?.[question.questionId]}
              defaultExpanded={!question.isCorrect}
            />
          ))
        )}
      </div>
    </div>
  )
}
