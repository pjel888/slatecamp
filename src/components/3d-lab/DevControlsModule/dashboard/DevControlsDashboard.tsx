'use client'

import { useState, useRef, useCallback } from 'react'
import { useDevControlsStore } from '../stores/useDevControlsStore'
import { useSelectionStore } from '../stores/useSelectionStore'
import { PresetSelector } from './PresetSelector'
import { LotInputPanel } from './LotInputPanel'
import { ZoningInputPanel } from './ZoningInputPanel'
import { ProposedBuildingPanel } from './ProposedBuildingPanel'
import { CameraPresetBar } from './CameraPresetBar'
import { AMBFThreeWayPanel } from './AMBFThreeWayPanel'
import { ClosureEquationStrip } from './ClosureEquationStrip'
import { ComplianceScorecard } from './ComplianceScorecard'
import { ZoneLegend } from './ZoneLegend'
import { LayerToggles } from './LayerToggles'
import { FlarPanel } from './FlarPanel'
import { BhlPanel } from './BhlPanel'
import { FirewallPanel } from './FirewallPanel'

// ─── Selected Object Detail ─────────────────────────────────────────────────

function SelectionDetail() {
  const data = useSelectionStore((s) => s.selectedObjectData)
  const clearSelection = useSelectionStore((s) => s.clearSelection)

  if (!data) return null

  return (
    <div className="rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#1B3FC4]">
          {data.layerType.toUpperCase()}
        </span>
        <button
          onClick={clearSelection}
          className="text-[10px] text-[#8896A7] hover:text-[#1A2332] transition-colors duration-150"
        >
          Deselect
        </button>
      </div>
      <p className="text-sm font-medium text-[#1A2332] mb-1">{data.displayName}</p>
      <div className="space-y-0.5 mb-2">
        {Object.entries(data.computedValues).map(([key, val]) => (
          <div key={key} className="flex items-baseline justify-between text-[10px]">
            <span className="text-[#8896A7]">{key}</span>
            <span className="font-mono text-[#1A2332]">{val}</span>
          </div>
        ))}
      </div>
      <p className="font-mono text-[8px] text-[#8896A7]">{data.codeReference}</p>
    </div>
  )
}

// ─── Computed HUD ───────────────────────────────────────────────────────────

export function ComputedHUD() {
  const r = useDevControlsStore((s) => s.result)

  const metrics = [
    { label: 'TLA', value: r.tla.toFixed(0), unit: 'sqm' },
    { label: 'AMBF', value: r.ambf.toFixed(0), unit: 'sqm' },
    { label: 'PSO', value: (r.psoActual * 100).toFixed(1), unit: '%' },
    { label: 'TOSL', value: r.tosl.toFixed(0), unit: 'sqm' },
    { label: 'BHL', value: `${r.bhlStoreys}F`, unit: '' },
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-[60px] flex-1 rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] px-2 py-1.5">
          <div className="text-[9px] font-medium uppercase tracking-wider text-[#8896A7]">{m.label}</div>
          <div className="font-mono text-sm font-medium text-[#1A2332]">
            {m.value}
            {m.unit && <span className="ml-0.5 text-[9px] font-normal text-[#8896A7]">{m.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Left Toolbar (Input Configuration) ─────────────────────────────────────
// Houses: Presets, Lot Parameters, Zoning Classification, Proposed Building
// These are the "input" controls — what the student configures before analysis.

export function LeftToolbar() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <PresetSelector />
      <hr className="border-[#D4DAE3]" />
      <LotInputPanel />
      <ZoningInputPanel />
      <FlarPanel />
      <BhlPanel />
      <FirewallPanel />
      <hr className="border-[#D4DAE3]" />
      <ProposedBuildingPanel />
    </div>
  )
}

// ─── Right Toolbar (Output & Analysis) ──────────────────────────────────────
// Houses: Camera/Layer controls, Selection Detail, Computed HUD, AMBF 3-Way,
// Closure Equation, Compliance Scorecard, Zone Legend, Code Reference.
// These are the "output" panels — what the student reads after configuring inputs.

export function RightToolbar() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <LayerToggles />
      <hr className="border-[#D4DAE3]" />
      <SelectionDetail />
      <ComputedHUD />
      <hr className="border-[#D4DAE3]" />
      <AMBFThreeWayPanel />
      <ClosureEquationStrip />
      <hr className="border-[#D4DAE3]" />
      <ComplianceScorecard />
      <ZoneLegend />
      {/* Code reference footer */}
      <div className="mt-auto border-t border-[#D4DAE3] pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">Code Reference</p>
        <p className="mt-1 text-xs text-[#4A5568]">PD 1096 Rules VII & VIII — Site Development Controls</p>
        <p className="mt-0.5 font-mono text-[9px] text-[#8896A7]">2004 Revised IRR (DPWH, April 2005)</p>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Sheet ────────────────────────────────────────────────────
// On mobile, both toolbars collapse into a single swipeable sheet.

export function MobileBottomSheet() {
  const [expanded, setExpanded] = useState(false)
  const touchStartY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current
    if (deltaY < -30) setExpanded(true)
    if (deltaY > 30) setExpanded(false)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 rounded-t-lg border-t border-[#D4DAE3] bg-white shadow-md transition-transform duration-200 ease-out md:hidden ${
        expanded ? 'translate-y-0' : 'translate-y-[calc(100%-110px)]'
      }`}
      style={{ maxHeight: '70vh' }}
    >
      <div
        className="flex cursor-grab items-center justify-center py-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-1 w-8 rounded-full bg-[#D4DAE3]" />
      </div>
      <div className="px-4 pb-2">
        <ComputedHUD />
      </div>
      {expanded && (
        <div className="max-h-[50vh] overflow-y-auto px-4 pb-4 space-y-4">
          {/* Inputs */}
          <PresetSelector />
          <LotInputPanel />
          <ZoningInputPanel />
          <ProposedBuildingPanel />
          <hr className="border-[#D4DAE3]" />
          {/* Outputs */}
          <CameraPresetBar />
          <AMBFThreeWayPanel />
          <ClosureEquationStrip />
          <ComplianceScorecard />
        </div>
      )}
    </div>
  )
}
