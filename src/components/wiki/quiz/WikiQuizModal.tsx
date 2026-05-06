'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, XCircle, ArrowRight, ArrowCounterClockwise, BookOpen } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { getWikiQuizQuestions, submitWikiQuizAnswer, endWikiQuizSession } from '@/lib/actions/wiki-quiz'
import type { QuestionForClient } from '@/types/quiz-config'
import { SlideToSubmit } from '@/components/quiz-v2/SlideToSubmit'

// ─── Props ────────────────────────────────────────────────────────────────────

interface WikiQuizModalProps {
  nodeId: string
  topicName: string
  articleSlug?: string
  articleTitle?: string
  articleId?: string
  onClose: () => void
}

// ─── Option styling ──────────────────────────────────────────────────────────

const OPTION_STATE_CLASSES: Record<string, string> = {
  default:
    'bg-white border-border text-foreground hover:border-primary/40 hover:shadow-sm cursor-pointer',
  selected:
    'bg-primary-50 border-primary text-foreground cursor-pointer ring-1 ring-primary/20',
  correct:
    'bg-success-50 border-success text-foreground cursor-default ring-1 ring-success/20',
  incorrect:
    'bg-warning-50 border-warning text-foreground cursor-default ring-1 ring-warning/20',
}

const LETTER_STATE_CLASSES: Record<string, string> = {
  default: 'bg-surface-light text-text-secondary',
  selected: 'bg-primary text-white',
  correct: 'bg-success text-white',
  incorrect: 'bg-warning text-white',
}

// ─── Gated delay for wiki review ───────────────────────────────────────────────

const GATED_DELAY_MS = 2000

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getScoreLabel = (percent: number): { text: string; color: string; subtext: string } => {
  if (percent >= 80) return { text: 'Strong retention', color: 'text-success', subtext: 'You clearly understood this article.' }
  if (percent >= 60) return { text: 'Good progress', color: 'text-primary', subtext: 'You are building solid recall. A quick re-read of the key sections will lock it in.' }
  if (percent >= 40) return { text: 'Keep reviewing', color: 'text-foreground', subtext: 'Some concepts need reinforcement. Re-reading the article will help.' }
  return { text: 'Needs more study', color: 'text-warning', subtext: 'This topic needs more attention. Re-read the article and try again.' }
}

// ─── Component ────────────────────────────────────────────────────────────────

