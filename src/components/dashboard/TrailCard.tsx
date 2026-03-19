import Link from 'next/link'
import type { TrailEnrollment } from '@/types/app'

interface TrailCardProps {
  enrollment: TrailEnrollment
}

const TrailCard = ({ enrollment }: TrailCardProps) => {
  const trail = enrollment.camp_trails
  if (!trail) return null

  const totalSteps = trail.total_steps ?? 0
  const estimatedMinutes = totalSteps * 5 // rough estimate per step

  return (
    <Link
      href={`/dashboard/trails/${trail.slug}/today`}
      className="block rounded-md border border-[#D4DAE3] bg-white p-3 transition-shadow duration-150 ease-out hover:shadow-sm"
    >
      <p className="text-xs font-medium text-[#8896A7] uppercase tracking-wide mb-1">
        Your Camp Trail
      </p>
      <p className="text-sm font-semibold text-[#1A2332]">
        Day {enrollment.current_day} of {trail.duration_days}
      </p>
      <p className="text-xs text-[#4A5568] mt-1">
        Today: {totalSteps > 0 ? `${totalSteps} activities` : 'Activities'} &middot; ~{estimatedMinutes} min
      </p>
      <span className="inline-block mt-2 text-xs font-medium text-[#1B3FC4]">
        Continue Trail &rarr;
      </span>
    </Link>
  )
}

export default TrailCard
