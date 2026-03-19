'use client'

import Link from 'next/link'

/**
 * Day Complete Screen — UX Strategy Section 7 (Step 5)
 *
 * "Day 14 complete. Your score moved from 62 to 64." [+2 in subtle green]
 * NOT a celebration screen. A factual acknowledgment.
 * Do NOT show: confetti, fireworks, level-up animations, XP numbers.
 */

interface NodeChange {
  nodeName: string
  previousState: 'red' | 'amber' | 'grey'
  newState: 'amber' | 'green'
}

interface DayCompleteProps {
  dayNumber: number
  trailSlug: string
  totalDays: number
  scoreBefore: number
  scoreAfter: number
  nodeChanges: NodeChange[]
  currentStreak: number
  /** Next day preview */
  nextDay?: {
    dayNumber: number
    title: string
    estimatedMinutes: number
  }
  /** Fresh Start milestone (Day 7, 14, 28) */
  milestone?: string
}

const STATE_COLORS: Record<string, string> = {
  red: '#D64545',
  amber: '#D4951A',
  green: '#2D9F6F',
  grey: '#D4DAE3',
}

export const DayComplete = ({
  dayNumber,
  trailSlug,
  totalDays,
  scoreBefore,
  scoreAfter,
  nodeChanges,
  currentStreak,
  nextDay,
  milestone,
}: DayCompleteProps) => {
  const delta = scoreAfter - scoreBefore
  const improvements = nodeChanges.filter(
    (c) =>
      (c.previousState === 'red' && (c.newState === 'amber' || c.newState === 'green')) ||
      (c.previousState === 'amber' && c.newState === 'green') ||
      (c.previousState === 'grey' && (c.newState === 'amber' || c.newState === 'green')),
  )

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      {/* Day number + title */}
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
        Day {dayNumber} of {totalDays}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold text-[#1A2332]">
        Day {dayNumber} complete.
      </h1>

      {/* Score delta */}
      {delta !== 0 && (
        <p className="mt-3 text-base text-[#4A5568]">
          Your score moved from {scoreBefore} to {scoreAfter}.{' '}
          <span
            className="font-medium"
            style={{ color: delta > 0 ? '#2D9F6F' : '#D64545' }}
          >
            {delta > 0 ? '+' : ''}{delta}
          </span>
        </p>
      )}

      {/* Node changes — the emotional payoff */}
      {improvements.length > 0 && (
        <div className="mt-4 rounded-md border border-[#D4DAE3] bg-white p-4">
          <p className="text-sm font-medium text-[#1A2332] mb-2">
            {improvements.length} {improvements.length === 1 ? 'node' : 'nodes'} improved
          </p>
          <div className="flex flex-col gap-1.5">
            {improvements.map((change) => (
              <div key={change.nodeName} className="flex items-center gap-2 text-xs">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATE_COLORS[change.previousState] }}
                />
                <span className="text-[#8896A7]">&rarr;</span>
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATE_COLORS[change.newState] }}
                />
                <span className="text-[#4A5568]">{change.nodeName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      {currentStreak > 0 && (
        <p className="mt-4 text-sm text-[#4A5568]">
          {currentStreak}-day streak
        </p>
      )}

      {/* Fresh Start milestone — Day 7, 14, 28 */}
      {milestone && (
        <div className="mt-4 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
          <p className="text-sm text-[#1A2332]">{milestone}</p>
        </div>
      )}

      {/* Next day preview */}
      {nextDay && (
        <div className="mt-6">
          <p className="text-xs text-[#8896A7] mb-1">Tomorrow</p>
          <p className="text-sm font-medium text-[#1A2332]">
            Day {nextDay.dayNumber} &mdash; {nextDay.title} &middot; {nextDay.estimatedMinutes} min
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3">
        {nextDay ? (
          <Link
            href={`/dashboard/trails/${trailSlug}/today`}
            className="inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            See Tomorrow&apos;s Trail
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-sm px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            Back to Dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
