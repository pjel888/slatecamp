import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import {
  getTrailBySlug,
  getTrailDays,
  getEnrollmentForTrail,
  getStepProgress,
  getFullDayCompletions,
  getScoreTrajectory,
  getTodayNodeStates,
} from '@/lib/queries/trails'
import { getStudyWindow } from '@/lib/actions/profile'
import { TrailDayView } from '@/components/trails/TrailDayView'
import { MiniHeatmapPreview } from '@/components/trails/MiniHeatmapPreview'
import { TrailRibbon } from '@/components/trails/TrailRibbon'
import { MissedDayCard } from '@/components/trails/MissedDayCard'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'

const TrailTodayPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  const trail = await getTrailBySlug(slug)
  if (!trail) notFound()

  const enrollment = await getEnrollmentForTrail(trail.trail_id)
  if (!enrollment || enrollment.status !== 'active') {
    redirect(`/dashboard/camptrails/${trail.slug}`)
  }

  const [days, stepProgress, dayCompletions, scoreTrajectory, studyWindow] = await Promise.all([
    getTrailDays(trail.trail_id),
    getStepProgress(enrollment.enrollment_id),
    getFullDayCompletions(enrollment.enrollment_id).catch(() => []),
    getScoreTrajectory(enrollment.enrollment_id).catch(() => []),
    getStudyWindow(),
  ])

  const currentDay = days.find((d) => d.day_number === enrollment.current_day) ?? null
  if (!currentDay) notFound()

  const completedStepIds = stepProgress.map((p) => p.step_id)

  const lastActivityDate = enrollment.last_activity_at
    ? new Date(enrollment.last_activity_at)
    : new Date(enrollment.started_at)
  const daysSinceLastActivity = Math.floor(
    (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24),
  )

  const todayNodeIds = (currentDay.steps ?? []).flatMap((s) => s.target_node_ids)
  const nodeStates = todayNodeIds.length > 0
    ? await getTodayNodeStates(todayNodeIds).catch(() => [])
    : []

  const showMissedDayCard = daysSinceLastActivity >= 3

  return (
    <PracticeLayout
      hero={{
        subtitle: currentDay.title,
        description:
          `Day ${currentDay.day_number} of ${trail.duration_days} · Week ${Math.ceil(currentDay.day_number / 7)} of ${Math.ceil(trail.duration_days / 7)}${currentDay.subject_focus ? ` · ${currentDay.subject_focus}` : ''}`,
      }}
    >
      <div className="w-full max-w-3xl mx-auto flex flex-col gap-5">
        <Link
          href={`/dashboard/camptrails/${trail.slug}`}
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150 w-fit"
        >
          <ArrowLeft size={14} />
          Trail Overview
        </Link>

        {showMissedDayCard && (
          <MissedDayCard enrollment={enrollment} daysSinceLastActivity={daysSinceLastActivity} />
        )}

        <div className="h-px bg-border" />

        <TrailDayView
          trail={trail}
          enrollment={enrollment}
          currentDay={currentDay}
          completedStepIds={completedStepIds}
          userStudyWindow={studyWindow}
        />

        <div className="h-px bg-border" />

        {todayNodeIds.length > 0 && (
          <>
            <MiniHeatmapPreview
              nodeStates={nodeStates}
              targetNodeIds={todayNodeIds}
              subjectName={currentDay.subject_focus ?? 'Today\'s Topics'}
            />
            <div className="h-px bg-border" />
          </>
        )}

        <TrailRibbon
          days={days}
          completions={dayCompletions}
          currentDay={enrollment.current_day}
          scoreTrajectory={scoreTrajectory}
        />
      </div>
    </PracticeLayout>
  )
}

export default TrailTodayPage
