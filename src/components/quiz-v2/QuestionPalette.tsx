'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Flag,
  X,
  Circle,
  CheckCircle,
  ArrowUUpLeft,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { QuestionForClient, QuizAnswerState } from '@/types/quiz-config'

// ─── Types ───────────────────────────────────────────────────────────────────

type PaletteFilter = 'all' | 'unanswered' | 'flagged'

interface QuestionPaletteProps {
  questions: QuestionForClient[]
  answers: Record<string, QuizAnswerState>
  currentIndex: number
  flaggedSet: Set<string>
  onJumpTo: (index: number) => void
  onClose: () => void
}

type CellState = 'unanswered' | 'answered' | 'flagged' | 'current' | 'skipped'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getCellState = (
  question: QuestionForClient,
  answers: Record<string, QuizAnswerState>,
  flaggedSet: Set<string>,
  currentIndex: number,
  questionIndex: number,
): CellState => {
  if (questionIndex === currentIndex) return 'current'
  const answer = answers[question.question_id]
  if (flaggedSet.has(question.question_id)) return 'flagged'
  if (answer?.isSkipped) return 'skipped'
  if (answer?.selectedOptionId) return 'answered'
  return 'unanswered'
}

// ─── Cell style map (color is never the sole indicator) ──────────────────────

const cellStyles: Record<CellState, string> = {
  unanswered:
    'bg-white border-2 border-border text-muted-foreground',
  answered:
    'bg-primary border-2 border-primary text-white',
  flagged:
    'bg-camp-orange border-2 border-camp-orange text-white',
  current:
    'bg-white border-2 border-primary text-primary ring-2 ring-primary ring-offset-1 font-bold',
  skipped:
    'bg-white border-2 border-dashed border-muted-foreground text-muted-foreground',
}

// ─── CellIcon — ensures color is always paired with shape/icon ───────────────

const CellIcon = ({ state }: { state: CellState }) => {
  if (state === 'answered') {
    return <CheckCircle size={10} weight="fill" aria-hidden="true" className="absolute bottom-0.5 right-0.5" />
  }
  if (state === 'flagged') {
    return <Flag size={10} weight="fill" aria-hidden="true" className="absolute bottom-0.5 right-0.5" />
  }
  if (state === 'skipped') {
    return <ArrowUUpLeft size={10} weight="regular" aria-hidden="true" className="absolute bottom-0.5 right-0.5" />
  }
  if (state === 'unanswered') {
    return <Circle size={10} weight="regular" aria-hidden="true" className="absolute bottom-0.5 right-0.5" />
  }
  return null
}

// ─── Filter pill labels ───────────────────────────────────────────────────────

const FILTER_LABELS: Record<PaletteFilter, string> = {
  all: 'All',
  unanswered: 'Unanswered',
  flagged: 'Flagged',
}

// ─── Component ───────────────────────────────────────────────────────────────

