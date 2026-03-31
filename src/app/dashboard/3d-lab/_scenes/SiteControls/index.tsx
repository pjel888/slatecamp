'use client'

import { useState, useRef, useCallback } from 'react'
import { useSiteControlsStore, SITE_CONTROL_PRESETS } from '../../_stores/siteControlsStore'
import { ZoningClass } from '../../_constants/nbcp'
import { SITE_CONTROL_TABLE, SITE_CONTROL_CITATIONS } from '../../_constants/siteControls'
import { SiteControlsCanvas } from './SiteControlsCanvas'
import { TourOverlay } from './TourOverlay'
import { ComplianceScorecard } from './ComplianceScorecard'

// ─── Zoning class dropdown options ──────────────────────────────────────────

const ZONING_OPTIONS = Object.entries(SITE_CONTROL_TABLE).map(([key, val]) => ({
  value: key as ZoningClass,
  label: val.label,
}))

// ─── Zone Info Panel (visible when a zone is selected) ──────────────────────

function ZoneInfoPanel() {
  const activeZone = useSiteControlsStore((s) => s.activeZone)
  const computed = useSiteControlsStore((s) => s.computed)
  const inputs = useSiteControlsStore((s) => s.inputs)
  const setActiveZone = useSiteControlsStore((s) => s.setActiveZone)

  if (!activeZone) return null

  const { tla, ambf, pso, tosl, isa, usa, maca, setbacks, isaPercent, usaPercent, ambf_by_setbacks, ambf_by_pso, violations } = computed
  const constraint = ambf_by_setbacks <= ambf_by_pso ? 'setback-limited' : 'zoning-capped'

  const zones: Record<string, { label: string; fullName: string; value: string; description: string; citation: string }> = {
    tla: {
      label: 'TLA', fullName: 'Total Lot Area',
      value: `${tla.toFixed(1)} sqm`,
      description: `${inputs.lotWidth}m x ${inputs.lotDepth}m = ${tla.toFixed(1)} sqm. Starting point for all development control calculations.`,
      citation: SITE_CONTROL_CITATIONS.tla,
    },
    ambf: {
      label: 'AMBF', fullName: 'Allowable Maximum Building Footprint',
      value: `${ambf.toFixed(1)} sqm (PSO: ${(pso * 100).toFixed(1)}%)`,
      description: `The binding constraint is min(${ambf_by_setbacks.toFixed(1)}, ${ambf_by_pso.toFixed(1)}) = ${ambf.toFixed(1)} sqm. Currently ${constraint}.`,
      citation: SITE_CONTROL_CITATIONS.ambf,
    },
    setbacks: {
      label: 'SETBACKS', fullName: 'Required Setbacks',
      value: `F: ${setbacks.front}m | S: ${setbacks.left}m | R: ${setbacks.rear}m`,
      description: 'Minimum distances from building to lot lines per zoning class and RROW width.',
      citation: SITE_CONTROL_CITATIONS.setbacks,
    },
    isa: {
      label: 'ISA', fullName: 'Impervious Surface Area',
      value: `${isa.toFixed(1)} sqm (${(isaPercent * 100).toFixed(0)}% table ref)`,
      description: `Paved open space redistributed within TOSL (${tosl.toFixed(1)} sqm) to maintain AMBF+ISA+USA=TLA.`,
      citation: SITE_CONTROL_CITATIONS.isa,
    },
    usa: {
      label: 'USA', fullName: 'Unpaved Surface Area',
      value: `${usa.toFixed(1)} sqm (${(usaPercent * 100).toFixed(0)}% table ref)`,
      description: `Landscaped open space redistributed within TOSL proportionally from ${(usaPercent * 100).toFixed(0)}% table value.`,
      citation: SITE_CONTROL_CITATIONS.usa,
    },
    violation: {
      label: 'VIOLATION', fullName: 'Code Violation',
      value: violations.length > 0 ? violations[0].message : '',
      description: violations.map((v) => v.message).join(' '),
      citation: violations.length > 0 ? violations[0].codeCitation : '',
    },
  }

  const zone = zones[activeZone]
  if (!zone) return null

  return (
    <div className="rounded-md border border-[#1B3FC4] bg-[#EEF2FC] p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#1B3FC4]">{zone.label}</span>
        <button onClick={() => setActiveZone(null)} className="text-[10px] text-[#8896A7] hover:text-[#1A2332] transition-colors duration-150">
          Deselect
        </button>
      </div>
      <p className="text-sm font-medium text-[#1A2332] mb-1">{zone.fullName}</p>
      <p className="font-mono text-lg font-semibold text-[#1B3FC4] mb-2">{zone.value}</p>
      <p className="text-xs text-[#4A5568] leading-relaxed mb-2">{zone.description}</p>
      <p className="font-mono text-[10px] text-[#8896A7]">{zone.citation}</p>
    </div>
  )
}

