'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getWikiQuizQuestions, submitWikiQuizAnswer, endWikiQuizSession } from '@/lib/actions/wiki-quiz'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'
import type { QuestionForClient } from '@/types/quiz-config'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WikiQuizModalProps {
  nodeId: string
  topicName: string
  articleSlug?: string
  onClose: () => void
}

// ─── Option styling (matches OptionsColumn patterns, amber for incorrect) ────

const OPTION_STATE_CLASSES: Record<string, string> = {
  default:
    'bg-white border-border text-foreground hover:border-primary/40 hover:shadow-sm cursor-pointer',
  selected:
    'bg-primary-50 border-primary text-foreground cursor-pointer',
  correct:
    'bg-success-50 border-success text-foreground cursor-default',
  incorrect:
    'bg-warning-50 border-warning text-foreground cursor-default',
}

const LETTER_STATE_CLASSES: Record<string, string> = {
  default: 'bg-surface-light text-text-secondary',
  selected: 'bg-primary text-white',
  correct: 'bg-success text-white',
  incorrect: 'bg-warning text-white',
}

// ─── Gated delay for wiki review (shorter than full quiz) ────────────────────

const GATED_DELAY_MS = 2000

// ─── Component ────────────────────────────────────────────────────────────────

export const WikiQuizModal = ({ nodeId, topicName, articleSlug, onClose }: WikiQuizModalProps) => {
  const [status, setStatus] = useState<'loading' | 'empty' | 'question' | 'feedback' | 'results'>('loading')
  const [questions, setQuestions] = useState<QuestionForClient[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Array<{ isCorrect: boolean; correctOptionId: string; rationale: string | null }>>([])
  const [nextReady, setNextReady] = useState(false)
  const [remainingMs, setRemainingMs] = useState(GATED_DELAY_MS)

  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const gatedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentQuestion = questions[currentIndex] ?? null
  const totalQuestions = questions.length

  // ── Focus management ─────────────────────────────────────────────────────

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    closeButtonRef.current?.focus()

    return () => {
      if (previousFocusRef.current && 'focus' in previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [])

  // ── Focus trap ───────────────────────────────────────────────────────────

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleFocusTrap = (e: FocusEvent) => {
      if (!dialog.contains(e.target as Node)) {
        closeButtonRef.current?.focus()
      }
    }

    document.addEventListener('focusin', handleFocusTrap)
    return () => document.removeEventListener('focusin', handleFocusTrap)
  }, [])

  // ── Escape to close ──────────────────────────────────────────────────────

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // ── Body scroll lock ─────────────────────────────────────────────────────

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // ── Load questions ───────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        if (!nodeId) {
          setStatus('empty')
          return
        }
        const result = await getWikiQuizQuestions(nodeId, articleSlug)
        if (cancelled) return
        if (result.questions.length === 0) {
          setStatus('empty')
          return
        }
        setQuestions(result.questions)
        setSessionId(result.sessionId)
        setStatus('question')
      } catch {
        if (!cancelled) setStatus('empty')
      }
    }

    load()
    return () => { cancelled = true }
  }, [nodeId, onClose])

  // ── Cleanup gated timer ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (gatedTimerRef.current) clearInterval(gatedTimerRef.current)
    }
  }, [])

  // ── Option state resolver ────────────────────────────────────────────────

  const getOptionState = (optionId: string): 'default' | 'selected' | 'correct' | 'incorrect' => {
    const currentAnswer = answers[currentIndex]
    if (!currentAnswer) {
      return selectedOptionId === optionId ? 'selected' : 'default'
    }
    if (optionId === currentAnswer.correctOptionId) return 'correct'
    if (optionId === selectedOptionId && !currentAnswer.isCorrect) return 'incorrect'
    return 'default'
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectOption = (optionId: string) => {
    if (status !== 'question') return
    setSelectedOptionId(optionId)
  }

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !selectedOptionId || !currentQuestion) return

    try {
      const result = await submitWikiQuizAnswer({
        sessionId,
        questionId: currentQuestion.question_id,
        selectedOptionId,
        timeSpentMs: 0,
      })

      setAnswers((prev) => [
        ...prev,
        {
          isCorrect: result.isCorrect,
          correctOptionId: result.correctOptionId,
          rationale: result.rationale,
        },
      ])
      setStatus('feedback')
      setNextReady(false)
      setRemainingMs(GATED_DELAY_MS)

      // Gated countdown with progress tracking
      const startTime = Date.now()
      gatedTimerRef.current = setInterval(() => {
        const left = Math.max(0, GATED_DELAY_MS - (Date.now() - startTime))
        setRemainingMs(left)
        if (left <= 0) {
          setNextReady(true)
          if (gatedTimerRef.current) clearInterval(gatedTimerRef.current)
        }
      }, 50) as unknown as ReturnType<typeof setTimeout>
    } catch {
      // Silently handle — user can retry
    }
  }, [sessionId, selectedOptionId, currentQuestion])

  const countdownSeconds = Math.ceil(remainingMs / 1000)
  const countdownProgress = GATED_DELAY_MS > 0 ? 1 - remainingMs / GATED_DELAY_MS : 1

  const handleNext = useCallback(async () => {
    if (gatedTimerRef.current) {
      clearInterval(gatedTimerRef.current)
      gatedTimerRef.current = null
    }

    const isLastQuestion = currentIndex === totalQuestions - 1

    if (isLastQuestion && sessionId) {
      try {
        await endWikiQuizSession(sessionId)
      } catch {
        // Continue to results even if end call fails
      }
      setStatus('results')
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOptionId(null)
      setNextReady(false)
      setStatus('question')
    }
  }, [currentIndex, totalQuestions, sessionId])

  // ── Score calculation ────────────────────────────────────────────────────

  const correctCount = answers.filter((a) => a.isCorrect).length
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  const getScoreLabel = (): { text: string; color: string } => {
    if (scorePercent >= 70) return { text: 'Passing', color: 'text-success' }
    if (scorePercent >= 50) return { text: 'Building', color: 'text-foreground' }
    return { text: 'Needs review', color: 'text-foreground' }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Quick review quiz"
        className={cn(
          'relative w-full max-w-[560px] mx-4 max-h-[90vh] overflow-y-auto',
          'rounded-lg bg-card shadow-lg',
          'animate-in zoom-in-95 duration-150 ease-out',
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-3.5 rounded-t-lg">
          <div className="flex items-center gap-3">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-surface-light transition-colors duration-150"
              aria-label="Close quiz"
            >
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
            <h2 className="text-sm font-semibold text-foreground truncate max-w-[320px]">
              {status === 'results' ? 'Quick Review Complete' : `Quick Review — ${topicName}`}
            </h2>
          </div>
          {status !== 'results' && status !== 'loading' && (
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {currentIndex + 1} of {totalQuestions}
            </span>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="p-5">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <span className="h-5 w-5 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <span className="text-sm text-text-secondary">Loading questions...</span>
            </div>
          )}

          {/* Empty state — no questions available */}
          {status === 'empty' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="text-sm text-text-secondary">No review questions available for this topic yet.</span>
              <button
                type="button"
                onClick={onClose}
                className="text-[13px] text-primary hover:underline mt-1"
              >
                Close
              </button>
            </div>
          )}

          {/* Question + Feedback state */}
          {(status === 'question' || status === 'feedback') && currentQuestion && (
            <div className="flex flex-col gap-4">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full transition-colors duration-150',
                      i < currentIndex
                        ? answers[i]?.isCorrect
                          ? 'bg-success'
                          : 'bg-warning'
                        : i === currentIndex
                          ? 'bg-primary'
                          : 'bg-border',
                    )}
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Question stem */}
              <p className="text-sm font-medium text-foreground leading-relaxed">
                {currentQuestion.stem}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2" role="radiogroup" aria-label={`Question ${currentIndex + 1}`}>
                {currentQuestion.options.map((option) => {
                  const state = getOptionState(option.id)
                  const isDisabled = status === 'feedback'

                  return (
                    <label
                      key={option.id}
                      className={cn(
                        'flex items-start gap-3 w-full rounded-md border px-4 py-3',
                        'transition-all duration-150 ease-out',
                        OPTION_STATE_CLASSES[state],
                        isDisabled && state === 'default' && 'pointer-events-none opacity-60',
                      )}
                    >
                      <input
                        type="radio"
                        name={`wiki-quiz-${currentQuestion.question_id}`}
                        value={option.id}
                        checked={selectedOptionId === option.id}
                        disabled={isDisabled}
                        onChange={() => handleSelectOption(option.id)}
                        className="sr-only"
                        aria-label={`Option ${option.letter}: ${option.text}`}
                      />
                      <span
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center',
                          'text-xs font-semibold transition-colors duration-150',
                          LETTER_STATE_CLASSES[state],
                        )}
                        aria-hidden="true"
                      >
                        {option.letter}
                      </span>
                      <span className="text-sm leading-relaxed pt-0.5 flex-1">
                        {option.text}
                      </span>
                    </label>
                  )
                })}
              </div>

              {/* Slide to submit — always visible when question/feedback is active */}
              {(status === 'question' || status === 'feedback') && (
                <SlideToSubmit 
                  onSubmit={handleSubmit} 
                  label="Slide to submit" 
                  disabled={!selectedOptionId || status === 'feedback'}
                  checked={status === 'feedback'}
                />
              )}

              {/* Feedback panel */}
              {status === 'feedback' && answers[currentIndex] && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className={cn(
                    'rounded-md border p-4 space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-150',
                    answers[currentIndex].isCorrect
                      ? 'bg-success-50 border-success/20'
                      : 'bg-warning-50 border-warning/20',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {answers[currentIndex].isCorrect ? (
                      <CheckCircle size={18} weight="fill" className="text-success shrink-0" aria-hidden="true" />
                    ) : (
                      <ArrowRight size={18} weight="bold" className="text-warning shrink-0" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        answers[currentIndex].isCorrect ? 'text-success' : 'text-warning',
                      )}
                    >
                      {answers[currentIndex].isCorrect ? 'Correct — nice work' : 'Not quite'}
                    </span>
                  </div>

                  {answers[currentIndex].rationale && (
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {answers[currentIndex].rationale}
                    </p>
                  )}

                  {/* Gated next — countdown bar + disabled button */}
                  <div className="space-y-2 pt-1">
                    {!nextReady && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-muted-foreground">
                          Review the explanation — next in {countdownSeconds}s
                        </p>
                        <div className="h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/40 transition-none"
                            style={{ width: `${countdownProgress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!nextReady}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-sm px-3 py-2 text-sm font-medium',
                        'transition-all duration-150 min-h-[44px]',
                        nextReady
                          ? 'bg-primary text-white hover:bg-primary-700'
                          : 'bg-primary/50 text-white/70 cursor-not-allowed',
                      )}
                    >
                      {currentIndex === totalQuestions - 1 ? 'See results' : 'Next question'}
                      <ArrowRight size={16} weight="bold" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results state */}
          {status === 'results' && (
            <div className="flex flex-col items-center gap-5 py-6">
              {/* Score fraction */}
              <div className="text-center space-y-1">
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  {correctCount} / {totalQuestions}
                </p>
                <p className={cn('text-base font-semibold', getScoreLabel().color)}>
                  {scorePercent}% — {getScoreLabel().text}
                </p>
              </div>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {answers.map((answer, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-3 w-3 rounded-full',
                      answer.isCorrect ? 'bg-success' : 'bg-warning',
                    )}
                    aria-label={`Question ${i + 1}: ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                  />
                ))}
              </div>

              {/* Mastery note */}
              <p className="text-xs text-muted-foreground text-center">
                This review lightly updates your mastery.
              </p>

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'rounded-sm px-6 py-2.5 text-sm font-medium min-h-[44px]',
                  'bg-primary text-white hover:bg-primary-700',
                  'transition-colors duration-150',
                )}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
