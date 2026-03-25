'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CaretDown, CaretRight, Clock, Fire, ListChecks } from '@phosphor-icons/react/dist/ssr'
import { enrollInTrail } from '@/lib/actions/trails'
import type { CampTrail, TrailDay, TrailEnrollment } from '@/types/app'
import { Card } from '@/components/ui/card'

const INTENSITY_COLORS: Record<string, { bg: string; text: string }> = {
  intensive: { bg: 'bg-destructive-50', text: 'text-destructive' },
  accelerated: { bg: 'bg-warning-50', text: 'text-warning' },
  standard: { bg: 'bg-primary-50', text: 'text-camp-cobalt' },
  comprehensive: { bg: 'bg-success-50', text: 'text-emerald' },
  undergraduate: { bg: 'bg-success-50', text: 'text-emerald' },
}

const groupDaysByWeek = (days: TrailDay[]): Record<number, TrailDay[]> => {
  return days.reduce<Record<number, TrailDay[]>>((acc, day) => {
    const week = Math.ceil(day.day_number / 7)
    if (!acc[week]) acc[week] = []
    acc[week].push(day)
    return acc
  }, {})
}

interface TrailDetailProps {
  trail: CampTrail
  days: TrailDay[]
  enrollment: TrailEnrollment | null
}

export const TrailDetail = ({ trail, days, enrollment }: TrailDetailProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]))

  const weekGroups = groupDaysByWeek(days)
  const totalSteps = days.reduce((sum, d) => sum + (d.steps?.length ?? 0), 0)

  const intensityColors = trail.intensity
    ? INTENSITY_COLORS[trail.intensity] ?? { bg: 'bg-primary-50', text: 'text-camp-cobalt' }
    : null

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(week)) {
        next.delete(week)
      } else {
        next.add(week)
      }
      return next
    })
  }

  const handleEnroll = () => {
    startTransition(async () => {
      await enrollInTrail(trail.trail_id)
      router.push(`/dashboard/camptrails/${trail.slug}/today`)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">{trail.name}</h1>
        {trail.description && (
          <p className="text-sm text-text-secondary leading-relaxed">{trail.description}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <Clock size={16} className="text-text-tertiary" />
          <span>{trail.duration_days} days</span>
        </div>
        {intensityColors && (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium ${intensityColors.bg} ${intensityColors.text}`}>
            <Fire size={12} />
            {trail.intensity!.charAt(0).toUpperCase() + trail.intensity!.slice(1)}
          </span>
        )}
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <ListChecks size={16} className="text-text-tertiary" />
          <span>{totalSteps} steps</span>
        </div>
      </div>

      {/* CTA */}
      <Card className="p-4">
        {enrollment ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Day {enrollment.current_day} of {trail.duration_days}
              </p>
              <p className="text-xs text-text-secondary">
                {enrollment.days_completed} days completed
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push(`/dashboard/camptrails/${trail.slug}/today`)}
              className="px-4 py-2 rounded-sm bg-camp-cobalt text-white text-sm font-medium transition-colors duration-150 ease-out hover:bg-primary-700"
            >
              Continue Trail &rarr;
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Ready to start? This trail takes {trail.duration_days} days to complete.
            </p>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={isPending}
              className="px-4 py-2 rounded-sm bg-camp-cobalt text-white text-sm font-medium transition-colors duration-150 ease-out hover:bg-primary-700 disabled:opacity-50"
            >
              {isPending ? 'Starting...' : 'Start This Trail \u2192'}
            </button>
          </div>
        )}
      </Card>

      {/* Week-by-week preview */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Weekly Breakdown
        </h2>
        {Object.entries(weekGroups).map(([weekStr, weekDays]) => {
          const week = Number(weekStr)
          const isExpanded = expandedWeeks.has(week)
          const weekStepCount = weekDays.reduce(
            (sum, d) => sum + (d.steps?.length ?? 0),
            0,
          )

          return (
            <Card
              key={week}
              className="overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleWeek(week)}
                className="flex items-center justify-between w-full px-4 py-3 text-left transition-colors duration-150 ease-out hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <CaretDown size={14} className="text-text-tertiary" />
                  ) : (
                    <CaretRight size={14} className="text-text-tertiary" />
                  )}
                  <span className="text-sm font-medium text-text-primary">
                    Week {week}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {weekDays.length} days, {weekStepCount} steps
                  </span>
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-border px-4 py-2">
                  {weekDays.map((day) => (
                    <div
                      key={day.day_id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-tertiary w-12">
                          Day {day.day_number}
                        </span>
                        <span className="text-sm text-text-primary">{day.title}</span>
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {day.steps?.length ?? 0} steps
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
