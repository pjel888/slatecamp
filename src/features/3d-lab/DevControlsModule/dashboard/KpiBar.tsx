'use client'

// ─── KPI Bar ───────────────────────────────────────────────────────────────
// Viewport-attached bottom bar combining:
//   Row 1: 5 KPI chips (TLA, AMBF, PSO, TOSL, BHL)
//   Row 2: Camera preset buttons (reused from FloatingCameraBar)
// Always visible regardless of panel state.

import { useCallback } from 'react'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { KpiChip } from './KpiChip'
import type { CameraPreset } from '@/lib/pd1096/types'

const MAIN_PRESETS: { value: CameraPreset; label: string }[] = [
  { value: 'perspective', label: 'Orbit' },
  { value: 'top', label: 'Plan' },
  { value: 'front', label: 'Front' },
]

// Isometric corners — cycle through on repeated clicks
const ISO_CYCLE: CameraPreset[] = ['iso-ne', 'iso-nw', 'iso-se', 'iso-sw']
const ISO_LABELS: Record<string, string> = {
  'iso-ne': 'NE',
  'iso-nw': 'NW',
  'iso-se': 'SE',
  'iso-sw': 'SW',
}

export function KpiBar() {
  const result = useDevControlsStore((s) => s.result)
  const overallCompliant = result.overallCompliant
  const cameraPreset = useDevControlsStore((s) => s.cameraPreset)
  const setCameraPreset = useDevControlsStore((s) => s.setCameraPreset)
  const showDimensions = useDevControlsStore((s) => s.showDimensions)
  const setShowDimensions = useDevControlsStore((s) => s.setShowDimensions)

  // Cycle through iso corners: NE → NW → SE → SW → NE...
  const isIso = ISO_CYCLE.includes(cameraPreset)
  const isoLabel = isIso ? ISO_LABELS[cameraPreset] : 'NE'
  const cycleIso = useCallback(() => {
    const idx = ISO_CYCLE.indexOf(cameraPreset)
    const next = idx >= 0 ? ISO_CYCLE[(idx + 1) % ISO_CYCLE.length] : ISO_CYCLE[0]
    setCameraPreset(next)
  }, [cameraPreset, setCameraPreset])

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
          {MAIN_PRESETS.map((p) => {
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

          {/* Iso button — cycles through NE/NW/SE/SW corners */}
          <button
            onClick={cycleIso}
            title={`Isometric ${isoLabel} (click to cycle)`}
            className={`rounded-sm px-2.5 py-1 text-[10px] font-medium transition-colors duration-150 ${
              isIso
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white/90'
            }`}
          >
            Iso
            {isIso && (
              <span className="ml-0.5 font-mono text-[8px] text-white/50">{isoLabel}</span>
            )}
          </button>

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
