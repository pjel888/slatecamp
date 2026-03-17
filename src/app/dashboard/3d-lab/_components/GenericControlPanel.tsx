// src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx
'use client'

import { memo, useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import type { ParameterDef, Preset } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border first:border-t-0 pt-2 first:pt-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 w-full text-left mb-2"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-zinc-400" />
        ) : (
          <ChevronRight className="h-3 w-3 text-zinc-400" />
        )}
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {title}
        </span>
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  )
}

function SliderControl({
  param,
  value,
  onChange,
}: {
  param: ParameterDef
  value: number
  onChange: (v: number) => void
}) {
  const displayVal =
    param.decimals !== undefined ? value.toFixed(param.decimals) : value
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-zinc-600">
          {param.label}
        </label>
        <span className="text-[11px] font-bold text-zinc-900 tabular-nums">
          {displayVal} {param.unit ?? ''}
        </span>
      </div>
      <Slider
        value={[value]}
        min={param.min ?? 0}
        max={param.max ?? 100}
        step={param.step ?? 1}
        onValueChange={(v) => {
          const val = Array.isArray(v) ? v[0] : v
          if (typeof val === 'number') onChange(val)
        }}
        className="cursor-pointer"
      />
    </div>
  )
}

function ToggleControl({
  param,
  value,
  onChange,
}: {
  param: ParameterDef
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-medium text-zinc-600">
        {param.label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={cn(
          'w-8 h-4 rounded-full transition-colors relative',
          value
            ? 'bg-blue-600 cursor-pointer'
            : 'bg-zinc-200 cursor-pointer'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform',
            value ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  )
}

function DropdownControl({
  param,
  value,
  onChange,
}: {
  param: ParameterDef
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[11px] font-medium text-zinc-600 shrink-0">
        {param.label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-[11px] font-medium text-zinc-900 border border-border rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
      >
        {param.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface GenericControlPanelProps {
  title: string
  parameters: ParameterDef[]
  presets?: Preset[]
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  className?: string
}

export const GenericControlPanel = memo(function GenericControlPanel({
  title,
  parameters,
  presets,
  useStore,
  className,
}: GenericControlPanelProps) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const setParams = useStore((s) => s.setParams)
  const reset = useStore((s) => s.reset)

  // Group parameters by their group field
  const grouped = useMemo(() => {
    const groups = new Map<string, ParameterDef[]>()
    for (const p of parameters) {
      const group = p.group ?? '_ungrouped'
      const existing = groups.get(group)
      if (existing) {
        existing.push(p)
      } else {
        groups.set(group, [p])
      }
    }
    return groups
  }, [parameters])

  function renderParam(param: ParameterDef) {
    const value = params[param.key] ?? param.default

    switch (param.type) {
      case 'slider':
        return (
          <SliderControl
            key={param.key}
            param={param}
            value={typeof value === 'number' ? value : Number(value)}
            onChange={(v) => setParam(param.key, v)}
          />
        )
      case 'toggle':
        return (
          <ToggleControl
            key={param.key}
            param={param}
            value={typeof value === 'boolean' ? value : Boolean(value)}
            onChange={(v) => setParam(param.key, v)}
          />
        )
      case 'dropdown':
        return (
          <DropdownControl
            key={param.key}
            param={param}
            value={String(value)}
            onChange={(v) => setParam(param.key, v)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        'absolute left-4 top-4 bottom-4 z-10 w-72 overflow-y-auto',
        'bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-3',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
          {title}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-sm hover:bg-zinc-100"
          onClick={reset}
          title="Reset to defaults"
        >
          <RotateCcw className="h-3 w-3 text-zinc-400" />
        </Button>
      </div>

      {/* Preset buttons */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setParams(preset.values)}
              className="text-[10px] font-medium text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Parameter groups */}
      {Array.from(grouped.entries()).map(([group, params]) =>
        group === '_ungrouped' ? (
          <div key={group} className="space-y-3">
            {params.map(renderParam)}
          </div>
        ) : (
          <Section key={group} title={group}>
            {params.map(renderParam)}
          </Section>
        )
      )}
    </div>
  )
})
