import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import {
  getTrailBySlug,
  getTrailDays,
  getEnrollmentForTrail,
  getStepProgress,
  getDayCompletions,
} from '@/lib/actions/trails'
import { getStudyWindow } from '@/lib/actions/profile'
import { TrailDailyView } from '@/components/trails/TrailDailyView'

const TrailTodayPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params

  const trail = await getTrailBySlug(slug)
  if (!trail) notFound()

  const enrollment = await getEnrollmentForTrail(trail.trail_id)
  if (!enrollment) {
    redirect(`/dashboard/trails/${trail.slug}`)
  }

  const [days, stepProgress, dayCompletionIds, studyWindow] = await Promise.all([
    getTrailDays(trail.trail_id),
    getStepProgress(enrollment.enrollment_id),
    getDayCompletions(enrollment.enrollment_id),
    getStudyWindow(),
  ])

  const currentDay = days.find((d) => d.day_number === enrollment.current_day) ?? null
  if (!currentDay) notFound()

  const completedStepIds = stepProgress.map((p) => p.step_id)

  return (
    <SharedPageLayout>
      <div className="w-full max-w-3xl mx-auto">
        <TrailDailyView
          trail={trail}
          enrollment={enrollment}
          currentDay={currentDay}
          completedStepIds={completedStepIds}
          totalDaysCompleted={dayCompletionIds.length}
          userStudyWindow={studyWindow}
        />
      </div>
    </SharedPageLayout>
  )
}

export default TrailTodayPage
