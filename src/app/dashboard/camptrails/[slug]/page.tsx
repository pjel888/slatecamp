import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { ROUTES } from '@/lib/routes'
import {
  getTrailBySlug,
  getTrailDays,
  getEnrollmentForTrail,
  getFullDayCompletions,
  recommendTrail,
} from '@/lib/queries/trails'
import { TrailPhaseMap } from '@/components/trails/TrailPhaseMap'
import { TrailDetailEnroll } from '@/components/trails/TrailDetailEnroll'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'

const INTENSITY_LABELS: Record<string, string> = {
  intensive: 'Intensive',
  accelerated: 'Accelerated',
  standard: 'Standard',
  comprehensive: 'Comprehensive',
  undergraduate: 'Undergraduate',
}

const TrailDetailPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  const trail = await getTrailBySlug(slug)
  if (!trail) notFound()

  const [days, enrollment, recommendation] = await Promise.all([
    getTrailDays(trail.trail_id),
    getEnrollmentForTrail(trail.trail_id),
    recommendTrail().catch(() => null),
  ])

  const completions = enrollment
    ? await getFullDayCompletions(enrollment.enrollment_id).catch(() => [])
    : []

  const totalSteps = days.reduce((sum, d) => sum + (d.steps?.length ?? 0), 0)
  const weekGroups = days.reduce<Record<number, typeof days>>((acc, day) => {
    const week = Math.ceil(day.day_number / 7)
    if (!acc[week]) acc[week] = []
    acc[week].push(day)
    return acc
  }, {})

  const rationale = recommendation?.trail.trail_id === trail.trail_id
    ? recommendation.reasoning
    : null

  return (
    <PracticeLayout
      hero={{
        subtitle: trail.name,
        description: trail.description ?? undefined,
        metadata: (
          <span className="font-dm-mono text-[11px] text-text-tertiary tabular-nums">
            {trail.duration_days} days · ~{Math.round(trail.daily_time_estimate_minutes / 60 * 10) / 10} hrs/day
            {trail.intensity && ` · ${INTENSITY_LABELS[trail.intensity] ?? trail.intensity}`}
            {' · '}{totalSteps} activities
          </span>
        ),
      }}
    >
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
        <Link
          href={ROUTES.dashboard.camptrails}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 w-fit"
        >
          <ArrowLeft size={14} />
          Back to Trails
        </Link>

        <TrailDetailEnroll trail={trail} enrollment={enrollment} />

        {rationale && (
          <p className="text-sm italic text-text-secondary">{rationale}</p>
        )}

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-3">
            Trail Overview
          </p>
          <TrailPhaseMap
            days={days}
            enrollment={enrollment ?? undefined}
            completions={completions}
          />
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-3">
            Week-by-Week Preview
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(weekGroups).map(([weekStr, weekDays]) => {
              const week = Number(weekStr)
              const weekStepCount = weekDays.reduce((sum, d) => sum + (d.steps?.length ?? 0), 0)
              const subjectFocuses = [...new Set(weekDays.map((d) => d.subject_focus).filter(Boolean))]

              return (
                <details key={week} className="group rounded-md border border-border bg-white overflow-hidden" open={week === 1}>
                  <summary className="flex items-center justify-between w-full px-4 py-3 cursor-pointer transition-colors duration-150 ease-out hover:bg-surface-light list-none">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">Week {week}</span>
                      {subjectFocuses.length > 0 && (
                        <span className="text-xs text-text-tertiary">{subjectFocuses.join(', ')}</span>
                      )}
                    </div>
                    <span className="text-xs text-text-tertiary">
                      {weekDays.length} days · {weekStepCount} activities
                    </span>
                  </summary>
                  <div className="border-t border-border px-4 py-2">
                    {weekDays.map((day) => (
                      <div key={day.day_id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-text-tertiary w-12">Day {day.day_number}</span>
                          <span className="text-sm text-text-primary">{day.title}</span>
                          {day.is_rest_day && (
                            <span className="text-[11px] text-text-tertiary bg-muted px-1.5 py-0.5 rounded-sm">Rest</span>
                          )}
                        </div>
                        <span className="text-xs text-text-tertiary">
                          {day.is_rest_day ? '—' : `${day.steps?.length ?? 0} steps · ~${day.estimated_minutes}m`}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )
            })}
          </div>
        </div>

        <TrailDetailEnroll trail={trail} enrollment={enrollment} />
      </div>
    </PracticeLayout>
  )
}

export default TrailDetailPage
