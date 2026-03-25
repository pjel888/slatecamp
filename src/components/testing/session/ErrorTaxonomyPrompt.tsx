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
      <span className="text-[12px] font-semibold text-text-tertiary uppercase tracking-widest">
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
                  ? 'bg-[#EEF2FC] border-camp-cobalt text-camp-cobalt'
                  : 'bg-white border-border text-text-secondary hover:border-camp-cobalt/30 hover:bg-[#EEF2FC]/30',
              )}
            >
              {ERROR_TAG_LABELS[tag]}
            </button>
          )
        })}
      </div>
      <p className="text-[11px] text-text-tertiary">
        Optional — helps us understand where to focus
      </p>
    </div>
  )
}
