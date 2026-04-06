// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPControlPanel.tsx
'use client'

import { memo, useState } from 'react'
import { CaretDown, CaretRight, ArrowCounterClockwise } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useNBCPStore, NBCP_PRESETS } from '@/features/3d-lab/stores/nbcpStore'
import { ZoningClass, LotType, ZONING_TABLE, FIREWALL_ALLOWED } from '@/features/3d-lab/constants/nbcp'
import type { FirewallInputs } from '@/features/3d-lab/utils/nbcpCalculator'

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = true }: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border first:border-t-0 pt-2 first:pt-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 w-full text-left mb-2"
      >
        {open ? <SCIcon icon={CaretDown} size="xs" className="text-zinc-400" /> : <SCIcon icon={CaretRight} size="xs" className="text-zinc-400" />}
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">{title}</span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  )
}

function SliderRow({ label, value, min, max, step, unit, decimals = 0, onChange }: {
  label: string; value: number; min: number; max: number; step: number
  unit: string; decimals?: number; onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-zinc-600">{label}</label>
        <span className="text-[11px] font-bold text-zinc-900 tabular-nums">
          {value.toFixed(decimals)} {unit}
        </span>
      </div>
      <Slider
        value={[value]} min={min} max={max} step={step}
        onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; if (typeof val === 'number') onChange(val) }}
        className="cursor-pointer"
      />
    </div>
  )
}

function SelectRow({ label, value, options, onChange }: {
  label: string; value: string
  options: Array<{ value: string; label: string }>
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[11px] font-medium text-zinc-600 shrink-0">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-[11px] font-medium text-zinc-900 border border-border rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary min-w-0"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function ToggleRow({ label, value, disabled, tooltip, onChange }: {
  label: string; value: boolean; disabled: boolean; tooltip?: string; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <label className={cn('text-[11px] font-medium', disabled ? 'text-zinc-300' : 'text-zinc-600')}>
        {label}
      </label>
      <button
        title={tooltip}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          'w-8 h-4 rounded-full transition-colors relative',
          disabled ? 'opacity-40 cursor-not-allowed bg-zinc-200' :
            value ? 'bg-primary cursor-pointer' : 'bg-zinc-200 cursor-pointer'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform',
          value && !disabled ? 'translate-x-4' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const ZONING_OPTIONS = Object.entries(ZONING_TABLE).map(([value, entry]) => ({
  value,
  label: entry.label,
}))

const LOT_TYPE_OPTIONS = [
  { value: LotType.INSIDE,  label: 'Inside' },
  { value: LotType.CORNER,  label: 'Corner' },
  { value: LotType.THROUGH, label: 'Through' },
  { value: LotType.END,     label: 'End' },
]

export const NBCPControlPanel = memo(function NBCPControlPanel() {
  const { inputs, setInputs, setFirewall, applyPreset, reset } = useNBCPStore()
  const { computed } = useNBCPStore()

  const allowedFirewallSides = new Set(FIREWALL_ALLOWED[inputs.zoningClass])

  // BHL conversion display
  const bhlDisplay = `BHL: ${computed.bhl_effective} storeys × ${inputs.floorHeight.toFixed(1)}m = ${computed.bhl_meters.toFixed(1)}m`

  return (
    <div className="absolute left-4 top-4 bottom-4 z-10 w-72 overflow-y-auto
      bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          NBCP Parameters
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-zinc-100" onClick={reset}>
          <SCIcon icon={ArrowCounterClockwise} size="xs" className="text-zinc-400" />
        </Button>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1">
        {NBCP_PRESETS.map(preset => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset)}
            className="text-[11px] font-medium text-primary border border-primary/30 rounded px-1.5 py-0.5 hover:bg-primary-50 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Lot */}
      <Section title="Lot">
        <SliderRow label="Width" value={inputs.lotWidth} min={5} max={200} step={1} unit="m"
          onChange={v => setInputs({ lotWidth: v })} />
        <SliderRow label="Depth" value={inputs.lotDepth} min={5} max={200} step={1} unit="m"
          onChange={v => setInputs({ lotDepth: v })} />
        <SelectRow label="Lot Type" value={inputs.lotType} options={LOT_TYPE_OPTIONS}
          onChange={v => setInputs({ lotType: v as LotType })} />
      </Section>

      {/* Zoning */}
      <Section title="Zoning">
        <SelectRow label="Zone" value={inputs.zoningClass} options={ZONING_OPTIONS}
          onChange={v => setInputs({ zoningClass: v as ZoningClass })} />
      </Section>

      {/* Building */}
      <Section title="Building">
        <div className="text-[11px] text-zinc-400 italic mb-1">
          Floor height is a design assumption, not a code requirement
        </div>
        <SliderRow label="Floor Height" value={inputs.floorHeight} min={2.7} max={4.0} step={0.1} unit="m" decimals={1}
          onChange={v => setInputs({ floorHeight: v })} />
        <div className="text-[11px] font-mono text-zinc-500 bg-zinc-50 rounded px-2 py-1">
          {bhlDisplay}
        </div>
        <div className="pt-1 border-t border-border">
          <div className="text-[11px] text-zinc-400 italic mb-1">
            Floors override — drag above BHL to show violation
          </div>
          <SliderRow
            label="Floors"
            value={inputs.floorsOverride > 0 ? inputs.floorsOverride : computed.effectiveStoreys}
            min={1}
            max={computed.bhl_effective * 3}
            step={1}
            unit="F"
            onChange={v => setInputs({ floorsOverride: v === computed.effectiveStoreys ? 0 : v })}
          />
          {inputs.floorsOverride > 0 && (
            <button
              onClick={() => setInputs({ floorsOverride: 0 })}
              className="text-[11px] text-primary hover:underline mt-0.5"
            >
              Reset to code max ({computed.effectiveStoreys}F)
            </button>
          )}
        </div>
      </Section>

      {/* Road */}
      <Section title="Road (RROW)">
        <SliderRow label="RROW Width" value={inputs.rrowWidth} min={6} max={40} step={0.5} unit="m" decimals={1}
          onChange={v => setInputs({ rrowWidth: v })} />
      </Section>

      {/* Firewalls */}
      <Section title="Firewalls" defaultOpen={false}>
        {(['front', 'rear', 'left', 'right'] as const).map(side => {
          const isAllowed = allowedFirewallSides.has(side)
          return (
            <ToggleRow
              key={side}
              label={side.charAt(0).toUpperCase() + side.slice(1)}
              value={inputs.firewalls[side as keyof FirewallInputs]}
              disabled={!isAllowed}
              tooltip={!isAllowed ? `Firewalls not permitted on ${side} in ${ZONING_TABLE[inputs.zoningClass].label}` : undefined}
              onChange={v => setFirewall(side as keyof FirewallInputs, v)}
            />
          )
        })}
      </Section>
    </div>
  )
})
