'use client'

import { useMemo } from 'react'
import { Star } from '@phosphor-icons/react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { TrailDay, TrailEnrollment, TrailDayCompletion } from '@/types/app'
import { SUBJECT_COLORS } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COL_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Resolve the fill color for a day cell from subject_color or SUBJECT_COLORS lookup. */
const resolveDayColor = (day: TrailDay): string => {
  if (day.subject_color) return day.subject_color
  if (day.subject_focus && SUBJECT_COLORS[day.subject_focus]) {
    return SUBJECT_COLORS[day.subject_focus]
  }
  return '#8896A7' // fallback neutral
}

/** Group days into rows of 7 (weeks), padding the first row with nulls if needed. */
const groupIntoWeeks = (days: TrailDay[]): (TrailDay | null)[][] => {
  if (days.length === 0) return []

  const totalDays = days[days.length - 1]?.day_number ?? days.length
  const totalWeeks = Math.ceil(totalDays / 7)
  const weeks: (TrailDay | null)[][] = []

  // Index days by day_number for O(1) lookup
  const dayMap = new Map<number, TrailDay>()
  for (const d of days) {
    dayMap.set(d.day_number, d)
  }

  for (let w = 0; w < totalWeeks; w++) {
    const row: (TrailDay | null)[] = []
    for (let col = 0; col < 7; col++) {
      const dayNum = w * 7 + col + 1
      row.push(dayMap.get(dayNum) ?? null)
    }
    weeks.push(row)
  }

  return weeks
}

/* ------------------------------------------------------------------ */
/*  DayCell                                                            */
/* ------------------------------------------------------------------ */

interface DayCellProps {
  day: TrailDay
  isCompleted: boolean
  isCurrent: boolean
  isUpcoming: boolean
}

