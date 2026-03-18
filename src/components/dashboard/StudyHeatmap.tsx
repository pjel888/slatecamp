'use client'

import { useMemo, useState, useCallback } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import type { HeatmapDay } from '@/types/dashboard'

// ── Constants ───────────────────────────────────────────────────────────────

const CELL_SIZE = 11
const CELL_GAP = 2
const CELL_TOTAL = CELL_SIZE + CELL_GAP
const MOBILE_CELL_SIZE = 9
const MOBILE_CELL_GAP = 2
const MOBILE_CELL_TOTAL = MOBILE_CELL_SIZE + MOBILE_CELL_GAP
const FULL_WEEKS = 52
const MOBILE_WEEKS = 16
const DAYS_IN_WEEK = 7
const DAY_LABELS = ['M', '', 'W', '', 'F', '', ''] // Mon, Wed, Fri only
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Cobalt-based intensity scale
const INTENSITY_COLORS = [
  '#F2F0EB',                   // 0: no activity (Neutral Cream)
  'rgba(27, 63, 196, 0.15)',   // 1: 1-2 questions
  'rgba(27, 63, 196, 0.30)',   // 2: 3-5 questions
  'rgba(27, 63, 196, 0.55)',   // 3: 6-10 questions
  'rgba(27, 63, 196, 1.0)',    // 4: 11+ questions
] as const

function getIntensityLevel(questionCount: number): number {
  if (questionCount === 0) return 0
  if (questionCount <= 2) return 1
  if (questionCount <= 5) return 2
  if (questionCount <= 10) return 3
  return 4
}

