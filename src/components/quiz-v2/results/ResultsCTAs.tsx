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
    router.push(`/quiz/focused/setup?source=missed&sessionId=${sessionId}`)
  }

  const handleDashboard = () => {
    router.push('/dashboard')
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
            'bg-[#1B3FC4] text-white',
            'hover:bg-[#1535A8] active:bg-[#1535A8]',
            'transition-colors duration-150 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4] focus-visible:ring-offset-2',
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
          'w-full rounded-sm px-5 py-2.5 text-sm text-[#4A5568]',
          'hover:text-[#1A2332]',
          'transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4DAE3] focus-visible:ring-offset-2',
        )}
      >
        Back to Dashboard
      </button>
    </div>
  )
}