const DayCell = ({ day, isCompleted, isCurrent, isUpcoming }: DayCellProps) => {
  const color = resolveDayColor(day)

  // Rest day: empty circle
  if (day.is_rest_day) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'w-7 h-7 rounded-[4px] border border-[border] bg-transparent',
              'max-sm:w-[22px] max-sm:h-[22px]',
              isCurrent && 'ring-2 ring-[camp-cobalt]',
            )}
            aria-label={`Day ${day.day_number}: Rest day`}
          />
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-xs">
            Day {day.day_number} &mdash; Rest Day
          </span>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Phase transition: star overlay
  if (day.is_phase_transition) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div
            className={cn(
              'relative flex items-center justify-center w-7 h-7 rounded-[4px]',
              'max-sm:w-[22px] max-sm:h-[22px]',
              isCurrent && 'ring-2 ring-[camp-cobalt]',
            )}
            style={{
              backgroundColor: color,
              opacity: isCompleted ? 1 : isUpcoming ? 0.3 : 1,
            }}
            aria-label={`Day ${day.day_number}: ${day.title} (phase transition)`}
          >
            <Star
              size={12}
              weight="fill"
              className="text-white max-sm:w-[10px] max-sm:h-[10px]"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium">
              Day {day.day_number} &mdash; {day.title}
            </span>
            {day.phase_name && (
              <span className="text-[11px] opacity-80">
                Phase: {day.phase_name}
              </span>
            )}
            {day.subject_focus && (
              <span className="text-[11px] opacity-80">{day.subject_focus}</span>
            )}
            <span className="text-[11px] opacity-80">~{day.estimated_minutes} min</span>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  // Standard study day
  return (
    <Tooltip>
      <TooltipTrigger>
        <div
          className={cn(
            'w-7 h-7 rounded-[4px]',
            'max-sm:w-[22px] max-sm:h-[22px]',
            isCurrent && 'ring-2 ring-[camp-cobalt]',
          )}
          style={{
            backgroundColor: color,
            opacity: isCompleted ? 1 : isUpcoming ? 0.3 : 0.5,
          }}
          aria-label={`Day ${day.day_number}: ${day.title}`}
        />
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium">
            Day {day.day_number} &mdash; {day.title}
          </span>
          {day.subject_focus && (
            <span className="text-[11px] opacity-80">{day.subject_focus}</span>
          )}
          <span className="text-[11px] opacity-80">~{day.estimated_minutes} min</span>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

/* ------------------------------------------------------------------ */
/*  EmptyCell — placeholder for padding at end of last week            */
/* ------------------------------------------------------------------ */

const EmptyCell = () => (
  <div className="w-7 h-7 max-sm:w-[22px] max-sm:h-[22px]" />
)

/* ------------------------------------------------------------------ */
/*  TrailPhaseMap                                                      */
/* ------------------------------------------------------------------ */

interface TrailPhaseMapProps {
  days: TrailDay[]
  enrollment?: TrailEnrollment
  completions?: TrailDayCompletion[]
}

export const TrailPhaseMap = ({
  days,
  enrollment,
  completions = [],
}: TrailPhaseMapProps) => {
  const weeks = useMemo(() => groupIntoWeeks(days), [days])

  const completedDayNumbers = useMemo(() => {
    const set = new Set<number>()
    for (const c of completions) {
      if (c.day_number != null) {
        set.add(c.day_number)
      }
    }
    return set
  }, [completions])

  const currentDay = enrollment?.current_day ?? 0

  // Collect phase boundaries: first day_number of each phase
  const phaseBoundaries = useMemo(() => {
    const boundaries = new Map<number, string>()
    for (const day of days) {
      if (day.is_phase_transition && day.phase_name) {
        const weekIndex = Math.ceil(day.day_number / 7) - 1
        if (!boundaries.has(weekIndex)) {
          boundaries.set(weekIndex, day.phase_name)
        }
      }
    }
    return boundaries
  }, [days])

  if (weeks.length === 0) return null

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1" role="grid" aria-label="Trail calendar overview">
        {/* Column headers */}
        <div className="grid grid-cols-[auto_repeat(7,1fr)] gap-[3px] items-center">
          {/* Spacer for week label column */}
          <div className="w-10 max-sm:w-8" />
          {COL_HEADERS.map((label) => (
            <div
              key={label}
              className="flex items-center justify-center font-mono text-[11px] text-[text-tertiary] select-none"
            >
              {label}
            </div>
          ))}
        </div>

        {/* Week rows */}
        {weeks.map((weekDays, weekIdx) => {
          const phaseName = phaseBoundaries.get(weekIdx)

          return (
            <div key={weekIdx}>
              {/* Phase boundary label */}
              {phaseName && (
                <div className="flex items-center gap-2 py-1 mb-0.5">
                  <div className="h-px flex-1 bg-[border]" />
                  <span className="font-mono text-[11px] text-[text-tertiary] whitespace-nowrap select-none">
                    {phaseName}
                  </span>
                  <div className="h-px flex-1 bg-[border]" />
                </div>
              )}

              <div
                className="grid grid-cols-[auto_repeat(7,1fr)] gap-[3px] items-center"
                role="row"
              >
                {/* Week label */}
                <div className="w-10 max-sm:w-8 text-right pr-2">
                  <span className="font-mono text-[11px] text-[text-tertiary] select-none">
                    Wk {weekIdx + 1}
                  </span>
                </div>

                {/* Day cells */}
                {weekDays.map((day, colIdx) => {
                  if (!day) {
                    return <EmptyCell key={`empty-${weekIdx}-${colIdx}`} />
                  }

                  const isCompleted = completedDayNumbers.has(day.day_number)
                  const isCurrent = day.day_number === currentDay
                  const isUpcoming = day.day_number > currentDay

                  return (
                    <div
                      key={day.day_id}
                      className="flex items-center justify-center"
                      role="gridcell"
                    >
                      <DayCell
                        day={day}
                        isCompleted={isCompleted}
                        isCurrent={isCurrent}
                        isUpcoming={isUpcoming}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
