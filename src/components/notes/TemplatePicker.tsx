'use client'

import { FileText, SquaresFour, Warning } from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { NoteType } from '@/types/app'

const TEMPLATES: {
  id: NoteType
  label: string
  title: string
  icon: PhosphorIcon
}[] = [
  {
    id: 'quick_capture',
    label: 'Quick',
    title: 'Free-form quick note',
    icon: FileText,
  },
  {
    id: 'cornell',
    label: 'Cornell',
    title: 'Cues · Notes · Summary',
    icon: SquaresFour,
  },
  {
    id: 'gap_analysis',
    label: 'Gap',
    title: 'Why I was wrong — available on quiz questions',
    icon: Warning,
  },
]

interface TemplatePickerProps {
  value: NoteType
  onChange: (type: NoteType) => void
  /** Gap Analysis requires a question_id anchor. Disable when unavailable. */
  disableGap?: boolean
}

export function TemplatePicker({ value, onChange, disableGap }: TemplatePickerProps) {
  return (
    <div className="flex gap-1.5">
      {TEMPLATES.map(({ id, label, title, icon: Icon }) => {
        const disabled = id === 'gap_analysis' && disableGap
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(id)}
            title={disabled ? 'Requires a quiz question context' : title}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-center transition-all duration-150',
              active
                ? 'border-primary bg-primary-50 text-primary-700'
                : 'border-zinc-200 bg-white text-zinc-400 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-600',
              disabled && 'cursor-not-allowed opacity-35',
            )}
          >
            <SCIcon icon={Icon} size="xs" />
            <span className="text-[11px] font-semibold leading-none">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
