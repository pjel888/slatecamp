'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// ─── Compliance Summary ────────────────────────────────────────────────────
// Section 1 of the Output Panel — always visible, never collapses.
// Shows overall pass/violation badge + count + progress bar.
// Red left-border when violations exist.

export function ComplianceSummary() {
  const checks = useDevControlsStore((s) => s.result.checks)
  const overallCompliant = useDevControlsStore((s) => s.result.overallCompliant)

  const total = checks.length
  const passed = checks.filter((c) => c.compliant).length
  const failed = total - passed
  const ratio = total > 0 ? passed / total : 1

  return (
    <div
      className={`p-4 ${
        !overallCompliant ? 'border-l-4 border-l-destructive' : ''
      }`}
    >
      {/* Status badge */}
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Compliance Status
        </span>
        <span
          className={`rounded px-2 py-0.5 font-mono text-[9px] font-medium ${
            overallCompliant
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {overallCompliant ? 'PASS' : 'VIOLATION'}
        </span>
      </div>

      {/* Count */}
      <p className="text-sm font-medium text-foreground">
        {passed} of {total} checks pass
      </p>

      {/* Progress bar */}
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            overallCompliant ? 'bg-emerald-500' : 'bg-destructive'
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>

      {/* Violation count */}
      {failed > 0 && (
        <p className="mt-1 text-xs text-destructive">
          {failed} violation{failed > 1 ? 's' : ''} found
        </p>
      )}
    </div>
  )
}
