'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock, ListChecks } from '@phosphor-icons/react/dist/ssr'
import type { DayCompletionData } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Node mastery color mapping                                         */
/* ------------------------------------------------------------------ */

const NODE_DOT_COLOR: Record<string, string> = {
  grey: 'bg-border',
  red: 'bg-destructive',
  amber: 'bg-warning',
  green: 'bg-emerald',
}

/* ------------------------------------------------------------------ */
/*  DayCompletionMoment                                                */
/* ------------------------------------------------------------------ */

interface DayCompletionMomentProps {
  completionData: DayCompletionData
  trailSlug: string
}

export const DayCompletionMoment = ({
  completionData,
  trailSlug,
}: DayCompletionMomentProps) => {
  const router = useRouter()

  const {
    day_number,
    subject_focus,
    mastery_before,
    mastery_after,
    nodes_updated,
    next_day,
  } = completionData

  // Compute aggregate mastery delta
  const { avgBefore, avgAfter, delta, scenario } = useMemo(() => {
    const beforeValues = Object.values(mastery_before)
    const afterValues = Object.values(mastery_after)

    const avg = (arr: number[]) =>
      arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0

    const b = avg(beforeValues)
    const a = avg(afterValues)
    const d = a - b

    const s: 'improved' | 'unchanged' | 'dipped' =
      d > 0 ? 'improved' : d < 0 ? 'dipped' : 'unchanged'

    return { avgBefore: b, avgAfter: a, delta: d, scenario: s }
  }, [mastery_before, mastery_after])

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">
          Day {day_number} complete.
        </h2>
        {subject_focus && (
          <p className="text-lg text-text-secondary mt-1">
            {subject_focus} &mdash; covered.
          </p>
        )}
      </div>

      {/* Mastery scenario */}
      <div className="rounded-md border border-border bg-white p-4">
        {scenario === 'improved' && (
          <>
            <p className="text-sm text-text-secondary mb-3">
              Your {subject_focus ?? 'overall'} mastery moved from {avgBefore}%
              to {avgAfter}% today.
            </p>

            {/* Before / After bars */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase text-text-tertiary w-14">
                  Before
                </span>
                <div className="flex-1 h-2 rounded-full bg-primary-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-border"
                    style={{
                      width: `${avgBefore}%`,
                      transition: 'width 600ms ease-out',
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-text-tertiary w-10 text-right">
                  {avgBefore}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase text-text-tertiary w-14">
                  After
                </span>
                <div className="flex-1 h-2 rounded-full bg-primary-50 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-camp-cobalt"
                    style={{
                      width: `${avgAfter}%`,
                      transition: 'width 600ms ease-out',
                    }}
                  />
                </div>
                <span className="font-mono text-[11px] text-text-tertiary w-10 text-right">
                  {avgAfter}%
                </span>
              </div>
            </div>

            <p className="text-sm font-semibold text-camp-cobalt mt-3">
              &#9650; +{delta} points
            </p>
          </>
        )}

        {scenario === 'unchanged' && (
          <p className="text-sm text-text-secondary">
            Today&apos;s content is in progress. The heatmap updates after you
            review this again in a few days.
          </p>
        )}

        {scenario === 'dipped' && (
          <p className="text-sm text-text-secondary">
            You covered new material today. Scores often dip before they rise
            when you&apos;re learning something genuinely hard.
          </p>
        )}
      </div>

      {/* Nodes updated */}
      {nodes_updated.length > 0 && (
        <div>
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary block mb-2">
            Nodes Updated
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {nodes_updated.map((node) => (
              <div
                key={node.node_id}
                className="flex items-center gap-1"
                title={`${node.node_id}: ${node.from} → ${node.to}`}
              >
                <div
                  className={`h-3 w-3 rounded-full ${NODE_DOT_COLOR[node.from] ?? 'bg-border'}`}
                  style={{ transition: 'background-color 400ms ease-out' }}
                />
                <span className="text-[11px] text-text-tertiary">&rarr;</span>
                <div
                  className={`h-3 w-3 rounded-full ${NODE_DOT_COLOR[node.to] ?? 'bg-border'}`}
                  style={{ transition: 'background-color 400ms ease-out' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tomorrow preview */}
      {next_day && (
        <div className="rounded-md border border-border bg-surface-light p-4">
          <span className="font-mono text-[11px] uppercase tracking-wider text-text-tertiary block mb-2">
            Tomorrow
          </span>
          <p className="text-sm font-medium text-text-primary">{next_day.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <ListChecks size={14} className="text-text-tertiary" />
              {next_day.step_count} steps
            </span>
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock size={14} className="text-text-tertiary" />
              ~{next_day.estimated_minutes} min
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              router.push(`/dashboard/camptrails/${trailSlug}/today`)
            }
            className="mt-3 inline-flex items-center gap-1.5 rounded-sm bg-camp-cobalt px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary-700"
          >
            Start Day {next_day.day_number}
            <ArrowRight size={14} weight="bold" />
          </button>
        </div>
      )}

      {/* Back to Dashboard */}
      <button
        type="button"
        onClick={() => router.push('/dashboard')}
        className="self-start rounded-sm border border-border bg-transparent px-4 py-2 text-sm font-medium text-text-secondary transition-colors duration-150 ease-out hover:bg-muted"
      >
        Back to Dashboard
      </button>
    </div>
  )
}
