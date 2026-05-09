// src/app/dashboard/3d-lab/_components/GenericControlPanel.tsx
// Restyled to match implementation plan v2 §6.1 — ParameterPanel design
'use client'

import { memo, useState, useMemo } from 'react'
import {
  CaretDown,
  CaretRight,
  ArrowCounterClockwise,
  CheckCircle,
  Warning,
  XCircle,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'
import type { ParameterDef, Preset } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

const MONO_FONT = 'var(--font-dm-mono), monospace'

// ─── Section (collapsible group) ─────────────────────────────────────────────

const Section = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border pt-3 first:border-t-0 first:pt-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 w-full text-left mb-2"
      >
        <SCIcon
          icon={open ? CaretDown : CaretRight}
          size="xs"
          className="text-muted-foreground"
        />
        <span
          style={{ fontFamily: MONO_FONT, fontSize: 11 }}
          className="font-bold uppercase tracking-[0.15em] text-muted-foreground"
        >
          {title}
        </span>
      </button>
      {open && <div className="space-y-4">{children}</div>}
    </div>
  )
}

// ─── Slider — delegates to shared LabSlider ─────────────────────────────────

// ─── Toggle ──────────────────────────────────────────────────────────────────

const ToggleControl = ({
  param,
  value,
  onChange,
}: {
  param: ParameterDef
  value: boolean
  onChange: (v: boolean) => void
}) => (
  <div className="flex items-center justify-between">
    <label htmlFor={`toggle-${param.key}`} className="text-[11px] font-medium text-foreground">
      {param.label}
    </label>
    <Switch
      id={`toggle-${param.key}`}
      checked={value}
      onCheckedChange={onChange}
      aria-label={param.label}
    />
  </div>
)

// ─── Dropdown ────────────────────────────────────────────────────────────────

