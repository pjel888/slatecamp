'use client'

import { useEffect, useCallback } from 'react'
import { Backspace } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useQuizStore } from '@/stores/useQuizStore'
import { ConfidenceInput } from './ConfidenceInput'
import { FeedbackPanel } from './FeedbackPanel'
import { SlideToSubmit } from './SlideToSubmit'
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

const OPTION_STATE_CLASSES: Record<string, string> = {
  default:
    'bg-white border-[#D4DAE3] text-[#1A2332] hover:border-[#1B3FC4]/40 hover:shadow-sm cursor-pointer',
  selected:
    'bg-[#EEF2FC] border-[#1B3FC4] text-[#1A2332] cursor-pointer',
  correct:
    'bg-[#EDFAF4] border-[#2D9F6F] text-[#1A2332] cursor-default',
  incorrect:
    'bg-[#FDF0F0] border-[#D64545] text-[#1A2332] cursor-default',
}

const LETTER_STATE_CLASSES: Record<string, string> = {
  default: 'bg-[#F8F7F5] text-[#4A5568]',
  selected: 'bg-[#1B3FC4] text-white',
  correct: 'bg-[#2D9F6F] text-white',
  incorrect: 'bg-[#D64545] text-white',
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
          const isDisabledForOption = isDisabled
          const isSelected = selectedOptionId === option.id
          const isEliminated = eliminatedIds.has(option.id) && !isChecked

          return (
            <div key={option.id} className="relative">
              <label
                className={cn(
                  'flex items-center gap-3 w-full rounded-md border px-4 py-3 min-h-[52px]',
                  'transition-colors duration-150 ease-out',
                  OPTION_STATE_CLASSES[state],
                  isDisabledForOption && state === 'default' && 'pointer-events-none opacity-60',
                  isEliminated && !isSelected && 'opacity-50',
                )}
              >
                <input
                  type="radio"
                  name={`options-${question.question_id}`}
                  value={option.id}
                  checked={isSelected}
                  disabled={isDisabledForOption}
                  onChange={() => onSelectOption(isSelected ? '' : option.id)}
                  className="sr-only"
                  aria-label={`Option ${option.letter}: ${option.text}${isEliminated ? ' (eliminated)' : ''}`}
                />
                {/* Letter badge */}
                <span
                  className={cn(
                    'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center',
                    'text-xs font-semibold transition-colors duration-150',
                    isEliminated && !isSelected
                      ? 'bg-[#D4DAE3] text-[#8896A7]'
                      : LETTER_STATE_CLASSES[state],
                  )}
                  aria-hidden="true"
                >
                  {option.letter}
                </span>
                {/* Option text */}
                <span
                  className={cn(
                    'text-sm leading-relaxed flex-1',
                    isEliminated && !isSelected && 'line-through decoration-[#8896A7]/60',
                  )}
                >
                  {option.text}
                </span>

                {/* Inline eliminate / restore button — always present to prevent layout shift, invisible after submit */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (!isDisabled) toggleEliminate(question.question_id, option.id)
                  }}
                  disabled={isDisabled}
                  className={cn(
                    'flex-shrink-0 flex items-center justify-center',
                    'w-8 h-8 rounded-sm',
                    'transition-colors duration-150 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
                    isDisabled
                      ? 'opacity-0 pointer-events-none'
                      : isEliminated
                        ? 'text-[#D64545] hover:text-[#D64545] hover:bg-[#D64545]/10'
                        : 'text-[#8896A7] hover:text-[#4A5568]',
                  )}
                  aria-label={isEliminated ? `Restore option ${option.letter}` : `Eliminate option ${option.letter}`}
                  aria-pressed={isEliminated}
                >
                  <Backspace size={12} weight="regular" aria-hidden="true" />
                </button>
              </label>
            </div>
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
