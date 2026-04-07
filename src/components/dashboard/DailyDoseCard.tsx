'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import Link from 'next/link'
import {
  Lightning,
  Cards,
  BookOpen,
  CheckCircle,
  ArrowRight,
  SpinnerGap,
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { getTodayDose, startDoseActivity, regenerateDose } from '@/lib/actions/daily-dose/actions'
import type { StoredDose } from '@/lib/actions/daily-dose/actions'
import type { DoseActivity } from '@/lib/actions/daily-dose/generate'

// ── Activity icon map ────────────────────────────────────────────────────────

const ACTIVITY_ICON: Record<DoseActivity['type'], typeof Lightning> = {
  quiz: Lightning,
  srs_review: Cards,
  wiki: BookOpen,
}

const ACTIVITY_LABEL: Record<DoseActivity['type'], string> = {
  quiz: 'Quiz Session',
  srs_review: 'Review Cards',
  wiki: 'Wiki Reading',
}

// ── Activity href builder ────────────────────────────────────────────────────

const getActivityHref = (activity: DoseActivity): string => {
  const mode = (activity.config.mode as string) ?? 'camp'
  return `/quiz/${mode}/setup`
}

// ── Stepper dots (inline mini-stepper) ───────────────────────────────────────

const MiniStepper = ({
  total,
  completedCount,
}: {
  total: number
  completedCount: number
}) => {
  if (total <= 1) return null

  return (
    <div className="flex items-center gap-1" aria-label={`${completedCount} of ${total} activities complete`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 w-1.5 rounded-full transition-colors duration-150"
          style={{
            backgroundColor:
              i < completedCount
                ? '#2D9F6F' // Emerald — completed
                : i === completedCount
                  ? '#1B3FC4' // Cobalt — current
                  : '#D4DAE3', // Border — remaining
          }}
        />
      ))}
      <span className="ml-1 text-[11px] tabular-nums" style={{ color: '#8896A7' }}>
        {completedCount} of {total}
      </span>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

export const DailyDoseCard = () => {
  const [dose, setDose] = useState<StoredDose | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Load today's dose on mount
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const result = await getTodayDose()
        if (!cancelled) {
          setDose(result)
          // If no dose was returned (new user with no data), show time picker
          if (!result) setShowTimePicker(true)
        }
      } catch {
        // Silently handle — card will show empty state
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  // Handle time selection
  const handleTimeSelect = useCallback(
    (minutes: number) => {
      startTransition(async () => {
        try {
          const result = dose
            ? await regenerateDose(minutes)
            : await getTodayDose(minutes)
          if (result) {
            setDose(result)
            setShowTimePicker(false)
          } else {
            // No dose could be generated (new user, no data) — show a fallback
            setDose({
              id: '',
              userId: '',
              doseDate: '',
              activities: [{
                type: 'quiz',
                config: { mode: 'camp', questionCount: 10 },
                minutes: Math.min(minutes, 15),
                reason: 'Start your first practice session',
              }],
              estimatedMinutes: Math.min(minutes, 15),
              rationale: 'Welcome! Start with a quick practice session to get your baseline.',
              startedAt: null,
              completedAt: null,
              createdAt: new Date().toISOString(),
            })
            setShowTimePicker(false)
          }
        } catch (err) {
          console.error('[DailyDose] Generation failed:', err)
          // Show fallback even on error
          setShowTimePicker(false)
          setDose({
            id: '',
            userId: '',
            doseDate: '',
            activities: [{
              type: 'quiz',
              config: { mode: 'camp', questionCount: 10 },
              minutes: Math.min(minutes, 15),
              reason: 'Start a practice session',
            }],
            estimatedMinutes: Math.min(minutes, 15),
            rationale: 'Ready to practice? Start a quick Camp session.',
            startedAt: null,
            completedAt: null,
            createdAt: new Date().toISOString(),
          })
        }
      })
    },
    [dose],
  )

  // Handle starting an activity
  const handleStart = useCallback(
    async (doseId: string) => {
      await startDoseActivity(doseId)
    },
    [],
  )

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card className="border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <SpinnerGap size={16} className="animate-spin" style={{ color: '#1B3FC4' }} />
          <span className="text-sm" style={{ color: '#4A5568' }}>
            Building your daily session...
          </span>
        </div>
      </Card>
    )
  }

  // ── Completed state ───────────────────────────────────────────────────────

  if (dose?.completedAt) {
    const studiedMinutes = dose.startedAt
      ? Math.round(
          (new Date(dose.completedAt).getTime() - new Date(dose.startedAt).getTime()) /
            (1000 * 60),
        )
      : dose.estimatedMinutes

    return (
      <Card className="border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} weight="fill" style={{ color: '#2D9F6F' }} />
          <div>
            <p className="text-sm font-medium" style={{ color: '#1A2332' }}>
              Today&apos;s session complete
            </p>
            <p className="text-xs" style={{ color: '#4A5568' }}>
              You studied for {studiedMinutes} {studiedMinutes === 1 ? 'minute' : 'minutes'} today.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  // ── Time picker state (no dose yet or user wants to change) ───────────────

  if (showTimePicker || !dose) {
    return (
      <Card className="border border-border bg-card p-4">
        <div className="text-sm text-text-tertiary">Time picker unavailable (Pass 1 cleanup)</div>
      </Card>
    )
  }

  // ── Active dose state ─────────────────────────────────────────────────────

  const activities = dose.activities
  // We track completion at the dose level, not per-activity in this iteration.
  // The completedCount is 0 when started_at is null, otherwise we assume the
  // user is working through them sequentially.
  const completedCount = dose.startedAt ? 0 : 0

  return (
    <Card className="border border-border bg-white p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#1A2332' }}>
            Today&apos;s Study Plan
          </p>
          <p className="text-xs" style={{ color: '#8896A7' }}>
            ~{dose.estimatedMinutes} min &middot; {activities.length}{' '}
            {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
        <MiniStepper total={activities.length} completedCount={completedCount} />
      </div>

      {/* Rationale */}
      <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
        {dose.rationale}
      </p>

      {/* Activity list */}
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = ACTIVITY_ICON[activity.type] ?? Lightning
          const label = ACTIVITY_LABEL[activity.type] ?? 'Activity'
          const isFirst = index === 0
          const href = getActivityHref(activity)

          return (
            <div
              key={index}
              className={[
                'flex items-center justify-between rounded-md border p-3 transition-all duration-150 ease-out',
                isFirst
                  ? 'border-camp-cobalt bg-primary-50'
                  : 'border-border bg-card',
              ].join(' ')}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  size={18}
                  weight={isFirst ? 'fill' : 'regular'}
                  style={{ color: isFirst ? '#1B3FC4' : '#8896A7', flexShrink: 0 }}
                />
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: isFirst ? '#1B3FC4' : '#1A2332' }}
                  >
                    {label}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#4A5568' }}>
                    {activity.reason} &middot; ~{activity.minutes} min
                  </p>
                </div>
              </div>

              {isFirst && (
                <Link
                  href={href}
                  onClick={() => void handleStart(dose.id)}
                  className={[
                    'inline-flex items-center gap-1 rounded-sm px-3 py-1.5',
                    'text-sm font-medium text-white',
                    'transition-colors duration-150 ease-out',
                    'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
                  ].join(' ')}
                  style={{ backgroundColor: '#1B3FC4' }}
                >
                  Start
                  <ArrowRight size={14} weight="bold" />
                </Link>
              )}
            </div>
          )
        })}
      </div>

      {/* Adjust time link */}
      <button
        type="button"
        onClick={() => setShowTimePicker(true)}
        className="text-xs font-medium transition-colors duration-150 ease-out hover:underline"
        style={{ color: '#1B3FC4' }}
      >
        Adjust available time
      </button>
    </Card>
  )
}
