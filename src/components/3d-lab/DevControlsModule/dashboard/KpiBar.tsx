'use client'

// ─── KPI Bar ───────────────────────────────────────────────────────────────
// Viewport-attached bottom bar combining:
//   Row 1: 5 KPI chips (TLA, AMBF, PSO, TOSL, BHL)
//   Row 2: Camera preset buttons (reused from FloatingCameraBar)
// Always visible regardless of panel state.

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { KpiChip } from './KpiChip'
import type { CameraPreset } from '@/lib/pd1096/types'

const CAMERA_PRESETS: { value: CameraPreset; label: string }[] = [
  { value: 'perspective', label: 'Orbit' },
  { value: 'top', label: 'Plan' },
  { value: 'front', label: 'Front' },
  { value: 'iso-ne', label: 'Iso' },
]

export function KpiBar() {
  const result = useDevControlsStore((s) => s.result)
  const overallCompliant = result.overallCompliant
  const cameraPreset = useDevControlsStore((s) => s.cameraPreset)
  const setCameraPreset = useDevControlsStore((s) => s.setCameraPreset)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)

  return (
    <div className="absolute inset-x-0 bottom-0 z-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-1 pb-3">
        {/* Row 1: KPI chips */}
        <div className="flex items-center gap-0.5 rounded-lg bg-black/60 px-2 py-0.5 backdrop-blur-sm">
          <KpiChip label="TLA" value={result.tla.toFixed(0)} unit="sqm" />
          <div className="h-6 w-px bg-white/15" />
          <KpiChip
            label="AMBF"
            value={result.ambf.toFixed(0)}
            unit="sqm"
            isViolating={!overallCompliant}
          />
          <div className="h-6 w-px bg-white/15" />
          <KpiChip
            label="PSO"
            value={(result.psoActual * 100).toFixed(1)}
            unit="%"
          />
          <div className="h-6 w-px bg-white/15" />
          <KpiChip label="TOSL" value={result.tosl.toFixed(0)} unit="sqm" />
          <div className="h-6 w-px bg-white/15" />
          <KpiChip label="BHL" value={`${result.bhlStoreys}F`} unit="" />
        </div>

        {/* Row 2: Camera presets */}
        <div className="flex items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-1 backdrop-blur-sm">
          {CAMERA_PRESETS.map((p) => {
            const active = cameraPreset === p.value
            return (
              <button
                key={p.value}
                onClick={() => setCameraPreset(p.value)}
                className={`rounded-sm px-2.5 py-1 text-[10px] font-medium transition-colors duration-150 ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                }`}
              >
                {p.label}
              </button>
            )
          })}

          <div className="mx-0.5 h-4 w-px bg-white/15" />

          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`rounded-sm px-2.5 py-1 text-[10px] font-medium transition-colors duration-150 ${
              showDimensions
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white/90'
            }`}
          >
            Dims
          </button>
        </div>
      </div>
    </div>
  )
}
