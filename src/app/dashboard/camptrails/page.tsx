import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getPublishedTrails, getUserEnrollments, recommendTrail } from '@/lib/actions/trails'
import type { CampTrail, TrailEnrollment } from '@/types/app'
import { RecommendedTrailCard } from '@/components/trails/RecommendedTrailCard'
import { TrailCard } from '@/components/trails/TrailCard'
import { ActiveTrailBanner } from '@/components/trails/ActiveTrailBanner'

const TRAIL_TYPE_LABELS: Record<string, string> = {
  time_gated: 'Time-Gated Programs',
  subject_mastery: 'Subject Mastery Paths',
  code_deep_dive: 'Code Deep-Dives',
  remediation: 'Targeted Remediation',
  exam_simulation: 'Exam Simulation',
}

const CampTrailsPage = async () => {
  // Fetch data with graceful fallbacks so the page always renders
  const [trails, enrollments, recommendation] = await Promise.all([
    getPublishedTrails().catch(() => [] as CampTrail[]),
    getUserEnrollments().catch(() => [] as TrailEnrollment[]),
    recommendTrail().catch(() => null),
  ])

  const activeEnrollment = enrollments.find((e) => e.status === 'active') ?? null
  const recommendedTrailId = recommendation?.trail.trail_id ?? null

  // Group trails by trail_type
  const grouped = trails.reduce<Record<string, CampTrail[]>>((acc, trail) => {
    const key = trail.trail_type
    if (!acc[key]) acc[key] = []
    acc[key].push(trail)
    return acc
  }, {})

  // Attach enrollment to trails
  const enrollmentMap = new Map<string, TrailEnrollment>()
  for (const e of enrollments) {
    enrollmentMap.set(e.trail_id, e)
  }

  return (
    <SharedPageLayout>
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1A2332]">Camp Trails</h1>

        {/* Active enrollment banner */}
        {activeEnrollment && (
          <ActiveTrailBanner enrollment={activeEnrollment} />
        )}

        {/* Recommended trail card — always first when no active enrollment */}
        {recommendation && !activeEnrollment && (
          <div>
            <p className="font-mono text-[11px] uppercase text-[#8896A7] tracking-wide mb-2">
              Recommended for you
            </p>
            <RecommendedTrailCard recommendation={recommendation} />
          </div>
        )}

        {/* Trail library by type */}
        {Object.keys(grouped).length > 0 && (
          <div>
            <p className="font-mono text-[11px] uppercase text-[#8896A7] tracking-wide mb-3">
              {activeEnrollment || recommendation ? 'Other Trails' : 'All Trails'}
            </p>
            <div className="h-px bg-[#D4DAE3] mb-4" />
          </div>
        )}

        {Object.entries(grouped).map(([trailType, typeTrails]) => (
          <section key={trailType}>
            <h2 className="text-sm font-semibold text-[#4A5568] uppercase tracking-wide mb-3">
              {TRAIL_TYPE_LABELS[trailType] ?? trailType}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {typeTrails.map((trail) => (
                <TrailCard
                  key={trail.trail_id}
                  trail={{ ...trail, enrollment: enrollmentMap.get(trail.trail_id) ?? null }}
                  isLocked={false}
                />
              ))}
            </div>
          </section>
        ))}

        {trails.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#4A5568]">
              No trails available yet. Check back soon for structured study paths.
            </p>
          </div>
        )}
      </div>
    </SharedPageLayout>
  )
}

export default CampTrailsPage
