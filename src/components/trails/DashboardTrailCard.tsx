'use client'

import Link from 'next/link'
import { ArrowRight, Path } from '@phosphor-icons/react'

interface DashboardTrailCardProps {
  dayNumber: number
  title: string
  estimatedMinutes: number
  trailSlug: string
  trailDurationDays?: number
  stepsCompleted?: number
  totalSteps?: number
}

export const DashboardTrailCard = ({
  dayNumber,
  title,
  estimatedMinutes,
  trailSlug,
  trailDurationDays,
  stepsCompleted = 0,
  totalSteps = 3,
}: DashboardTrailCardProps) => {
  return (
    <Link
      href={`/dashboard/camptrails/${trailSlug}/today`}
      className="block rounded-md border border-camp-cobalt bg-[#EEF2FC] p-4 transition-shadow duration-150 ease-out hover:shadow-sm"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-camp-cobalt">
            <Path size={16} weight="bold" className="text-white" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wide text-camp-cobalt">
              Today&apos;s Trail Day
            </p>
            <p className="text-sm font-semibold text-text-primary">
              Day {dayNumber}{trailDurationDays ? ` of ${trailDurationDays}` : ''}
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-camp-cobalt">
          Start <ArrowRight size={12} />
        </span>
      </div>

      <p className="text-sm text-text-primary mb-1">{title}</p>

      <div className="flex items-center gap-3 text-xs text-text-secondary">
        <span>~{estimatedMinutes} min</span>
        <span>{stepsCompleted}/{totalSteps} steps complete</span>
      </div>
    </Link>
  )
}

export const DashboardTrailPrompt = () => {
  return (
    <Link
      href="/dashboard/trails"
      className="block rounded-md border border-dashed border-border bg-[#F8F7F5] p-4 transition-shadow duration-150 ease-out hover:shadow-sm hover:border-camp-cobalt"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#EEF2FC]">
          <Path size={16} className="text-camp-cobalt" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-primary">Start Your Camp Trail</p>
          <p className="text-xs text-text-secondary">
            A structured daily study plan — so you always know what to study next.
          </p>
        </div>
      </div>
    </Link>
  )
}