export const WikiQuizModal = ({ nodeId, topicName, articleSlug, articleTitle, articleId, onClose }: WikiQuizModalProps) => {
  const [status, setStatus] = useState<'loading' | 'error' | 'empty' | 'question' | 'feedback' | 'results'>('loading')
  const [questions, setQuestions] = useState<QuestionForClient[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Array<{ isCorrect: boolean; correctOptionId: string; rationale: string | null }>>([])
  const [nextReady, setNextReady] = useState(false)
  const [remainingMs, setRemainingMs] = useState(GATED_DELAY_MS)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [mounted, setMounted] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const firstOptionRef = useRef<HTMLInputElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const gatedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadAbortRef = useRef<boolean>(false)
  const loadingRef = useRef<boolean>(false)
  // Guard against stale async updates when modal re-opens or article changes
  const requestIdRef = useRef<number>(0)

  const currentQuestion = questions[currentIndex] ?? null
  const totalQuestions = questions.length

  const safeClose = useCallback(() => {
    if (gatedTimerRef.current) {
      clearInterval(gatedTimerRef.current)
      gatedTimerRef.current = null
    }
    loadAbortRef.current = true
    requestIdRef.current++
    loadingRef.current = false
    onClose()
  }, [onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  // ── Focus management ─────────────────────────────────────────────────────

  useEffect(() => {
    // Move focus to the modal title on open for a natural entry point
    const timer = setTimeout(() => {
      titleRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // ── Focus trap ────────────────────────────────────────────────────────────

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const FOCUSABLE_SELECTOR = 'button:not(:disabled), [href]:not([aria-disabled="true"]), input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[]
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !dialog.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [status, nextReady])

  // ── Intentional dismissal policy ──────────────────────────────────────────
  // The review modal is non-dismissible by backdrop click or Escape so students
  // cannot accidentally exit while dragging the slide-to-submit control. The
  // explicit header close button remains the primary exit affordance.

  // ── Body scroll lock ─────────────────────────────────────────────────────

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [])

  // ── Load questions ───────────────────────────────────────────────────────

  const loadQuestions = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    const requestId = ++requestIdRef.current
    loadAbortRef.current = false
    setStatus('loading')
    setError(null)
    setSubmitError(null)
    setQuestions([])
    setAnswers([])
    setCurrentIndex(0)
    setSelectedOptionId(null)
    setNextReady(false)
    setRemainingMs(GATED_DELAY_MS)

    try {
      if (!nodeId) {
        if (requestId === requestIdRef.current) setStatus('empty')
        return
      }
      const result = await getWikiQuizQuestions(nodeId, articleSlug, articleId)
      // Stale response guard: ignore if a newer request started or modal unmounted
      if (requestId !== requestIdRef.current || loadAbortRef.current) return
      if (result.questions.length === 0) {
        setStatus('empty')
        return
      }
      setQuestions(result.questions)
      setSessionId(result.sessionId)
      setStatus('question')
      // Focus first option after questions load
      setTimeout(() => firstOptionRef.current?.focus(), 100)
    } catch (err) {
      if (requestId === requestIdRef.current && !loadAbortRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load questions')
        setStatus('error')
      }
    } finally {
      loadingRef.current = false
    }
  }, [nodeId, articleSlug, articleId])

  useEffect(() => {
    loadQuestions()
    return () => {
      loadAbortRef.current = true
      // Increment requestId so any in-flight responses are ignored
      requestIdRef.current++
      loadingRef.current = false
    }
  }, [loadQuestions])

  // ── Cleanup gated timer ──────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (gatedTimerRef.current) {
        clearInterval(gatedTimerRef.current)
        gatedTimerRef.current = null
      }
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
    if (!sessionId || !selectedOptionId || !currentQuestion || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)
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
          if (gatedTimerRef.current) {
            clearInterval(gatedTimerRef.current)
            gatedTimerRef.current = null
          }
          // Auto-focus next button when ready
          setTimeout(() => nextButtonRef.current?.focus(), 50)
        }
      }, 50)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [sessionId, selectedOptionId, currentQuestion, isSubmitting])

  const countdownSeconds = Math.ceil(remainingMs / 1000)
  const countdownProgress = GATED_DELAY_MS > 0 ? 1 - remainingMs / GATED_DELAY_MS : 1

  const handleNext = useCallback(async () => {
    if (gatedTimerRef.current) {
      clearInterval(gatedTimerRef.current)
      gatedTimerRef.current = null
    }
    setSubmitError(null)

    const isLastQuestion = currentIndex === totalQuestions - 1

    if (isLastQuestion && sessionId) {
      setIsEnding(true)
      try {
        await endWikiQuizSession(sessionId)
      } catch {
        // Continue to results even if end call fails
      } finally {
        setIsEnding(false)
      }
      setStatus('results')
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOptionId(null)
      setNextReady(false)
      setStatus('question')
      // Focus first option of new question
      setTimeout(() => firstOptionRef.current?.focus(), 100)
    }
  }, [currentIndex, totalQuestions, sessionId])

  const handleRetry = useCallback(() => {
    if (gatedTimerRef.current) {
      clearInterval(gatedTimerRef.current)
      gatedTimerRef.current = null
    }
    setSubmitError(null)
    loadQuestions()
  }, [loadQuestions])

  const handleReviewAgain = useCallback(() => {
    if (gatedTimerRef.current) {
      clearInterval(gatedTimerRef.current)
      gatedTimerRef.current = null
    }
    setAnswers([])
    setCurrentIndex(0)
    setSelectedOptionId(null)
    setNextReady(false)
    setRemainingMs(GATED_DELAY_MS)
    setSubmitError(null)
    setSessionId(null)
    loadQuestions()
  }, [loadQuestions])

  // ── Score calculation ────────────────────────────────────────────────────

  const correctCount = answers.filter((a) => a.isCorrect).length
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const scoreMeta = getScoreLabel(scorePercent)

  // ── Render ───────────────────────────────────────────────────────────────

  const currentAnswer = answers[currentIndex]
  const isQuestionActive = status === 'question' && currentQuestion
  const isFeedbackActive = status === 'feedback' && currentQuestion && currentAnswer

  const modalContent = (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-1 backdrop-blur-[3px] animate-in fade-in duration-200 sm:p-2"
      data-testid="wiki-quiz-overlay"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wiki-quiz-title"
        className={cn(
          'relative z-[1001] flex h-[min(calc(100dvh-0.5rem),780px)] w-full flex-col overflow-hidden',
          'max-w-[min(calc(100vw-0.5rem),1120px)] rounded-xl bg-card shadow-modal',
          'animate-in zoom-in-95 duration-200 ease-out sm:h-[min(calc(100dvh-1rem),780px)] sm:max-w-[min(calc(100vw-1rem),1120px)]',
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm sm:px-5 sm:py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={safeClose}
              disabled={isSubmitting || isEnding}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-surface-light hover:text-foreground',
                (isSubmitting || isEnding) && 'cursor-not-allowed opacity-50'
              )}
              aria-label="Close quiz"
            >
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h2
                ref={titleRef}
                id="wiki-quiz-title"
                tabIndex={-1}
                className="truncate text-sm font-semibold text-foreground outline-none"
              >
                {status === 'results' ? 'Review Complete' : `Quick Review — ${topicName}`}
              </h2>
              {articleTitle && status !== 'results' && (
                <p className="truncate text-[11px] text-muted-foreground">{articleTitle}</p>
              )}
            </div>
          </div>
          {status !== 'results' && status !== 'loading' && status !== 'error' && status !== 'empty' && (
            <span className="ml-3 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
              {currentIndex + 1} / {totalQuestions}
            </span>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center gap-4 px-5 py-14 sm:px-6">
              <span className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="space-y-1 text-center">
                <span className="text-sm font-medium text-foreground">Preparing your review…</span>
                <p className="text-xs text-muted-foreground">Finding questions based on this article</p>
              </div>
              <div className="mt-2 w-full space-y-3">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                <div className="mt-4 space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center gap-4 px-5 py-14 text-center sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-50">
                <XCircle size={20} className="text-warning" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">Could not load review</span>
                <p className="max-w-[280px] text-xs text-muted-foreground">
                  {error || 'Something went wrong while preparing your questions.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  <ArrowCounterClockwise size={14} aria-hidden="true" />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={safeClose}
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-light hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Empty state — no questions available */}
          {status === 'empty' && (
            <div className="flex flex-col items-center justify-center gap-4 px-5 py-14 text-center sm:px-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-light">
                <BookOpen size={20} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">No questions yet</span>
                <p className="max-w-[280px] text-xs text-muted-foreground">
                  We do not have review questions for this topic yet. Try a full practice session instead.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
                >
                  <ArrowCounterClockwise size={14} aria-hidden="true" />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={safeClose}
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-light hover:text-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Question + Feedback state */}
          {(isQuestionActive || isFeedbackActive) && currentQuestion && (
            <div className="flex h-full min-h-0 flex-col">
              {/* Progress bar */}
              <div className="shrink-0 border-b border-border/70 px-4 py-2.5 sm:px-5">
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Question {currentIndex + 1} of {totalQuestions}</span>
                  <span>{Math.round((currentIndex / totalQuestions) * 100)}% complete</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + (status === 'feedback' ? 1 : 0)) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
                {/* Left: question */}
                <section className="min-h-0 overflow-y-auto border-b border-border p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-5">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary">
                      <BookOpen size={13} weight="fill" aria-hidden="true" />
                      Article review
                    </div>
                    <p className="text-base font-medium leading-relaxed text-foreground">
                      {currentQuestion.stem}
                    </p>
                    {currentQuestion.image_url && (
                      <img
                        src={currentQuestion.image_url}
                        alt={currentQuestion.image_alt_text || 'Question image'}
                        className="max-h-[260px] max-w-full rounded-lg border border-border object-contain"
                      />
                    )}
                  </div>
                </section>

                {/* Right: choices + feedback */}
                <section className="min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-5">
                  <div className="flex min-h-full flex-col gap-4">
                    <div
                      className="flex flex-col gap-2"
                      role="radiogroup"
                      aria-label={`Question ${currentIndex + 1}: ${currentQuestion.stem}`}
                    >
                      {currentQuestion.options.map((option, idx) => {
                        const state = getOptionState(option.id)
                        const isDisabled = status === 'feedback'
                        const isChecked = selectedOptionId === option.id

                        return (
                          <label
                            key={option.id}
                            className={cn(
                              'flex w-full items-start gap-3 rounded-lg border px-4 py-2',
                              'transition-all duration-150 ease-out',
                              'focus-within:ring-2 focus-within:ring-primary/30',
                              OPTION_STATE_CLASSES[state],
                              isDisabled && state === 'default' && 'pointer-events-none opacity-50',
                            )}
                          >
                            <input
                              ref={idx === 0 ? firstOptionRef : undefined}
                              type="radio"
                              name={`wiki-quiz-${currentQuestion.question_id}`}
                              value={option.id}
                              checked={isChecked}
                              disabled={isDisabled}
                              onChange={() => handleSelectOption(option.id)}
                              className="sr-only"
                            />
                            <span
                              className={cn(
                                'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md',
                                'text-xs font-semibold transition-colors duration-150',
                                LETTER_STATE_CLASSES[state],
                              )}
                              aria-hidden="true"
                            >
                              {option.letter}
                            </span>
                            <span className="flex-1 pt-0.5 text-sm leading-relaxed">
                              {option.text}
                            </span>
                          </label>
                        )
                      })}
                    </div>

                    {status === 'feedback' && currentAnswer && (
                      <div
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                        className={cn(
                          'rounded-xl border p-3 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200',
                          currentAnswer.isCorrect
                            ? 'bg-success-50 border-success/20'
                            : 'bg-warning-50 border-warning/20',
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          {currentAnswer.isCorrect ? (
                            <CheckCircle size={20} weight="fill" className="shrink-0 text-success" aria-hidden="true" />
                          ) : (
                            <XCircle size={20} weight="fill" className="shrink-0 text-warning" aria-hidden="true" />
                          )}
                          <span
                            className={cn(
                              'text-sm font-semibold',
                              currentAnswer.isCorrect ? 'text-success' : 'text-warning',
                            )}
                          >
                            {currentAnswer.isCorrect ? 'Correct — nice work' : 'Not quite'}
                          </span>
                        </div>

                        {currentAnswer.rationale && (
                          <p className="text-sm leading-relaxed text-text-secondary">
                            {currentAnswer.rationale}
                          </p>
                        )}

                        {!nextReady && (
                          <div className="space-y-2 pt-1">
                            <p className="text-[11px] text-muted-foreground">
                              Review the explanation — next in {countdownSeconds}s
                            </p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full rounded-full bg-primary/40 transition-none"
                                style={{ width: `${countdownProgress * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {submitError && (
                      <p className="text-center text-sm text-warning" role="alert">
                        {submitError}
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Results state */}
          {status === 'results' && (
            <div className="flex flex-col items-center gap-6 px-5 py-8 sm:px-6">
              {/* Score ring */}
              <div className="relative flex items-center justify-center">
                <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-border"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className={cn(
                      'transition-all duration-700 ease-out',
                      scorePercent >= 60 ? 'text-success' : scorePercent >= 40 ? 'text-primary' : 'text-warning'
                    )}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${scorePercent}, 100`}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold tabular-nums text-foreground">{scorePercent}%</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{correctCount}/{totalQuestions}</p>
                </div>
              </div>

              {/* Score label */}
              <div className="space-y-1 text-center">
                <p className={cn('text-base font-semibold', scoreMeta.color)}>
                  {scoreMeta.text}
                </p>
                <p className="max-w-[320px] text-xs text-muted-foreground">
                  {scoreMeta.subtext}
                </p>
              </div>

              {/* Per-question dots */}
              <div className="flex items-center gap-2">
                {answers.map((answer, i) => (
                  <span
                    key={i}
                    className={cn(
                      'h-3 w-3 rounded-full transition-transform duration-150',
                      answer.isCorrect ? 'bg-success' : 'bg-warning',
                    )}
                    aria-label={`Question ${i + 1}: ${answer.isCorrect ? 'correct' : 'incorrect'}`}
                    title={`Question ${i + 1}: ${answer.isCorrect ? 'Correct' : 'Incorrect'}`}
                  />
                ))}
              </div>

              {/* Mastery note */}
              <p className="text-center text-xs text-muted-foreground">
                This review lightly updates your mastery for {topicName}.
              </p>

              {/* Actions */}
              <div className="flex w-full flex-col items-center gap-2.5 sm:w-auto sm:flex-row">
                <button
                  type="button"
                  onClick={handleReviewAgain}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-[0.98] sm:w-auto"
                >
                  <ArrowCounterClockwise size={16} aria-hidden="true" />
                  Review again
                </button>
                <button
                  type="button"
                  onClick={safeClose}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-surface-light hover:text-foreground sm:w-auto"
                >
                  <BookOpen size={16} aria-hidden="true" />
                  Back to article
                </button>
              </div>
            </div>
          )}
        </div>

        {(isQuestionActive || isFeedbackActive) && currentQuestion && (
          <div className="shrink-0 border-t border-border bg-card/95 p-2 backdrop-blur-sm sm:px-5 sm:py-2">
            {status === 'question' ? (
              <SlideToSubmit
                onSubmit={handleSubmit}
                label={isSubmitting ? 'Checking your answer…' : 'Slide to submit'}
                disabled={!selectedOptionId || isSubmitting}
                checked={false}
                testId="wiki-quiz-submit-slider"
              />
            ) : (
              <button
                ref={nextButtonRef}
                type="button"
                onClick={handleNext}
                disabled={!nextReady || isEnding}
                className={cn(
                  'inline-flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-sm font-semibold',
                  'transition-all duration-150',
                  nextReady && !isEnding
                    ? 'bg-primary text-white shadow-sm hover:bg-primary-700 active:scale-[0.98]'
                    : 'cursor-not-allowed bg-primary/40 text-white/70',
                )}
              >
                {isEnding ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Finishing…
                  </span>
                ) : (
                  <>
                    {currentIndex === totalQuestions - 1 ? 'See results' : 'Next question'}
                    <ArrowRight size={16} weight="bold" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}
