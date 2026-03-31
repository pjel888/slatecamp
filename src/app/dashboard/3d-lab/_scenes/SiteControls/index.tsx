'use client'

import { useState, useRef, useCallback } from 'react'
import { useSiteControlsStore, SITE_CONTROL_PRESETS } from '../../_stores/siteControlsStore'
import { ZoningClass } from '../../_constants/nbcp'
import { SITE_CONTROL_TABLE } from '../../_constants/siteControls'
import { SiteControlsCanvas } from './SiteControlsCanvas'
import { TourOverlay } from './TourOverlay'
import { ComplianceScorecard } from './ComplianceScorecard'

// ─── Zoning class options ────────────────────────────────────────────────────

const ZONING_OPTIONS = Object.entries(SITE_CONTROL_TABLE).map(([key, val]) => ({
  value: key as ZoningClass,
  label: val.label,
}))

// ─── Computed HUD ────────────────────────────────────────────────────────────

function ComputedHUD() {
  const computed = useSiteControlsStore((s) => s.computed)
  const { tgfa, pso, ambf, bhl, isa, compliance } = computed

  const metrics = [
    { label: 'TGFA', value: `${tgfa.toFixed(1)}`, unit: 'sqm', ok: compliance.ambfOk },
    { label: 'PSO', value: `${(pso * 100).toFixed(1)}`, unit: '%', ok: compliance.ambfOk },
    { label: 'AMBF', value: `${ambf.toFixed(1)}`, unit: 'sqm', ok: compliance.ambfOk },
    { label: 'BHL', value: `${bhl.toFixed(1)}`, unit: 'm', ok: true },
    { label: 'ISA', value: `${isa.toFixed(1)}`, unit: 'sqm', ok: compliance.toslOk },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="min-w-[72px] flex-1 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] px-3 py-2"
        >
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
            {m.label}
          </div>
          <div className={`font-mono text-lg font-medium ${m.ok ? 'text-[#1A2332]' : 'text-[#D64545]'}`}>
            {m.value}
            <span className="ml-0.5 text-[10px] font-normal text-[#8896A7]">{m.unit}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Slider Component ────────────────────────────────────────────────────────

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  warning,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  warning?: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          {label}
        </label>
        <span className="font-mono text-xs font-medium text-[#1A2332]">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D4DAE3] accent-[#1B3FC4]"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
      {warning && (
        <p className="mt-0.5 text-[10px] text-[#D4951A]">{warning}</p>
      )}
    </div>
  )
}

// ─── Controls Panel ──────────────────────────────────────────────────────────

function ControlsPanel() {
  const inputs = useSiteControlsStore((s) => s.inputs)
  const setInputs = useSiteControlsStore((s) => s.setInputs)
  const applyPreset = useSiteControlsStore((s) => s.applyPreset)
  const reset = useSiteControlsStore((s) => s.reset)
  const viewMode = useSiteControlsStore((s) => s.viewMode)
  const setViewMode = useSiteControlsStore((s) => s.setViewMode)
  const showDimensions = useSiteControlsStore((s) => s.showDimensions)
  const toggleDimensions = useSiteControlsStore((s) => s.toggleDimensions)
  const compliance = useSiteControlsStore((s) => s.computed.compliance)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Presets */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Presets
        </label>
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

      {/* Parameters section */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Parameters
        </label>
        <div className="space-y-3">
          <SliderControl
            label="Lot Width"
            value={inputs.lotWidth}
            min={5}
            max={60}
            step={0.5}
            unit="m"
            onChange={(v) => setInputs({ lotWidth: v })}
          />
          <SliderControl
            label="Lot Depth"
            value={inputs.lotDepth}
            min={5}
            max={60}
            step={0.5}
            unit="m"
            onChange={(v) => setInputs({ lotDepth: v })}
          />
          <SliderControl
            label="Number of Floors"
            value={inputs.numFloors}
            min={1}
            max={10}
            step={1}
            unit=""
            onChange={(v) => setInputs({ numFloors: v })}
          />
          <SliderControl
            label="Floor-to-Floor Height"
            value={inputs.floorHeight}
            min={2.4}
            max={5.0}
            step={0.1}
            unit="m"
            warning={inputs.floorHeight < 2.7 ? 'Below 2.7m habitable minimum' : undefined}
            onChange={(v) => setInputs({ floorHeight: v })}
          />
          <SliderControl
            label="RROW Width"
            value={inputs.rrowWidth}
            min={6}
            max={40}
            step={1}
            unit="m"
            onChange={(v) => setInputs({ rrowWidth: v })}
          />
        </div>
      </div>

      {/* Zoning Class */}
      <div>
        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Zoning Class
        </label>
        <select
          value={inputs.zoningClass}
          onChange={(e) => setInputs({ zoningClass: e.target.value as ZoningClass })}
          className="w-full rounded-sm border border-[#D4DAE3] bg-white px-2 py-1.5 text-xs text-[#1A2332]"
        >
          {ZONING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
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

      <hr className="border-[#D4DAE3]" />

      {/* Computed HUD */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Computed Values
        </label>
        <ComputedHUD />
      </div>

      <hr className="border-[#D4DAE3]" />

      {/* Compliance Scorecard */}
      <ComplianceScorecard />

      {/* Code Reference */}
      <div className="mt-auto border-t border-[#D4DAE3] pt-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Code Reference
        </p>
        <p className="mt-1 text-xs text-[#4A5568]">
          PD 1096 Rule VII & VIII — Site Development Controls
        </p>
        <button className="mt-1 text-xs font-medium text-[#1B3FC4] transition-colors duration-150 hover:text-[#1535A8]">
          Open Wiki →
        </button>
      </div>
    </div>
  )
}

// ─── Mobile Bottom Sheet ─────────────────────────────────────────────────────

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
      {/* Drag handle */}
      <div
        className="flex cursor-grab items-center justify-center py-2"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="h-1 w-8 rounded-full bg-[#D4DAE3]" />
      </div>

      {/* Collapsed: just show HUD */}
      <div className="px-4 pb-2">
        <ComputedHUD />
      </div>

      {/* Expanded: full controls */}
      {expanded && (
        <div className="max-h-[50vh] overflow-y-auto">
          <ControlsPanel />
        </div>
      )}
    </div>
  )
}

// ─── Scene Entry Point ───────────────────────────────────────────────────────

export default function SiteControls() {
  return (
    <div className="flex h-full w-full">
      {/* 3D Canvas — full width on mobile, flex-1 on desktop */}
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
