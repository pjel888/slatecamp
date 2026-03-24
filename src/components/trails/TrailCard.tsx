'use client'

import Link from 'next/link'
import { Check, Lock, ArrowRight } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/ui/progress-bar'
import { cn } from '@/lib/utils'
import type { CampTrail, TrailEnrollment } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Trail type display config                                          */
/* ------------------------------------------------------------------ */

const TRAIL_TYPE_LABELS: Record<CampTrail['trail_type'], string> = {
  time_gated: 'TIME-GATED',
  subject_mastery: 'MASTERY',
  code_deep_dive: 'DEEP DIVE',
  remediation: 'REMEDIATION',
  exam_simulation: 'EXAM SIM',
}

const TRAIL_TYPE_VARIANTS: Record<CampTrail['trail_type'], 'primary' | 'info' | 'purple' | 'warning' | 'orange'> = {
  time_gated: 'primary',
  subject_mastery: 'info',
  code_deep_dive: 'purple',
  remediation: 'warning',
  exam_simulation: 'orange',
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const truncate = (text: string, max: number): string =>
  text.length <= max ? text : `${text.slice(0, max).trimEnd()}...`

const getCardState = (
  enrollment: TrailEnrollment | null | undefined,
  isLocked: boolean,
): 'locked' | 'completed' | 'enrolled' | 'not_started' => {
  if (isLocked) return 'locked'
  if (enrollment?.status === 'completed') return 'completed'
  if (enrollment?.status === 'active' || enrollment?.status === 'paused') return 'enrolled'
  return 'not_started'
}

/* ------------------------------------------------------------------ */
/*  TrailCard                                                          */
/* ------------------------------------------------------------------ */

interface TrailCardProps {
  trail: CampTrail & { enrollment?: TrailEnrollment | null }
  isLocked: boolean
}

export const TrailCard = ({ trail, isLocked }: TrailCardProps) => {
  const state = getCardState(trail.enrollment, isLocked)
  const progressPercent =
    state === 'enrolled' && trail.enrollment
      ? Math.round((trail.enrollment.days_completed / trail.duration_days) * 100)
      : 0

  const hrsPerDay = (trail.daily_time_estimate_minutes / 60).toFixed(1)
  const href =
    state === 'locked'
      ? '/dashboard/upgrade'
      : `/dashboard/camptrails/${trail.slug}`

  const ctaLabel =
    state === 'locked'
      ? 'Upgrade to Access'
      : state === 'enrolled'
        ? 'Continue'
        : state === 'completed'
          ? 'View Trail'
          : 'View Trail'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col rounded-md border border-[#D4DAE3] bg-white transition-shadow duration-150 ease-out hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/20 focus-visible:ring-offset-2 outline-none',
        state === 'completed' && 'bg-[#EDFAF4] border-[#2D9F6F]/30',
      )}
    >
      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {/* Top row: type badge + optional lock/check */}
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant={TRAIL_TYPE_VARIANTS[trail.trail_type]}
            size="xs"
            className="font-mono text-[11px] uppercase tracking-widest"
          >
            {TRAIL_TYPE_LABELS[trail.trail_type]}
          </Badge>

          {state === 'locked' && (
            <Badge variant="warning" size="xs" pill>
              <Lock size={10} weight="bold" />
              PRO
            </Badge>
          )}

          {state === 'completed' && (
            <span className="flex items-center justify-center rounded-full bg-[#2D9F6F] p-0.5">
              <Check size={12} weight="bold" className="text-white" />
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-[#1A2332] leading-snug">
          {trail.name}
        </h3>

        {/* Description */}
        {trail.description && (
          <p className="text-xs text-[#4A5568] leading-relaxed">
            {truncate(trail.description, 120)}
          </p>
        )}

        {/* Stats */}
        <p className="mt-auto text-xs text-[#4A5568]">
          {trail.duration_days} days &middot; ~{hrsPerDay} hrs/day
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-between pt-1">
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium transition-colors duration-150',
              state === 'locked'
                ? 'text-[#D4951A]'
                : state === 'completed'
                  ? 'text-[#2D9F6F]'
                  : 'text-[#1B3FC4] group-hover:text-[#1535A8]',
            )}
          >
            {ctaLabel}
            {state === 'enrolled' && <ArrowRight size={12} weight="bold" />}
          </span>

          {state === 'enrolled' && trail.enrollment && (
            <span className="font-mono text-[11px] text-[#8896A7] tabular-nums">
              {trail.enrollment.days_completed}/{trail.duration_days}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar for enrolled state */}
      {state === 'enrolled' && (
        <div className="px-4 pb-3">
          <ProgressBar
            value={progressPercent}
            size="sm"
            variant="primary"
          />
        </div>
      )}
    </Link>
  )
}
