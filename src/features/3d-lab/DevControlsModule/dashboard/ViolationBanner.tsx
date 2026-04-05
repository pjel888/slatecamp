'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// ─── Violation Banner ──────────────────────────────────────────────────────
// Viewport overlay at bottom-left, above the KPI bar.
// Shows when overallCompliant === false. Never auto-dismisses.
// Displays the first (most severe) failing check.

export function ViolationBanner() {
  const checks = useDevControlsStore((s) => s.result.checks)
  const overallCompliant = useDevControlsStore((s) => s.result.overallCompliant)

  if (overallCompliant) return null

  const failedChecks = checks.filter((c) => !c.compliant)
  if (failedChecks.length === 0) return null

  // Show the first failing check as the primary banner
  const primary = failedChecks[0]

  return (
    <div className="absolute bottom-24 left-4 z-10 max-w-[360px] animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="rounded-lg border border-red-200 bg-red-50/90 p-3 backdrop-blur-sm">
        <div className="flex items-start gap-2">
          {/* Red dot indicator */}
          <span className="mt-0.5 size-2.5 shrink-0 rounded-full bg-destructive" />
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-medium uppercase tracking-widest text-red-900">
              {primary.label} — VIOLATION
            </p>
            <p className="mt-0.5 text-xs text-red-800">
              Required: {primary.required.toFixed(1)} {primary.unit}
              {' · '}
              Actual: {primary.actual.toFixed(1)} {primary.unit}
              {primary.excess != null && (
                <span className="font-medium"> · Excess: {primary.excess.toFixed(1)} {primary.unit}</span>
              )}
            </p>
            <p className="mt-1 font-mono text-[9px] text-red-400">
              {primary.codeReference}
            </p>
            {failedChecks.length > 1 && (
              <p className="mt-1 text-[10px] text-red-600">
                +{failedChecks.length - 1} more violation{failedChecks.length > 2 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
