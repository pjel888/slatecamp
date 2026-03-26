'use client'

import { useEffect, useCallback, useState } from 'react'
import { X, EyeSlash } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { FeedbackPanel } from './FeedbackPanel'
import { SlideToSubmit } from './SlideToSubmit'
import type { QuestionForClient, FeedbackData, QuizSessionConfig } from '@/types/quiz-config'

interface OptionsColumnProps {
  question: QuestionForClient
  selectedOptionId: string | null
  feedback: FeedbackData | null
  config: QuizSessionConfig
  onSelectOption: (optionId: string) => void
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
  feedback,
  config,
  onSelectOption,
  onSubmit,
  onNext,
}: OptionsColumnProps) => {
  const headingId = `question-heading-${question.question_id}`
  const hasAnswered = selectedOptionId !== null
  const isSubmitted = feedback !== null

  const showFeedbackPanel =
    feedback !== null && config.feedback.timing === 'immediate'

  // ── Elimination mode (cross out options) ────────────────────────────────
  const [eliminateMode, setEliminateMode] = useState(false)
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set())

  // Reset elimination when question changes
  useEffect(() => {
    setEliminatedIds(new Set())
    setEliminateMode(false)
  }, [question.question_id])

  const toggleEliminate = (optionId: string) => {
    setEliminatedIds((prev) => {
      const next = new Set(prev)
      if (next.has(optionId)) next.delete(optionId)
      else next.add(optionId)
      return next
    })
  }

  const handleOptionClick = (optionId: string) => {
    if (eliminateMode) {
      toggleEliminate(optionId)
    } else {
      // If selecting an eliminated option, un-eliminate it
      if (eliminatedIds.has(optionId)) {
        setEliminatedIds((prev) => {
          const next = new Set(prev)
          next.delete(optionId)
          return next
        })
      }
      onSelectOption(optionId)
    }
  }

  // Keyboard submit (Enter / Space) as accessibility fallback
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isSubmitted || !hasAnswered) return
      if (e.key === 'Enter' || e.key === ' ') {
        const tag = (e.target as HTMLElement)?.tagName
        if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'LABEL') return
        e.preventDefault()
        onSubmit()
      }
    },
    [isSubmitted, hasAnswered, onSubmit],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const eliminatedCount = eliminatedIds.size

  return (
    <div className="flex flex-col gap-4">
      {/* Eliminate toggle — top-right of options area */}
      {!isSubmitted && (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setEliminateMode((p) => !p)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium',
              'transition-colors duration-150 min-h-[32px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
              eliminateMode
                ? 'bg-[#EEF2FC] text-[#1B3FC4] border border-[#1B3FC4]/30'
                : 'text-[#8896A7] hover:text-[#4A5568] border border-transparent',
            )}
            aria-label={eliminateMode ? 'Exit elimination mode' : 'Eliminate options'}
            aria-pressed={eliminateMode}
          >
            <EyeSlash size={13} weight={eliminateMode ? 'fill' : 'regular'} aria-hidden="true" />
            {eliminateMode ? 'Done' : 'Eliminate'}
            {eliminatedCount > 0 && !eliminateMode && (
              <span className="ml-0.5 text-[10px] text-[#8896A7]">({eliminatedCount})</span>
            )}
          </button>
        </div>
      )}

      {/* Radio group */}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="flex flex-col gap-2"
      >
        {question.options.map((option) => {
          const state = getOptionState(option.id, selectedOptionId, feedback)
          const isDisabled = isSubmitted
          const isSelected = selectedOptionId === option.id
          const isEliminated = eliminatedIds.has(option.id) && !isSubmitted

          return (
            <div key={option.id} className="relative">
              <label
                className={cn(
                  'flex items-start gap-3 w-full rounded-md border px-4 py-3',
                  'transition-all duration-150 ease-out',
                  OPTION_STATE_CLASSES[state],
                  isDisabled && state === 'default' && 'pointer-events-none opacity-60',
                  isEliminated && !isSelected && 'opacity-40',
                  eliminateMode && 'cursor-crosshair',
                )}
                onClick={eliminateMode ? (e) => { e.preventDefault(); handleOptionClick(option.id) } : undefined}
              >
                <input
                  type="radio"
                  name={`options-${question.question_id}`}
                  value={option.id}
                  checked={isSelected}
                  disabled={isDisabled || eliminateMode}
                  onChange={() => handleOptionClick(option.id)}
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
                    'text-sm leading-relaxed pt-0.5 flex-1',
                    isEliminated && !isSelected && 'line-through decoration-[#8896A7]/60',
                  )}
                >
                  {option.text}
                </span>

                {/* Eliminate X button — visible in eliminate mode or when already eliminated */}
                {!isSubmitted && (isEliminated || eliminateMode) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleEliminate(option.id)
                    }}
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded-sm flex items-center justify-center mt-0.5',
                      'transition-colors duration-150',
                      isEliminated
                        ? 'bg-[#D64545]/10 text-[#D64545]'
                        : 'text-[#8896A7] hover:text-[#D64545] hover:bg-[#D64545]/10',
                    )}
                    aria-label={isEliminated ? `Restore option ${option.letter}` : `Eliminate option ${option.letter}`}
                  >
                    <X size={12} weight="bold" aria-hidden="true" />
                  </button>
                )}
              </label>
            </div>
          )
        })}
      </div>

      {/* Slide-to-submit bar */}
      {hasAnswered && !isSubmitted && config.feedback.timing !== 'none' && (
        <SlideToSubmit onSubmit={onSubmit} label="Slide to submit" />
      )}

      {hasAnswered && !isSubmitted && config.feedback.timing === 'none' && (
        <SlideToSubmit onSubmit={onSubmit} label="Slide to continue" />
      )}

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
}
