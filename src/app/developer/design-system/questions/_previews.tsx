'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  QuestionCard Preview                                               */
/* ------------------------------------------------------------------ */

const MOCK_OPTIONS = [
  { id: 'a', text: '1.00 meter' },
  { id: 'b', text: '1.10 meters' },
  { id: 'c', text: '1.20 meters' },
  { id: 'd', text: '1.50 meters' },
]

export const QuestionCardPreview = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-md p-5">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 text-[11px] font-medium">
          Medium
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-muted-foreground text-[11px] font-medium">
          Building Code
        </span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium text-foreground leading-snug mb-4">
        What is the minimum corridor width for commercial occupancies per PD
        1096?
      </p>

      {/* Options */}
      <div className="space-y-2">
        {MOCK_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedId(opt.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm border text-left transition-colors duration-150 cursor-pointer',
              selectedId === opt.id
                ? 'border-primary bg-primary-50 text-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/50',
            )}
          >
            {/* Radio circle */}
            <span
              className={cn(
                'flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-150',
                selectedId === opt.id
                  ? 'border-primary'
                  : 'border-border',
              )}
            >
              {selectedId === opt.id && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </span>

            {/* Label */}
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground mr-1">
              {opt.id.toUpperCase()}.
            </span>
            <span className="text-[13px]">{opt.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AnswerOption Preview                                               */
/* ------------------------------------------------------------------ */

export const AnswerOptionPreview = () => (
  <div className="w-full max-w-sm space-y-2">
    {/* Default state */}
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-border bg-card text-foreground">
      <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-border" />
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground mr-1">
        A.
      </span>
      <span className="text-[13px]">1.00 meter</span>
      <span className="ml-auto text-[11px] text-muted-foreground italic">
        default
      </span>
    </div>

    {/* Selected state */}
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-primary bg-primary-50 text-foreground">
      <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-primary" />
      </span>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground mr-1">
        B.
      </span>
      <span className="text-[13px]">1.10 meters</span>
      <span className="ml-auto text-[11px] text-primary italic">selected</span>
    </div>

    {/* Correct state */}
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-emerald-500 bg-success-50 text-foreground">
      <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-emerald-500 flex items-center justify-center">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
      </span>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground mr-1">
        C.
      </span>
      <span className="text-[13px]">1.20 meters</span>
      <span className="ml-auto text-[11px] text-emerald-600 italic">
        correct
      </span>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  RationalePanel Preview                                             */
/* ------------------------------------------------------------------ */

export const RationalePanelPreview = () => (
  <div className="w-full max-w-md rounded-md border border-emerald-200 overflow-hidden">
    {/* Header */}
    <div className="bg-success-50 px-4 py-2.5 border-b border-emerald-200">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[11px] font-bold">
          &#10003;
        </span>
        <span className="text-sm font-semibold text-emerald-800">
          Correct!
        </span>
      </div>
    </div>

    {/* Body */}
    <div className="bg-card px-4 py-3 space-y-3">
      <p className="text-[13px] text-foreground leading-relaxed">
        The minimum corridor width for commercial occupancies under PD 1096
        (National Building Code of the Philippines) is{' '}
        <strong>1.20 meters</strong>. This requirement ensures adequate egress
        capacity for occupant loads typical of commercial use groups. For
        corridors serving occupant loads exceeding 50, the width must be
        increased proportionally.
      </p>

      {/* Citations */}
      <div className="space-y-1.5">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Citations
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-[11px] text-muted-foreground">
            PD 1096, Section 401.3
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-muted text-[11px] text-muted-foreground">
            NBC Table 4.1.1
          </span>
        </div>
      </div>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  DifficultyBadge Preview                                            */
/* ------------------------------------------------------------------ */

export const DifficultyBadgePreview = () => (
  <div className="flex items-center gap-3">
    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-success-50 text-emerald-700 text-[12px] font-medium">
      Easy
    </span>
    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-warning-50 text-amber-700 text-[12px] font-medium">
      Medium
    </span>
    <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-destructive-50 text-red-700 text-[12px] font-medium">
      Hard
    </span>
  </div>
)

/* ------------------------------------------------------------------ */
/*  SessionTimer Preview                                               */
/* ------------------------------------------------------------------ */

export const SessionTimerPreview = () => (
  <div className="flex flex-col items-center gap-3">
    <div className="flex items-center gap-2 px-4 py-3 rounded-md border border-border bg-card">
      <svg
        className="w-4 h-4 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span className="font-[family-name:var(--font-dm-mono)] text-2xl font-medium text-foreground tracking-wide">
        28:42
      </span>
    </div>
    <span className="text-[11px] text-muted-foreground">
      Time remaining in session
    </span>
  </div>
)
