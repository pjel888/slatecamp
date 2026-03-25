import Link from 'next/link'

/**
 * Dashboard state from UX Strategy Section 7 — "Daily Launchpad"
 * Shows different primary cards based on user's onboarding progress.
 */

export type DashboardState =
  | 'needs_assessment'
  | 'needs_score_reveal'
  | 'needs_trail'
  | 'active_trail'
  | 'ready' // Has completed onboarding, no active trail but no action needed

interface OnboardingStateCardProps {
  state: DashboardState
  /** Score reveal shown_at set, free user sees it as "ready" */
  assessmentProgress?: number
  /** Trail day info for active_trail state */
  trailDay?: {
    dayNumber: number
    title: string
    estimatedMinutes: number
    trailSlug: string
    topGapSubject?: string
  }
}

export const OnboardingStateCard = ({
  state,
  assessmentProgress,
  trailDay,
}: OnboardingStateCardProps) => {
  if (state === 'needs_assessment') {
    return (
      <Link
        href="/dashboard/assessment"
        className="block rounded-md border border-[camp-cobalt] bg-[#EEF2FC] p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[camp-cobalt]">
          Get started
        </p>
        <p className="mt-2 text-base font-semibold text-[text-primary]">
          {assessmentProgress && assessmentProgress > 0
            ? `Your score is ${assessmentProgress}% complete. Pick up where you left off.`
            : 'Start your diagnostic — 35 questions, ~20 min'}
        </p>
        <p className="mt-1 text-sm text-[text-secondary]">
          Your Readiness Score tells you exactly where you stand across all ALE subjects.
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[camp-cobalt]">
          {assessmentProgress && assessmentProgress > 0 ? 'Continue Assessment' : 'Start Assessment'} &rarr;
        </span>
      </Link>
    )
  }

  if (state === 'needs_score_reveal') {
    return (
      <Link
        href="/dashboard/score-reveal"
        className="block rounded-md border border-[camp-orange] bg-[camp-orange]/5 p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[camp-orange]">
          Score ready
        </p>
        <p className="mt-2 text-base font-semibold text-[text-primary]">
          Your Readiness Score is ready. See where you stand.
        </p>
        <p className="mt-1 text-sm text-[text-secondary]">
          35 questions analyzed. One number that shows exactly where to focus.
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[camp-orange]">
          See Your Score &rarr;
        </span>
      </Link>
    )
  }

  if (state === 'needs_trail') {
    return (
      <Link
        href="/dashboard/trails"
        className="block rounded-md border border-[emerald] bg-[#EDFAF4] p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[emerald]">
          Trail ready
        </p>
        <p className="mt-2 text-base font-semibold text-[text-primary]">
          Your trail is ready.{trailDay?.topGapSubject ? ` Day 1 focuses on ${trailDay.topGapSubject}.` : ''}
        </p>
        <p className="mt-1 text-sm text-[text-secondary]">
          A structured study plan built around your assessment results.
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[emerald]">
          Start Your Camp Trail &rarr;
        </span>
      </Link>
    )
  }

  if (state === 'active_trail' && trailDay) {
    return (
      <Link
        href={`/dashboard/camptrails/${trailDay.trailSlug}/today`}
        className="block rounded-md border border-[camp-cobalt] bg-[#EEF2FC] p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[camp-cobalt]">
          Today&apos;s trail
        </p>
        <p className="mt-2 text-base font-semibold text-[text-primary]">
          Day {trailDay.dayNumber} &middot; {trailDay.title}
        </p>
        <p className="mt-1 text-sm text-[text-secondary]">
          ~{trailDay.estimatedMinutes} min
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[camp-cobalt]">
          Start Day {trailDay.dayNumber} &rarr;
        </span>
      </Link>
    )
  }

  // Default: ready state (no specific action needed)
  return null
}
