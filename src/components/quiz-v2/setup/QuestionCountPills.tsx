'use client'

import { cn } from '@/lib/utils'

const COUNT_OPTIONS = [10, 20, 30, 50, 100] as const

type CountOption = (typeof COUNT_OPTIONS)[number]

interface QuestionCountPillsProps {
  selected: number
  onChange: (count: number) => void
  options?: number[]
}

const QuestionCountPills = ({
  selected,
  onChange,
  options = COUNT_OPTIONS as unknown as number[],
}: QuestionCountPillsProps) => (
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
            'min-h-[44px] min-w-[52px] px-4 rounded-sm text-[13px] font-medium',
            'border transition-all duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2',
            isSelected
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-text-secondary border-border hover:border-primary/40 hover:text-primary',
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
