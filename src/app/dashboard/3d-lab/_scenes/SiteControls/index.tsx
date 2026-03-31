'use client'

import { useSiteControlsStore, SITE_CONTROL_PRESETS } from '../../_stores/siteControlsStore'
import { ZoningClass } from '../../_constants/nbcp'
import { SITE_CONTROL_TABLE } from '../../_constants/siteControls'
import { SiteControlsCanvas } from './SiteControlsCanvas'
import { ComplianceScorecard } from './ComplianceScorecard'

// ─── Zoning class options for the dropdown ────────────────────────────────────

const ZONING_OPTIONS = Object.entries(SITE_CONTROL_TABLE).map(([key, val]) => ({
  value: key as ZoningClass,
  label: val.label,
}))

// ─── Controls Panel ───────────────────────────────────────────────────────────

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
        <label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          Presets
        </label>
        <div className="flex flex-wrap gap-1.5">
          {SITE_CONTROL_PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-sm border px-2 py-1 text-[10px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lot Dimensions */}
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
        label="Building Height"
        value={inputs.buildingHeight}
        min={3}
        max={30}
        step={0.5}
        unit="m"
        onChange={(v) => setInputs({ buildingHeight: v })}
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

      {/* Zoning Class */}
      <div>
        <label className="mb-1.5 block font-mono text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          Zoning Class
        </label>
        <select
          value={inputs.zoningClass}
          onChange={(e) => setInputs({ zoningClass: e.target.value as ZoningClass })}
          className="w-full rounded-sm border bg-background px-2 py-1.5 text-xs text-foreground"
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
          className="flex-1 rounded-sm border px-2 py-1.5 text-[10px] font-medium text-foreground transition-colors duration-150 hover:bg-muted"
        >
          {viewMode === 'perspective' ? 'Plan View' : 'Perspective'}
        </button>
        <button
          onClick={toggleDimensions}
          className={`flex-1 rounded-sm border px-2 py-1.5 text-[10px] font-medium transition-colors duration-150 ${
            showDimensions
              ? 'border-[#1B3FC4] bg-[#EEF2FC] text-[#1B3FC4]'
              : 'text-foreground hover:bg-muted'
          }`}
        >
          Dimensions
        </button>
        <button
          onClick={reset}
          className="rounded-sm border px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          Reset
        </button>
      </div>

      {/* Divider */}
      <hr className="border-border" />

      {/* Compliance Scorecard */}
      <ComplianceScorecard />
    </div>
  )
}

// ─── Slider Component ─────────────────────────────────────────────────────────

function SliderControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="font-mono text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        <span className="font-mono text-xs font-medium text-foreground">
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-[#1B3FC4]"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  )
}

// ─── Scene Entry Point ────────────────────────────────────────────────────────

export default function SiteControls() {
  return (
    <div className="flex h-full w-full">
      {/* 3D Canvas — 65% width on desktop */}
      <div className="relative min-h-0 flex-1">
        <SiteControlsCanvas />
      </div>

      {/* Controls sidebar — 35% width on desktop */}
      <div className="w-[340px] shrink-0 border-l bg-background">
        <ControlsPanel />
      </div>
    </div>
  )
}
