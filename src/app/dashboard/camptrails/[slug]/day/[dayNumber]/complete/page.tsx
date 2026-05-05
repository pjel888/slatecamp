import { notFound, redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import Link from 'next/link'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { Card } from '@/components/ui/card'
import {
  getTrailBySlug,
  getEnrollmentForTrail,
  getDayCompletionDetail,
  getScoreTrajectory,
} from '@/lib/queries/trails'
import { DayCompletionMoment } from '@/components/trails/DayCompletionMoment'
import { ScoreTrajectoryChart } from '@/components/trails/ScoreTrajectoryChart'

const DayCompletePage = async ({
  params,
}: {
  params: Promise<{ slug: string; dayNumber: string }>
}) => {
  const { slug, dayNumber: dayNumberStr } = await params
  const dayNumber = parseInt(dayNumberStr, 10)
  if (isNaN(dayNumber)) notFound()

  const trail = await getTrailBySlug(slug)
  if (!trail) notFound()

  const enrollment = await getEnrollmentForTrail(trail.trail_id)
  if (!enrollment) redirect(`/dashboard/camptrails/${slug}`)

  const [completionData, scoreTrajectory] = await Promise.all([
    getDayCompletionDetail(enrollment.enrollment_id, dayNumber).catch(() => null),
    getScoreTrajectory(enrollment.enrollment_id).catch(() => []),
  ])

  if (!completionData) redirect(`/dashboard/camptrails/${slug}/today`)

  const isTrailComplete = dayNumber >= trail.duration_days

  return (
    <PracticeLayout
      hero={{
        subtitle: 'Day Complete',
        description: `${trail.name} — Day ${dayNumber} finished.`,
      }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 py-4">
        <DayCompletionMoment completionData={completionData} trailSlug={slug} />

        {scoreTrajectory.length > 1 && (
          <>
            <div className="h-px bg-border" />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-3">Score Trajectory</p>
              <ScoreTrajectoryChart data={scoreTrajectory} variant="inline" />
            </div>
          </>
        )}

        <div className="h-px bg-border" />

        {isTrailComplete ? (
          <div className="text-center">
            <h2 className="text-xl font-bold text-text-primary mb-2">{trail.name} complete.</h2>
            <p className="text-sm text-text-secondary mb-4">{trail.duration_days} days of structured study — finished.</p>
            <div className="flex flex-col items-center gap-3">
              <Link href={`/dashboard/camptrails/${slug}`} className="px-5 py-2.5 rounded-sm bg-camp-cobalt text-white text-sm font-semibold transition-colors duration-150 ease-out hover:bg-primary-700">
                View Trail Summary
              </Link>
              <Link href={ROUTES.dashboard.root} className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : completionData.next_day ? (
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-text-tertiary mb-2">Tomorrow</p>
            <Card className="p-4">
              <p className="text-sm font-medium text-text-primary">
                Day {completionData.next_day.day_number} · {completionData.next_day.title}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {completionData.next_day.step_count} activities · ~{completionData.next_day.estimated_minutes} min
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Link href={`/dashboard/camptrails/${slug}/today`} className="px-4 py-2 rounded-sm bg-camp-cobalt text-white text-sm font-medium transition-colors duration-150 ease-out hover:bg-primary-700">
                  Start Day {completionData.next_day.day_number} →
                </Link>
                <Link href={ROUTES.dashboard.root} className="px-4 py-2 rounded-sm text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">
                  Back to Dashboard
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/camptrails/${slug}/today`} className="px-4 py-2 rounded-sm bg-camp-cobalt text-white text-sm font-medium transition-colors duration-150 ease-out hover:bg-primary-700">
              Continue Trail →
            </Link>
            <Link href={ROUTES.dashboard.root} className="text-sm text-text-secondary hover:text-text-primary transition-colors duration-150">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </PracticeLayout>
  )
}

export default DayCompletePage
