'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const ERROR_TYPES = [
  { value: 'knowledge_gap', label: 'Knowledge gap' },
  { value: 'misread', label: 'Misread question' },
  { value: 'distractor', label: 'Two options looked similar' },
  { value: 'code_version', label: 'Code confusion' },
  { value: 'time_pressure', label: 'Ran out of time' },
] as const

interface ErrorTypePromptProps {
  onSelect: (errorType: string) => void
  onSkip: () => void
}

export const ErrorTypePrompt = ({ onSelect, onSkip }: ErrorTypePromptProps) => {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (value: string) => {
    setSelected(value)
    onSelect(value)
  }

  return (
    <div className="py-3 space-y-2">
      <p className="text-[13px] text-text-secondary font-medium">
        What happened there?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ERROR_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => handleSelect(value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150',
              selected === value
                ? 'bg-camp-cobalt text-white'
                : 'bg-[#F5F5F5] text-[#555555] hover:bg-[#E5E7EB]',
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
      >
        Skip
      </button>
    </div>
  )
}
