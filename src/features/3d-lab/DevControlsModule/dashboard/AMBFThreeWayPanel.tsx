'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// Three-candidate AMBF breakdown display.
// Shows bySetbacks, byPSO, byTOSL with the binding constraint highlighted.

export function AMBFThreeWayPanel() {
  const candidates = useDevControlsStore((s) => s.result.ambfCandidates)
  const tla = useDevControlsStore((s) => s.result.tla)

  const rows = [
    { label: 'By Setbacks', value: candidates.bySetbacks, binding: candidates.bindingSource === 'setback', citation: '(W−L−R)×(D−F−Rear)' },
    { label: 'By PSO', value: candidates.byPSO, binding: candidates.bindingSource === 'pso', citation: 'PSO% × TLA' },
    { label: 'By TOSL', value: candidates.byTOSL, binding: false, citation: '(1−TOSL%) × TLA ≡ PSO' },
  ]

  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        AMBF Three-Way Check
      </label>
      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between rounded-sm border px-2 py-1.5 ${
              row.binding
                ? 'border-primary bg-primary-50'
                : 'border-border bg-card'
            }`}
          >
            <div>
              <span className={`text-[10px] font-medium ${row.binding ? 'text-primary' : 'text-text-secondary'}`}>
                {row.label}
              </span>
              {row.binding && (
                <span className="ml-1.5 rounded-sm bg-primary px-1 py-0.5 text-[8px] font-medium text-white">
                  BINDING
                </span>
              )}
              <p className="font-mono text-[9px] text-muted-foreground">{row.citation}</p>
            </div>
            <span className={`font-mono text-sm font-medium ${row.binding ? 'text-primary' : 'text-foreground'}`}>
              {row.value === Infinity ? 'N/A' : `${row.value.toFixed(1)}`}
              <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">sqm</span>
            </span>
          </div>
        ))}
      </div>
      <p className="mt-1 font-mono text-[9px] text-muted-foreground">
        AMBF = min(setback, PSO) = {candidates.binding.toFixed(1)} sqm ({((candidates.binding / tla) * 100).toFixed(1)}% of TLA)
      </p>
    </div>
  )
}
