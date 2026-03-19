'use client'

/**
 * Study Streak Ribbon — UX Strategy Section 9
 * Shows yesterday/today/tomorrow as dot-ribbon, not a raw number.
 * "Trail Streak" — consistency building framing.
 */

interface StreakRibbonProps {
  currentStreak: number
  streakStatus: 'active' | 'at_risk' | 'broken'
}

const DOT_STATES = {
  completed: 'bg-[#2D9F6F]',      // Emerald — done
  today_done: 'bg-[#1B3FC4]',     // Cobalt — today completed
  today_pending: 'border-2 border-[#1B3FC4] bg-transparent', // Today not yet done
  at_risk: 'border-2 border-[#D4951A] bg-transparent',       // Amber — at risk
  future: 'border border-[#D4DAE3] bg-transparent',          // Grey — upcoming
  missed: 'bg-[#D4DAE3]',         // Grey — missed
}

export const StreakRibbon = ({ currentStreak, streakStatus }: StreakRibbonProps) => {
  if (currentStreak === 0 && streakStatus === 'broken') return null

  // Build 7-day ribbon: past 5 days + today + tomorrow
  const dots = Array.from({ length: 7 }).map((_, i) => {
    const dayOffset = i - 5 // -5 to +1 (yesterday...5 days ago, today, tomorrow)

    if (dayOffset < 0) {
      // Past days
      const daysAgo = Math.abs(dayOffset)
      if (daysAgo <= currentStreak) return DOT_STATES.completed
      return DOT_STATES.missed
    }

    if (dayOffset === 0) {
      // Today
      if (streakStatus === 'active') return DOT_STATES.today_done
      if (streakStatus === 'at_risk') return DOT_STATES.at_risk
      return DOT_STATES.today_pending
    }

    // Tomorrow
    return DOT_STATES.future
  })

  const streakLabel =
    streakStatus === 'active'
      ? `${currentStreak}-day streak`
      : streakStatus === 'at_risk'
        ? 'Streak paused'
        : ''

  if (!streakLabel) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {dots.map((dotClass, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full ${dotClass}`}
          />
        ))}
      </div>
      <span
        className="text-xs font-medium"
        style={{
          color: streakStatus === 'at_risk' ? '#D4951A' : '#4A5568',
        }}
      >
        {streakLabel}
      </span>
    </div>
  )
}
