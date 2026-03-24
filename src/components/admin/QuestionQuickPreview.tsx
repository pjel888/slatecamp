'use client'

import { useState } from 'react'
import { CampModePreview } from './preview/CampModePreview'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

interface QuestionQuickPreviewProps {
  stem: string
  options: string[] | { text: string; is_correct?: boolean }[]
  correctAnswer: number
  rationale: string | null
  codeCitation?: string | null
}

export const QuestionQuickPreview = ({
  stem,
  options,
  correctAnswer,
  rationale,
  codeCitation,
}: QuestionQuickPreviewProps) => {
  const [open, setOpen] = useState(false)

  const normalizedOptions = options.map((o) => (typeof o === 'string' ? o : o.text))
  const correctIndex =
    typeof options[0] === 'string'
      ? correctAnswer
      : options.findIndex((o) => typeof o !== 'string' && o.is_correct)

  const safeCorrectIndex = correctIndex < 0 ? correctAnswer : correctIndex

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="whitespace-nowrap text-xs text-[#4A5568] hover:text-[#1B3FC4] border border-[#D4DAE3] rounded-sm px-2 py-0.5 transition-colors duration-150 hover:border-[#1B3FC4] bg-white"
        >
          Preview
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        className="w-[400px] p-0 rounded-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#D4DAE3] bg-[#F8F7F5]">
          <span className="text-[11px] font-semibold text-[#4A5568] uppercase tracking-wider">
            Quick Preview
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[#8896A7] hover:text-[#1A2332] transition-colors duration-150 text-[11px] leading-none"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
        <div className="p-3">
          <CampModePreview
            stem={stem}
            options={normalizedOptions}
            correctAnswer={safeCorrectIndex}
            rationale={rationale ?? ''}
            codeCitation={codeCitation ?? undefined}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