export const QuestionPalette = ({
  questions,
  answers,
  currentIndex,
  flaggedSet,
  onJumpTo,
  onClose,
}: QuestionPaletteProps) => {
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const [filter, setFilter] = useState<PaletteFilter>('all')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Compute visible questions based on filter
  const visibleQuestions = questions.filter((q, i) => {
    if (filter === 'all') return true
    const state = getCellState(q, answers, flaggedSet, currentIndex, i)
    if (filter === 'unanswered') return state === 'unanswered' || state === 'skipped'
    if (filter === 'flagged') return state === 'flagged'
    return true
  })

  // Focus first cell on mount
  useEffect(() => {
    const firstCell = cellRefs.current[0]
    if (firstCell) {
      firstCell.focus()
      setFocusedIndex(0)
    } else {
      closeButtonRef.current?.focus()
    }
  }, [])

  // Re-focus when filter changes
  useEffect(() => {
    setFocusedIndex(0)
    const firstCell = cellRefs.current[0]
    if (firstCell) firstCell.focus()
  }, [filter])

  // Focus trap
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const handleFocusTrap = (e: FocusEvent) => {
      if (!panel.contains(e.target as Node)) {
        closeButtonRef.current?.focus()
      }
    }

    document.addEventListener('focusin', handleFocusTrap)
    return () => document.removeEventListener('focusin', handleFocusTrap)
  }, [])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cols = Math.floor((panelRef.current?.clientWidth ?? 320) / 44) || 7

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return

      e.preventDefault()

      setFocusedIndex((prev) => {
        let next = prev
        if (e.key === 'ArrowRight') next = Math.min(prev + 1, visibleQuestions.length - 1)
        if (e.key === 'ArrowLeft') next = Math.max(prev - 1, 0)
        if (e.key === 'ArrowDown') next = Math.min(prev + cols, visibleQuestions.length - 1)
        if (e.key === 'ArrowUp') next = Math.max(prev - cols, 0)

        cellRefs.current[next]?.focus()
        return next
      })
    },
    [onClose, visibleQuestions.length],
  )

  const answeredCount = questions.filter(
    (q) => answers[q.question_id]?.selectedOptionId,
  ).length
  const flaggedCount = flaggedSet.size
  const unansweredCount = questions.filter((q) => {
    const a = answers[q.question_id]
    return !a?.selectedOptionId && !a?.isSkipped
  }).length

  return (
    // Overlay backdrop
    <div
      className="fixed inset-0 z-40 bg-black/30"
      onClick={onClose}
      aria-hidden="true"
    >
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Question palette"
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-lg',
          'flex flex-col',
          !prefersReducedMotion && 'animate-in slide-in-from-right duration-150 ease-out',
        )}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Question Palette
            </h2>
            <p className="text-xs text-text-secondary">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close question palette"
          >
            <X size={16} aria-hidden="true" />
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 border-b border-border px-4 py-2">
          {(['all', 'unanswered', 'flagged'] as PaletteFilter[]).map((f) => {
            const count =
              f === 'all'
                ? questions.length
                : f === 'unanswered'
                  ? unansweredCount
                  : flaggedCount
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-sm px-2 py-1 text-xs font-medium transition-colors duration-150',
                  filter === f
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-light',
                )}
                aria-pressed={filter === f}
              >
                {FILTER_LABELS[f]}
                <span
                  className={cn(
                    'ml-1 rounded-sm px-1 py-0.5 text-[10px]',
                    filter === f ? 'bg-primary text-white' : 'bg-border text-text-secondary',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 border-b border-border px-4 py-2">
          <LegendItem color="bg-primary" label="Answered" icon={<CheckCircle size={8} weight="fill" aria-hidden="true" />} />
          <LegendItem color="bg-camp-orange" label="Flagged" icon={<Flag size={8} weight="fill" aria-hidden="true" />} />
          <LegendItem color="bg-white border border-border" label="Unanswered" icon={<Circle size={8} weight="regular" aria-hidden="true" />} />
          <LegendItem color="bg-white border border-dashed border-muted-foreground" label="Skipped" icon={<ArrowUUpLeft size={8} weight="regular" aria-hidden="true" />} />
        </div>

        {/* Grid */}
        <div
          className="flex-1 overflow-y-auto p-4"
        >
          {visibleQuestions.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No questions match this filter.
            </p>
          ) : (
            <div
              role="grid"
              aria-label={`${FILTER_LABELS[filter]} questions`}
              className="grid gap-1.5"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(36px, 1fr))' }}
            >
              {visibleQuestions.map((q, idx) => {
                const originalIndex = questions.indexOf(q)
                const state = getCellState(q, answers, flaggedSet, currentIndex, originalIndex)
                const isFocused = focusedIndex === idx

                return (
                  <div key={q.question_id} role="row">
                    <button
                      ref={(el) => { cellRefs.current[idx] = el }}
                      role="gridcell"
                      type="button"
                      tabIndex={isFocused ? 0 : -1}
                      aria-label={`Question ${originalIndex + 1}, ${state}`}
                      aria-current={state === 'current' ? 'step' : undefined}
                      onClick={() => {
                        onJumpTo(originalIndex)
                        onClose()
                      }}
                      className={cn(
                        'relative flex items-center justify-center rounded-sm text-xs font-medium',
                        'transition-all duration-150',
                        // 36px desktop, 44px mobile touch target via padding
                        'h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] sm:h-9 sm:w-9',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                        'hover:opacity-80',
                        cellStyles[state],
                      )}
                    >
                      {originalIndex + 1}
                      <CellIcon state={state} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── LegendItem ───────────────────────────────────────────────────────────────

const LegendItem = ({
  color,
  label,
  icon,
}: {
  color: string
  label: string
  icon: React.ReactNode
}) => (
  <div className="flex items-center gap-1">
    <span
      className={cn('flex h-3 w-3 shrink-0 items-center justify-center rounded-[2px]', color)}
      aria-hidden="true"
    >
      {icon}
    </span>
    <span className="text-[10px] text-text-secondary">{label}</span>
  </div>
)
