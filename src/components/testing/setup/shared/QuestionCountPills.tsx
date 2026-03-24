'use client'

import { cn } from '@/lib/utils'

interface QuestionCountPillsProps {
  options: number[]
  selected: number
  onChange: (value: number) => void
}

const QuestionCountPills = ({ options, selected, onChange }: QuestionCountPillsProps) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label="Question count">
    {options.map((count) => {
      const isSelected = count === selected
      return (
        <button
          key={count}
          type="button"
          onClick={() => onChange(count)}
          aria-pressed={isSelected}
          className={cn(
            'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out border select-none',
            isSelected
              ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'bg-white text-[var(--text-secondary)] border-[var(--border)] hover:bg-[#F8F7F5]',
          )}
        >
          {count}
        </button>
      )
    })}
  </div>
)

QuestionCountPills.displayName = 'QuestionCountPills'

export { QuestionCountPills }
