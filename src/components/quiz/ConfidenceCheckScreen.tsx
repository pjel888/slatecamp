'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type ConfidenceRating = 1 | 2 | 3

interface ConfidenceCheckScreenProps {
  subjectNames: string[]
  onSubmit: (ratings: Record<string, ConfidenceRating>) => void
  onSkip: () => void
}

const LEVELS: { value: ConfidenceRating; label: string }[] = [
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' },
]

export const ConfidenceCheckScreen = ({
  subjectNames,
  onSubmit,
  onSkip,
}: ConfidenceCheckScreenProps) => {
  const [ratings, setRatings] = useState<Record<string, ConfidenceRating>>({})

  const handleSelect = (subject: string, value: ConfidenceRating) => {
    setRatings((prev) => ({ ...prev, [subject]: value }))
  }

  const allRated = subjectNames.every((s) => ratings[s] !== undefined)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 py-10 bg-[#F5F7FA]">
      <div className="w-full max-w-md space-y-6">
        {/* Eyebrow */}
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#8896A7] text-center">
          Confidence Check
        </p>

        {/* Prompt */}
        <h2 className="text-base font-semibold text-[#1A2332] text-center">
          How confident are you in these subjects right now?
        </h2>

        {/* Subject grid */}
        <div className="space-y-3">
          {subjectNames.map((subject) => (
            <div
              key={subject}
              className="flex items-center justify-between bg-white border border-[#D4DAE3] rounded-md px-4 py-3"
            >
              <span className="text-sm font-medium text-[#1A2332] truncate mr-4">
                {subject}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {LEVELS.map(({ value, label }) => {
                  const isSelected = ratings[subject] === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelect(subject, value)}
                      className={cn(
                        'px-3 py-1 rounded-sm text-xs font-medium transition-colors duration-150',
                        isSelected
                          ? 'bg-[#1B3FC4] text-white'
                          : 'bg-[#F2F0EB] text-[#555555] hover:bg-[#E8E4DC]',
                      )}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-[#8896A7] hover:text-[#4A5568] transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={() => onSubmit(ratings)}
            disabled={!allRated}
            className={cn(
              'h-10 px-6 rounded-sm font-bold text-xs uppercase tracking-[0.15em] transition-all',
              allRated
                ? 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed',
            )}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
