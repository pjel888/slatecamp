import Link from 'next/link'

/**
 * Locked Score Widget — UX Strategy Section 5b
 * Shows after free user has seen the score reveal once.
 * "N" = count of readiness_score_snapshots since score_reveal_shown_at.
 * This number increments visibly — each quiz session adds to it.
 */

interface LockedScoreWidgetProps {
  /** Number of score updates since the reveal was shown */
  updatesSinceReveal: number
}

export const LockedScoreWidget = ({ updatesSinceReveal }: LockedScoreWidgetProps) => {
  return (
    <div className="rounded-md border border-[border] bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg
          className="h-4 w-4 text-[text-tertiary]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
        <span className="text-sm font-semibold text-[text-primary]">Readiness Score</span>
      </div>
      <p className="text-sm text-[text-secondary]">
        Updated{' '}
        <span className="font-medium text-[text-primary] tabular-nums">{updatesSinceReveal}</span>
        {' '}{updatesSinceReveal === 1 ? 'time' : 'times'} since your diagnostic.
      </p>
      <Link
        href="/dashboard/upgrade"
        className="mt-3 inline-flex items-center text-sm font-medium text-[camp-cobalt] transition-colors duration-150 ease-out hover:text-[#1535A8]"
      >
        Upgrade to See Live &rarr;
      </Link>
    </div>
  )
}
