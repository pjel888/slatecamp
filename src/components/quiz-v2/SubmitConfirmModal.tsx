'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
  Flag,
  CheckCircle,
  Circle,
  ArrowUUpLeft,
  PaperPlaneTilt,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { QuestionForClient, QuizAnswerState } from '@/types/quiz-config'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubmitConfirmModalProps {
  questions: QuestionForClient[]
  answers: Map<string, QuizAnswerState>
  flaggedSet: Set<string>
  currentIndex: number
  onReviewUnanswered: () => void
  onSubmit: () => void
  onClose: () => void
}

type MiniCellState = 'answered' | 'flagged' | 'skipped' | 'unanswered'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getMiniCellState = (
  question: QuestionForClient,
  answers: Map<string, QuizAnswerState>,
  flaggedSet: Set<string>,
): MiniCellState => {
  const answer = answers.get(question.question_id)
  if (flaggedSet.has(question.question_id)) return 'flagged'
  if (answer?.isSkipped) return 'skipped'
  if (answer?.selectedOptionId) return 'answered'
  return 'unanswered'
}

const miniCellStyles: Record<MiniCellState, string> = {
  answered: 'bg-[#1B3FC4] border-[#1B3FC4] text-white',
  flagged: 'bg-[#E8853A] border-[#E8853A] text-white',
  skipped: 'border-dashed border-[#8896A7] text-[#8896A7] bg-white',
  unanswered: 'border-[#D4DAE3] text-[#8896A7] bg-white',
}

const MiniCellIcon = ({ state }: { state: MiniCellState }) => {
  if (state === 'answered') return <CheckCircle size={8} weight="fill" aria-hidden="true" className="absolute bottom-0 right-0" />
  if (state === 'flagged') return <Flag size={8} weight="fill" aria-hidden="true" className="absolute bottom-0 right-0" />
  if (state === 'skipped') return <ArrowUUpLeft size={8} weight="regular" aria-hidden="true" className="absolute bottom-0 right-0" />
  return <Circle size={8} weight="regular" aria-hidden="true" className="absolute bottom-0 right-0" />
}

// ─── Component ───────────────────────────────────────────────────────────────

export const SubmitConfirmModal = ({
  questions,
  answers,
  flaggedSet,
  currentIndex,
  onReviewUnanswered,
  onSubmit,
  onClose,
}: SubmitConfirmModalProps) => {
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)

  // Counts
  const answeredCount = questions.filter(
    (q) => answers.get(q.question_id)?.selectedOptionId,
  ).length
  const unansweredCount = questions.filter((q) => {
    const a = answers.get(q.question_id)
    return !a?.selectedOptionId && !a?.isSkipped
  }).length
  const flaggedCount = flaggedSet.size
  const skippedCount = questions.filter(
    (q) => answers.get(q.question_id)?.isSkipped,
  ).length

  // Store previous focus, focus submit button on mount
  useEffect(() => {
    previousFocusRef.current = document.activeElement
    submitButtonRef.current?.focus()

    return () => {
      if (
        previousFocusRef.current &&
        'focus' in previousFocusRef.current
      ) {
        (previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [])

  // Focus trap
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleFocusTrap = (e: FocusEvent) => {
      if (!dialog.contains(e.target as Node)) {
        submitButtonRef.current?.focus()
      }
    }

    document.addEventListener('focusin', handleFocusTrap)
    return () => document.removeEventListener('focusin', handleFocusTrap)
  }, [])

  // Escape dismisses
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose],
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="submit-confirm-title"
        aria-describedby="submit-confirm-desc"
        className="flex w-full max-w-md flex-col gap-4 rounded-lg bg-white p-6 shadow-lg"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="space-y-1">
          <h2
            id="submit-confirm-title"
            className="text-sm font-semibold text-[#1A2332]"
          >
            Ready to submit?
          </h2>
          <p
            id="submit-confirm-desc"
            className="text-sm text-[#4A5568]"
          >
            Review your answers below before submitting. This action cannot be undone.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2">
          <StatCell
            value={answeredCount}
            label="Answered"
            valueColor="text-[#1B3FC4]"
            icon={<CheckCircle size={14} weight="fill" className="text-[#1B3FC4]" aria-hidden="true" />}
          />
          <StatCell
            value={unansweredCount}
            label="Unanswered"
            valueColor={unansweredCount > 0 ? 'text-[#D4951A]' : 'text-[#8896A7]'}
            icon={<Circle size={14} weight="regular" className={unansweredCount > 0 ? 'text-[#D4951A]' : 'text-[#8896A7]'} aria-hidden="true" />}
          />
          <StatCell
            value={flaggedCount}
            label="Flagged"
            valueColor={flaggedCount > 0 ? 'text-[#E8853A]' : 'text-[#8896A7]'}
            icon={<Flag size={14} weight="fill" className={flaggedCount > 0 ? 'text-[#E8853A]' : 'text-[#8896A7]'} aria-hidden="true" />}
          />
        </div>

        {/* Mini question grid */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#4A5568]">All questions</p>
          <div
            role="grid"
            aria-label="Question status overview"
            aria-readonly="true"
            className="grid gap-1"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))' }}
          >
            {questions.map((q, idx) => {
              const state = getMiniCellState(q, answers, flaggedSet)
              const isCurrent = idx === currentIndex

              return (
                <div key={q.question_id} role="row">
                  <div
                    role="gridcell"
                    aria-label={`Question ${idx + 1}: ${state}${isCurrent ? ', current' : ''}`}
                    className={cn(
                      'relative flex h-7 w-7 items-center justify-center rounded-sm border text-[10px] font-medium',
                      miniCellStyles[state],
                      isCurrent && 'ring-2 ring-[#1B3FC4] ring-offset-1',
                    )}
                  >
                    {idx + 1}
                    <MiniCellIcon state={state} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mini legend */}
          {skippedCount > 0 && (
            <p className="text-[10px] text-[#8896A7]">
              {skippedCount} question{skippedCount !== 1 ? 's' : ''} skipped —{' '}
              skipped questions will be counted as unanswered.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
          {/* Review unanswered — only shown when there are unanswered questions */}
          {unansweredCount > 0 ? (
            <Button
              variant="secondary"
              size="md"
              onClick={onReviewUnanswered}
              leftIcon={<MagnifyingGlass size={16} aria-hidden="true" />}
              className="order-2 sm:order-1"
            >
              Review {unansweredCount} unanswered
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="md"
              onClick={onClose}
              className="order-2 sm:order-1"
            >
              Go back
            </Button>
          )}

          {/* Submit */}
          <Button
            ref={submitButtonRef}
            variant="primary"
            size="md"
            onClick={onSubmit}
            leftIcon={<PaperPlaneTilt size={16} aria-hidden="true" />}
            className="order-1 sm:order-2"
          >
            Submit exam
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── StatCell ────────────────────────────────────────────────────────────────

const StatCell = ({
  value,
  label,
  valueColor,
  icon,
}: {
  value: number
  label: string
  valueColor: string
  icon: React.ReactNode
}) => (
  <div className="flex flex-col items-center gap-1 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] py-3">
    <div className="flex items-center gap-1">
      {icon}
      <span className={cn('text-lg font-semibold', valueColor)}>{value}</span>
    </div>
    <span className="text-[10px] text-[#4A5568]">{label}</span>
  </div>
)
