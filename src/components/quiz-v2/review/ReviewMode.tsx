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
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
      isCurrent && 'ring-2 ring-primary ring-offset-1',
      question.isFlagged && !isCurrent && 'bg-warning-50 text-warning border border-warning/40',
      !question.isCorrect && !question.isFlagged && !isCurrent && 'bg-destructive-50 text-text-secondary',
      question.isCorrect && !isCurrent && 'bg-success-50 text-success',
      isCurrent && 'bg-primary text-white',
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
  <div className="mt-4 rounded-md border border-border bg-surface-light p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
      Explanation
    </p>
    <p className="text-sm text-foreground leading-relaxed">{question.rationale}</p>

    {/* Wrong-answer-specific explanation */}
    {!question.isCorrect && question.wrongAnswerExplanation && (
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs font-semibold text-text-secondary mb-1">Why your answer was incorrect</p>
        <p className="text-sm text-text-secondary leading-relaxed">
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
        className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:text-primary-700 transition-colors duration-150"
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
        question_type: 'mcq' as const,
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
        <p className="text-text-secondary text-sm">No questions match this filter.</p>
        <button
          type="button"
          onClick={() => handleFilterChange('all')}
          className="text-primary text-sm font-medium hover:underline"
        >
          Show all questions
        </button>
      </div>
    )
  }

  const userWasWrong = !current.isCorrect && !current.isSkipped

  return (
    <div className="flex flex-col min-h-screen bg-surface-focused">
      {/* ── Header bar ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors duration-150"
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
          className="flex gap-1 bg-surface-light rounded-sm p-0.5"
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
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Question count */}
        <p className="text-xs text-muted-foreground tabular-nums shrink-0">
          {currentIndex + 1} / {filtered.length}
        </p>
      </header>

      {/* ── Question palette strip ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-border px-4 py-2.5">
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
        <div className="p-4 md:p-6 lg:p-8 md:border-r md:border-border overflow-y-auto">
          <QuestionColumn
            question={questionForColumn}
          />

          {/* Rationale panel always visible in review */}
          <RationalePanel question={current} />
        </div>

        {/* Right: annotated options */}
        <div className="p-4 md:p-6 lg:p-8 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
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
      <footer className="sticky bottom-0 bg-white border-t border-border px-4 py-3 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-medium',
            'border border-border transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed text-muted-foreground'
              : 'text-text-secondary hover:border-primary/40 hover:text-foreground',
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
              ? 'bg-surface-light text-muted-foreground'
              : current.isCorrect
                ? 'bg-success-50 text-success'
                : 'bg-surface-light text-text-secondary',
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
            'border border-border transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            currentIndex === filtered.length - 1
              ? 'opacity-40 cursor-not-allowed text-muted-foreground'
              : 'text-text-secondary hover:border-primary/40 hover:text-foreground',
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
