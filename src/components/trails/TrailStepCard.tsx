'use client'

/**
 * TrailStepCard — Client Component
 *
 * The atomic unit of the Camp Trail day view. Renders a single step
 * with its type badge, title, time estimate, sleep-aware label,
 * blindspot priority flag, taxonomy coverage, and CTA button.
 *
 * Supports three visual states: pending, complete, and optional+pending.
 */

import { useRouter } from 'next/navigation'
import { Check, Clock } from '@phosphor-icons/react/dist/ssr'
import { SleepAwareLabel } from '@/components/trails/SleepAwareLabel'
import { BlindspotPriorityFlag } from '@/components/trails/BlindspotPriorityFlag'
import { STEP_TYPE_CONFIG } from '@/types/app'
import type { TrailStep, TrailStepType } from '@/types/app'

interface TrailStepCardProps {
  step: TrailStep & { is_completed: boolean }
  enrollmentId: string
  trailSlug: string
  onComplete: (stepId: string) => void
  isPending?: boolean
  blindspotFlagged?: boolean
  userStudyWindow?: 'morning' | 'evening' | 'both' | 'any'
}

const CTA_ROUTES: Record<TrailStepType, (nodeIds: string[]) => string> = {
  wiki: () => '/dashboard/wiki',
  quiz: (nodeIds) => `/dashboard/testing/camp/setup`,
  lab: () => '/dashboard/3d-lab',
  review: (nodeIds) => `/dashboard/testing/camp/setup`,
}

const TrailStepCard = ({
  step,
  enrollmentId,
  trailSlug,
  onComplete,
  isPending = false,
  blindspotFlagged = false,
  userStudyWindow = 'any',
}: TrailStepCardProps) => {
  const router = useRouter()
  const config = STEP_TYPE_CONFIG[step.step_type]
  const isCompleted = step.is_completed

  // Derive preferred time from step data for the sleep-aware label
  const preferredTime = (step.preferred_time === 'morning' || step.preferred_time === 'evening')
    ? step.preferred_time
    : 'any' as const

  // Container border/bg classes based on state
  const containerClasses = isCompleted
    ? 'border-emerald bg-success-50'
    : step.is_optional
      ? 'border-dashed border-border opacity-75'
      : 'border-border bg-white'

  const handleCTA = () => {
    if (isCompleted || isPending) return

    // For wiki and lab, mark complete via callback before navigating
    if (step.step_type === 'wiki' || step.step_type === 'lab') {
      onComplete(step.step_id)
    }

    const route = CTA_ROUTES[step.step_type](step.target_node_ids)
    router.push(route)
  }

  return (
    <div
      className={`rounded-md border p-4 transition-shadow duration-150 ease-out hover:shadow-sm ${containerClasses}`}
    >
      {/* 1. Step type row */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none" aria-hidden="true">{config.icon}</span>
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
          {config.label}
        </span>
        {step.is_optional && (
          <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-[11px] text-text-tertiary">
            Optional
          </span>
        )}
      </div>

      {/* 2. Step title */}
      <h3 className="mt-2 text-sm font-semibold text-text-primary">
        {step.title}
      </h3>

      {/* 3. Time estimate + SleepAwareLabel */}
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-text-tertiary" />
          <span className="text-[11px] text-text-tertiary">
            ~{step.estimated_minutes} min
          </span>
        </div>
        <SleepAwareLabel
          preferredTime={preferredTime}
          userStudyWindow={userStudyWindow}
        />
      </div>

      {/* 4. BlindspotPriorityFlag */}
      {blindspotFlagged && (
        <div className="mt-3">
          <BlindspotPriorityFlag flaggedNodeCount={step.target_node_ids.length} />
        </div>
      )}

      {/* 5. Taxonomy coverage */}
      {step.target_node_ids.length > 0 && (
        <p className="mt-2 hidden text-[11px] text-text-tertiary sm:block">
          Covers {step.target_node_ids.length} taxonomy node{step.target_node_ids.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* 6. Computation-heavy indicator */}
      {step.is_computation_heavy && (
        <p className="mt-2 text-xs text-camp-orange">
          &#9201; This session involves calculations — budget extra time.
        </p>
      )}

      {/* 7. CTA / completion indicator */}
      <div className="mt-3">
        {isCompleted ? (
          <div className="flex items-center gap-1.5">
            <Check size={16} weight="bold" className="text-emerald" />
            <span className="text-sm font-medium text-emerald">Complete</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCTA}
            disabled={isPending}
            className="rounded-sm bg-primary-50 px-4 py-2 text-sm font-medium text-camp-cobalt transition-colors duration-150 hover:bg-camp-cobalt hover:text-white disabled:opacity-50"
          >
            {config.cta}
          </button>
        )}
      </div>
    </div>
  )
}

export { TrailStepCard }
export type { TrailStepCardProps }
