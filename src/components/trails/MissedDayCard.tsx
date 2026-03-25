'use client'

/**
 * MissedDayCard — Client Component
 *
 * A warm, shame-free return card for students who have been away 3+ days.
 * Follows SlateCamp voice rules: growth-framed, no broken-streak language,
 * no guilt. The copy assumes the student is welcome back unconditionally.
 */

import { useState } from 'react'
import type { TrailEnrollment } from '@/types/app'
import { CatchUpView } from '@/components/trails/CatchUpView'
import { Card } from '@/components/ui/card'

interface MissedDayCardProps {
  enrollment: TrailEnrollment
  daysSinceLastActivity: number
  onContinue?: () => void
  onViewMissed?: () => void
}

const MissedDayCard = ({
  enrollment,
  daysSinceLastActivity,
  onContinue,
  onViewMissed,
}: MissedDayCardProps) => {
  const [showCatchUp, setShowCatchUp] = useState(false)
  return (
    <Card className="p-5">
      {/* Headline — where they left off */}
      <p className="text-lg font-semibold text-text-primary">
        You left off at Day {enrollment.current_day}.
      </p>

      {/* Time away */}
      <p className="mt-1 text-sm text-text-secondary">
        {daysSinceLastActivity} day{daysSinceLastActivity !== 1 ? 's' : ''} ago.
      </p>

      {/* Encouragement — no pressure */}
      <p className="mt-1 text-sm text-text-secondary">
        Day {enrollment.current_day} is ready when you are.
      </p>

      {/* CTAs */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Primary: continue */}
        <button
          type="button"
          onClick={onContinue}
          className="rounded-sm bg-camp-cobalt px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-700"
        >
          Continue Day {enrollment.current_day} &rarr;
        </button>

        {/* Secondary: view missed */}
        <button
          type="button"
          onClick={() => {
            if (onViewMissed) {
              onViewMissed()
            } else {
              setShowCatchUp(true)
            }
          }}
          className="rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-light"
        >
          View what I missed
        </button>
      </div>

      {showCatchUp && (
        <CatchUpView
          missedDays={[]}
          open={showCatchUp}
          onOpenChange={setShowCatchUp}
          onCatchUp={() => setShowCatchUp(false)}
          onSkip={() => setShowCatchUp(false)}
        />
      )}
    </Card>
  )
}

export { MissedDayCard }
export type { MissedDayCardProps }
