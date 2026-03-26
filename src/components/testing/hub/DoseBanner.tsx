'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Lightning, SpinnerGap } from '@phosphor-icons/react'
import { getTodayDose } from '@/lib/actions/daily-dose/actions'
import type { StoredDose } from '@/lib/actions/daily-dose/actions'
import type { DoseActivity } from '@/lib/actions/daily-dose/generate'

// ── Helpers ──────────────────────────────────────────────────────────────────

const getFirstActivityHref = (activities: DoseActivity[]): string => {
  if (activities.length === 0) return '/quiz/camp/setup'
  const mode = (activities[0].config.mode as string) ?? 'camp'
  return `/quiz/${mode}/setup`
}

const formatDaysSince = (dateStr: string): string => {
  const hours = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60)
  if (hours < 24) return 'earlier today'
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

// ── Props ────────────────────────────────────────────────────────────────────

interface DoseBannerProps {
  lastStudyDate: string | null
  targetExamDate: string | null
  weakestSubject?: string | null
}

// ── Component ────────────────────────────────────────────────────────────────

export const DoseBanner = ({
  lastStudyDate,
  targetExamDate,
  weakestSubject,
}: DoseBannerProps) => {
  const [dose, setDose] = useState<StoredDose | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const result = await getTodayDose()
        if (!cancelled) setDose(result)
      } catch {
        // Silently handle — banner simply won't show
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  // Don't render anything while loading or if dose is already completed
  if (loading) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-md border border-border bg-white p-3">
        <SpinnerGap size={14} className="animate-spin" style={{ color: '#1B3FC4' }} />
        <span className="text-xs" style={{ color: '#4A5568' }}>
          Loading your daily plan...
        </span>
      </div>
    )
  }

  if (!dose || dose.completedAt) return null

  // Build contextual headline
  const activities = dose.activities
  const headline = buildHeadline({
    lastStudyDate,
    targetExamDate,
    weakestSubject: weakestSubject ?? null,
    activities,
  })

  const href = getFirstActivityHref(activities)

  return (
    <div
      className="mb-6 flex items-center justify-between gap-3 rounded-md border border-[#1B3FC4]/20 bg-[#EEF2FC] px-4 py-3"
      role="region"
      aria-label="Daily study recommendation"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Lightning size={18} weight="fill" style={{ color: '#1B3FC4' }} className="flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: '#1A2332' }}>
            {headline}
          </p>
          <p className="text-xs truncate" style={{ color: '#4A5568' }}>
            {dose.rationale} &middot; ~{dose.estimatedMinutes} min
          </p>
        </div>
      </div>

      <Link
        href={href}
        className={[
          'inline-flex items-center gap-1 rounded-sm px-3 py-1.5 flex-shrink-0',
          'text-sm font-medium text-white',
          'transition-colors duration-150 ease-out hover:opacity-90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        ].join(' ')}
        style={{ backgroundColor: '#1B3FC4' }}
      >
        Start
        <ArrowRight size={14} weight="bold" />
      </Link>
    </div>
  )
}

// ── Headline builder ─────────────────────────────────────────────────────────

const buildHeadline = ({
  lastStudyDate,
  targetExamDate,
  weakestSubject,
  activities,
}: {
  lastStudyDate: string | null
  targetExamDate: string | null
  weakestSubject: string | null
  activities: DoseActivity[]
}): string => {
  // Priority: exam countdown
  if (targetExamDate) {
    const daysUntil = Math.ceil(
      (new Date(targetExamDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    )
    if (daysUntil > 0 && daysUntil <= 30) {
      if (weakestSubject) {
        return `${daysUntil} days to exam. Today's focus: ${weakestSubject} (your weakest area).`
      }
      return `${daysUntil} days to exam. Today's plan is ready.`
    }
  }

  // Return user — long absence
  if (lastStudyDate) {
    const hoursSince = (Date.now() - new Date(lastStudyDate).getTime()) / (1000 * 60 * 60)
    if (hoursSince >= 48) {
      const since = formatDaysSince(lastStudyDate)
      const firstActivity = activities[0]
      const hasSrs = activities.some((a) => a.type === 'srs_review')
      if (hasSrs) {
        return `Your last session was ${since}. Start with overdue review cards.`
      }
      return `Your last session was ${since}. Pick up where you left off.`
    }
  }

  // Default: focus area
  if (weakestSubject) {
    return `Today's focus: ${weakestSubject}`
  }

  return 'Your daily study plan is ready'
}
