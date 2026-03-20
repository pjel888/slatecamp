'use client'

import { OptionButton } from '@/components/quiz'
import type { OptionState } from '@/components/quiz'
import type { Choice } from '@/types/app'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuizOptionsProps {
  options: Choice[]
  getOptionState: (option: Choice) => OptionState
  isChecked: boolean
  onSelect: (choiceId: string) => void
  onStrike: (choiceId: string, e: React.MouseEvent | React.KeyboardEvent) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export const QuizOptions = ({
  options,
  getOptionState,
  isChecked,
  onSelect,
  onStrike,
}: QuizOptionsProps) => (
  <div className='space-y-2.5' role='group' aria-label='Answer options'>
    {options.map((option, idx) => (
      <OptionButton
        key={option.id}
        letter={String.fromCharCode(65 + idx)}
        text={option.text}
        state={getOptionState(option)}
        isChecked={isChecked}
        onSelect={() => onSelect(option.id)}
        onStrike={(e) => onStrike(option.id, e)}
      />
    ))}
  </div>
)
