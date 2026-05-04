'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, XCircle, ArrowRight, ArrowCounterClockwise, BookOpen } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { getWikiQuizQuestions, submitWikiQuizAnswer, endWikiQuizSession } from '@/lib/actions/wiki-quiz'
import type { QuestionForClient } from '@/types/quiz-config'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEnding, setIsEnding] = useState(false)

  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<Element | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const firstOptionRef = useRef<HTMLLabelElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const gatedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadAbortRef = useRef<boolean>(false)
  // Guard against stale async updates when modal re-opens or article changes
  const requestIdRef = useRef<number>(0)

  const currentQuestion = questions[currentIndex] ?? null
  const totalQuestions = questions.length

  // ── Focus management ─────────────────────────────────────────────────────

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    // Small delay to ensure modal is in DOM
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus()
    }, 50)

    return () => {
      clearTimeout(timer)
      if (previousFocusRef.current && 'focus' in previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus()
      }
    }
  }, [])

  // ── Focus trap ────────────────────────────────────────────────────────────

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

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

  // ── Escape to close (blocked during critical async) ──────────────────────

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSubmitting || isEnding) {
          e.preventDefault()
          return
        }
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose, isSubmitting, isEnding])

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
    const requestId = ++requestIdRef.current
    loadAbortRef.current = false
    setStatus('loading')
    setError(null)
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
      const result = await getWikiQuizQuestions(nodeId, articleSlug)
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
    }
  }, [nodeId, articleSlug])

  useEffect(() => {
    loadQuestions()
    return () => {
      loadAbortRef.current = true
      // Increment requestId so any in-flight responses are ignored
      requestIdRef.current++
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
    } catch {
      // Silent fail — user stays on question, can retry
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
    setStatus('question')
    setTimeout(() => firstOptionRef.current?.focus(), 100)
  }, [])

  // ── Score calculation ────────────────────────────────────────────────────

  const correctCount = answers.filter((a) => a.isCorrect).length
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const scoreMeta = getScoreLabel(scorePercent)

  // ── Render ───────────────────────────────────────────────────────────────

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[3px] animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting && !isEnding) onClose()
      }}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Review quiz for ${topicName}`}
        className={cn(
          'relative w-full max-w-[600px] mx-4 max-h-[92vh] overflow-y-auto',
          'rounded-xl bg-card shadow-xl border border-border',
          'animate-in zoom-in-95 duration-200 ease-out',
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur-sm px-5 py-3.5 rounded-t-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isEnding}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-light transition-colors duration-150 shrink-0',
                (isSubmitting || isEnding) && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Close quiz"
            >
              <X size={18} weight="bold" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">
                {status === 'results' ? 'Review Complete' : `Quick Review — ${topicName}`}
              </h2>
              {articleTitle && status !== 'results' && (
                <p className="text-[11px] text-muted-foreground truncate">{articleTitle}</p>
              )}
            </div>
          </div>
          {status !== 'results' && status !== 'loading' && status !== 'error' && status !== 'empty' && (
            <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0 ml-3">
              {currentIndex + 1} / {totalQuestions}
            </span>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          {/* Loading state */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center gap-4 py-14">
              <span className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <div className="text-center space-y-1">
                <span className="text-sm font-medium text-foreground">Preparing your review…</span>
                <p className="text-xs text-muted-foreground">Finding questions based on this article</p>
              </div>
              {/* Skeleton question placeholder */}
              <div className="w-full space-y-3 mt-2">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                <div className="space-y-2 mt-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error state */}
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <div className="h-10 w-10 rounded-full bg-warning-50 flex items-center justify-center">
                <XCircle size={20} className="text-warning" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">Could not load review</span>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  {error || 'Something went wrong while preparing your questions.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-700 transition-colors"
                >
                  <ArrowCounterClockwise size={14} aria-hidden="true" />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-light transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Empty state — no questions available */}
          {status === 'empty' && (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
              <div className="h-10 w-10 rounded-full bg-surface-light flex items-center justify-center">
                <BookOpen size={20} className="text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-foreground">No questions yet</span>
                <p className="text-xs text-muted-foreground max-w-[280px]">
                  We do not have review questions for this topic yet. Try a full practice session instead.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium bg-primary text-white hover:bg-primary-700 transition-colors"
                >
                  <ArrowCounterClockwise size={14} aria-hidden="true" />
                  Try again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-light transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Question + Feedback state */}
          {(status === 'question' || status === 'feedback') && currentQuestion && (
            <div className="flex flex-col gap-5">
              {/* Progress bar */}
              <div className="w-full">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                  <span>Question {currentIndex + 1} of {totalQuestions}</span>
                  <span>{Math.round(((currentIndex) / totalQuestions) * 100)}% complete</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${((currentIndex + (status === 'feedback' ? 1 : 0)) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question stem */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {currentQuestion.stem}
                </p>
                {currentQuestion.image_url && (
                  <img
                    src={currentQuestion.image_url}
                    alt={currentQuestion.image_alt_text || 'Question image'}
                    className="rounded-lg border border-border max-h-[200px] object-contain"
                  />
                )}
              </div>

              {/* Options */}
              <div
                className="flex flex-col gap-2.5"
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
                      ref={idx === 0 ? firstOptionRef : undefined}
                      className={cn(
                        'flex items-start gap-3 w-full rounded-lg border px-4 py-3.5',
                        'transition-all duration-150 ease-out',
                        OPTION_STATE_CLASSES[state],
                        isDisabled && state === 'default' && 'pointer-events-none opacity-50',
                      )}
                      role="radio"
                      aria-checked={isChecked}
                      tabIndex={isDisabled ? -1 : 0}
                      onKeyDown={(e) => {
                        if (isDisabled) return
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelectOption(option.id)
                        }
                        // Arrow key navigation between options
                        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                          e.preventDefault()
                          const next = e.currentTarget.nextElementSibling as HTMLElement | null
                          next?.focus()
                        }
                        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                          e.preventDefault()
                          const prev = e.currentTarget.previousElementSibling as HTMLElement | null
                          prev?.focus()
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`wiki-quiz-${currentQuestion.question_id}`}
                        value={option.id}
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => handleSelectOption(option.id)}
                        className="sr-only"
                        aria-label={`Option ${option.letter}`}
                      />
                      <span
                        className={cn(
                          'flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center',
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

              {/* Submit button (desktop-friendly, replaces SlideToSubmit) */}
              {status === 'question' && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedOptionId || isSubmitting}
                  className={cn(
                    'w-full rounded-lg px-4 py-3 text-sm font-semibold',
                    'transition-all duration-150 min-h-[48px]',
                    selectedOptionId && !isSubmitting
                      ? 'bg-primary text-white hover:bg-primary-700 shadow-sm active:scale-[0.98]'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                  aria-live="polite"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Checking…
                    </span>
                  ) : (
                    'Submit answer'
                  )}
                </button>
              )}

              {/* Feedback panel */}
              {status === 'feedback' && answers[currentIndex] && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className={cn(
                    'rounded-xl border p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200',
                    answers[currentIndex].isCorrect
                      ? 'bg-success-50 border-success/20'
                      : 'bg-warning-50 border-warning/20',
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {answers[currentIndex].isCorrect ? (
                      <CheckCircle size={20} weight="fill" className="text-success shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle size={20} weight="fill" className="text-warning shrink-0" aria-hidden="true" />
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

                  {/* Gated next — countdown bar + button */}
                  <div className="space-y-3 pt-1">
                    {!nextReady && (
                      <div className="space-y-2">
                        <p className="text-[11px] text-muted-foreground">
                          Review the explanation — next in {countdownSeconds}s
                        </p>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/40 transition-none"
                            style={{ width: `${countdownProgress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      ref={nextButtonRef}
                      type="button"
                      onClick={handleNext}
                      disabled={!nextReady || isEnding}
                      className={cn(
                        'w-full inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-3 text-sm font-semibold',
                        'transition-all duration-150 min-h-[48px]',
                        nextReady && !isEnding
                          ? 'bg-primary text-white hover:bg-primary-700 shadow-sm active:scale-[0.98]'
                          : 'bg-primary/40 text-white/70 cursor-not-allowed',
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
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results state */}
          {status === 'results' && (
            <div className="flex flex-col items-center gap-6 py-4">
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
                  <p className="text-2xl font-bold text-foreground tabular-nums">{scorePercent}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{correctCount}/{totalQuestions}</p>
                </div>
              </div>

              {/* Score label */}
              <div className="text-center space-y-1">
                <p className={cn('text-base font-semibold', scoreMeta.color)}>
                  {scoreMeta.text}
                </p>
                <p className="text-xs text-muted-foreground max-w-[320px]">
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
              <p className="text-xs text-muted-foreground text-center">
                This review lightly updates your mastery for {topicName}.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReviewAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold bg-primary text-white hover:bg-primary-700 shadow-sm active:scale-[0.98] transition-all"
                >
                  <ArrowCounterClockwise size={16} aria-hidden="true" />
                  Review again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-surface-light border border-border transition-all"
                >
                  <BookOpen size={16} aria-hidden="true" />
                  Back to article
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}
