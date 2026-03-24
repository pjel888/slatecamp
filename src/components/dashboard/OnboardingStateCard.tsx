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
        className="block rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#1B3FC4]">
          Get started
        </p>
        <p className="mt-2 text-base font-semibold text-[#1A2332]">
          {assessmentProgress && assessmentProgress > 0
            ? `Your score is ${assessmentProgress}% complete. Pick up where you left off.`
            : 'Start your diagnostic — 35 questions, ~20 min'}
        </p>
        <p className="mt-1 text-sm text-[#4A5568]">
          Your Readiness Score tells you exactly where you stand across all ALE subjects.
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[#1B3FC4]">
          {assessmentProgress && assessmentProgress > 0 ? 'Continue Assessment' : 'Start Assessment'} &rarr;
        </span>
      </Link>
    )
  }

  if (state === 'needs_score_reveal') {
    return (
      <Link
        href="/dashboard/score-reveal"
        className="block rounded-md border border-[#E8853A] bg-[#E8853A]/5 p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#E8853A]">
          Score ready
        </p>
        <p className="mt-2 text-base font-semibold text-[#1A2332]">
          Your Readiness Score is ready. See where you stand.
        </p>
        <p className="mt-1 text-sm text-[#4A5568]">
          35 questions analyzed. One number that shows exactly where to focus.
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[#E8853A]">
          See Your Score &rarr;
        </span>
      </Link>
    )
  }

  if (state === 'needs_trail') {
    return (
      <Link
        href="/dashboard/trails"
        className="block rounded-md border border-[#2D9F6F] bg-[#EDFAF4] p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#2D9F6F]">
          Trail ready
        </p>
        <p className="mt-2 text-base font-semibold text-[#1A2332]">
          Your trail is ready.{trailDay?.topGapSubject ? ` Day 1 focuses on ${trailDay.topGapSubject}.` : ''}
        </p>
        <p className="mt-1 text-sm text-[#4A5568]">
          A structured study plan built around your assessment results.
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[#2D9F6F]">
          Start Your Camp Trail &rarr;
        </span>
      </Link>
    )
  }

  if (state === 'active_trail' && trailDay) {
    return (
      <Link
        href={`/dashboard/camptrails/${trailDay.trailSlug}/today`}
        className="block rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-5 transition-shadow duration-150 ease-out hover:shadow-sm"
      >
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#1B3FC4]">
          Today&apos;s trail
        </p>
        <p className="mt-2 text-base font-semibold text-[#1A2332]">
          Day {trailDay.dayNumber} &middot; {trailDay.title}
        </p>
        <p className="mt-1 text-sm text-[#4A5568]">
          ~{trailDay.estimatedMinutes} min
        </p>
        <span className="mt-3 inline-flex items-center text-sm font-medium text-[#1B3FC4]">
          Start Day {trailDay.dayNumber} &rarr;
        </span>
      </Link>
    )
  }

  // Default: ready state (no specific action needed)
  return null
}
