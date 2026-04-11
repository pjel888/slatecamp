'use client'

import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/stores/useQuizStore'
import { ConfidenceInput } from './ConfidenceInput'
import { FeedbackPanel } from './FeedbackPanel'
import { SlideToSubmit } from './SlideToSubmit'
import { GestureCaptureZone } from './GestureCaptureZone'
import type { QuestionForClient, FeedbackData, QuizSessionConfig } from '@/types/quiz-config'
import type { GestureSignalEvent } from '@/types/patent'

// ─── Types ───────────────────────────────────────────────────────────────────

export type GenerationQuestionType = 'numeric' | 'short_text' | 'formula'

interface GenerationInputProps {
  question: QuestionForClient
  questionType: GenerationQuestionType
  unit?: string
  confidenceLevel: 1 | 2 | 3 | null
  feedback: FeedbackData | null
  config: QuizSessionConfig
  isSubmitting?: boolean
  onSubmit: (signalTrace?: GestureSignalEvent[]) => void
  onConfidenceChange: (level: 1 | 2 | 3) => void
  onNext: () => void
}

// ─── Placeholders by type ────────────────────────────────────────────────────

const PLACEHOLDER_MAP: Record<GenerationQuestionType, string> = {
  numeric: 'Enter your answer',
  short_text: 'Type your answer',
  formula: 'Enter your computed result',
}

// ─── Component ───────────────────────────────────────────────────────────────

export const GenerationInput = memo(({
  question,
  questionType,
  unit,
  confidenceLevel,
  feedback,
  config,
  onSubmit,
  onConfidenceChange,
  onNext,
}: GenerationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const signalTraceRef = useRef<GestureSignalEvent[]>([])
  const [localValue, setLocalValue] = useState('')

  // ── Store bindings ─────────────────────────────────────────────────────────
  const selectAnswer = useQuizStore((s) => s.selectAnswer)
  const selectedOptionId = useQuizStore(
    (s) => s.answers[question.question_id]?.selectedOptionId ?? null,
  )

  // Sync local state from store on question change
  useEffect(() => {
    const storeValue = useQuizStore.getState().answers[question.question_id]?.selectedOptionId
    setLocalValue(storeValue ?? '')
  }, [question.question_id])

  const status = useQuizStore((s) => s.status)
  const isChecked = feedback !== null
  const isSubmitting = status === 'submitting'
  const isDisabled = isChecked || isSubmitting

  const hasAnswered = localValue.trim().length > 0

  const showFeedbackPanel =
    feedback !== null && config.feedback.timing === 'immediate'

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDisabled) return
      const val = e.target.value

      // For short_text: cap at 100 characters
      if (questionType === 'short_text' && val.length > 100) return

      setLocalValue(val)
      // Store the raw text answer in selectedOptionId field
      // (reusing the existing answer state infrastructure)
      selectAnswer(question.question_id, val)
    },
    [isDisabled, questionType, selectAnswer, question.question_id],
  )

  const handleClear = useCallback(() => {
    if (isDisabled) return
    setLocalValue('')
    selectAnswer(question.question_id, '')
    inputRef.current?.focus()
  }, [isDisabled, selectAnswer, question.question_id])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && hasAnswered && !isDisabled) {
        e.preventDefault()
        onSubmit()
      }
    },
    [hasAnswered, isDisabled, onSubmit],
  )

  const handleGestureBuffer = useCallback((buffer: GestureSignalEvent[]) => {
    signalTraceRef.current = buffer
  }, [])

  const handleInternalSubmit = useCallback(() => {
    onSubmit(signalTraceRef.current)
    signalTraceRef.current = [] // Clear after submission
  }, [onSubmit])

  // ── Input type ─────────────────────────────────────────────────────────────

  const inputType = questionType === 'short_text' ? 'text' : 'text'
  // We use type="text" even for numeric to allow commas, units, etc.
  // Validation happens server-side via answer-matching.

  const inputMode: 'text' | 'decimal' =
    questionType === 'numeric' || questionType === 'formula'
      ? 'decimal'
      : 'text'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Generation input area */}
      <div className="space-y-2">
        <label
          htmlFor={`gen-input-${question.question_id}`}
          className="text-xs font-medium text-text-secondary"
        >
          Your answer
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            id={`gen-input-${question.question_id}`}
            type={inputType}
            inputMode={inputMode}
            value={localValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            placeholder={PLACEHOLDER_MAP[questionType]}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className={cn(
              'w-full rounded-md border px-4 py-3 text-base',
              'text-foreground bg-card placeholder:text-muted-foreground',
              'transition-colors duration-150 ease-out',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              isDisabled && feedback?.isCorrect && 'border-success bg-success-50',
              isDisabled && !feedback?.isCorrect && 'border-destructive bg-destructive-50',
              !isDisabled && 'border-border',
              isDisabled && 'pointer-events-none',
              // Large centered input for numeric/formula
              (questionType === 'numeric' || questionType === 'formula') &&
                'text-center text-2xl font-mono tracking-wide',
            )}
            aria-describedby={unit ? `gen-unit-${question.question_id}` : undefined}
          />

          {/* Unit label */}
          {unit && (
            <span
              id={`gen-unit-${question.question_id}`}
              className={cn(
                'absolute right-10 top-1/2 -translate-y-1/2',
                'text-sm text-muted-foreground pointer-events-none',
              )}
            >
              {unit}
            </span>
          )}

          {/* Clear button */}
          {localValue.length > 0 && !isDisabled && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'flex items-center justify-center w-6 h-6 rounded-sm',
                'text-muted-foreground hover:text-text-secondary hover:bg-surface-light',
                'transition-colors duration-150 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
              )}
              aria-label="Clear answer"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Character count for short_text */}
        {questionType === 'short_text' && !isDisabled && (
          <p className="text-[11px] text-muted-foreground text-right">
            {localValue.length}/100
          </p>
        )}
      </div>

      {/* Confidence input — shown after typing, before submit, hidden in chill mode */}
      {hasAnswered && !isDisabled && config.mode !== 'chill' && (
        <ConfidenceInput
          value={confidenceLevel}
          onChange={onConfidenceChange}
        />
      )}

      {/* Slide-to-submit bar — wrapped with signal capture zone (Patent Claims 1(a-b), 6) */}
      <GestureCaptureZone onBufferReady={handleGestureBuffer}>
        <SlideToSubmit
          onSubmit={handleInternalSubmit}
          label={config.feedback.timing === 'none' ? 'Slide to continue' : 'Slide to submit'}
          disabled={!hasAnswered || isDisabled}
          checked={isChecked}
        />
      </GestureCaptureZone>

      {/* Inline feedback panel */}
      {showFeedbackPanel && selectedOptionId && (
        <FeedbackPanel
          feedback={feedback}
          question={question}
          selectedOptionId={selectedOptionId}
          gatedDelayMs={config.feedback.gatedProgressionDelayMs}
          onNext={onNext}
        />
      )}
    </div>
  )
})

GenerationInput.displayName = 'GenerationInput'
