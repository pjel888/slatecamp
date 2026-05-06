'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { getPrequestions } from '@/lib/actions/wiki/get-prequestions'
import { submitPrequestion } from '@/lib/actions/wiki/submit-prequestion'
import type {
  PrequestionForClient,
  PrequestionPayload,
} from '@/lib/actions/wiki/get-prequestions'
import type { SubmitPrequestionResult } from '@/lib/actions/wiki/submit-prequestion'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PrequestionGateProps {
  topicId: string
  topicName: string
  articleSlug?: string
  children: ReactNode
  onMissedQuestions?: (questionIds: string[]) => void
}

interface AnsweredQuestion {
  questionId: string
  selectedOptionId: string
  result: SubmitPrequestionResult
}

type GatePhase = 'loading' | 'questions' | 'summary' | 'article'

// ─── Option state styling (mirrors Slatecamp design system) ───────────────────

const OPTION_CLASSES = {
  default:
    'bg-card border-border text-foreground hover:border-primary/40 hover:shadow-sm cursor-pointer',
  selected: 'bg-primary-50 border-primary text-foreground cursor-pointer',
  correct:
    'bg-success-50 border-success text-foreground cursor-default',
  incorrect:
    'bg-destructive-50 border-destructive text-foreground cursor-default',
} as const

const LETTER_CLASSES = {
  default: 'bg-surface-light text-text-secondary',
  selected: 'bg-primary text-white',
  correct: 'bg-success text-white',
  incorrect: 'bg-destructive text-white',
} as const

// ─── Component ───────────────────────────────────────────────────────────────

