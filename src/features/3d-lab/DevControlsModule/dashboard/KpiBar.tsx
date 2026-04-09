'use client'

// ─── KPI Bar ───────────────────────────────────────────────────────────────
// Viewport-attached bottom bar — KPI chips only.
// Camera presets moved to shared CameraNavigationBar (rendered by ViewportWrapper).
// Always visible regardless of panel state.

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { KpiChip } from './KpiChip'

export const KpiBar = () => {
  const result = useDevControlsStore((s) => s.result)
  const overallCompliant = result.overallCompliant

  return (
    <div className="absolute inset-x-0 bottom-16 z-10 pointer-events-none">
      <div className="mx-auto flex max-w-xl flex-col items-center">
        {/* KPI chips — positioned above the shared CameraNavigationBar */}
        <div
          className="flex items-center gap-0.5 rounded-lg px-2 py-0.5 pointer-events-auto"
          style={{ backgroundColor: 'var(--viewport-overlay-bg)', backdropFilter: 'blur(8px)' }}
        >
          <KpiChip label="TLA" value={result.tla.toFixed(0)} unit="sqm" />
          <div className="h-6 w-px" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
          <KpiChip
            label="AMBF"
            value={result.ambf.toFixed(0)}
            unit="sqm"
            isViolating={!overallCompliant}
          />
          <div className="h-6 w-px" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
          <KpiChip
            label="PSO"
            value={(result.psoActual * 100).toFixed(1)}
            unit="%"
          />
          <div className="h-6 w-px" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
          <KpiChip label="TOSL" value={result.tosl.toFixed(0)} unit="sqm" />
          <div className="h-6 w-px" style={{ backgroundColor: 'var(--viewport-overlay-text)', opacity: 0.15 }} />
          <KpiChip label="BHL" value={`${result.bhlStoreys}F`} unit="" />
        </div>
      </div>
    </div>
  )
}