const DropdownControl = ({
  param,
  value,
  onChange,
}: {
  param: ParameterDef
  value: string
  onChange: (v: string) => void
}) => (
  <div className="space-y-1">
    <label className="text-[11px] font-medium text-foreground">
      {param.label}
    </label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className="w-full" style={{ fontFamily: MONO_FONT }}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {param.options?.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

// ─── Formula / Compliance Status (live indicator at bottom of panel) ─────────

const ComplianceIndicator = ({
  violations,
  sourceBacked = true,
}: {
  violations: Array<{ message: string; severity: string }>
  sourceBacked?: boolean
}) => {
  if (violations.length === 0) {
    return (
      <div className="rounded-md p-3 bg-success/5 border border-success/20">
        <div className="flex items-center gap-2">
          <SCIcon icon={CheckCircle} size="xs" className="text-emerald" />
          <span
            className="text-emerald font-medium"
            style={{ fontFamily: MONO_FONT, fontSize: 11 }}
          >
            {sourceBacked ? 'COMPLIANT' : 'CALCULATION OK'}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          {sourceBacked
            ? 'All values within code limits.'
            : 'No active formula issues. Source-backed compliance remains disabled pending review.'}
        </p>
      </div>
    )
  }

  const hasError = violations.some((v) => v.severity === 'error')
  const activeLabel = sourceBacked
    ? hasError
      ? 'VIOLATION'
      : 'AT LIMIT'
    : hasError
      ? 'FORMULA ISSUE'
      : 'REVIEW'

  return (
    <div
      className={cn(
        'rounded-md p-3 border',
        hasError
          ? 'bg-destructive/10 border-destructive/20'
          : 'bg-amber-50 border-warning/20'
      )}
    >
      <div className="flex items-center gap-2">
        <SCIcon
          icon={hasError ? XCircle : Warning}
          size="xs"
          className={hasError ? 'text-destructive' : 'text-warning'}
        />
        <span
          className={cn('font-medium', hasError ? 'text-destructive' : 'text-warning')}
          style={{ fontFamily: MONO_FONT, fontSize: 11 }}
        >
          {activeLabel}
        </span>
      </div>
      {violations.map((v, i) => (
        <p key={i} className="text-[11px] text-muted-foreground mt-1">
          {v.message}
        </p>
      ))}
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
  contextScenario?: string
  violations?: Array<{
    check: (params: Record<string, number | boolean | string>) => boolean
    message: string
    severity: string
  }>
  sourceBackedCompliance?: boolean
  /** When true, renders without absolute positioning (for use inside LabPanelLayout) */
  embedded?: boolean
}

export const GenericControlPanel = memo(function GenericControlPanel({
  title,
  parameters,
  presets,
  useStore,
  className,
  contextScenario,
  violations,
  sourceBackedCompliance = true,
  embedded = false,
}: GenericControlPanelProps) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const setParams = useStore((s) => s.setParams)
  const reset = useStore((s) => s.reset)

  // Filter out parameters hidden by visibleWhen predicate, then group
  const visibleParams = useMemo(
    () => parameters.filter((p) => !p.visibleWhen || p.visibleWhen(params)),
    [parameters, params]
  )

  const grouped = useMemo(() => {
    const groups = new Map<string, ParameterDef[]>()
    for (const p of visibleParams) {
      const group = p.group ?? '_ungrouped'
      const existing = groups.get(group)
      if (existing) existing.push(p)
      else groups.set(group, [p])
    }
    return groups
  }, [visibleParams])

  // Active violations
  const activeViolations = useMemo(
    () => (violations ?? []).filter((v) => v.check(params)),
    [violations, params]
  )

  const renderParam = (param: ParameterDef) => {
    const value = params[param.key] ?? param.default

    switch (param.type) {
      case 'slider': {
        const numValue = typeof value === 'number' ? value : Number(value)
        return (
          <LabSlider
            key={param.key}
            label={param.label}
            value={numValue}
            min={param.min ?? 0}
            max={param.max ?? 100}
            step={param.step ?? 1}
            unit={param.unit}
            formatValue={param.decimals !== undefined ? (v) => v.toFixed(param.decimals!) : undefined}
            onChange={(v) => setParam(param.key, v)}
          />
        )
      }
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
        embedded
          ? 'h-full overflow-y-auto'
          : cn(
              'absolute left-0 top-0 bottom-0 z-10 w-[240px] overflow-y-auto',
              'bg-card border-r border-border',
              'max-sm:left-0 max-sm:right-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-h-[50vh] max-sm:rounded-t-lg max-sm:border-r-0 max-sm:border-t max-sm:shadow-lg'
            ),
        className
      )}
      role="complementary"
      aria-label="Parameter controls"
    >
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-4 py-3 z-10">
        <span
          className="text-muted-foreground uppercase"
          style={{ fontFamily: MONO_FONT, fontSize: 11, letterSpacing: '0.1em' }}
        >
          {title}
        </span>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[13px] font-semibold text-foreground">
            Parameters
          </span>
          <button
            onClick={reset}
            className="p-1 rounded-sm hover:bg-primary/10 transition-colors duration-150"
            title="Reset to defaults"
          >
            <SCIcon icon={ArrowCounterClockwise} size="xs" className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Context scenario */}
        {contextScenario && (
          <div className="rounded-sm border border-border bg-background px-3 py-2.5">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {contextScenario}
            </p>
          </div>
        )}

        {/* Preset buttons */}
        {presets && presets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setParams(preset.values)}
                className="text-[11px] font-medium text-primary border border-primary/20 rounded-sm px-2 py-1 hover:bg-primary/10 transition-colors duration-150"
                style={{ fontFamily: MONO_FONT, fontSize: 11 }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {/* Parameter groups */}
        {Array.from(grouped.entries()).map(([group, groupParams]) =>
          group === '_ungrouped' ? (
            <div key={group} className="space-y-4">
              {groupParams.map(renderParam)}
            </div>
          ) : (
            <Section key={group} title={group}>
              {groupParams.map(renderParam)}
            </Section>
          )
        )}

        {/* Compliance indicator */}
        {violations && (
          <ComplianceIndicator violations={activeViolations} sourceBacked={sourceBackedCompliance} />
        )}
      </div>
    </div>
  )
})
