'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from '@phosphor-icons/react/dist/ssr'
import { completeStep } from '@/lib/actions/trails'
import { TrailStepCard } from '@/components/trails/TrailStepCard'
import type { CampTrail, TrailDay, TrailStep, TrailEnrollment } from '@/types/app'

/**
 * Sleep-aware step ordering (Walker 2017, Stickgold 2005):
 * Morning users: retrieval first (quiz/review), then new content (wiki/lab)
 * Evening users: new content first, then retrieval (consolidates overnight)
 */
const sortStepsByStudyWindow = (
  steps: TrailStep[],
  userWindow: 'morning' | 'evening' | 'both' | 'any',
): TrailStep[] => {
  if (userWindow === 'both' || userWindow === 'any') return steps

  const conceptSteps = steps.filter(
    (s) => s.step_type === 'wiki' || s.step_type === 'lab',
  )
  const retrievalSteps = steps.filter(
    (s) => s.step_type === 'quiz' || s.step_type === 'review',
  )

  return userWindow === 'morning'
    ? [...retrievalSteps, ...conceptSteps]
    : [...conceptSteps, ...retrievalSteps]
}

interface TrailDayViewProps {
  trail: CampTrail
  enrollment: TrailEnrollment
  currentDay: TrailDay
  completedStepIds: string[]
  userStudyWindow?: 'morning' | 'evening' | 'both' | 'any'
}

export const TrailDayView = ({
  trail,
  enrollment,
  currentDay,
  completedStepIds,
  userStudyWindow = 'any',
}: TrailDayViewProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [localCompleted, setLocalCompleted] = useState<Set<string>>(
    new Set(completedStepIds),
  )

  const rawSteps = currentDay.steps ?? []
  const steps = sortStepsByStudyWindow(rawSteps, userStudyWindow)

  const handleComplete = (stepId: string) => {
    // Optimistic update
    setLocalCompleted((prev) => new Set([...prev, stepId]))

    startTransition(async () => {
      await completeStep({
        enrollmentId: enrollment.enrollment_id,
        stepId,
      })

      // Check if all required steps are now complete
      const requiredSteps = steps.filter((s) => !s.is_optional)
      const allComplete = requiredSteps.every(
        (s) => localCompleted.has(s.step_id) || s.step_id === stepId,
      )

      if (allComplete) {
        router.push(
          `/dashboard/camptrails/${trail.slug}/day/${currentDay.day_number}/complete`,
        )
      } else {
        router.refresh()
      }
    })
  }

  // Day progress
  const requiredSteps = steps.filter((s) => !s.is_optional)
  const completedCount = requiredSteps.filter((s) => localCompleted.has(s.step_id)).length
  const totalRequired = requiredSteps.length
  const progressPercent = totalRequired > 0
    ? Math.round((completedCount / totalRequired) * 100)
    : 0

  return (
    <div className="flex flex-col gap-3">
      {/* Step cards */}
      {steps.map((step) => (
        <TrailStepCard
          key={step.step_id}
          step={{ ...step, is_completed: localCompleted.has(step.step_id) }}
          enrollmentId={enrollment.enrollment_id}
          trailSlug={trail.slug}
          onComplete={handleComplete}
          isPending={isPending}
          userStudyWindow={userStudyWindow}
        />
      ))}

      {/* Day progress bar */}
      <div className="rounded-md border border-border bg-[#F8F7F5] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary">
            Day progress: {completedCount}/{totalRequired} complete
          </span>
          {completedCount === totalRequired && totalRequired > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald">
              <Check size={12} weight="bold" />
              All steps complete
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#EEF2FC]">
          <div
            className="h-1.5 rounded-full bg-camp-cobalt transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