// ── Date utilities ──────────────────────────────────────────────────────────

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function toDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Build a grid of dates: columns = weeks, rows = days (0=Sun through 6=Sat). */
function buildGrid(weeks: number, today: Date): Date[][] {
  const grid: Date[][] = []
  // End date is the Saturday of the current week
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

  // Start date is (weeks) weeks before that Sunday
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (weeks * 7 - 1))

  const cursor = new Date(startDate)
  let currentWeek: Date[] = []

  while (cursor <= endDate) {
    currentWeek.push(new Date(cursor))
    if (currentWeek.length === DAYS_IN_WEEK) {
      grid.push(currentWeek)
      currentWeek = []
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  if (currentWeek.length > 0) {
    grid.push(currentWeek)
  }

  return grid
}

/** Get month labels positioned at the first Monday of each month. */
function getMonthLabels(grid: Date[][]): Array<{ label: string; colIndex: number }> {
  const labels: Array<{ label: string; colIndex: number }> = []
  let lastMonth = -1

  for (let col = 0; col < grid.length; col++) {
    // Use Monday (index 1) of each week
    const monday = grid[col][1]
    if (!monday) continue
    const month = monday.getMonth()
    if (month !== lastMonth) {
      labels.push({ label: MONTH_NAMES[month], colIndex: col })
      lastMonth = month
    }
  }

  return labels
}

// ── Props ───────────────────────────────────────────────────────────────────

interface StudyHeatmapProps {
  activityDays: HeatmapDay[]
  todayStr: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function StudyHeatmap({ activityDays, todayStr }: StudyHeatmapProps) {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      setIsMobile(node.clientWidth < 640)
    }
  }, [])

  const weeks = isMobile ? MOBILE_WEEKS : FULL_WEEKS
  const cellSize = isMobile ? MOBILE_CELL_SIZE : CELL_SIZE
  const cellTotal = isMobile ? MOBILE_CELL_TOTAL : CELL_TOTAL

  const today = useMemo(() => new Date(todayStr), [todayStr])

  // Build lookup map
  const activityMap = useMemo(() => {
    const map = new Map<string, HeatmapDay>()
    for (const day of activityDays) {
      map.set(day.date, day)
    }
    return map
  }, [activityDays])

  // Build grid
  const grid = useMemo(() => buildGrid(weeks, today), [weeks, today])
  const monthLabels = useMemo(() => getMonthLabels(grid), [grid])
  const todayDateStr = useMemo(() => toDateString(today), [today])

  // Consecutive study days for footer text
  const consecutiveDays = useMemo(() => {
    let count = 0
    const cursor = new Date(today)
    // Check today first; if no activity, try yesterday
    if (!activityMap.has(toDateString(cursor))) {
      cursor.setDate(cursor.getDate() - 1)
      if (!activityMap.has(toDateString(cursor))) return 0
    }
    while (activityMap.has(toDateString(cursor))) {
      count++
      cursor.setDate(cursor.getDate() - 1)
    }
    return count
  }, [activityMap, today])

  const hasAnyActivity = activityDays.length > 0

  // Layout measurements
  const dayLabelWidth = isMobile ? 0 : 20
  const gridWidth = weeks * cellTotal
  const gridHeight = DAYS_IN_WEEK * cellTotal
  const svgWidth = dayLabelWidth + gridWidth
  const svgHeight = 16 + gridHeight // 16px for month labels

  return (
    <div ref={containerRef} className="w-full">
      {hasAnyActivity ? (
        <>
          <div className="overflow-x-auto">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              role="img"
              aria-label="Study activity heatmap showing daily question counts over the past year"
              className="block"
            >
              {/* Month labels */}
              {monthLabels.map(({ label, colIndex }) => (
                <text
                  key={`month-${colIndex}`}
                  x={dayLabelWidth + colIndex * cellTotal}
                  y={10}
                  className="font-dm-mono"
                  style={{ fontSize: '9px', fill: '#8896A7' }}
                >
                  {label}
                </text>
              ))}

              {/* Day-of-week labels (M, W, F) — desktop only */}
              {!isMobile &&
                DAY_LABELS.map((label, rowIndex) =>
                  label ? (
                    <text
                      key={`day-${rowIndex}`}
                      x={0}
                      y={16 + rowIndex * cellTotal + cellSize - 1}
                      className="font-dm-mono"
                      style={{ fontSize: '9px', fill: '#8896A7' }}
                    >
                      {label}
                    </text>
                  ) : null,
                )}
            </svg>

            {/* Grid of cells — using HTML for Radix Tooltip compatibility */}
            <div
              className="relative"
              style={{
                marginLeft: dayLabelWidth,
                marginTop: -gridHeight,
                width: gridWidth,
                height: gridHeight,
              }}
            >
              {grid.map((week, colIndex) =>
                week.map((date, rowIndex) => {
                  const dateStr = toDateString(date)
                  const activity = activityMap.get(dateStr)
                  const level = activity ? getIntensityLevel(activity.questionCount) : 0
                  const isToday = dateStr === todayDateStr
                  const isFuture = date > today

                  if (isFuture) return null

                  const x = colIndex * cellTotal
                  const y = rowIndex * cellTotal

                  const sessionText = activity
                    ? `${activity.sessionCount} session${activity.sessionCount !== 1 ? 's' : ''}, ${activity.questionCount} question${activity.questionCount !== 1 ? 's' : ''}`
                    : 'No activity'

                  return (
                    <Tooltip key={dateStr}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="absolute rounded-[2px] outline-none focus-visible:ring-1 focus-visible:ring-[#1B3FC4]"
                          style={{
                            left: x,
                            top: y,
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: INTENSITY_COLORS[level],
                            border: isToday ? '1px solid #1B3FC4' : 'none',
                          }}
                          aria-label={`${formatDateLabel(date)} — ${sessionText}`}
                          tabIndex={-1}
                        />
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="rounded-md border px-2 py-1.5"
                        style={{
                          borderColor: '#D4DAE3',
                          backgroundColor: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                      >
                        <p
                          className="text-xs font-medium"
                          style={{ color: '#1A2332' }}
                        >
                          {formatDateLabel(date)}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: '#4A5568' }}
                        >
                          {sessionText}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )
                }),
              )}
            </div>
          </div>

          {/* Legend + streak */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px]" style={{ color: '#8896A7' }}>
                Less
              </span>
              {INTENSITY_COLORS.map((color, i) => (
                <span
                  key={i}
                  className="inline-block h-[9px] w-[9px] rounded-[2px]"
                  style={{ backgroundColor: color }}
                />
              ))}
              <span className="text-[11px]" style={{ color: '#8896A7' }}>
                More
              </span>
            </div>

            {consecutiveDays > 0 && (
              <span
                className="text-xs font-medium"
                style={{ color: '#4A5568' }}
              >
                {consecutiveDays}-day study run
              </span>
            )}
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-8 text-center">
          {/* Render faded grid to show what it will look like */}
          <div className="mb-3 opacity-40">
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${Math.min(weeks, 20)}, ${cellSize}px)`,
                gap: `${CELL_GAP}px`,
              }}
            >
              {Array.from({ length: Math.min(weeks, 20) * 3 }).map((_, i) => (
                <span
                  key={i}
                  className="rounded-[2px]"
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: '#F2F0EB',
                  }}
                />
              ))}
            </div>
          </div>
          <p className="text-[13px] font-medium" style={{ color: '#4A5568' }}>
            Your study journey starts here.
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: '#8896A7' }}>
            Complete a session to light up your first day.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

export function StudyHeatmapSkeleton() {
  return (
    <div className="space-y-2">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(26, ${CELL_SIZE}px)`,
          gap: `${CELL_GAP}px`,
        }}
      >
        {Array.from({ length: 26 * 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="rounded-[2px]"
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          />
        ))}
      </div>
    </div>
  )
}
