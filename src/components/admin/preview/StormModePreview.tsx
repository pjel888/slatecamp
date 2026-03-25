'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { StudentViewWatermark } from '@/components/ui/student-view-watermark'

export interface StormModePreviewProps {
  stem: string
  options: string[]
}

const LABELS = ['A', 'B', 'C', 'D']

export const StormModePreview = ({ stem, options }: StormModePreviewProps) => {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="rounded-md border border-[border] bg-[#F5F7FA] overflow-hidden text-sm">
      {/* STUDENT VIEW watermark */}
      <StudentViewWatermark label="Student View — Storm Mode" />

      {/* Thin progress bar */}
      <div className="h-[4px] w-full bg-[border]">
        <div className="h-full bg-[camp-cobalt]" style={{ width: '35%' }} />
      </div>

      {/* Question counter */}
      <div className="px-5 pt-3 pb-1">
        <span className="text-[11px] font-mono text-[text-tertiary]">7 / 20</span>
      </div>

      {/* Question stem */}
      <div className="px-5 pt-2 pb-4">
        <p className="text-base font-medium text-[text-primary] leading-[1.65]">
          {stem || <span className="text-[text-tertiary] italic">Question stem will appear here…</span>}
        </p>
      </div>

      {/* Options — selectable but no feedback */}
      <div className="px-5 pb-4 space-y-2">
        {options.slice(0, 4).map((option, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setSelected(idx)}
            className={cn(
              'flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-sm border text-left transition-colors duration-150',
              selected === idx
                ? 'bg-[#EEF2FC] border-[camp-cobalt] text-[text-primary]'
                : 'bg-white border-[border] text-[text-primary] hover:border-[camp-cobalt] cursor-pointer',
            )}
          >
            <div
              className={cn(
                'shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-black border transition-colors',
                selected === idx
                  ? 'bg-primary/10 border-primary/30 text-[camp-cobalt]'
                  : 'bg-[#F8F7F5] border-[border] text-[text-tertiary]',
              )}
            >
              {LABELS[idx]}
            </div>
            <span className="text-[15px] font-medium leading-snug flex-1">
              {option || <span className="italic text-[text-tertiary]">Option {LABELS[idx]}…</span>}
            </span>
          </button>
        ))}
      </div>

      {/* Navigation — disabled display only */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3 border-t border-[border] pt-3">
        <button
          type="button"
          disabled
          className="h-9 px-5 rounded-sm border border-[border] text-[text-tertiary] text-[11px] font-black uppercase tracking-[0.15em] disabled:cursor-not-allowed opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled
          className="h-9 px-5 rounded-sm bg-[camp-cobalt] text-white text-[11px] font-black uppercase tracking-[0.15em] disabled:cursor-not-allowed opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  )
}
