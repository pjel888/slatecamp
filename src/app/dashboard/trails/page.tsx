import Link from 'next/link'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { getPublishedTrails, getUserEnrollments, recommendTrail } from '@/lib/actions/trails'
import type { CampTrail, TrailEnrollment, TrailRecommendation } from '@/types/app'

const INTENSITY_COLORS: Record<string, { bg: string; text: string }> = {
  intensive: { bg: 'bg-[#FDF0F0]', text: 'text-[#D64545]' },
  accelerated: { bg: 'bg-[#FEF8ED]', text: 'text-[#D4951A]' },
  standard: { bg: 'bg-[#EEF2FC]', text: 'text-[#1B3FC4]' },
  comprehensive: { bg: 'bg-[#EDFAF4]', text: 'text-[#2D9F6F]' },
  undergraduate: { bg: 'bg-[#EDFAF4]', text: 'text-[#2D9F6F]' },
}

const TRAIL_TYPE_LABELS: Record<string, string> = {
  time_gated: 'Time-Gated',
  subject_mastery: 'Subject Mastery',
  code_deep_dive: 'Code Deep Dive',
  remediation: 'Remediation',
  exam_simulation: 'Exam Simulation',
}

const IntensityBadge = ({ intensity }: { intensity: string | null }) => {
  if (!intensity) return null
  const colors = INTENSITY_COLORS[intensity] ?? { bg: 'bg-[#EEF2FC]', text: 'text-[#1B3FC4]' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${colors.bg} ${colors.text}`}>
      {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
    </span>
  )
}

const ActiveEnrollmentCard = ({ enrollment }: { enrollment: TrailEnrollment }) => {
  const trail = enrollment.camp_trails
  if (!trail) return null

  const progressPercent = trail.duration_days > 0
    ? Math.round((enrollment.days_completed / trail.duration_days) * 100)
    : 0

  return (
    <Link
      href={`/dashboard/trails/${trail.slug}/today`}
      className="block rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-4 transition-shadow duration-150 ease-out hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-[#1A2332]">Your Active Trail</h3>
        <span className="text-xs font-medium text-[#1B3FC4]">
          Continue Trail &rarr;
        </span>
      </div>
      <p className="text-sm font-medium text-[#1A2332] mb-1">{trail.name}</p>
      <div className="flex items-center gap-3 text-xs text-[#4A5568]">
        <span>Day {enrollment.current_day} of {trail.duration_days}</span>
        <span>{enrollment.days_completed} days completed</span>
      </div>
      <div className="mt-2 h-1.5 w-full rounded-sm bg-white">
        <div
          className="h-1.5 rounded-sm bg-[#1B3FC4] transition-all duration-150 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Link>
  )
}

const TrailCard = ({
  trail,
  isRecommended,
}: {
  trail: CampTrail
  isRecommended: boolean
}) => {
  const descriptionTruncated = trail.description
    ? trail.description.length > 120
      ? trail.description.slice(0, 120) + '...'
      : trail.description
    : null

  return (
    <Link
      href={`/dashboard/trails/${trail.slug}`}
      className={`block rounded-md border bg-white p-4 transition-shadow duration-150 ease-out hover:shadow-sm ${
        isRecommended ? 'border-[#E8853A]' : 'border-[#D4DAE3]'
      }`}
    >
      {isRecommended && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-[#E8853A]/10 text-[#E8853A] mb-2">
          Recommended for you
        </span>
      )}
      <h3 className="text-sm font-semibold text-[#1A2332] mb-1">{trail.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-[#4A5568]">{trail.duration_days} days</span>
        <IntensityBadge intensity={trail.intensity} />
      </div>
      {descriptionTruncated && (
        <p className="text-xs text-[#4A5568] leading-relaxed">{descriptionTruncated}</p>
      )}
    </Link>
  )
}

const TrailsPage = async () => {
  const [trails, enrollments, recommendation] = await Promise.all([
    getPublishedTrails(),
    getUserEnrollments(),
    recommendTrail(),
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

  return (
    <SharedPageLayout>
      <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1A2332]">Camp Trails</h1>
        </div>

        {activeEnrollment && (
          <ActiveEnrollmentCard enrollment={activeEnrollment} />
        )}

        {recommendation && !activeEnrollment && (
          <div className="rounded-md border border-[#E8853A] bg-[#E8853A]/5 p-4">
            <p className="text-sm font-medium text-[#1A2332] mb-1">
              Trail recommendation
            </p>
            <p className="text-xs text-[#4A5568]">{recommendation.reasoning}</p>
            <p className="text-xs text-[#8896A7] mt-1">{recommendation.weekOnePreview}</p>
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
                  trail={trail}
                  isRecommended={trail.trail_id === recommendedTrailId}
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

export default TrailsPage
