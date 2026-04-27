'use client'

import { useState, useEffect, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Lightning,
  Cards,
  BookOpen,
  CheckCircle,
  ArrowRight,
  SpinnerGap,
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const TIME_BUDGET_OPTIONS = [15, 30, 45, 60]

// ── Activity href builder ────────────────────────────────────────────────────

const getActivityHref = (activity: DoseActivity): string => {
  const mode = (activity.config.mode as string) ?? 'camp'
  return `/quiz/${mode}/setup`
}

// ── Main Component ───────────────────────────────────────────────────────────

export const DailyDoseCard = () => {
  const router = useRouter()
  const [dose, setDose] = useState<StoredDose | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isTimePickerPending, setIsTimePickerPending] = useState(false)
  const [isRouteTransitionPending, startActivityTransition] = useTransition()
  const [startingDoseId, setStartingDoseId] = useState<string | null>(null)
  const [isStartingDose, setIsStartingDose] = useState(false)
  const [pendingMinutes, setPendingMinutes] = useState<number | null>(null)

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
    async (minutes: number) => {
      if (isTimePickerPending || isStartingDose || isRouteTransitionPending) return

      setIsTimePickerPending(true)
      setPendingMinutes(minutes)

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
      } finally {
        setIsTimePickerPending(false)
        setPendingMinutes(null)
      }
    },
    [dose, isRouteTransitionPending, isStartingDose, isTimePickerPending],
  )

  // Handle starting an activity
  const handleStart = useCallback(
    async (doseId: string, href: string) => {
      if (isStartingDose) return

      setIsStartingDose(true)
      setStartingDoseId(doseId || 'fallback-dose')

      try {
        if (doseId) {
          const result = await startDoseActivity(doseId)
          if (!result.success) {
            console.error('[DailyDose] Failed to mark dose as started', { doseId })
          }
        }
      } finally {
        startActivityTransition(() => {
          router.push(href)
        })
      }
    },
    [isStartingDose, router],
  )

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Card className="border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <SpinnerGap size={16} className="animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">
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
          <CheckCircle size={20} weight="fill" className="text-success" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Today&apos;s session complete
            </p>
            <p className="text-xs text-muted-foreground">
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
      <Card className="border border-border bg-card p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            Choose today&apos;s study window
          </p>
          <p className="text-xs text-muted-foreground">
            We&apos;ll tune your plan to the time you actually have right now.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TIME_BUDGET_OPTIONS.map((minutes) => {
            const isPendingOption =
              isTimePickerPending && pendingMinutes === minutes

            return (
              <Button
                key={minutes}
                type="button"
                variant={
                  dose?.estimatedMinutes === minutes && !isPendingOption
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                loading={isPendingOption}
                loadingText={`${minutes} min`}
                disabled={isTimePickerPending || isStartingDose || isRouteTransitionPending}
                onClick={() => handleTimeSelect(minutes)}
              >
                {minutes} min
              </Button>
            )
          })}
        </div>

        {dose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isTimePickerPending}
            onClick={() => setShowTimePicker(false)}
            className="justify-start px-0"
          >
            Keep current plan
          </Button>
        )}
      </Card>
    )
  }

  // ── Active dose state ─────────────────────────────────────────────────────

  const activities = dose.activities

  return (
    <Card className="border border-border bg-card p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Today&apos;s Study Plan
          </p>
          <p className="text-xs text-muted-foreground">
            ~{dose.estimatedMinutes} min &middot; {activities.length}{' '}
            {activities.length === 1 ? 'activity' : 'activities'}
          </p>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {dose.rationale}
      </p>

      {/* Activity list */}
      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = ACTIVITY_ICON[activity.type] ?? Lightning
          const label = ACTIVITY_LABEL[activity.type] ?? 'Activity'
          const isFirst = index === 0
          const href = getActivityHref(activity)
          const isStartingThisActivity =
            isFirst &&
            startingDoseId === (dose.id || 'fallback-dose') &&
            (isStartingDose || isRouteTransitionPending)

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
                  className={[
                    'shrink-0',
                    isFirst ? 'text-primary' : 'text-muted-foreground',
                  ].join(' ')}
                />
                <div className="min-w-0">
                  <p className={[
                    'text-sm font-medium truncate',
                    isFirst ? 'text-primary' : 'text-foreground',
                  ].join(' ')}>
                    {label}
                  </p>
                  <p className="text-xs truncate text-muted-foreground">
                    {activity.reason} &middot; ~{activity.minutes} min
                  </p>
                </div>
              </div>

              {isFirst && (
                <Button
                  type="button"
                  size="sm"
                  loading={isStartingThisActivity}
                  loadingText="Starting..."
                  disabled={
                    isStartingDose ||
                    isRouteTransitionPending ||
                    isTimePickerPending
                  }
                  aria-busy={isStartingThisActivity ? true : undefined}
                  onClick={() => handleStart(dose.id, href)}
                  rightIcon={
                    !isStartingThisActivity ? (
                      <ArrowRight size={14} weight="bold" />
                    ) : undefined
                  }
                >
                  Start
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Adjust time link */}
      <button
        type="button"
        onClick={() => setShowTimePicker(true)}
        disabled={isStartingDose || isRouteTransitionPending}
        aria-disabled={
          isStartingDose || isRouteTransitionPending ? true : undefined
        }
        className="text-xs font-medium text-primary transition-colors duration-150 ease-out hover:underline"
      >
        Adjust available time
      </button>
    </Card>
  )
}
