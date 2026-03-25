'use client'

import { useEffect, useRef, useMemo } from 'react'
import type { TrailDay, TrailDayCompletion, ScorePoint } from '@/types/app'
import { SUBJECT_COLORS } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const getSubjectColor = (day: TrailDay): string =>
  day.subject_color ?? (day.subject_focus ? SUBJECT_COLORS[day.subject_focus] ?? '#D4DAE3' : '#D4DAE3')

/**
 * Build SVG path data for the score trajectory line.
 * Maps completed scores onto the ribbon coordinate space.
 */
const buildScorePath = (
  points: ScorePoint[],
  totalDays: number,
  segmentWidth: number,
  containerHeight: number,
): string => {
  if (points.length === 0) return ''

  return points
    .map((pt, i) => {
      // Center of the day segment
      const x = (pt.day_number - 1) * segmentWidth + segmentWidth / 2
      // Score 0–100 mapped to containerHeight (inverted: 0 at top)
      const y = containerHeight - (pt.score / 100) * containerHeight
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

/* ------------------------------------------------------------------ */
/*  TrailRibbon                                                        */
/* ------------------------------------------------------------------ */

interface TrailRibbonProps {
  days: TrailDay[]
  completions: TrailDayCompletion[]
  currentDay: number
  scoreTrajectory: ScorePoint[]
}

export const TrailRibbon = ({
  days,
  completions,
  currentDay,
  scoreTrajectory,
}: TrailRibbonProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  const completionSet = useMemo(
    () => new Set(completions.map((c) => c.day_number)),
    [completions],
  )

  const totalDays = days.length

  // Scroll to center "today" on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentDay])

  // SVG dimensions derived from segment count
  const segmentWidth = 20 // matches w-5 (desktop)
  const svgWidth = totalDays * segmentWidth
  const containerHeight = 80 // matches h-20

  const scorePath = useMemo(
    () => buildScorePath(scoreTrajectory, totalDays, segmentWidth, containerHeight),
    [scoreTrajectory, totalDays, segmentWidth, containerHeight],
  )

  // Threshold line y position (70% of 100 score → 30% from top)
  const thresholdY = containerHeight - (70 / 100) * containerHeight

  // Determine stroke color segments: below 70 = orange, above = emerald
  const lastScore = scoreTrajectory.length > 0 ? scoreTrajectory[scoreTrajectory.length - 1].score : 0
  const trajectoryStroke = lastScore >= 70 ? '#2D9F6F' : '#E8853A'

  if (totalDays === 0) return null

  // Empty state: Day 1 with no completions
  const isFirstDay = currentDay === 1 && completions.length === 0

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          Trail Progress
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary">
          Day {currentDay} of {totalDays}
        </span>
      </div>

      {/* Ribbon container */}
      <div
        ref={scrollRef}
        className="relative h-16 md:h-20 overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Day segments */}
        <div className="flex h-full items-end" style={{ minWidth: `${svgWidth}px` }}>
          {days.map((day) => {
            const isCompleted = completionSet.has(day.day_number)
            const isToday = day.day_number === currentDay
            const subjectColor = getSubjectColor(day)

            // Rest day: thin gap
            if (day.is_rest_day) {
              return (
                <div
                  key={day.day_id}
                  className="flex-shrink-0"
                  style={{
                    width: '2px',
                    height: '100%',
                    scrollSnapAlign: 'start',
                  }}
                />
              )
            }

            // Phase transition: taller divider with label
            if (day.is_phase_transition && day.phase_name) {
              return (
                <div
                  key={day.day_id}
                  ref={isToday ? todayRef : undefined}
                  className="relative flex flex-col items-center flex-shrink-0"
                  style={{
                    width: `${segmentWidth}px`,
                    height: '100%',
                    scrollSnapAlign: 'start',
                  }}
                >
                  <span className="font-mono text-[11px] text-text-tertiary whitespace-nowrap absolute -top-4">
                    {day.phase_name}
                  </span>
                  <div
                    className="w-px flex-1"
                    style={{ backgroundColor: '#D4DAE3' }}
                  />
                  <div
                    className="w-3.5 md:w-5 flex-shrink-0"
                    style={{
                      height: isToday ? '100%' : '85%',
                      backgroundColor: isCompleted
                        ? subjectColor
                        : isToday
                          ? '#1B3FC4'
                          : '#D4DAE3',
                      opacity: !isCompleted && !isToday ? 0.3 : 1,
                    }}
                  />
                </div>
              )
            }

            return (
              <div
                key={day.day_id}
                ref={isToday ? todayRef : undefined}
                className="relative flex flex-col items-center flex-shrink-0"
                style={{
                  width: `${segmentWidth}px`,
                  scrollSnapAlign: 'start',
                }}
              >
                {/* TODAY label */}
                {isToday && (
                  <span className="font-mono text-[11px] font-medium text-camp-cobalt absolute -top-4 whitespace-nowrap">
                    TODAY
                  </span>
                )}

                {/* Segment bar */}
                <div
                  className="w-3.5 md:w-5 transition-all duration-150 ease-out"
                  style={{
                    height: isToday ? '100%' : '85%',
                    backgroundColor: isCompleted
                      ? subjectColor
                      : isToday
                        ? '#1B3FC4'
                        : undefined,
                    // Upcoming days: subject color at 30% opacity via inline style
                    ...(!isCompleted && !isToday
                      ? {
                          backgroundColor: subjectColor,
                          opacity: 0.3,
                        }
                      : {}),
                    marginTop: 'auto',
                  }}
                >
                  {/* Subtle pulse for today — CSS custom animation */}
                  {isToday && (
                    <div
                      className="h-full w-full"
                      style={{
                        animation: 'trailPulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Score trajectory SVG overlay */}
        {scoreTrajectory.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgWidth}
            height={containerHeight}
            viewBox={`0 0 ${svgWidth} ${containerHeight}`}
            preserveAspectRatio="none"
            style={{ width: `${svgWidth}px`, height: '100%' }}
          >
            {/* Passing threshold dashed line at 70% */}
            <line
              x1={0}
              y1={thresholdY}
              x2={svgWidth}
              y2={thresholdY}
              stroke="#E63329"
              strokeWidth={1}
              strokeDasharray="4 3"
              opacity={0.6}
            />

            {/* Score trajectory path */}
            <path
              d={scorePath}
              fill="none"
              stroke={trajectoryStroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Empty state */}
      {isFirstDay && (
        <p className="text-xs text-text-secondary">
          Your trail starts here. Complete Day 1 to see your trajectory begin.
        </p>
      )}

      {/* Pulse keyframe injected via style tag (scoped) */}
      <style>{`
        @keyframes trailPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
      `}</style>
    </div>
  )
}
