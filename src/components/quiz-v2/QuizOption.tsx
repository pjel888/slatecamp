'use client'

import { Backspace } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

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

const STATE_CLASSES: Record<OptionState, string> = {
  default: 'bg-white border-[#D4DAE3] text-[#1A2332] hover:border-[#1B3FC4]/40 hover:shadow-sm cursor-pointer',
  selected: 'bg-[#EEF2FC] border-[#1B3FC4] text-[#1A2332] cursor-pointer',
  correct: 'bg-[#EDFAF4] border-[#2D9F6F] text-[#1A2332] cursor-default',
  incorrect: 'bg-[#FDF0F0] border-[#D64545] text-[#1A2332] cursor-default',
}

const LETTER_CLASSES: Record<OptionState, string> = {
  default: 'bg-[#F8F7F5] text-[#4A5568]',
  selected: 'bg-[#1B3FC4] text-white',
  correct: 'bg-[#2D9F6F] text-white',
  incorrect: 'bg-[#D64545] text-white',
}

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
  const isSelected = state === 'selected' || (state === 'incorrect' && isEliminated) // simplified logic check

  return (
    <div className="relative group">
      <label
        className={cn(
          'flex items-center gap-3 w-full rounded-md border px-4 py-3 min-h-[52px]',
          'transition-all duration-150 ease-out',
          STATE_CLASSES[state],
          isDisabled && state === 'default' && 'pointer-events-none opacity-60',
          isEliminated && state === 'default' && 'opacity-50',
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
            'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center',
            'text-xs font-semibold transition-colors duration-150',
            isEliminated && state === 'default'
              ? 'bg-[#D4DAE3] text-[#8896A7]'
              : LETTER_CLASSES[state],
          )}
          aria-hidden="true"
        >
          {letter}
        </span>

        {/* Option text */}
        <span
          className={cn(
            'text-sm leading-relaxed flex-1',
            isEliminated && state === 'default' && 'line-through decoration-[#8896A7]/60',
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
            'flex-shrink-0 flex items-center justify-center',
            'w-8 h-8 rounded-sm',
            'transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
            isDisabled
              ? 'opacity-0 pointer-events-none'
              : isEliminated
                ? 'text-[#D64545] bg-[#D64545]/5 hover:bg-[#D64545]/10'
                : 'text-[#8896A7] hover:text-[#4A5568] hover:bg-[#F8F7F5] lg:opacity-0 lg:group-hover:opacity-100',
          )}
          aria-label={isEliminated ? `Restore option ${letter}` : `Eliminate option ${letter}`}
          aria-pressed={isEliminated}
        >
          <Backspace size={14} weight={isEliminated ? "fill" : "regular"} aria-hidden="true" />
        </button>
      </label>
    </div>
  )
}
