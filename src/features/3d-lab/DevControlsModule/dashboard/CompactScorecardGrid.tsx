'use client'

import type { ComplianceCheck } from '@/lib/pd1096/types'

// ─── Compact Scorecard Grid ────────────────────────────────────────────────
// Shows when the Detailed Scorecard section is collapsed.
// Tight 3-column grid: "AMBF ✓  TOSL ✓  BHL ✗" etc.

interface CompactScorecardGridProps {
  checks: ComplianceCheck[]
}

// Shorten common check IDs for the compact grid
const SHORT_LABELS: Record<string, string> = {
  ambf: 'AMBF',
  tosl: 'TOSL',
  isa: 'ISA',
  usa: 'USA',
  bhl: 'BHL',
  tgfa: 'TGFA',
  amvb: 'AMVB',
  ftf: 'FTF',
  closure: 'AREA',
  pso: 'PSO',
}

export function CompactScorecardGrid({ checks }: CompactScorecardGridProps) {
  return (
    <div className="grid grid-cols-3 gap-x-3 gap-y-0.5">
      {checks.map((check) => {
        const shortLabel = SHORT_LABELS[check.id] ?? check.id.toUpperCase()
        return (
          <span
            key={check.id}
            className="font-mono text-[11px]"
          >
            {shortLabel}{' '}
            <span className={check.compliant ? 'text-emerald-600' : 'text-destructive'}>
              {check.compliant ? '✓' : '✗'}
            </span>
          </span>
        )
      })}
    </div>
  )
}
