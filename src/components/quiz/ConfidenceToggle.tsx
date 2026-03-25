'use client'

import { cn } from '@/lib/utils'

export type ConfidenceLevel = 'sure' | 'unsure' | null

interface ConfidenceToggleProps {
  value: ConfidenceLevel
  onChange: (value: ConfidenceLevel) => void
  disabled?: boolean
}

export function ConfidenceToggle({
  value,
  onChange,
  disabled = false,
}: ConfidenceToggleProps) {
  const toggle = (level: 'sure' | 'unsure') => {
    if (disabled) return
    onChange(value === level ? null : level)
  }

  return (
    <div
      className="flex items-center gap-1.5"
      role="group"
      aria-label="How confident are you?"
    >
      <button
        type="button"
        onClick={() => toggle('sure')}
        disabled={disabled}
        aria-pressed={value === 'sure'}
        className={cn(
          'h-7 px-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors duration-150',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          value === 'sure'
            ? 'bg-[#EEF2FC] text-[#1535A8] border border-[#1535A8]/20'
            : 'text-text-tertiary border border-transparent hover:bg-[#F5F5F5] hover:text-text-secondary',
          disabled && 'opacity-40 cursor-not-allowed',
        )}
      >
        Sure
      </button>
      <button
        type="button"
        onClick={() => toggle('unsure')}
        disabled={disabled}
        aria-pressed={value === 'unsure'}
        className={cn(
          'h-7 px-3 rounded-sm text-[11px] font-bold uppercase tracking-widest transition-colors duration-150',
          'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
          value === 'unsure'
            ? 'bg-[#FEF8ED] text-warning border border-warning/20'
            : 'text-text-tertiary border border-transparent hover:bg-[#F5F5F5] hover:text-text-secondary',
          disabled && 'opacity-40 cursor-not-allowed',
        )}
      >
        Unsure
      </button>
    </div>
  )
}
