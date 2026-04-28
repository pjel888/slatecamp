'use client'

import React, { useMemo, useState } from 'react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Card } from '@/components/ui/card'
import { RichInfoPopover } from '@/components/dashboard/RichInfoPopover'
import { ChartEmptyState } from '@/components/analytics/ChartEmptyState'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TimelineHeatmapCell {
  /** ISO date string (YYYY-MM-DD) — start of the week bucket */
  weekStart: string
  /** Subject / swim-lane label */
  subject: string
  /** Total questions answered in this bucket */
  count: number
  /** Accuracy percentage (0–100) for this bucket, null if no data */
  accuracy: number | null
}

export interface TimelineHeatmapRow {
  subject: string
  color: string
  cells: TimelineHeatmapCell[]
  totalQuestions: number
}

interface TimelineHeatmapProps {
  rows: TimelineHeatmapRow[]
  weekLabels: string[]
}

// ─── Color helpers ────────────────────────────────────────────────────────────

type Level = 0 | 1 | 2 | 3 | 4

function toLevel(n: number, max: number): Level {
  if (n <= 0) return 0
  if (max <= 0) return 0
  const ratio = n / max
  if (ratio <= 0.15) return 1
  if (ratio <= 0.4) return 2
  if (ratio <= 0.7) return 3
  return 4
}

const INTENSITY_COLORS: Record<Level, string> = {
  0: '#F0F0ED',
  1: '#C5D0F0',
  2: '#8FA2E0',
  3: '#5572D0',
  4: '#1B3FC4',
}

function getCellBg(level: Level): string {
  return INTENSITY_COLORS[level]
}

function getCellTextColor(level: Level): string {
  return level >= 3 ? '#FFFFFF' : '#1A2332'
}

// ─── Date formatting ──────────────────────────────────────────────────────────

