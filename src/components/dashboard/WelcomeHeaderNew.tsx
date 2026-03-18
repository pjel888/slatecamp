'use client'

import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { getReadinessLabel } from '@/lib/constants/readiness'

interface WelcomeHeaderProps {
  userName: string
  readinessScore: number
  previousScore: number | null
  examDate: string | null
  daysUntilExam: number | null
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getScoreDotColor(score: number): string {
  if (score >= 70) return '#2D9F6F'
  if (score >= 40) return '#D4951A'
  return '#D64545'
}

export function WelcomeHeaderNew({
  userName,
  readinessScore,
  previousScore,
  examDate,
  daysUntilExam,
}: WelcomeHeaderProps) {
  const greeting = useMemo(() => getGreeting(), [])
  const label = getReadinessLabel(readinessScore)
  const dotColor = getScoreDotColor(readinessScore)
  const delta = previousScore != null ? readinessScore - previousScore : null

  let deltaText = ''
  let deltaColor = '#8896A7' // Ink Tertiary
  if (delta != null && Math.abs(delta) >= 1) {
    if (delta > 0) {
      deltaText = `+${delta} since last session`
      deltaColor = '#2D9F6F' // Emerald
    } else {
      deltaText = `${delta} since last session`
      deltaColor = '#4A5568' // Ink Secondary — NOT red
    }
  } else if (delta != null) {
    deltaText = 'Holding steady'
  }

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Greeting */}
      <h1
        className="text-lg font-semibold tracking-tight"
        style={{ color: '#1A2332' }}
      >
        {greeting}, {userName}.
      </h1>

      {/* Right: Readiness pill + exam countdown */}
      <div className="flex items-center gap-3">
        {/* Readiness pill */}
        <div className="flex items-center gap-1.5 rounded-sm bg-white px-2.5 py-1 border"
          style={{ borderColor: '#D4DAE3' }}
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: dotColor }}
            aria-hidden="true"
          />
          <span
            className="font-mono text-sm font-bold tabular-nums"
            style={{ color: '#1A2332' }}
          >
            {readinessScore}
          </span>
          <span
            className="text-xs font-medium"
            style={{ color: '#4A5568' }}
          >
            {label}
          </span>
        </div>

        {/* Delta */}
        {deltaText && (
          <span
            className="text-[11px] font-medium"
            style={{ color: deltaColor }}
          >
            {deltaText}
          </span>
        )}

        {/* Exam countdown */}
        {daysUntilExam != null ? (
          <span
            className="font-dm-mono text-[11px] font-medium"
            style={{ color: '#4A5568' }}
          >
            {daysUntilExam} days until your exam
          </span>
        ) : (
          <a
            href="/dashboard/settings"
            className="text-[11px] font-medium underline underline-offset-2"
            style={{ color: '#1B3FC4' }}
          >
            Set your exam date to unlock pacing.
          </a>
        )}
      </div>
    </div>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

export function WelcomeHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-5 w-48" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-7 w-32 rounded-sm" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}
