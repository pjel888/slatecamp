'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultsCTAsProps {
  sessionId: string
  missedCount: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ResultsCTAs = ({ sessionId, missedCount }: ResultsCTAsProps) => {
  const router = useRouter()

  const handlePracticeMissed = () => {
    router.push(`/quiz/focus_review/setup?source=missed&sessionId=${sessionId}`)
  }

  const handleDashboard = () => {
    router.push('/dashboard/drills')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Primary: Practice missed (only shown when there are missed questions) */}
      {missedCount > 0 && (
        <button
          type="button"
          onClick={handlePracticeMissed}
          className={cn(
            'w-full rounded-sm px-5 py-3 text-sm font-semibold',
            'bg-primary text-white',
            'hover:bg-primary-700 active:bg-primary-700',
            'transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          )}
        >
          Practice {missedCount} Missed Question{missedCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Ghost: Back to dashboard */}
      <button
        type="button"
        onClick={handleDashboard}
        className={cn(
          'w-full rounded-sm px-5 py-2.5 text-sm text-text-secondary',
          'hover:text-foreground',
          'transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2',
        )}
      >
        Back to Drills
      </button>
    </div>
  )
}
