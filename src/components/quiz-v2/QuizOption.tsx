'use client'

import { Backspace } from '@phosphor-icons/react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type OptionState = 'default' | 'selected' | 'correct' | 'incorrect'

interface QuizOptionProps {
  id: string
  letter: string
  text: string
  state: OptionState
  isEliminated: boolean
  isDisabled: boolean
  onSelect: (id: string) => void
  onToggleEliminate: (id: string) => void
  name: string
}

const optionVariants = cva(
  'flex min-h-[52px] w-full items-center gap-3 rounded-md border px-4 py-3 touch-manipulation',
  {
    variants: {
      state: {
        default: 'cursor-pointer border-border bg-card text-foreground hover:border-primary/40 hover:shadow-sm',
        selected: 'cursor-pointer border-primary bg-primary-50 text-foreground',
        correct: 'cursor-default border-success bg-success-50 text-foreground',
        incorrect: 'cursor-default border-destructive bg-destructive-50 text-foreground',
      },
      motion: {
        true: 'transition-[border-color,background-color,color,box-shadow,opacity] duration-150 ease-out',
        false: '',
      },
      subdued: {
        true: 'pointer-events-none opacity-60',
        false: '',
      },
      eliminated: {
        true: 'opacity-50',
        false: '',
      },
    },
  },
)

const letterVariants = cva(
  'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-xs font-semibold',
  {
    variants: {
      state: {
        default: 'bg-surface-light text-text-secondary',
        selected: 'bg-primary text-primary-foreground',
        correct: 'bg-success text-white',
        incorrect: 'bg-destructive text-white',
      },
      motion: {
        true: 'transition-colors duration-150 ease-out',
        false: '',
      },
      eliminated: {
        true: 'bg-border text-muted-foreground',
        false: '',
      },
    },
    compoundVariants: [
      {
        state: 'default',
        eliminated: true,
        className: 'bg-border text-muted-foreground',
      },
    ],
  },
)

const eliminateButtonVariants = cva(
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-sm touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
  {
    variants: {
      state: {
        default:
          'text-muted-foreground hover:bg-surface-light hover:text-text-secondary lg:opacity-0 lg:group-hover:opacity-100',
        eliminated: 'bg-destructive/5 text-destructive hover:bg-destructive/10',
      },
      motion: {
        true: 'transition-[background-color,color,opacity] duration-150 ease-out',
        false: '',
      },
      hidden: {
        true: 'pointer-events-none opacity-0',
        false: '',
      },
    },
  },
)

export const QuizOption = ({
  id,
  letter,
  text,
  state,
  isEliminated,
  isDisabled,
  onSelect,
  onToggleEliminate,
  name,
}: QuizOptionProps) => {
  const reducedMotion = useReducedMotion()
  const isDefaultState = state === 'default'
  const showEliminatedStyling = isEliminated && isDefaultState
  const isSubdued = isDisabled && isDefaultState

  return (
    <div className="relative group">
      <label
        className={cn(
          optionVariants({
            state,
            motion: !reducedMotion,
            subdued: isSubdued,
            eliminated: showEliminatedStyling,
          }),
        )}
      >
        <input
          type="radio"
          name={name}
          value={id}
          checked={state === 'selected'}
          disabled={isDisabled}
          onChange={() => onSelect(id)}
          className="sr-only"
          aria-label={`Option ${letter}: ${text}${isEliminated ? ' (eliminated)' : ''}`}
        />
        
        {/* Letter badge */}
        <span
          className={cn(
            letterVariants({
              state,
              motion: !reducedMotion,
              eliminated: showEliminatedStyling,
            }),
          )}
          aria-hidden="true"
        >
          {letter}
        </span>

        {/* Option text */}
        <span
          className={cn(
            'flex-1 text-sm leading-relaxed',
            showEliminatedStyling && 'line-through decoration-muted-foreground/60',
          )}
        >
          {text}
        </span>

        {/* Inline eliminate / restore button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!isDisabled) onToggleEliminate(id)
          }}
          disabled={isDisabled}
          className={cn(
            eliminateButtonVariants({
              state: isEliminated ? 'eliminated' : 'default',
              motion: !reducedMotion,
              hidden: isDisabled,
            }),
          )}
          aria-label={isEliminated ? `Restore option ${letter}` : `Eliminate option ${letter}`}
          aria-pressed={isEliminated}
        >
          <Backspace size={14} weight={isEliminated ? 'fill' : 'regular'} aria-hidden="true" />
        </button>
      </label>
    </div>
  )
}
