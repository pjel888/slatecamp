'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { StudentViewWatermark } from '@/components/ui/student-view-watermark'
import { Eyebrow } from '@/components/ui/eyebrow'

export interface CampModePreviewProps {
  stem: string
  options: string[]
  correctAnswer: number // 0-3 index
  rationale: string
  codeCitation?: string
  difficulty?: number
}

const LABELS = ['A', 'B', 'C', 'D']

export const CampModePreview = ({
  stem,
  options,
  correctAnswer,
  rationale,
  codeCitation,
}: CampModePreviewProps) => {
  const [selected, setSelected] = useState<number | null>(null)
  const isChecked = selected !== null

  const handleSelect = (idx: number) => {
    if (isChecked) return
    setSelected(idx)
  }

  const getOptionStyle = (idx: number) => {
    if (!isChecked) {
      return selected === idx
        ? 'bg-[#EEF2FC] border-[#1B3FC4] text-[#1A2332] cursor-pointer'
        : 'bg-white border-[#D4DAE3] text-[#1A2332] hover:border-[#1B3FC4] cursor-pointer'
    }
    if (idx === correctAnswer) {
      return 'bg-[#EDFAF4] border-[#2D9F6F] text-[#1A2332] cursor-default ring-2 ring-[#2D9F6F]/30'
    }
    if (idx === selected && idx !== correctAnswer) {
      return 'bg-[#FDF0F0] border-[#D64545]/50 text-[#1A2332] cursor-default opacity-80'
    }
    return 'bg-white border-[#D4DAE3] text-[#D4DAE3] opacity-40 cursor-default'
  }

  const getLetterBadgeStyle = (idx: number) => {
    if (!isChecked) {
      return selected === idx
        ? 'bg-primary/10 border-primary/30 text-[#1B3FC4]'
        : 'bg-[#F8F7F5] border-[#D4DAE3] text-[#8896A7]'
    }
    if (idx === correctAnswer) return 'bg-[#2D9F6F] border-[#2D9F6F] text-white'
    if (idx === selected && idx !== correctAnswer) return 'bg-[#D64545] border-[#D64545] text-white'
    return 'bg-[#F8F7F5] border-[#D4DAE3] text-[#D4DAE3]'
  }

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white overflow-hidden text-sm">
      {/* STUDENT VIEW watermark */}
      <div className="flex items-center justify-between border-b border-amber-200 bg-[#FFF8EB]">
        <StudentViewWatermark label="Student View — Camp Mode" />
        {isChecked && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="pr-4 text-[11px] text-amber-600 underline transition-colors duration-150 hover:text-amber-800"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress bar stub */}
      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] text-[#8896A7]">Question 7 of 20</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#D4DAE3] overflow-hidden">
          <div className="h-full rounded-full bg-[#1B3FC4]" style={{ width: '35%' }} />
        </div>
      </div>

      {/* Question stem */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-base font-medium text-[#1A2332] leading-[1.65]">
          {stem || <span className="text-[#8896A7] italic">Question stem will appear here…</span>}
        </p>
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {options.slice(0, 4).map((option, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(idx)}
            disabled={isChecked}
            className={cn(
              'relative flex items-center gap-3 w-full min-h-[48px] px-4 py-3 rounded-sm border text-left transition-colors duration-150',
              getOptionStyle(idx),
            )}
          >
            {/* Letter badge */}
            <div
              className={cn(
                'shrink-0 w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-black border transition-colors',
                getLetterBadgeStyle(idx),
              )}
            >
              {LABELS[idx]}
            </div>
            <span className="text-[15px] font-medium leading-snug flex-1">
              {option || <span className="italic text-[#8896A7]">Option {LABELS[idx]}…</span>}
            </span>
          </button>
        ))}
      </div>

      {/* Rationale — shown after selection */}
      {isChecked && (
        <div className="px-4 pb-4">
          <div className="rounded-md border bg-[#EEF2FC] p-4 space-y-2">
            <Eyebrow className="font-black text-[#1B3FC4]">Rationale</Eyebrow>
            <p className="text-sm text-[#4A5568] leading-[1.65]">
              {rationale || <span className="italic text-[#8896A7]">Rationale will appear here…</span>}
            </p>
            {codeCitation && (
              <div className="pt-1">
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-[#F5F5F5] border border-[#D4DAE3] text-[#4A5568]">
                  {codeCitation}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Check Answer button (pre-check) */}
      {!isChecked && (
        <div className="px-4 pb-4">
          <button
            type="button"
            disabled={selected === null}
            onClick={() => selected !== null && setSelected(selected)}
            className="w-full h-9 rounded-sm bg-[#1B3FC4] text-white text-[11px] font-black uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 hover:bg-[#1535A8]"
          >
            Check Answer
          </button>
        </div>
      )}
    </div>
  )
}
