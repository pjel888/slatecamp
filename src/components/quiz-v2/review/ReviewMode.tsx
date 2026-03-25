'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AnnotatedOption } from './AnnotatedOption'
import { QuestionColumn } from '@/components/quiz-v2/QuestionColumn'
import type { ReviewDataResult, ReviewQuestionData } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterMode = 'all' | 'incorrect' | 'flagged'

interface ReviewModeProps {
  data: ReviewDataResult
}

// ─── Question palette item ────────────────────────────────────────────────────

interface PaletteItemProps {
  question: ReviewQuestionData
  isCurrent: boolean
  onClick: () => void
}

const PaletteItem = ({ question, isCurrent, onClick }: PaletteItemProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Question ${question.position}${question.isCorrect ? ', correct' : ', incorrect'}${question.isFlagged ? ', flagged' : ''}`}
    aria-current={isCurrent ? 'true' : undefined}
    className={cn(
      'w-8 h-8 rounded-sm text-xs font-semibold transition-colors duration-150 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-1',
      isCurrent && 'ring-2 ring-[#1B3FC4] ring-offset-1',
      question.isFlagged && !isCurrent && 'bg-[#FEF8ED] text-[#D4951A] border border-[#D4951A]/40',
      !question.isCorrect && !question.isFlagged && !isCurrent && 'bg-[#FDF0F0] text-[#4A5568]',
      question.isCorrect && !isCurrent && 'bg-[#EDFAF4] text-[#2D9F6F]',
      isCurrent && 'bg-[#1B3FC4] text-white',
    )}
  >
    {question.position}
  </button>
)

// ─── Rationale panel ─────────────────────────────────────────────────────────

interface RationalePanelProps {
  question: ReviewQuestionData
}

const RationalePanel = ({ question }: RationalePanelProps) => (
  <div className="mt-4 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-[#8896A7] mb-2">
      Explanation
    </p>
    <p className="text-sm text-[#1A2332] leading-relaxed">{question.rationale}</p>

    {/* Wrong-answer-specific explanation */}
    {!question.isCorrect && question.wrongAnswerExplanation && (
      <div className="mt-3 border-t border-[#D4DAE3] pt-3">
        <p className="text-xs font-semibold text-[#4A5568] mb-1">Why your answer was incorrect</p>
        <p className="text-sm text-[#4A5568] leading-relaxed">
          {question.wrongAnswerExplanation}
        </p>
      </div>
    )}

    {/* Wiki link */}
    {question.wikiArticleUrl && (
      <a
        href={question.wikiArticleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
      >
        Read reference article
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path
            d="M2 8L8 2M8 2H4M8 2v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    )}
  </div>
)

// ─── Component ────────────────────────────────────────────────────────────────

export const ReviewMode = ({ data }: ReviewModeProps) => {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterMode>('all')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filtered question list
  const filtered = useMemo(() => {
    if (filter === 'incorrect') return data.questions.filter((q) => !q.isCorrect)
    if (filter === 'flagged') return data.questions.filter((q) => q.isFlagged)
    return data.questions
  }, [data.questions, filter])

  const current = filtered[currentIndex] ?? null

  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(filtered.length - 1, i + 1))
  }, [filtered.length])

  const handleFilterChange = useCallback((next: FilterMode) => {
    setFilter(next)
    setCurrentIndex(0)
  }, [])

  const handlePaletteJump = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  // Build a read-only QuestionForClient shape from ReviewQuestionData
  const questionForColumn = current
    ? {
        question_id: current.questionId,
        position: current.position,
        stem: current.stem,
        image_url: current.imageUrl,
        image_alt_text: null,
        taxonomy_breadcrumb: current.taxonomyBreadcrumb,
        difficulty_label: 'Medium' as const,
        options: current.options.map((o) => ({
          id: o.id,
          letter: o.letter,
          text: o.text,
        })),
      }
    : null

  const FILTER_OPTIONS: { label: string; value: FilterMode }[] = [
    { label: 'All', value: 'all' },
    { label: 'Incorrect', value: 'incorrect' },
    { label: 'Flagged', value: 'flagged' },
  ]

  if (!current || !questionForColumn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[#4A5568] text-sm">No questions match this filter.</p>
        <button
          type="button"
          onClick={() => handleFilterChange('all')}
          className="text-[#1B3FC4] text-sm font-medium hover:underline"
        >
          Show all questions
        </button>
      </div>
    )
  }

  const userWasWrong = !current.isCorrect && !current.isSkipped

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7FA]">
      {/* ── Header bar ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#D4DAE3] px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[#4A5568] hover:text-[#1A2332] transition-colors duration-150"
          aria-label="Back to results"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Results
        </button>

        {/* Filter tabs */}
        <div
          role="tablist"
          aria-label="Filter questions"
          className="flex gap-1 bg-[#F8F7F5] rounded-sm p-0.5"
        >
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={filter === opt.value}
              onClick={() => handleFilterChange(opt.value)}
              className={cn(
                'px-3 py-1 rounded-sm text-xs font-medium transition-colors duration-150 ease-out',
                filter === opt.value
                  ? 'bg-white text-[#1B3FC4] shadow-sm'
                  : 'text-[#4A5568] hover:text-[#1A2332]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Question count */}
        <p className="text-xs text-[#8896A7] tabular-nums shrink-0">
          {currentIndex + 1} / {filtered.length}
        </p>
      </header>

      {/* ── Question palette strip ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#D4DAE3] px-4 py-2.5">
        <div className="flex flex-wrap gap-1.5" role="list" aria-label="Question palette">
          {filtered.map((q, i) => (
            <PaletteItem
              key={q.questionId}
              question={q}
              isCurrent={i === currentIndex}
              onClick={() => handlePaletteJump(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Two-column body ──────────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
        {/* Left: question (read-only) */}
        <div className="p-4 md:p-6 lg:p-8 md:border-r md:border-[#D4DAE3] overflow-y-auto">
          <QuestionColumn
            question={questionForColumn}
            confidenceLevel={null}
            showConfidence={false}
            onConfidenceChange={() => undefined}
          />

          {/* Rationale panel always visible in review */}
          <RationalePanel question={current} />
        </div>

        {/* Right: annotated options */}
        <div className="p-4 md:p-6 lg:p-8 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8896A7] mb-3">
            Answer Choices
          </p>
          <div
            className="flex flex-col gap-2"
            role="list"
            aria-label="Answer options"
          >
            {current.options.map((option) => (
              <AnnotatedOption
                key={option.id}
                option={option}
                userWasWrong={userWasWrong}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation footer ────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 bg-white border-t border-[#D4DAE3] px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium',
            'border border-[#D4DAE3] transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-2',
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed text-[#8896A7]'
              : 'text-[#4A5568] hover:border-[#1B3FC4]/40 hover:text-[#1A2332]',
          )}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Previous
        </button>

        {/* Correct/incorrect badge for current question */}
        <span
          className={cn(
            'px-3 py-1 rounded-sm text-xs font-semibold',
            current.isSkipped
              ? 'bg-[#F8F7F5] text-[#8896A7]'
              : current.isCorrect
                ? 'bg-[#EDFAF4] text-[#2D9F6F]'
                : 'bg-[#F8F7F5] text-[#4A5568]',
          )}
        >
          {current.isSkipped ? 'Skipped' : current.isCorrect ? 'Correct' : 'Incorrect'}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentIndex === filtered.length - 1}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium',
            'border border-[#D4DAE3] transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-2',
            currentIndex === filtered.length - 1
              ? 'opacity-40 cursor-not-allowed text-[#8896A7]'
              : 'text-[#4A5568] hover:border-[#1B3FC4]/40 hover:text-[#1A2332]',
          )}
        >
          Next
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </footer>
    </div>
  )
}