// ─── Computed HUD (key metrics at a glance) ─────────────────────────────────

function ComputedHUD() {
  const computed = useSiteControlsStore((s) => s.computed)
  const { tgfa, pso, ambf, bhl, isa, compliance } = computed

  const metrics = [
    { label: 'TGFA', value: tgfa.toFixed(1), unit: 'sqm', ok: compliance.ambfOk },
    { label: 'PSO', value: (pso * 100).toFixed(1), unit: '%', ok: compliance.ambfOk },
    { label: 'AMBF', value: ambf.toFixed(1), unit: 'sqm', ok: compliance.ambfOk },
    { label: 'BHL', value: bhl.toFixed(1), unit: 'm', ok: true },
    { label: 'ISA', value: isa.toFixed(1), unit: 'sqm', ok: compliance.toslOk },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((m) => (
        <div key={m.label} className="min-w-[72px] flex-1 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">{m.label}</div>
          <div className={`font-mono text-lg font-medium ${m.ok ? 'text-[#1A2332]' : 'text-[#D64545]'}`}>
            {m.value}
            <span className="ml-0.5 text-[10px] font-normal text-[#8896A7]">{m.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Slider Control ─────────────────────────────────────────────────────────

function SliderControl({
  label, value, min, max, step, unit, warning, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number; unit: string; warning?: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">{label}</label>
        <span className="font-mono text-xs font-medium text-[#1A2332]">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D4DAE3] accent-[#1B3FC4]"
        aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      />
      {warning && <p className="mt-0.5 text-[10px] text-[#D4951A]">{warning}</p>}
    </div>
  )
}

// ─── Controls Panel ─────────────────────────────────────────────────────────

function ControlsPanel() {
  const inputs = useSiteControlsStore((s) => s.inputs)
  const setInputs = useSiteControlsStore((s) => s.setInputs)
  const applyPreset = useSiteControlsStore((s) => s.applyPreset)
  const reset = useSiteControlsStore((s) => s.reset)
  const viewMode = useSiteControlsStore((s) => s.viewMode)
  const setViewMode = useSiteControlsStore((s) => s.setViewMode)
  const showDimensions = useSiteControlsStore((s) => s.showDimensions)
  const toggleDimensions = useSiteControlsStore((s) => s.toggleDimensions)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Presets */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">Presets</label>
        <div className="flex flex-wrap gap-1.5">
          {SITE_CONTROL_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-sm border border-[#D4DAE3] px-2 py-1 text-[10px] font-medium text-[#1A2332] transition-colors duration-150 hover:bg-[#EEF2FC] hover:border-[#1B3FC4]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Parameters */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">Parameters</label>
        <div className="space-y-3">
          <SliderControl label="Lot Width" value={inputs.lotWidth} min={5} max={60} step={0.5} unit="m" onChange={(v) => setInputs({ lotWidth: v })} />
          <SliderControl label="Lot Depth" value={inputs.lotDepth} min={5} max={60} step={0.5} unit="m" onChange={(v) => setInputs({ lotDepth: v })} />
          <SliderControl label="Number of Floors" value={inputs.numFloors} min={1} max={10} step={1} unit="" onChange={(v) => setInputs({ numFloors: v })} />
          <SliderControl
            label="Floor-to-Floor Height" value={inputs.floorHeight} min={2.4} max={5.0} step={0.1} unit="m"
            warning={inputs.floorHeight < 2.7 ? 'Below 2.7m habitable minimum' : undefined}
            onChange={(v) => setInputs({ floorHeight: v })}
          />
          <SliderControl label="RROW Width" value={inputs.rrowWidth} min={6} max={40} step={1} unit="m" onChange={(v) => setInputs({ rrowWidth: v })} />
        </div>
      </div>

      {/* Zoning Class */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">Zoning Class</label>
        <select
          value={inputs.zoningClass}
          onChange={(e) => setInputs({ zoningClass: e.target.value as ZoningClass })}
          className="w-full rounded-sm border border-[#D4DAE3] bg-white px-2 py-1.5 text-xs text-[#1A2332]"
        >
          {ZONING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* View controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode(viewMode === 'perspective' ? 'top' : 'perspective')}
          className="flex-1 rounded-sm border border-[#D4DAE3] px-2 py-1.5 text-[10px] font-medium text-[#1A2332] transition-colors duration-150 hover:bg-[#EEF2FC]"
        >
          {viewMode === 'perspective' ? 'Plan View' : 'Perspective'}
        </button>
        <button
          onClick={toggleDimensions}
          className={`flex-1 rounded-sm border px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
            showDimensions
              ? 'border-[#1B3FC4] bg-[#EEF2FC] text-[#1B3FC4]'
              : 'border-[#D4DAE3] text-[#1A2332] hover:bg-[#EEF2FC]'
          }`}
        >
          Dimensions
        </button>
        <button
          onClick={reset}
          className="rounded-sm border border-[#D4DAE3] px-2 py-1.5 text-[10px] font-medium text-[#8896A7] transition-colors duration-150 hover:bg-[#F8F7F5] hover:text-[#1A2332]"
        >
          Reset
        </button>
      </div>

      {/* Zone detail panel */}
      <ZoneInfoPanel />

      <hr className="border-[#D4DAE3]" />

      {/* Computed values HUD */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">Computed Values</label>
        <ComputedHUD />
      </div>

      <hr className="border-[#D4DAE3]" />

      {/* Compliance scorecard */}
      <ComplianceScorecard />

      {/* Code reference footer */}
      <div className="mt-auto border-t border-[#D4DAE3] pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">Code Reference</p>
        <p className="mt-1 text-xs text-[#4A5568]">PD 1096 Rule VII & VIII — Site Development Controls</p>
        <button className="mt-1 text-xs font-medium text-[#1B3FC4] transition-colors duration-150 hover:text-[#1535A8]">
          Open Wiki &rarr;
        </button>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Sheet ────────────────────────────────────────────────────

function MobileBottomSheet() {
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
        expanded ? 'translate-y-0' : 'translate-y-[calc(100%-120px)]'
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
        <div className="max-h-[50vh] overflow-y-auto">
          <ControlsPanel />
        </div>
      )}
    </div>
  )
}

// ─── Scene Entry Point ──────────────────────────────────────────────────────

export default function SiteControls() {
  return (
    <div className="flex h-full w-full">
      {/* 3D Canvas — flex-1 on desktop, full width on mobile */}
      <div className="relative min-h-0 flex-1">
        <SiteControlsCanvas />
        <TourOverlay />
      </div>

      {/* Controls sidebar — desktop only (320px) */}
      <div className="hidden w-[320px] shrink-0 border-l border-[#D4DAE3] bg-white md:block">
        <ControlsPanel />
      </div>

      {/* Mobile bottom sheet */}
      <MobileBottomSheet />
    </div>
  )
}
