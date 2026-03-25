import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getPublishedTrails, getUserEnrollments, recommendTrail } from '@/lib/queries/trails'
import type { CampTrail, TrailEnrollment } from '@/types/app'
import { RecommendedTrailCard } from '@/components/trails/RecommendedTrailCard'
import { ActiveTrailBanner } from '@/components/trails/ActiveTrailBanner'
import { TrailLibrary } from '@/components/trails/TrailLibrary'
import { MapTrifold, Compass } from '@phosphor-icons/react/dist/ssr'

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
    <SharedPageLayout>
      <div className="flex flex-col gap-8 w-full">

        {/* ─── Page Header ─── */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#534AB7] mb-1.5">
              Structured Study
            </p>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              Camp Trail
            </h1>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
              Your daily study prescription. Choose a trail calibrated to your
              exam date and gaps — then follow the map.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0 mt-1">
            <span className="font-mono text-[11px] text-text-tertiary tabular-nums">
              {trails.length} trails available
            </span>
          </div>
        </div>

        {/* ─── Hero Zone: Active Trail(s) or Recommendation ─── */}
        {/* This is the ONE thing above the fold — singular focus */}
        {hasActiveEnrollment ? (
          <div className="flex flex-col gap-3">
            {activeEnrollments.map((enrollment) => (
              <ActiveTrailBanner key={enrollment.enrollment_id} enrollment={enrollment} />
            ))}
          </div>
        ) : recommendation ? (
          <RecommendedTrailCard recommendation={recommendation} />
        ) : null}

        {/* ─── Trail Library ─── */}
        {trails.length > 0 && (
          <div>
            <div className="h-px bg-border" />
            <div className="pt-6">
              <p className="font-mono text-[11px] uppercase text-text-tertiary tracking-widest mb-4">
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

        {/* ─── Welcoming Empty State ─── */}
        {trails.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center mb-4">
              <Compass size={24} className="text-camp-cobalt" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">
              Trails are being prepared
            </h2>
            <p className="text-sm text-text-secondary max-w-md">
              Structured study paths are coming soon. In the meantime, you can
              practice with Camp Mode or explore the Wiki.
            </p>
          </div>
        )}
      </div>
    </SharedPageLayout>
  )
}

export default CampTrailsPage
