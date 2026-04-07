import { cn } from '@/lib/utils'
import type { ReviewQuestionData } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionState = 'correct' | 'wrong-choice' | 'default'

interface AnnotatedOptionProps {
  option: ReviewQuestionData['options'][number]
  userWasWrong: boolean
}

// ─── State helpers ────────────────────────────────────────────────────────────

const getOptionState = (
  option: ReviewQuestionData['options'][number],
  userWasWrong: boolean,
): OptionState => {
  if (option.isCorrect) return 'correct'
  if (option.isUserChoice && userWasWrong) return 'wrong-choice'
  return 'default'
}

const CONTAINER_CLASSES: Record<OptionState, string> = {
  correct: 'bg-success-50 border-success',
  'wrong-choice': 'bg-destructive-50 border-destructive/40',
  default: 'bg-card border-border opacity-60',
}

const LETTER_CLASSES: Record<OptionState, string> = {
  correct: 'bg-success text-white',
  'wrong-choice': 'bg-border text-text-secondary',
  default: 'bg-surface-light text-muted-foreground',
}

// ─── Component ────────────────────────────────────────────────────────────────

export const AnnotatedOption = ({ option, userWasWrong }: AnnotatedOptionProps) => {
  const state = getOptionState(option, userWasWrong)

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-md border px-4 py-3',
        CONTAINER_CLASSES[state],
      )}
      role="listitem"
    >
      {/* Letter badge */}
      <span
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center',
          'text-xs font-semibold',
          LETTER_CLASSES[state],
        )}
        aria-hidden="true"
      >
        {option.letter}
      </span>

      {/* Text + annotation */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-relaxed">{option.text}</p>

        {/* Correct answer marker */}
        {option.isCorrect && (
          <p className="mt-1 text-xs font-medium text-success flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Correct answer
          </p>
        )}

        {/* "You chose" marker for wrong choice */}
        {state === 'wrong-choice' && (
          <p className="mt-1 text-xs text-text-secondary">← You chose this</p>
        )}
      </div>
    </div>
  )
}