function formatWeekLabel(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatWeekRange(iso: string): string {
  const start = new Date(`${iso}T12:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

// ─── Range selector ───────────────────────────────────────────────────────────

type TimeRange = '4w' | '8w' | '12w'

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '4w', label: '4 weeks' },
  { value: '8w', label: '8 weeks' },
  { value: '12w', label: '12 weeks' },
]

function getWeekCount(range: TimeRange): number {
  switch (range) {
    case '4w': return 4
    case '8w': return 8
    case '12w': return 12
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const CELL_W = 48
const CELL_H = 32
const LABEL_W = 180
const ROW_GAP = 2
const COL_GAP = 2

export function TimelineHeatmap({ rows, weekLabels }: TimelineHeatmapProps) {
  const [range, setRange] = useState<TimeRange>('8w')
  const weekCount = getWeekCount(range)

  // Slice to the selected range (most recent N weeks)
  const visibleWeeks = useMemo(
    () => weekLabels.slice(-weekCount),
    [weekLabels, weekCount],
  )

  const _visibleWeekSet = useMemo(() => new Set(visibleWeeks), [visibleWeeks])

  // Filter cells and compute global max for color scaling
  const { filteredRows, globalMax } = useMemo(() => {
    let max = 0
    const filtered = rows.map((row) => {
      const cells = visibleWeeks.map((wk) => {
        const cell = row.cells.find((c) => c.weekStart === wk)
        const count = cell?.count ?? 0
        if (count > max) max = count
        return cell ?? { weekStart: wk, subject: row.subject, count: 0, accuracy: null }
      })
      return { ...row, cells }
    })
    return { filteredRows: filtered, globalMax: max }
  }, [rows, visibleWeeks])

  // Sort rows by total questions descending
  const sortedRows = useMemo(
    () => [...filteredRows].sort((a, b) => b.totalQuestions - a.totalQuestions),
    [filteredRows],
  )

  const gridW = visibleWeeks.length * (CELL_W + COL_GAP) - COL_GAP

  if (rows.length === 0 || weekLabels.length === 0) {
    return (
      <ChartEmptyState
        title="No study activity yet"
        description="Your study timeline will appear after your first drill session."
        height="h-[140px]"
      />
    )
  }

  return (
    <Card className="border-border bg-card p-3 relative">
      <RichInfoPopover
        title="Study Timeline"
        description="Each row is a subject. Each column is a week. Darker cells = more questions answered. Hover for accuracy breakdown."
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.2em] text-text-2">
            Study Timeline
          </h3>
          <p className="text-xs text-ink-tertiary mt-0.5">
            Weekly activity by subject
          </p>
        </div>

        {/* Range toggle */}
        <div className="flex items-center rounded-sm border border-border overflow-hidden">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={cn(
                'px-2.5 py-1 text-[11px] font-medium transition-colors duration-150',
                range === opt.value
                  ? 'bg-camp-cobalt text-white'
                  : 'bg-card text-ink-secondary hover:bg-primary-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="overflow-x-auto scrollbar-thin">
        <div style={{ minWidth: LABEL_W + gridW + 16 }}>
          {/* Week column headers */}
          <div className="flex" style={{ paddingLeft: LABEL_W }}>
            {visibleWeeks.map((wk, i) => (
              <div
                key={wk}
                className="text-[11px] text-ink-tertiary text-center select-none shrink-0"
                style={{
                  width: CELL_W,
                  marginRight: i < visibleWeeks.length - 1 ? COL_GAP : 0,
                }}
              >
                {formatWeekLabel(wk)}
              </div>
            ))}
          </div>

          {/* Swim lanes */}
          <div className="mt-1.5 flex flex-col" style={{ gap: ROW_GAP }}>
            {sortedRows.map((row) => (
              <div key={row.subject} className="flex items-center">
                {/* Subject label */}
                <div
                  className="shrink-0 flex items-center gap-1.5 pr-2"
                  style={{ width: LABEL_W }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: row.color }}
                  />
                  <span className="text-xs text-ink-primary truncate font-medium">
                    {row.subject}
                  </span>
                  <span className="text-[11px] text-ink-tertiary tabular-nums ml-auto shrink-0">
                    {row.totalQuestions}
                  </span>
                </div>

                {/* Cells */}
                <div className="flex" style={{ gap: COL_GAP }}>
                  {row.cells.map((cell, _i) => {
                    const level = toLevel(cell.count, globalMax)
                    const bg = getCellBg(level)
                    const textColor = getCellTextColor(level)

                    const tipLines = [
                      formatWeekRange(cell.weekStart),
                      `${cell.count} question${cell.count !== 1 ? 's' : ''}`,
                    ]
                    if (cell.accuracy !== null) {
                      tipLines.push(`${cell.accuracy}% accuracy`)
                    }
                    const _tipText = tipLines.join(' · ')

                    return (
                      <Tooltip key={cell.weekStart}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'rounded-[3px] shrink-0 cursor-default flex items-center justify-center',
                              'transition-opacity duration-150 hover:opacity-75',
                            )}
                            style={{
                              width: CELL_W,
                              height: CELL_H,
                              backgroundColor: bg,
                            }}
                          >
                            {cell.count > 0 && (
                              <span
                                className="text-[11px] font-medium tabular-nums select-none"
                                style={{ color: textColor }}
                              >
                                {cell.count}
                              </span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={6}>
                          <div className="text-xs">
                            <div className="font-medium">{row.subject}</div>
                            <div className="text-white/70 mt-0.5">{formatWeekRange(cell.weekStart)}</div>
                            <div className="mt-1">
                              {cell.count} question{cell.count !== 1 ? 's' : ''}
                              {cell.accuracy !== null && (
                                <span> · {cell.accuracy}% accuracy</span>
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="text-[11px] text-ink-tertiary select-none">Less</span>
            {([0, 1, 2, 3, 4] as Level[]).map((lvl) => (
              <div
                key={lvl}
                className="rounded-[3px]"
                style={{
                  width: 14,
                  height: 14,
                  backgroundColor: INTENSITY_COLORS[lvl],
                }}
              />
            ))}
            <span className="text-[11px] text-ink-tertiary select-none">More</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
