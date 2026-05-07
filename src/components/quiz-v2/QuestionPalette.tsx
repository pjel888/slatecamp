'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Flag,
  Circle,
  CheckCircle,
  ArrowUUpLeft,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { QuestionForClient, QuizAnswerState } from '@/types/quiz-config'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'

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

const cellStyles: Record<CellState, string> = {
  unanswered:
    'bg-card border-2 border-border text-muted-foreground',
  answered:
    'bg-primary border-2 border-primary text-white',
  flagged:
    'bg-camp-orange border-2 border-camp-orange text-white',
  current:
    'bg-card border-2 border-primary text-primary ring-2 ring-primary ring-offset-1 font-bold',
  skipped:
    'bg-card border-2 border-dashed border-muted-foreground text-muted-foreground',
}

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
  const [filter, setFilter] = useState<PaletteFilter>('all')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<(HTMLButtonElement | null)[]>([])

  const visibleQuestions = questions.filter((q, i) => {
    if (filter === 'all') return true
    const state = getCellState(q, answers, flaggedSet, currentIndex, i)
    if (filter === 'unanswered') return state === 'unanswered' || state === 'skipped'
    if (filter === 'flagged') return state === 'flagged'
    return true
  })

  useEffect(() => {
    const firstCell = cellRefs.current[0]
    if (firstCell) {
      firstCell.focus()
      setFocusedIndex(0)
    }
  }, [])

  useEffect(() => {
    setFocusedIndex(0)
    const firstCell = cellRefs.current[0]
    if (firstCell) firstCell.focus()
  }, [filter])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const cols = Math.floor((contentRef.current?.clientWidth ?? 320) / 44) || 7

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
    [visibleQuestions.length],
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
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <ModalContent
        width={420}
        height={560}
        maxHeight="calc(100dvh - 24px)"
        role="dialog"
        aria-label="Question palette"
        onKeyDown={handleKeyDown}
      >
        <ModalHeader closeAriaLabel="Close question palette">
          <ModalTitle>Question Palette</ModalTitle>
          <ModalDescription>
            {answeredCount} of {questions.length} answered
          </ModalDescription>
        </ModalHeader>

        <ModalBody ref={contentRef} className="px-4 py-3">
          <div className="flex gap-2 border-b border-border pb-3">
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

          <div className="pt-4">
            {visibleQuestions.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
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
                          'h-9 w-9 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-[36px] sm:min-w-[36px]',
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
        </ModalBody>

        <ModalFooter className="justify-start sm:justify-start">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <LegendItem color="bg-primary" label="Answered" icon={<CheckCircle size={8} weight="fill" aria-hidden="true" />} />
            <LegendItem color="bg-camp-orange" label="Flagged" icon={<Flag size={8} weight="fill" aria-hidden="true" />} />
            <LegendItem color="bg-card border border-border" label="Unanswered" icon={<Circle size={8} weight="regular" aria-hidden="true" />} />
            <LegendItem color="bg-card border border-dashed border-muted-foreground" label="Skipped" icon={<ArrowUUpLeft size={8} weight="regular" aria-hidden="true" />} />
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
