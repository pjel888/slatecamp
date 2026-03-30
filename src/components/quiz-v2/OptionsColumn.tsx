'use client'

import { useEffect, useCallback } from 'react'
import { Backspace } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/stores/useQuizStore'
import { ConfidenceInput } from './ConfidenceInput'
import { FeedbackPanel } from './FeedbackPanel'
import { SlideToSubmit } from './SlideToSubmit'
import { QuizOption } from './QuizOption'
import type { QuestionForClient, FeedbackData, QuizSessionConfig } from '@/types/quiz-config'

interface OptionsColumnProps {
  question: QuestionForClient
  selectedOptionId: string | null
  confidenceLevel: 1 | 2 | 3 | null
  feedback: FeedbackData | null
  config: QuizSessionConfig
  onSelectOption: (optionId: string) => void
  onConfidenceChange: (level: number) => void
  onSubmit: () => void
  onNext: () => void
}

const getOptionState = (
  optionId: string,
  selectedOptionId: string | null,
  feedback: FeedbackData | null,
): 'default' | 'selected' | 'correct' | 'incorrect' => {
  if (!feedback) {
    return selectedOptionId === optionId ? 'selected' : 'default'
  }
  if (optionId === feedback.correctOptionId) return 'correct'
  if (optionId === selectedOptionId && !feedback.isCorrect) return 'incorrect'
  return 'default'
}

export const OptionsColumn = ({
  question,
  selectedOptionId,
  confidenceLevel,
  feedback,
  config,
  onSelectOption,
  onConfidenceChange,
  onSubmit,
  onNext,
}: OptionsColumnProps) => {
  const status = useQuizStore((s) => s.status)
  const isChecked = feedback !== null
  const isSubmitting = status === 'submitting'
  const isDisabled = isChecked || isSubmitting

  const showFeedbackPanel =
    feedback !== null && config.feedback.timing === 'immediate'

  const headingId = `question-heading-${question.question_id}`
  const hasAnswered = selectedOptionId !== null

  // ── Elimination state from store ─────────────────────────────────────────
  const eliminatedOptions = useQuizStore((s) => s.eliminatedOptions)
  const toggleEliminate = useQuizStore((s) => s.toggleEliminate)
  const eliminatedIds = eliminatedOptions.get(question.question_id) ?? new Set<string>()

  // Keyboard submit (Enter / Space) as accessibility fallback
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isDisabled || !hasAnswered) return
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'LABEL') return
        e.preventDefault()
        onSubmit()
      }
    },
    [isDisabled, hasAnswered, onSubmit],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col gap-4">
      {/* Radio group */}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="flex flex-col gap-2"
      >
        {question.options.map((option) => {
          const state = getOptionState(option.id, selectedOptionId, feedback)
          const isEliminated = eliminatedIds.has(option.id) && !isChecked

          return (
            <QuizOption
              key={option.id}
              id={option.id}
              letter={option.letter}
              text={option.text}
              state={state}
              isEliminated={isEliminated}
              isDisabled={isDisabled}
              onSelect={onSelectOption}
              onToggleEliminate={(id) => toggleEliminate(question.question_id, id)}
              name={`options-${question.question_id}`}
            />
          )
        })}
      </div>

      {/* Confidence slider — always visible, disabled after submit. Hidden only in chill mode. */}
      {config.mode !== 'chill' && (
        <ConfidenceInput
          value={confidenceLevel}
          onChange={onConfidenceChange}
          disabled={isDisabled}
        />
      )}

      {/* Slide-to-submit bar — always visible, disabled until option selected or after submit */}
      <SlideToSubmit
        onSubmit={onSubmit}
        label={config.feedback.timing === 'none' ? 'Slide to continue' : 'Slide to submit'}
        disabled={!hasAnswered || isDisabled}
        checked={isChecked}
      />

      {/* Inline feedback panel */}
      {showFeedbackPanel && selectedOptionId && (
        <FeedbackPanel
          feedback={feedback}
          question={question}
          selectedOptionId={selectedOptionId}
          gatedDelayMs={config.feedback.gatedProgressionDelayMs}
          onNext={onNext}
          mode={config.mode}
        />
      )}
    </div>
  )
}
