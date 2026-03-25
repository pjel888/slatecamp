'use client'

import { cn } from '@/lib/utils'
import type { ConfidenceTag as ConfidenceTagType } from '@/types/testing'

interface ConfidenceTagProps {
  value: ConfidenceTagType | null
  onChange: (tag: ConfidenceTagType) => void
}

export const ConfidenceTag = ({ value, onChange }: ConfidenceTagProps) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[12px] font-semibold text-text-tertiary uppercase tracking-widest shrink-0">
        How sure are you?
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange('sure')}
          aria-pressed={value === 'sure'}
          aria-label="Sure — I'm confident in this answer"
          className={cn(
            'px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors duration-150',
            value === 'sure'
              ? 'bg-camp-cobalt border-camp-cobalt text-white'
              : 'bg-white border-border text-text-secondary hover:border-camp-cobalt/40 hover:bg-primary-50/50',
          )}
        >
          Sure
        </button>
        <button
          type="button"
          onClick={() => onChange('unsure')}
          aria-pressed={value === 'unsure'}
          aria-label="Unsure — I'm guessing"
          className={cn(
            'px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors duration-150',
            value === 'unsure'
              ? 'bg-camp-cobalt border-camp-cobalt text-white'
              : 'bg-white border-border text-text-secondary hover:border-camp-cobalt/40 hover:bg-primary-50/50',
          )}
        >
          Unsure
        </button>
      </div>
    </div>
  )
}
