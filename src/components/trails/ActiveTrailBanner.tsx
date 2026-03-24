import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/dist/ssr'
import type { TrailEnrollment } from '@/types/app'

interface ActiveTrailBannerProps {
  enrollment: TrailEnrollment
}

export const ActiveTrailBanner = ({ enrollment }: ActiveTrailBannerProps) => {
  const trail = enrollment.camp_trails
  if (!trail) return null

  const progressPercent = trail.duration_days > 0
    ? Math.round((enrollment.days_completed / trail.duration_days) * 100)
    : 0

  const hrsPerDay = (trail.daily_time_estimate_minutes / 60).toFixed(1)

  // Find today's subject focus from subjects_covered
  const subjectFocus = trail.subjects_covered?.[0] ?? 'Mixed Review'

  return (
    <Link
      href={`/dashboard/camptrails/${trail.slug}/today`}
      className="block rounded-lg border border-[#D4DAE3] border-l-[3px] border-l-[#534AB7] bg-white transition-all duration-150 ease-out hover:shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5">
        {/* Left side */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-[#534AB7]" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#534AB7]">
              Active Trail
            </span>
          </div>
          <p className="text-base font-semibold text-[#1A2332] truncate">
            {trail.name}
          </p>
          <p className="text-sm text-[#8896A7]">
            Day {enrollment.current_day} of {trail.duration_days} &middot; {subjectFocus} &middot; ~{hrsPerDay} hrs today
          </p>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <span className="font-mono text-[11px] text-[#8896A7]">
            Day {enrollment.current_day} / {trail.duration_days}
          </span>
          <div className="h-1 w-full sm:w-28 rounded-sm bg-[#D4DAE3]">
            <div
              className="h-1 rounded-sm bg-[#534AB7] transition-all duration-150 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 bg-[#534AB7] text-white rounded-md px-4 py-2 text-sm font-semibold transition-colors duration-150 hover:bg-[#463FA0]">
            Continue Today
            <ArrowRight size={14} weight="bold" />
          </span>
        </div>
      </div>
    </Link>
  )
}
