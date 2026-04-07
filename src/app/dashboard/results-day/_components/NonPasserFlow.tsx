'use client'

import Link from 'next/link'

interface TopSubject {
  name: string
  score: number
}

interface NonPasserFlowProps {
  readinessScore: number | null
  topSubjects: TopSubject[]
}

const NonPasserFlow = ({ readinessScore, topSubjects }: NonPasserFlowProps) => {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      {/* Main message card */}
      <div className="rounded-md border border-border bg-card p-6">
        <p className="text-base font-semibold text-foreground">
          Your heatmap from this cycle is saved.
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          The next exam window opens registration soon. Your study trail picks
          up exactly where you left off — with everything you learned this cycle
          already accounted for.
        </p>
      </div>

      {/* Score + top subjects snapshot */}
      {(readinessScore !== null || topSubjects.length > 0) && (
        <div className="rounded-md border border-border bg-card p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            This cycle&apos;s snapshot
          </p>

          {readinessScore !== null && (
            <div className="flex items-baseline gap-2">
              <span
                className="font-mono text-3xl font-bold text-primary"
                aria-label={`Readiness score: ${readinessScore}`}
              >
                {readinessScore}
              </span>
              <span className="text-sm text-muted-foreground">readiness score</span>
            </div>
          )}

          {topSubjects.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Strongest subjects this cycle</p>
              <ul className="space-y-1.5" aria-label="Top subjects">
                {topSubjects.map((subject, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-sm border border-border px-3 py-2"
                  >
                    <span className="text-sm text-foreground truncate pr-2">
                      {subject.name}
                    </span>
                    <span className="text-sm font-semibold text-success shrink-0">
                      {subject.score}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="rounded-md border border-border bg-card p-5">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-between rounded-sm bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700"
        >
          Start Planning for Next Cycle
          <svg
            className="h-4 w-4 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          More data, better strategy. Your Camp Trail will reflect everything
          covered this cycle.
        </p>
      </div>
    </div>
  )
}

export default NonPasserFlow
