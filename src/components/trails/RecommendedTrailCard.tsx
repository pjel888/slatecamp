'use client'

import Link from 'next/link'
import { Star } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { TrailRecommendation } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  RecommendedTrailCard                                               */
/*  The ONLY cobalt-filled card in the product.                        */
/* ------------------------------------------------------------------ */

interface RecommendedTrailCardProps {
  recommendation: TrailRecommendation
  /** Optional callback — when omitted the CTA links to the trail page instead. */
  onStartTrail?: () => void
  isPending?: boolean
}

export const RecommendedTrailCard = ({
  recommendation,
  onStartTrail,
  isPending = false,
}: RecommendedTrailCardProps) => {
  const { trail, reasoning, weekOnePreview, isRetaker } = recommendation
  const hrsPerDay = (trail.daily_time_estimate_minutes / 60).toFixed(1)

  const ctaClasses = cn(
    'inline-block rounded-sm bg-white px-5 py-2.5 text-sm font-semibold text-[#1B3FC4] transition-all duration-150 ease-out text-center',
    'hover:bg-white/90 active:bg-white/80 active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1B3FC4] outline-none',
    'disabled:opacity-60 disabled:pointer-events-none',
  )

  return (
    <div className="rounded-md bg-[#1B3FC4] p-5">
      {/* Star + label */}
      <div className="flex items-center gap-2 mb-3">
        <Star size={20} weight="fill" className="text-white" />
        <span className="text-[11px] font-mono uppercase tracking-widest text-white/70">
          Recommended for you
        </span>
      </div>

      {/* Trail name */}
      <h2 className="text-xl font-bold text-white leading-snug mb-2">
        {trail.name}
      </h2>

      {/* Rationale */}
      <p className="text-sm italic text-white/85 leading-relaxed mb-3">
        {reasoning}
      </p>

      {/* Retaker note */}
      {isRetaker && (
        <p className="text-sm text-white/85 mb-3">
          Your mastery data is still here. This trail builds on what you already know.
        </p>
      )}

      {/* Week 1 preview */}
      <div className="mb-4">
        <span className="text-[11px] font-mono uppercase tracking-widest text-white/70 block mb-1">
          Week 1 Preview
        </span>
        <p className="text-sm text-white/85 leading-relaxed">
          {weekOnePreview}
        </p>
      </div>

      {/* Stats row */}
      <p className="font-mono text-[11px] uppercase tracking-widest text-white/70 mb-4">
        {trail.duration_days} DAYS &middot; ~{hrsPerDay} HRS/DAY
      </p>

      {/* CTA — button when callback provided, Link otherwise */}
      {onStartTrail ? (
        <button
          type="button"
          onClick={onStartTrail}
          disabled={isPending}
          className={ctaClasses}
        >
          {isPending ? 'Starting...' : 'Start This Trail'}
        </button>
      ) : (
        <Link href={`/dashboard/camptrails/${trail.slug}`} className={ctaClasses}>
          View Trail
        </Link>
      )}
    </div>
  )
}
