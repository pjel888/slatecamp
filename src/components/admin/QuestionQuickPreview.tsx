'use client'

import { useState } from 'react'
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
  const hasKnownCorrectAnswer =
    Number.isInteger(safeCorrectIndex) &&
    safeCorrectIndex >= 0 &&
    safeCorrectIndex < normalizedOptions.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="whitespace-nowrap text-xs text-text-secondary hover:text-camp-cobalt border border-border rounded-sm px-2 py-0.5 transition-colors duration-150 hover:border-camp-cobalt bg-white cursor-pointer"
      >
        Preview
      </PopoverTrigger>
      <PopoverContent
        side="left"
        align="start"
        sideOffset={8}
        className="w-[400px] p-0 rounded-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-light">
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
            Quick Preview
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-text-tertiary hover:text-text-primary transition-colors duration-150 text-[11px] leading-none"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>
        <div className="p-3">
          <div className="space-y-3">
            <p className="text-sm font-medium text-text-primary">{stem}</p>

            <div className="space-y-2">
              {normalizedOptions.map((option, index) => {
                const isCorrect = hasKnownCorrectAnswer && index === safeCorrectIndex

                return (
                  <div
                    key={`${option}-${index}`}
                    className={`rounded-sm border px-2.5 py-2 text-xs ${
                      isCorrect
                        ? 'border-emerald/30 bg-success-50 text-emerald-800'
                        : 'border-border bg-surface-light text-text-secondary'
                    }`}
                  >
                    <span className="mr-2 font-mono font-semibold text-text-tertiary">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </div>
                )
              })}
            </div>

            {rationale ? (
              <div className="rounded-sm border border-border bg-surface-light px-2.5 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Rationale
                </p>
                <p className="mt-1 text-xs text-text-secondary">{rationale}</p>
              </div>
            ) : null}

            {codeCitation ? (
              <p className="text-[11px] font-mono text-text-tertiary">
                {codeCitation}
              </p>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
