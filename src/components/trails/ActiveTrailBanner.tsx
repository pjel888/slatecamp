'use client'

import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react'
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

  return (
    <Link
      href={`/dashboard/camptrails/${trail.slug}/today`}
      className="block rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-4 transition-shadow duration-150 ease-out hover:shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[11px] uppercase tracking-wide text-[#1B3FC4]">
          Your Active Trail
        </p>
        <span className="flex items-center gap-1 text-xs font-medium text-[#1B3FC4]">
          Continue Trail <ArrowRight size={12} />
        </span>
      </div>
      <p className="text-base font-semibold text-[#1A2332] mb-1">{trail.name}</p>
      <div className="flex items-center gap-3 text-xs text-[#4A5568]">
        <span>Day {enrollment.current_day} of {trail.duration_days}</span>
        <span>{enrollment.days_completed} days completed</span>
      </div>
      <div className="mt-2.5 h-1.5 w-full rounded-sm bg-white">
        <div
          className="h-1.5 rounded-sm bg-[#1B3FC4] transition-all duration-150 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Link>
  )
}