export const PrequestionGate = ({
  topicId,
  topicName,
  articleSlug,
  children,
  onMissedQuestions,
}: PrequestionGateProps) => {
  const [phase, setPhase] = useState<GatePhase>('loading')
  const [payload, setPayload] = useState<PrequestionPayload | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<SubmitPrequestionResult | null>(null)
  const [answers, setAnswers] = useState<AnsweredQuestion[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const questionStartTime = useRef<number>(Date.now())

  // ── Fetch prequestions on mount ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await getPrequestions(topicId, 3, articleSlug)
        if (cancelled) return

        if (!data || data.questions.length === 0) {
          setPhase('article')
          return
        }

        setPayload(data)
        setPhase('questions')
        questionStartTime.current = Date.now()
      } catch {
        // On error, fail open — show the article
        if (!cancelled) setPhase('article')
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [topicId])

  // ── Notify parent of missed questions ────────────────────────────────────
  useEffect(() => {
    if (phase === 'article' && answers.length > 0 && onMissedQuestions) {
      const missed = answers
        .filter((a) => !a.result.isCorrect)
        .map((a) => a.questionId)
      if (missed.length > 0) {
        onMissedQuestions(missed)
      }
    }
  }, [phase, answers, onMissedQuestions])

  // ── Derived state ────────────────────────────────────────────────────────
  const currentQuestion: PrequestionForClient | null =
    payload?.questions[currentIndex] ?? null
  const totalQuestions = payload?.questions.length ?? 0
  const correctCount = answers.filter((a) => a.result.isCorrect).length

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectOption = useCallback(
    (optionId: string) => {
      if (feedback || isSubmitting) return
      setSelectedOptionId(optionId)
    },
    [feedback, isSubmitting],
  )

  const handleSubmit = useCallback(async () => {
    if (!currentQuestion || !selectedOptionId || !payload || isSubmitting) return

    setIsSubmitting(true)
    const timeSpentMs = Date.now() - questionStartTime.current

    try {
      const result = await submitPrequestion({
        sessionId: payload.sessionId,
        questionId: currentQuestion.questionId,
        selectedOptionId,
        topicId: currentQuestion.topicId,
        timeSpentMs,
      })

      setFeedback(result)
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.questionId,
          selectedOptionId,
          result,
        },
      ])
    } catch {
      // On submit error, advance silently
      handleNext()
    } finally {
      setIsSubmitting(false)
    }
  }, [currentQuestion, selectedOptionId, payload, isSubmitting])

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((i) => i + 1)
      setSelectedOptionId(null)
      setFeedback(null)
      questionStartTime.current = Date.now()
    } else {
      setPhase('summary')
    }
  }, [currentIndex, totalQuestions])

  const handleStartReading = useCallback(() => {
    setPhase('article')
  }, [])

  // Auto-submit when an option is selected (tap-to-answer)
  useEffect(() => {
    if (selectedOptionId && !feedback && !isSubmitting) {
      handleSubmit()
    }
  }, [selectedOptionId, feedback, isSubmitting, handleSubmit])

  // ── Render: Loading ──────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // ── Render: Article (gate passed) ────────────────────────────────────────
  if (phase === 'article') {
    return <>{children}</>
  }

  // ── Render: Summary ──────────────────────────────────────────────────────
  if (phase === 'summary') {
    const missedCount = totalQuestions - correctCount

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div
          className={cn(
            'mx-4 w-full max-w-lg rounded-lg bg-card p-6 shadow-modal',
            'sm:mx-auto',
          )}
          role="dialog"
          aria-labelledby="prequestion-summary-heading"
          aria-modal="true"
        >
          <h2
            id="prequestion-summary-heading"
            className="text-lg font-bold text-foreground"
          >
            Quick check complete
          </h2>

          {/* Score */}
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-mono text-2xl font-bold text-foreground">
              {correctCount}/{totalQuestions}
            </span>
            <span className="text-sm text-text-secondary">correct</span>
          </div>

          {/* Guidance message */}
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            {missedCount > 0
              ? `Keep an eye out for the ${missedCount === 1 ? 'concept' : `${missedCount} concepts`} you missed as you read.`
              : 'Great recall — you already have a solid foundation on this topic.'}
          </p>

          {/* Missed question summaries */}
          {missedCount > 0 && (
            <ul className="mt-4 space-y-2">
              {answers
                .filter((a) => !a.result.isCorrect)
                .map((a) => {
                  const q = payload?.questions.find(
                    (pq) => pq.questionId === a.questionId,
                  )
                  return (
                    <li
                      key={a.questionId}
                      className="rounded-md border border-warning/30 bg-warning-50 px-3 py-2 text-xs leading-relaxed text-text-secondary"
                    >
                      {a.result.rationale ||
                        (q ? q.text.slice(0, 100) : 'Missed concept')}
                    </li>
                  )
                })}
            </ul>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleStartReading}
            className={cn(
              'mt-6 w-full rounded-sm px-6 py-2.5',
              'bg-primary text-sm font-semibold text-white',
              'transition-colors duration-150 ease-out',
              'hover:bg-primary-700',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
            )}
          >
            Start Reading
          </button>
        </div>
      </div>
    )
  }

  // ── Render: Question ─────────────────────────────────────────────────────
  if (!currentQuestion) {
    return <>{children}</>
  }

  const getOptionState = (
    optionId: string,
  ): 'default' | 'selected' | 'correct' | 'incorrect' => {
    if (!feedback) {
      return selectedOptionId === optionId ? 'selected' : 'default'
    }
    if (optionId === feedback.correctOptionId) return 'correct'
    if (optionId === selectedOptionId && !feedback.isCorrect) return 'incorrect'
    return 'default'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className={cn(
          // Mobile: full-screen card. Desktop: centered constrained card.
          'flex flex-col',
          'mx-0 h-full w-full bg-card shadow-modal sm:mx-auto sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-lg',
        )}
        role="dialog"
        aria-labelledby="prequestion-heading"
        aria-modal="true"
      >
        {/* Header */}
        <div className="shrink-0 border-b border-border px-5 py-4">
          <p className="text-xs font-medium text-text-secondary">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
          <h2
            id="prequestion-heading"
            className="mt-1 text-sm font-semibold text-foreground"
          >
            Quick check — what do you already know about {topicName}?
          </h2>
        </div>

        {/* Body — scrollable on mobile */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* Question stem */}
          <p className="text-sm leading-relaxed text-foreground">
            {currentQuestion.text}
          </p>

          {/* Options */}
          <div
            role="radiogroup"
            aria-label={`Options for question ${currentIndex + 1}`}
            className="mt-5 flex flex-col gap-2"
          >
            {currentQuestion.options.map((option) => {
              const state = getOptionState(option.id)
              const isDisabled = feedback !== null

              return (
                <label
                  key={option.id}
                  className={cn(
                    'flex items-center gap-3 w-full rounded-md border px-4 py-3',
                    'transition-all duration-150 ease-out',
                    OPTION_CLASSES[state],
                    isDisabled && state === 'default' && 'pointer-events-none opacity-60',
                  )}
                >
                  <input
                    type="radio"
                    name={`prequestion-${currentQuestion.questionId}`}
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    disabled={isDisabled}
                    onChange={() => handleSelectOption(option.id)}
                    className="sr-only"
                    aria-label={`Option ${option.letter}: ${option.text}`}
                  />
                  {/* Letter badge */}
                  <span
                    className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center',
                      'text-xs font-semibold transition-colors duration-150',
                      LETTER_CLASSES[state],
                    )}
                    aria-hidden="true"
                  >
                    {option.letter}
                  </span>
                  {/* Option text */}
                  <span className="text-sm leading-relaxed flex-1">
                    {option.text}
                  </span>
                </label>
              )
            })}
          </div>

          {/* Feedback flash */}
          {feedback && (
            <div
              className={cn(
                'mt-4 rounded-md border px-4 py-3',
                'transition-opacity duration-200 ease-out',
                feedback.isCorrect
                  ? 'border-success bg-success-50'
                  : 'border-destructive bg-destructive-50',
              )}
              role="status"
              aria-live="polite"
            >
              <p
                className={cn(
                  'text-xs font-semibold',
                  feedback.isCorrect ? 'text-success' : 'text-destructive',
                )}
              >
                {feedback.isCorrect ? 'Correct' : 'Not quite'}
              </p>
              {feedback.rationale && (
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  {feedback.rationale}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border px-5 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={handleStartReading}
            className="text-xs text-text-secondary underline decoration-text-secondary/40 underline-offset-2 hover:text-foreground transition-colors duration-150"
          >
            Skip to article
          </button>

          {feedback && (
            <button
              type="button"
              onClick={handleNext}
              className={cn(
                'rounded-sm px-5 py-2',
                'bg-primary text-sm font-semibold text-white',
                'transition-colors duration-150 ease-out',
                'hover:bg-primary-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2',
              )}
            >
              {currentIndex + 1 < totalQuestions ? 'Next' : 'See Results'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
