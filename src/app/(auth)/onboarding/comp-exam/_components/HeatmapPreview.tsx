'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import type { HeatmapSeed } from '@/lib/actions/comp-exam-onboarding'

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  red: {
    bg: 'bg-destructive/10',
    border: 'border-destructive',
    dot: 'bg-destructive',
    label: 'Needs focus',
    labelColor: 'text-destructive',
  },
  amber: {
    bg: 'bg-warning/10',
    border: 'border-warning',
    dot: 'bg-warning',
    label: 'Developing',
    labelColor: 'text-warning',
  },
  green: {
    bg: 'bg-success/10',
    border: 'border-success',
    dot: 'bg-success',
    label: 'Strong',
    labelColor: 'text-success',
  },
}

// ── Bar fill width ─────────────────────────────────────────────────────────────

const barWidth = (score: number): string => `${Math.max(2, Math.min(100, score))}%`

// ── Props ──────────────────────────────────────────────────────────────────────

interface HeatmapPreviewProps {
  seeds: HeatmapSeed[]
}

// ── Component ──────────────────────────────────────────────────────────────────

export const HeatmapPreview = ({ seeds }: HeatmapPreviewProps) => {
  const sorted = [...seeds].sort((a, b) => a.score - b.score)

  const redCount = seeds.filter(s => s.tier === 'red').length
  const amberCount = seeds.filter(s => s.tier === 'amber').length
  const greenCount = seeds.filter(s => s.tier === 'green').length

  return (
    <div className="space-y-6">
      {/* Headline */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold text-foreground">
          This is your heatmap.
        </h2>
        <p className="text-sm text-muted-foreground">
          It shows what your comp exam already found.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        {redCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            {redCount} to focus
          </span>
        )}
        {amberCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-warning" />
            {amberCount} developing
          </span>
        )}
        {greenCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            {greenCount} strong
          </span>
        )}
      </div>

      {/* Subject bars — sorted weakest first */}
      <div className="space-y-2">
        {sorted.map(seed => {
          const cfg = TIER_CONFIG[seed.tier]
          return (
            <div
              key={seed.subjectKey}
              className={[
                'rounded-md border px-4 py-3 transition-colors duration-150',
                cfg.bg,
                cfg.border,
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={['h-2 w-2 rounded-full shrink-0', cfg.dot].join(' ')} aria-hidden="true" />
                  <span className="text-sm font-medium text-foreground">{seed.subjectName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={['text-xs font-medium', cfg.labelColor].join(' ')}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{seed.score}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-card/60">
                <div
                  className={['h-1.5 rounded-full transition-all duration-300', cfg.dot].join(' ')}
                  style={{ width: barWidth(seed.score) }}
                  aria-hidden="true"
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Context copy */}
      <div className="rounded-md border border-border bg-card px-4 py-3 space-y-1">
        <p className="text-sm text-foreground font-medium">What happens next</p>
        <p className="text-sm text-muted-foreground">
          The diagnostic quiz will make this more precise. Or start studying right now — the heatmap is already your map.
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5">
        <Link
          href={`${ROUTES.dashboard.quiz}?source=comp_exam`}
          className="block w-full rounded-sm bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Open the quiz hub →
        </Link>
        <Link
          href={ROUTES.dashboard.root}
          className="block w-full rounded-sm border border-border bg-card px-4 py-2.5 text-center text-sm font-medium text-muted-foreground transition-colors duration-150 hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Start studying now
        </Link>
      </div>
    </div>
  )
}
