'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import type { HeatmapSeed } from '@/lib/actions/comp-exam-onboarding'

// ── Tier config ───────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  red: {
    bg: 'bg-[#FDF0F0]',
    border: 'border-[#D64545]',
    dot: 'bg-[#D64545]',
    label: 'Needs focus',
    labelColor: 'text-[#D64545]',
  },
  amber: {
    bg: 'bg-[#FEF8ED]',
    border: 'border-[#D4951A]',
    dot: 'bg-[#D4951A]',
    label: 'Developing',
    labelColor: 'text-[#D4951A]',
  },
  green: {
    bg: 'bg-[#EDFAF4]',
    border: 'border-[#2D9F6F]',
    dot: 'bg-[#2D9F6F]',
    label: 'Strong',
    labelColor: 'text-[#2D9F6F]',
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
        <h2 className="text-lg font-bold text-[#1A2332]">
          This is your heatmap.
        </h2>
        <p className="text-sm text-[#4A5568]">
          It shows what your comp exam already found.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-[#4A5568]">
        {redCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D64545]" />
            {redCount} to focus
          </span>
        )}
        {amberCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#D4951A]" />
            {amberCount} developing
          </span>
        )}
        {greenCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#2D9F6F]" />
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
                  <span className="text-sm font-medium text-[#1A2332]">{seed.subjectName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={['text-xs font-medium', cfg.labelColor].join(' ')}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-semibold text-[#1A2332]">{seed.score}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-white/60">
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
      <div className="rounded-md border border-[#D4DAE3] bg-white px-4 py-3 space-y-1">
        <p className="text-sm text-[#1A2332] font-medium">What happens next</p>
        <p className="text-sm text-[#4A5568]">
          The diagnostic quiz will make this more precise. Or start studying right now — the heatmap is already your map.
        </p>
      </div>

      {/* CTAs */}
      <div className="space-y-2.5">
        <Link
          href={`${ROUTES.QUIZ_V2_SETUP('diagnostic')}?source=comp_exam`}
          className="block w-full rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-center text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#1535A8] focus:outline-none focus:ring-2 focus:ring-[#1B3FC4] focus:ring-offset-2"
        >
          Run the diagnostic quiz →
        </Link>
        <Link
          href={ROUTES.DASHBOARD}
          className="block w-full rounded-sm border border-[#D4DAE3] bg-white px-4 py-2.5 text-center text-sm font-medium text-[#4A5568] transition-colors duration-150 hover:border-[#1B3FC4] hover:text-[#1B3FC4] focus:outline-none focus:ring-2 focus:ring-[#1B3FC4] focus:ring-offset-2"
        >
          Start studying now
        </Link>
      </div>
    </div>
  )
}
