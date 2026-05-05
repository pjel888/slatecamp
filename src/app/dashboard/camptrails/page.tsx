import { PracticeLayout } from '@/components/layouts/category/PracticeLayout'
import { getPublishedTrails, getUserEnrollments, recommendTrail } from '@/lib/queries/trails'
import type { CampTrail, TrailEnrollment } from '@/types/app'
import { RecommendedTrailCard } from '@/components/trails/RecommendedTrailCard'
import { ActiveTrailBanner } from '@/components/trails/ActiveTrailBanner'
import { TrailLibrary } from '@/components/trails/TrailLibrary'
import { Compass } from '@phosphor-icons/react/dist/ssr'

const CampTrailsPage = async () => {
  const [trails, enrollments, recommendation] = await Promise.all([
    getPublishedTrails().catch(() => [] as CampTrail[]),
    getUserEnrollments().catch(() => [] as TrailEnrollment[]),
    recommendTrail().catch(() => null),
  ])

  const activeEnrollments = enrollments.filter((e) => e.status === 'active')
  const hasActiveEnrollment = activeEnrollments.length > 0
  const recommendedTrailId = recommendation?.trail.trail_id ?? null

  const enrollmentMap: Record<string, TrailEnrollment> = {}
  for (const e of enrollments) {
    enrollmentMap[e.trail_id] = e
  }

  return (
    <PracticeLayout
      hero={{
        subtitle: 'Camp Trail',
        description:
          'Daily study prescription calibrated to your exam date.',
        metadata: (
          <span className="font-dm-mono text-[11px] text-text-tertiary tabular-nums">
            {trails.length} trails available
          </span>
        ),
      }}
    >
      <div className="flex flex-col gap-8 w-full">
        {hasActiveEnrollment ? (
          <div className="flex flex-col gap-3">
            {activeEnrollments.map((enrollment) => (
              <ActiveTrailBanner key={enrollment.enrollment_id} enrollment={enrollment} />
            ))}
          </div>
        ) : recommendation ? (
          <RecommendedTrailCard recommendation={recommendation} />
        ) : null}

        {trails.length > 0 && (
          <div>
            <div className="h-px bg-border" />
            <div className="pt-6">
              <p className="font-dm-mono text-[11px] uppercase text-text-tertiary tracking-widest mb-4">
                {hasActiveEnrollment || recommendation ? 'Explore More Trails' : 'All Trails'}
              </p>
              <TrailLibrary
                trails={trails}
                enrollmentMap={enrollmentMap}
                excludeTrailId={!hasActiveEnrollment ? recommendedTrailId : null}
              />
            </div>
          </div>
        )}

        {trails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <Compass size={24} className="text-camp-cobalt" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Trails are being prepared</h2>
            <p className="text-sm text-text-secondary max-w-md">
              Structured study paths are coming soon. In the meantime, you can practice with Quiz or explore the Wiki.
            </p>
          </div>
        )}
      </div>
    </PracticeLayout>
  )
}

export default CampTrailsPage
