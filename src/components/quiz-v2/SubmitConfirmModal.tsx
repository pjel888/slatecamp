'use client'

import {
  Flag,
  CheckCircle,
  Circle,
  ArrowUUpLeft,
  PaperPlaneTilt,
  MagnifyingGlass,
  Warning,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { QuestionForClient, QuizAnswerState } from '@/types/quiz-config'

interface SubmitConfirmModalProps {
  questions: QuestionForClient[]
  answers: Record<string, QuizAnswerState>
  flaggedSet: Set<string>
  currentIndex: number
  onReviewUnanswered: () => void
  onSubmit: () => void
  onClose: () => void
}

type MiniCellState = 'answered' | 'flagged' | 'skipped' | 'unanswered'

const getMiniCellState = (
  question: QuestionForClient,
  answers: Record<string, QuizAnswerState>,
  flaggedSet: Set<string>,
): MiniCellState => {
  const answer = answers[question.question_id]
  if (flaggedSet.has(question.question_id)) return 'flagged'
  if (answer?.isSkipped) return 'skipped'
  if (answer?.selectedOptionId) return 'answered'
  return 'unanswered'
}

const miniCellStyles: Record<MiniCellState, string> = {
  answered: 'bg-primary border-primary text-white',
  flagged: 'bg-camp-orange border-camp-orange text-white',
  skipped: 'border-dashed border-muted-foreground text-muted-foreground bg-white',
  unanswered: 'border-border text-muted-foreground bg-white',
}

const MiniCellIcon = ({ state }: { state: MiniCellState }) => {
  if (state === 'answered') {
    return <CheckCircle size={8} weight="fill" aria-hidden="true" className="absolute bottom-0 right-0" />
  }

  if (state === 'flagged') {
    return <Flag size={8} weight="fill" aria-hidden="true" className="absolute bottom-0 right-0" />
  }

  if (state === 'skipped') {
    return <ArrowUUpLeft size={8} weight="regular" aria-hidden="true" className="absolute bottom-0 right-0" />
  }

  return <Circle size={8} weight="regular" aria-hidden="true" className="absolute bottom-0 right-0" />
}

export const SubmitConfirmModal = ({
  questions,
  answers,
  flaggedSet,
  currentIndex,
  onReviewUnanswered,
  onSubmit,
  onClose,
}: SubmitConfirmModalProps) => {
  const answeredCount = questions.filter(
    (question) => answers[question.question_id]?.selectedOptionId,
  ).length
  const unansweredCount = questions.filter((question) => {
    const answer = answers[question.question_id]
    return !answer?.selectedOptionId && !answer?.isSkipped
  }).length
  const flaggedCount = flaggedSet.size
  const skippedCount = questions.filter(
    (question) => answers[question.question_id]?.isSkipped,
  ).length

  const answeredPercent = (answeredCount / questions.length) * 100
  const isLowCompletion = answeredPercent < 50

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent
        size="md"
        showCloseButton={false}
        className="gap-4 rounded-lg bg-white p-6"
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold text-foreground">
            {isLowCompletion ? 'Are you sure?' : 'Ready to submit?'}
          </DialogTitle>
          <DialogDescription className="text-sm text-text-secondary">
            {isLowCompletion
              ? `You've only answered ${Math.round(answeredPercent)}% of the questions. Review your progress before submitting.`
              : 'Review your answers below before submitting. This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        {isLowCompletion && (
          <div className="flex items-start gap-2 rounded-md border border-destructive-300 bg-destructive-50 p-3">
            <Warning size={18} weight="fill" className="mt-0.5 shrink-0 text-destructive" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-destructive-600">
                High number of unanswered questions
              </p>
              <p className="text-[11px] leading-normal text-destructive-600">
                Submitting now will negatively impact your readiness score and statistics.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <StatCell
            value={answeredCount}
            label="Answered"
            valueColor="text-primary"
            icon={<CheckCircle size={14} weight="fill" className="text-primary" aria-hidden="true" />}
          />
          <StatCell
            value={unansweredCount}
            label="Unanswered"
            valueColor={unansweredCount > 0 ? 'text-warning' : 'text-muted-foreground'}
            icon={
              <Circle
                size={14}
                weight="regular"
                className={unansweredCount > 0 ? 'text-warning' : 'text-muted-foreground'}
                aria-hidden="true"
              />
            }
          />
          <StatCell
            value={flaggedCount}
            label="Flagged"
            valueColor={flaggedCount > 0 ? 'text-camp-orange' : 'text-muted-foreground'}
            icon={
              <Flag
                size={14}
                weight="fill"
                className={flaggedCount > 0 ? 'text-camp-orange' : 'text-muted-foreground'}
                aria-hidden="true"
              />
            }
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-text-secondary">All questions</p>
          <div
            role="grid"
            aria-label="Question status overview"
            aria-readonly="true"
            className="grid gap-1"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(28px, 1fr))' }}
          >
            {questions.map((question, index) => {
              const state = getMiniCellState(question, answers, flaggedSet)
              const isCurrent = index === currentIndex

              return (
                <div key={question.question_id} role="row">
                  <div
                    role="gridcell"
                    aria-label={`Question ${index + 1}: ${state}${isCurrent ? ', current' : ''}`}
                    className={cn(
                      'relative flex h-7 w-7 items-center justify-center rounded-sm border text-[10px] font-medium',
                      miniCellStyles[state],
                      isCurrent && 'ring-2 ring-primary ring-offset-1',
                    )}
                  >
                    {index + 1}
                    <MiniCellIcon state={state} />
                  </div>
                </div>
              )
            })}
          </div>

          {skippedCount > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {skippedCount} question{skippedCount !== 1 ? 's' : ''} skipped{' '}
              skipped questions will be counted as unanswered.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:justify-between">
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

          <Button
            variant="primary"
            size="md"
            onClick={onSubmit}
            leftIcon={<PaperPlaneTilt size={16} aria-hidden="true" />}
            className="order-1 sm:order-2"
            autoFocus
          >
            Submit exam
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
  <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface-light py-3">
    <div className="flex items-center gap-1">
      {icon}
      <span className={cn('text-lg font-semibold', valueColor)}>{value}</span>
    </div>
    <span className="text-[10px] text-text-secondary">{label}</span>
  </div>
)
