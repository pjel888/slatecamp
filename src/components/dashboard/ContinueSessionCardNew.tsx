'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { InProgressSession } from '@/types/dashboard'

// ── Mode name ───────────────────────────────────────────────────────────────

const MODE_NAMES: Record<string, string> = {
  camp: 'Camp Mode',
  storm: 'Storm Mode',
  chill: 'Chill Mode',
  timed: 'Timed Quiz',
  practice: 'Practice Quiz',
  custom: 'Custom Quiz',
  blindspot: 'Focus Review',
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Component ───────────────────────────────────────────────────────────────

interface ContinueSessionCardProps {
  session: InProgressSession | null
}

/**
 * DASHBOARD: ContinueSessionCard
 * Secondary resume prompt. Only renders if an in-progress session exists.
 * Complements NextBestActionCard (which also shows resume as priority 1).
 */
export function ContinueSessionCardNew({ session }: ContinueSessionCardProps) {
  if (!session) return null

  const modeName = MODE_NAMES[session.testMode] ?? 'Quiz'
  const pct =
    session.totalQuestions > 0
      ? Math.round(((session.currentIndex) / session.totalQuestions) * 100)
      : 0

  return (
    <Card className="p-3 bg-white h-full">
      <p
        className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] mb-2"
        style={{ color: '#8896A7' }}
      >
        Open Session
      </p>

      <p
        className="text-sm font-semibold"
        style={{ color: '#1A2332' }}
      >
        {modeName} — Question {session.currentIndex + 1} of {session.totalQuestions}
      </p>

      {/* Progress bar */}
      <div className="mt-2 mb-1.5">
        <div
          className="h-1 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: '#D4DAE3' }}
        >
          <div
            className="h-full rounded-full transition-all duration-150 ease-out"
            style={{
              width: `${pct}%`,
              backgroundColor: '#1B3FC4',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-[11px]"
          style={{ color: '#8896A7' }}
        >
          Started {formatRelative(session.startedAt)}
        </span>

        <Link
          href={`/dashboard/review?session=${session.sessionId}`}
          className="inline-flex items-center justify-center h-7 px-2 text-xs font-medium rounded-sm hover:bg-muted"
          style={{ color: '#1B3FC4' }}
        >
          Continue
        </Link>
      </div>
    </Card>
  )
}

export function ContinueSessionCardSkeleton() {
  return (
    <Card className="p-3 h-full">
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-1 w-full rounded-full mb-2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-16 rounded-sm" />
      </div>
    </Card>
  )
}
