'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle } from '@phosphor-icons/react'
import type { DoseActivity } from '@/lib/actions/daily-dose/generate'
import { ROUTES } from '@/lib/routes'

// ── Types ────────────────────────────────────────────────────────────────────

interface DoseProgressStepperProps {
  activities: DoseActivity[]
  currentIndex: number
  /** Called when the user clicks "Continue to next activity" */
  onContinue?: () => void
}

// ── Activity type labels ─────────────────────────────────────────────────────

const STEP_LABEL: Record<DoseActivity['type'], string> = {
  quiz: 'Quiz',
  srs_review: 'Review',
  wiki: 'Reading',
}

// ── Transition card shown between activities ─────────────────────────────────

const TransitionCard = ({
  nextActivity,
  nextIndex,
  total,
  onContinue,
}: {
  nextActivity: DoseActivity
  nextIndex: number
  total: number
  onContinue?: () => void
}) => {
  const label = STEP_LABEL[nextActivity.type] ?? 'Activity'
  const mode = (nextActivity.config.mode as string) ?? 'camp'
  const href = ROUTES.dashboard.quizSetup(mode)

  return (
    <div
      className="mx-auto max-w-md rounded-md border border-border bg-card p-6 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <CheckCircle size={32} weight="fill" style={{ color: 'var(--success)' }} className="mx-auto" />
      <p className="mt-3 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        Activity complete
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
        Up next: {label} ({nextIndex + 1} of {total}) &middot; ~{nextActivity.minutes} min
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
        {nextActivity.reason}
      </p>
      <Link
        href={href}
        onClick={onContinue}
        className={[
          'mt-4 inline-flex items-center gap-1.5 rounded-sm px-4 py-2',
          'text-sm font-medium text-white',
          'transition-colors duration-150 ease-out hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        ].join(' ')}
        style={{ backgroundColor: 'var(--primary)' }}
      >
        Continue
        <ArrowRight size={14} weight="bold" />
      </Link>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export const DoseProgressStepper = ({
  activities,
  currentIndex,
  onContinue,
}: DoseProgressStepperProps) => {
  const [showTransition, setShowTransition] = useState(false)

  const handleTransitionContinue = useCallback(() => {
    setShowTransition(false)
    onContinue?.()
  }, [onContinue])

  if (activities.length <= 1) return null

  // If showing transition card between activities
  if (showTransition && currentIndex + 1 < activities.length) {
    return (
      <TransitionCard
        nextActivity={activities[currentIndex + 1]}
        nextIndex={currentIndex + 1}
        total={activities.length}
        onContinue={handleTransitionContinue}
      />
    )
  }

  return (
    <div
      className="flex items-center justify-center gap-2 px-4 py-2"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={activities.length}
      aria-label={`Activity ${currentIndex + 1} of ${activities.length}`}
    >
      {activities.map((activity, i) => {
        const isCompleted = i < currentIndex
        const isCurrent = i === currentIndex
        const label = STEP_LABEL[activity.type] ?? 'Activity'

        return (
          <div key={i} className="flex items-center gap-2">
            {/* Step dot */}
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={[
                  'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-colors duration-150',
                  isCompleted
                    ? 'text-white'
                    : isCurrent
                      ? 'text-white'
                      : 'border border-border text-muted-foreground',
                ].join(' ')}
                style={{
                  backgroundColor: isCompleted
                    ? 'var(--success)' // Emerald
                    : isCurrent
                      ? 'var(--primary)' // Cobalt
                      : 'transparent',
                }}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <CheckCircle size={14} weight="fill" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{
                  color: isCompleted
                    ? 'var(--success)'
                    : isCurrent
                      ? 'var(--primary)'
                      : 'var(--muted-foreground)',
                }}
              >
                {label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {i < activities.length - 1 && (
              <div
                className="h-px w-6 sm:w-10"
                style={{
                  backgroundColor: i < currentIndex ? 'var(--success)' : 'var(--border)',
                }}
                aria-hidden="true"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
