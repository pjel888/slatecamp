'use client'

import { lazy, Suspense, useEffect, useState } from 'react'
import {
  ArrowRight,
  ArrowSquareOut,
  ChatCircleDots,
  CheckCircle,
  Lightbulb,
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/stores/useQuizStore'
import type { ErrorCategory, FeedbackData, QuestionForClient, QuizMode } from '@/types/quiz-config'
import { MnemonicTip } from './MnemonicTip'

const SocraticExplorer = lazy(() =>
  import('./SocraticExplorer').then((m) => ({ default: m.SocraticExplorer })),
)

const SOCRATIC_MODES: QuizMode[] = ['camp', 'focused', 'subject', 'chill']

const ERROR_HEADING_MAP: Record<Exclude<ErrorCategory, 'lucky_guess'>, string> = {
  knowledge_gap: "Here's what to know",
  random_guess: 'Slow down',
  misremembered_fact: 'You were close',
  computation_error: 'Check the steps',
  concept_confusion: 'Untangle the concept',
  misread_question: 'Read the cue words closely',
}

interface FeedbackPanelProps {
  feedback: FeedbackData
  question: QuestionForClient
  selectedOptionId: string
  gatedDelayMs: number
  onNext: () => void
  mode?: QuizMode | null
  failCount?: number
}

export const FeedbackPanel = ({
  feedback,
  question,
  selectedOptionId,
  gatedDelayMs,
  onNext,
  mode,
  failCount = 0,
}: FeedbackPanelProps) => {
  const [socraticOpen, setSocraticOpen] = useState(false)

  const openWikiPanel = useQuizStore((s) => s.openWikiPanel)
  const feedbackGateActive = useQuizStore((s) => s.feedback.feedbackGateActive)
  const feedbackGateRemainingMs = useQuizStore((s) => s.feedback.feedbackGateRemainingMs)
  const startFeedbackGate = useQuizStore((s) => s.startFeedbackGate)
  const tickFeedbackGate = useQuizStore((s) => s.tickFeedbackGate)
  const currentIndex = useQuizStore((s) => s.currentIndex)
  const totalQuestions = useQuizStore((s) => s.totalQuestions)

  const showSocraticButton =
    !feedback.isCorrect && mode != null && SOCRATIC_MODES.includes(mode)
  const showMnemonic =
    !feedback.isCorrect && failCount >= 2 && feedback.rationale != null
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1
  const nextActionLabel = isLastQuestion ? 'See results' : 'Next question'

  useEffect(() => {
    if (gatedDelayMs > 0) {
      startFeedbackGate(gatedDelayMs)
    }
  }, [gatedDelayMs, feedback.questionId, startFeedbackGate])

  useEffect(() => {
    if (!feedbackGateActive) return

    const intervalId = setInterval(() => {
      tickFeedbackGate()
    }, 100)

    return () => clearInterval(intervalId)
  }, [feedbackGateActive, tickFeedbackGate])

  const nextReady = !feedbackGateActive || gatedDelayMs === 0
  const remainingMs = feedbackGateRemainingMs
  const selectedOption = question.options.find((option) => option.id === selectedOptionId)
  const correctOption = question.options.find((option) => option.id === feedback.correctOptionId)
  const isGeneration = feedback.questionType != null && feedback.questionType !== 'mcq'
  const countdownSeconds = Math.ceil(remainingMs / 1000)
  const countdownProgress = gatedDelayMs > 0 ? 1 - remainingMs / gatedDelayMs : 1

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'animate-in slide-in-from-bottom-1 space-y-3 rounded-md border p-4 fade-in duration-150',
        feedback.isCorrect ? 'border-success/20 bg-success-50' : 'border-warning/20 bg-warning-50',
      )}
    >
      <div className="flex items-center gap-2">
        {feedback.isCorrect ? (
          <CheckCircle
            size={18}
            weight="fill"
            className="shrink-0 text-success"
            aria-hidden="true"
          />
        ) : (
          <ArrowRight
            size={18}
            weight="bold"
            className="shrink-0 text-warning"
            aria-hidden="true"
          />
        )}
        <span
          className={cn(
            'text-sm font-semibold',
            feedback.isCorrect ? 'text-success' : 'text-warning',
          )}
        >
          {feedback.isCorrect
            ? 'Correct'
            : feedback.errorDiagnostic?.category && ERROR_HEADING_MAP[feedback.errorDiagnostic.category]
              ? ERROR_HEADING_MAP[feedback.errorDiagnostic.category]
              : isGeneration && feedback.closeness != null && feedback.closeness > 0.8
                ? 'Very close'
                : 'Not quite'}
        </span>
      </div>

      {!feedback.isCorrect && isGeneration && (
        <div className="space-y-1.5">
          <p className="text-xs leading-relaxed text-text-secondary">
            You answered{' '}
            <span className="font-mono font-medium text-foreground">{selectedOptionId}</span>.
          </p>
          {feedback.correctAnswer && (
            <p className="text-xs leading-relaxed text-text-secondary">
              {feedback.closeness != null && feedback.closeness > 0.8 ? (
                <>
                  The correct value is{' '}
                  <span className="font-mono font-medium text-foreground">
                    {feedback.correctAnswer}
                  </span>
                  .
                </>
              ) : (
                <>
                  The correct answer is{' '}
                  <span className="font-mono font-medium text-foreground">
                    {feedback.correctAnswer}
                  </span>
                  .
                </>
              )}
            </p>
          )}
        </div>
      )}

      {feedback.isCorrect && isGeneration && feedback.correctAnswer && (
        <p className="text-xs leading-relaxed text-text-secondary">
          The answer is <span className="font-mono font-medium text-success">{feedback.correctAnswer}</span>.
        </p>
      )}

      {!feedback.isCorrect && !isGeneration && (
        <p className="text-xs leading-relaxed text-text-secondary">
          {selectedOption && (
            <>
              You chose{' '}
              <span className="font-medium text-foreground">
                {selectedOption.letter}. {selectedOption.text}
              </span>
              .{' '}
            </>
          )}
          {correctOption && (
            <>
              The correct answer is{' '}
              <span className="font-medium text-foreground">
                {correctOption.letter}. {correctOption.text}
              </span>
              .
            </>
          )}
        </p>
      )}

      {feedback.errorDiagnostic && !feedback.isCorrect && (
        <div className="flex items-start gap-2 rounded-sm border border-border bg-surface-light px-3 py-2">
          <Lightbulb
            size={14}
            weight="fill"
            className="mt-0.5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-text-secondary">
            {feedback.errorDiagnostic.message}
          </p>
        </div>
      )}

      {feedback.rationale && (
        <p className="text-sm leading-relaxed text-text-secondary">{feedback.rationale}</p>
      )}

      {feedback.wikiUrl && (
        <button
          type="button"
          onClick={() => openWikiPanel(feedback.wikiUrl!)}
          className="inline-flex cursor-pointer items-center gap-1 text-xs text-primary hover:underline"
        >
          <ArrowSquareOut size={12} aria-hidden="true" />
          Read more
        </button>
      )}

      {showMnemonic && (
        <MnemonicTip
          factToRemember={feedback.rationale ?? ''}
          topicName={question.taxonomy_breadcrumb}
        />
      )}

      <div className="space-y-2 pt-1">
        {gatedDelayMs > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] text-muted-foreground">
              {nextReady
                ? `Ready - tap ${nextActionLabel} to continue`
                : `Review the explanation - ${nextActionLabel.toLowerCase()} in ${countdownSeconds}s`}
            </p>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className={cn(
                  'h-full rounded-full transition-none',
                  nextReady ? 'bg-success' : 'bg-primary/40',
                )}
                style={{ width: `${countdownProgress * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={!nextReady}
            onClick={onNext}
            aria-disabled={!nextReady}
            className={cn(
              'transition-all duration-200',
              !nextReady && 'cursor-not-allowed opacity-50',
            )}
          >
            {nextActionLabel}
          </Button>

          {showSocraticButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSocraticOpen(true)}
              className="border-primary/30 text-primary hover:bg-primary-50"
            >
              <ChatCircleDots size={14} weight="bold" aria-hidden="true" />
              Why was I wrong?
            </Button>
          )}
        </div>
      </div>

      {socraticOpen && (
        <Suspense fallback={null}>
          <SocraticExplorer
            questionText={question.stem}
            selectedAnswer={
              question.options.find((option) => option.id === selectedOptionId)?.text ?? ''
            }
            correctAnswer={
              question.options.find((option) => option.id === feedback.correctOptionId)?.text ?? ''
            }
            topicName={question.taxonomy_breadcrumb}
            topicId={question.question_id}
            onClose={() => setSocraticOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
}
