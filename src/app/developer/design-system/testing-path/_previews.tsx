'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  ReadinessRing Preview                                              */
/* ------------------------------------------------------------------ */

const Ring = ({
  score,
  color,
  size,
}: {
  score: number
  color: string
  size: number
}) => {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
        />
        {/* Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {/* Center label */}
      <span
        className="font-[family-name:var(--font-dm-mono)] text-lg font-semibold text-foreground"
        style={{ marginTop: -(size / 2 + 12) }}
      >
        {score}%
      </span>
      {/* Spacer to offset the negative margin */}
      <span style={{ height: size / 2 - 22 }} />
    </div>
  )
}

export const ReadinessRingPreview = () => (
  <div className="flex items-center gap-10">
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg width={120} height={120} className="-rotate-90">
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-border"
          />
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke="#1B3FC4"
            strokeWidth={8}
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - 72 / 100)}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-[family-name:var(--font-dm-mono)] text-lg font-semibold text-foreground">
          72%
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground mt-1">
        Readiness Score
      </span>
    </div>

    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center">
        <svg width={120} height={120} className="-rotate-90">
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke="currentColor"
            strokeWidth={8}
            className="text-border"
          />
          <circle
            cx={60}
            cy={60}
            r={52}
            fill="none"
            stroke="#D4951A"
            strokeWidth={8}
            strokeDasharray={2 * Math.PI * 52}
            strokeDashoffset={2 * Math.PI * 52 * (1 - 38 / 100)}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-[family-name:var(--font-dm-mono)] text-lg font-semibold text-foreground">
          38%
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground mt-1">
        Sub-domain Score
      </span>
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  MasteryBar Preview                                                 */
/* ------------------------------------------------------------------ */

const ProgressRow = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-medium text-foreground">{label}</span>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
        {value}%
      </span>
    </div>
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className="h-2 rounded-full transition-all duration-300"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  </div>
)

export const MasteryBarPreview = () => (
  <div className="w-full max-w-sm space-y-4">
    <ProgressRow label="Structural Engineering" value={82} color="#2D9F6F" />
    <ProgressRow label="Building Code" value={68} color="#1B3FC4" />
    <ProgressRow label="Utilities & Services" value={34} color="#D4951A" />
  </div>
)

/* ------------------------------------------------------------------ */
/*  HeatmapGrid Preview                                                */
/* ------------------------------------------------------------------ */

const HEATMAP_VALUES = [
  92, 78, 45, 88, 34, 56, 71, 95, 22, 67, 83, 41, 59, 74, 38, 86,
]

export const HeatmapGridPreview = () => (
  <div className="grid grid-cols-4 gap-1.5">
    {HEATMAP_VALUES.map((value, i) => (
      <div
        key={i}
        className="w-12 h-12 rounded-sm flex items-center justify-center"
        style={{ backgroundColor: `rgba(45, 159, 111, ${value / 100})` }}
      >
        <span
          className={cn(
            'font-[family-name:var(--font-dm-mono)] text-[11px] font-medium',
            value > 60 ? 'text-white' : 'text-emerald-900',
          )}
        >
          {value}
        </span>
      </div>
    ))}
  </div>
)

/* ------------------------------------------------------------------ */
/*  TrailProgressCard Preview                                          */
/* ------------------------------------------------------------------ */

export const TrailProgressCardPreview = () => (
  <div className="w-full max-w-sm bg-card border border-border rounded-md p-5 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-foreground">
        Architecture Licensure Exam
      </h3>
      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-primary">
        64%
      </span>
    </div>
    <div className="h-2 w-full rounded-full bg-muted">
      <div
        className="h-2 rounded-full bg-primary transition-all duration-300"
        style={{ width: '64%' }}
      />
    </div>
    <p className="text-[12px] text-muted-foreground">
      31 of 48 topics completed
    </p>
  </div>
)

/* ------------------------------------------------------------------ */
/*  SubjectPill Preview                                                */
/* ------------------------------------------------------------------ */

const PILLS = [
  { label: 'Structural', count: 12, variant: 'primary' as const },
  { label: 'Utilities', count: 8, variant: 'default' as const },
  { label: 'Building Code', count: 15, variant: 'primary' as const },
  { label: 'Design', count: 6, variant: 'default' as const },
  { label: 'Professional Practice', count: 9, variant: 'subtle' as const },
]

export const SubjectPillPreview = () => (
  <div className="flex flex-wrap items-center gap-2">
    {PILLS.map((pill) => (
      <span
        key={pill.label}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium',
          pill.variant === 'primary' &&
            'bg-[#EEF2FC] text-[#1B3FC4]',
          pill.variant === 'default' &&
            'bg-muted text-foreground',
          pill.variant === 'subtle' &&
            'bg-transparent border border-border text-muted-foreground',
        )}
      >
        {pill.label}
        <span
          className={cn(
            'font-[family-name:var(--font-dm-mono)] text-[11px]',
            pill.variant === 'primary'
              ? 'text-[#1B3FC4]/60'
              : 'text-muted-foreground',
          )}
        >
          ({pill.count})
        </span>
      </span>
    ))}
  </div>
)
