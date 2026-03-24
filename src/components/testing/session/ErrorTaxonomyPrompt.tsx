'use client'

import { cn } from '@/lib/utils'
import { ERROR_TAG_LABELS } from '@/types/testing'
import type { ErrorTag } from '@/types/testing'

interface ErrorTaxonomyPromptProps {
  selectedTags: ErrorTag[]
  onChange: (tags: ErrorTag[]) => void
}

const ERROR_TAG_KEYS = Object.keys(ERROR_TAG_LABELS) as ErrorTag[]

export const ErrorTaxonomyPrompt = ({ selectedTags, onChange }: ErrorTaxonomyPromptProps) => {
  const toggle = (tag: ErrorTag) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag))
    } else {
      onChange([...selectedTags, tag])
    }
  }

  return (
    <div className="space-y-2 pt-1">
      <span className="text-[12px] font-semibold text-[#8896A7] uppercase tracking-widest">
        What happened?
      </span>
      <div className="flex flex-wrap gap-1.5">
        {ERROR_TAG_KEYS.map((tag) => {
          const isActive = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={isActive}
              aria-label={ERROR_TAG_LABELS[tag]}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors duration-150',
                isActive
                  ? 'bg-[#EEF2FC] border-[#1B3FC4] text-[#1B3FC4]'
                  : 'bg-white border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4]/30 hover:bg-[#EEF2FC]/30',
              )}
            >
              {ERROR_TAG_LABELS[tag]}
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-[#8896A7]">
        Optional — helps us understand where to focus
      </p>
    </div>
  )
}
