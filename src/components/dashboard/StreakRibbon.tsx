/**
 * Study Streak Ribbon — UX Strategy Section 9
 * Shows yesterday/today/tomorrow as dot-ribbon, not a raw number.
 * "Trail Streak" — consistency building framing.
 * Grace Day concept visible when at_risk.
 */

interface StreakRibbonProps {
  currentStreak: number
  streakStatus: 'active' | 'at_risk' | 'broken'
  /** Grace days remaining this week (UX Strategy: 1/week free, 2/week Pro) */
  graceDaysRemaining?: number
}

const DOT_STATES = {
  completed: 'bg-emerald',
  today_done: 'bg-camp-cobalt',
  today_pending: 'border-2 border-camp-cobalt bg-transparent',
  at_risk: 'border-2 border-warning bg-transparent',
  future: 'border border-border bg-transparent',
  missed: 'bg-border',
}

export const StreakRibbon = ({
  currentStreak,
  streakStatus,
  graceDaysRemaining,
}: StreakRibbonProps) => {
  if (currentStreak === 0 && streakStatus === 'broken') return null

  // Build 7-day ribbon: past 5 days + today + tomorrow
  const dots = Array.from({ length: 7 }).map((_, i) => {
    const dayOffset = i - 5

    if (dayOffset < 0) {
      const daysAgo = Math.abs(dayOffset)
      if (daysAgo <= currentStreak) return DOT_STATES.completed
      return DOT_STATES.missed
    }

    if (dayOffset === 0) {
      if (streakStatus === 'active') return DOT_STATES.today_done
      if (streakStatus === 'at_risk') return DOT_STATES.at_risk
      return DOT_STATES.today_pending
    }

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
        className={[
          'text-xs font-medium',
          streakStatus === 'at_risk' ? 'text-warning' : 'text-muted-foreground',
        ].join(' ')}
      >
        {streakLabel}
      </span>
      {/* Grace Day indicator — visible when streak is at risk */}
      {streakStatus === 'at_risk' && graceDaysRemaining !== undefined && graceDaysRemaining > 0 && (
        <span className="text-[11px] text-text-tertiary">
          &middot; {graceDaysRemaining} grace {graceDaysRemaining === 1 ? 'day' : 'days'} left this week
        </span>
      )}
    </div>
  )
}
