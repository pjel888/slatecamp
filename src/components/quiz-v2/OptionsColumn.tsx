'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FeedbackPanel } from './FeedbackPanel'
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

const LETTER_COLORS: Record<string, string> = {
  A: 'bg-[#F8F7F5] text-[#4A5568]',
  B: 'bg-[#F8F7F5] text-[#4A5568]',
  C: 'bg-[#F8F7F5] text-[#4A5568]',
  D: 'bg-[#F8F7F5] text-[#4A5568]',
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

  // For deferred/none feedback timing, no inline feedback panel
  const showFeedbackPanel =
    feedback !== null && config.feedback.timing === 'immediate'

  return (
    <div className="flex flex-col gap-4">
      {/* Radio group */}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="flex flex-col gap-2"
      >
        {question.options.map(option => {
          const state = getOptionState(option.id, selectedOptionId, feedback)
          const isDisabled = isSubmitted
          const isSelected = selectedOptionId === option.id

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
                name={`options-${question.question_id}`}
                value={option.id}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onSelectOption(option.id)}
                className="sr-only"
                aria-label={`Option ${option.letter}: ${option.text}`}
              />
              {/* Letter badge */}
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
              {/* Option text */}
              <span className="text-sm leading-relaxed pt-0.5">{option.text}</span>
            </label>
          )
        })}
      </div>

      {/* Submit button (shown before submission) */}
      {!isSubmitted && config.feedback.timing !== 'none' && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!hasAnswered}
          onClick={onSubmit}
          aria-label="Submit answer"
        >
          Submit answer
        </Button>
      )}

      {/* For deferred or none: a "next" button without feedback */}
      {!isSubmitted && config.feedback.timing === 'none' && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled={!hasAnswered}
          onClick={onSubmit}
          aria-label="Submit and continue"
        >
          Next
        </Button>
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
