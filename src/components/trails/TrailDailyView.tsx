'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Brain,
  Cube,
  Check,
  Clock,
} from '@phosphor-icons/react'
import { completeStep } from '@/lib/actions/trails'
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
  if (userWindow === 'any') return steps

  const conceptSteps = steps.filter(
    (s) => s.step_type === 'wiki' || s.step_type === 'lab',
  )
  const retrievalSteps = steps.filter(
    (s) => s.step_type === 'quiz' || s.step_type === 'review',
  )

  if (userWindow === 'morning') {
    return [...retrievalSteps, ...conceptSteps]
  }

  // evening or both: new content first, retrieval after
  return [...conceptSteps, ...retrievalSteps]
}

const STEP_ICONS: Record<string, typeof BookOpen> = {
  wiki: BookOpen,
  quiz: Brain,
  lab: Cube,
  review: BookOpen,
}

const STEP_ACTION_LABELS: Record<string, string> = {
  wiki: 'Open Wiki',
  quiz: 'Start Quiz',
  lab: 'Open Lab',
  review: 'Review',
}

interface TrailDailyViewProps {
  trail: CampTrail
  enrollment: TrailEnrollment
  currentDay: TrailDay
  completedStepIds: string[]
  totalDaysCompleted: number
  userStudyWindow?: 'morning' | 'evening' | 'both' | 'any'
}

export const TrailDailyView = ({
  trail,
  enrollment,
  currentDay,
  completedStepIds,
  totalDaysCompleted,
  userStudyWindow = 'any',
}: TrailDailyViewProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const rawSteps = currentDay.steps ?? []
  const completedSet = new Set(completedStepIds)

  // Sleep-aware step ordering
  const steps = sortStepsByStudyWindow(rawSteps, userStudyWindow)

  const totalEstimatedMinutes = steps.reduce(
    (sum, step) => sum + step.estimated_minutes,
    0,
  )

  const handleStepAction = (step: TrailStep) => {
    startTransition(async () => {
      if (step.step_type === 'wiki') {
        await completeStep({
          enrollmentId: enrollment.enrollment_id,
          stepId: step.step_id,
        })
        // Navigate to wiki placeholder
        router.push('/dashboard/wiki')
        return
      }

      if (step.step_type === 'quiz') {
        // Navigate to testing hub with topic params
        const topicParam = step.target_node_ids.length > 0
          ? `?topics=${step.target_node_ids.join(',')}`
          : ''
        router.push(`/dashboard/review${topicParam}`)
        return
      }

      if (step.step_type === 'lab') {
        await completeStep({
          enrollmentId: enrollment.enrollment_id,
          stepId: step.step_id,
        })
        router.push('/dashboard/3d-lab')
        return
      }

      // review or other
      await completeStep({
        enrollmentId: enrollment.enrollment_id,
        stepId: step.step_id,
      })
      router.refresh()
    })
  }

  // Detect missed day: current_day > days_completed + 1 means days were skipped
  const hasMissedDay = enrollment.current_day > (totalDaysCompleted + 1)
  const missedDayNumber = enrollment.current_day - 1

  return (
    <div className="flex flex-col gap-5">
      {/* Missed day recovery — UX Strategy Section 7 (Alt Path M1) */}
      {hasMissedDay && (
        <div className="rounded-md border border-[#D4951A] bg-[#FEF8ED] p-4">
          <p className="text-sm text-[#1A2332]">
            You missed Day {missedDayNumber}. Pick it up today, or skip ahead to Day {enrollment.current_day}.
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/dashboard/camptrails/${trail.slug}/today`)}
              className="text-xs font-medium text-[#D4951A] hover:text-[#9A6510] transition-colors duration-150"
            >
              Continue with Day {enrollment.current_day}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <p className="text-xs font-medium text-[#8896A7] uppercase tracking-wide mb-1">
          Your Camp Trail
        </p>
        <h1 className="text-xl font-bold text-[#1A2332]">
          Day {currentDay.day_number} of {trail.duration_days}
        </h1>
        <p className="text-base font-semibold text-[#1A2332] mt-1">
          {currentDay.title}
        </p>
        {currentDay.description && (
          <p className="text-sm text-[#4A5568] mt-1">{currentDay.description}</p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#D4DAE3]" />

      {/* Step list */}
      <div className="flex flex-col gap-2">
        {steps.map((step) => {
          const isCompleted = completedSet.has(step.step_id)
          const StepIcon = STEP_ICONS[step.step_type] ?? BookOpen
          const actionLabel = STEP_ACTION_LABELS[step.step_type] ?? 'Open'

          return (
            <div
              key={step.step_id}
              className={`rounded-md border bg-white p-3 transition-shadow duration-150 ease-out ${
                isCompleted ? 'border-[#D4DAE3] opacity-60' : 'border-[#D4DAE3]'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center ${
                    isCompleted
                      ? 'bg-[#2D9F6F] border-[#2D9F6F]'
                      : 'border-[#D4DAE3]'
                  }`}
                >
                  {isCompleted && <Check size={12} weight="bold" className="text-white" />}
                </div>

                {/* Icon */}
                <StepIcon
                  size={18}
                  className={isCompleted ? 'text-[#8896A7]' : 'text-[#1B3FC4]'}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'line-through text-[#8896A7]'
                          : 'text-[#1A2332]'
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.is_optional && (
                      <span className="text-[11px] text-[#8896A7] bg-[#F5F5F5] px-1.5 py-0.5 rounded-sm">
                        Optional
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-[#8896A7]" />
                    <span className="text-xs text-[#8896A7]">
                      ~{step.estimated_minutes} min
                    </span>
                    {/* Sleep-aware label (Walker 2017) */}
                    {userStudyWindow === 'morning' && (step.step_type === 'wiki' || step.step_type === 'lab') && (
                      <span className="text-[11px] text-[#D4951A]">Best in the evening</span>
                    )}
                    {userStudyWindow === 'evening' && (step.step_type === 'quiz' || step.step_type === 'review') && (
                      <span className="text-[11px] text-[#D4951A]">Best in the morning</span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => handleStepAction(step)}
                    disabled={isPending}
                    className="flex-shrink-0 px-3 py-1.5 rounded-sm bg-[#EEF2FC] text-[#1B3FC4] text-xs font-medium transition-colors duration-150 ease-out hover:bg-[#1B3FC4] hover:text-white disabled:opacity-50"
                  >
                    {actionLabel} &rarr;
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Day progress bar — UX Strategy: "0/3 → 1/3 → 2/3 → Day Complete" */}
      {(() => {
        const requiredSteps = steps.filter((s) => !s.is_optional)
        const completedCount = requiredSteps.filter((s) => completedSet.has(s.step_id)).length
        const totalRequired = requiredSteps.length
        const percent = totalRequired > 0 ? Math.round((completedCount / totalRequired) * 100) : 0
        return (
          <div className="rounded-md border border-[#D4DAE3] bg-[#F5F5F5] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#4A5568]">
                Day progress: {completedCount}/{totalRequired} complete
              </span>
              <span className="text-xs text-[#8896A7]">
                ~{totalEstimatedMinutes} min total
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#EEF2FC]">
              <div
                className="h-1.5 rounded-full bg-[#1B3FC4] transition-all duration-150 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      })()}

      {/* Trail-level footer */}
      <div className="text-center text-xs text-[#8896A7]">
        {totalDaysCompleted} of {trail.duration_days} trail days completed
      </div>
    </div>
  )
}
