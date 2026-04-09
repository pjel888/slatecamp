'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import type { PerSideSetbacks } from '@/lib/pd1096/types'
import { Info } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

// ─── Setback Controls (Left Column) ───────────────────────────────────────
// 4 sliders (Front/Rear/Left/Right) with per-side reset. Mirrors BhlControls pattern.
// Firewall sides are shown as non-interactive info text.

const SIDES: { key: keyof PerSideSetbacks; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'rear',  label: 'Rear' },
  { key: 'left',  label: 'Left' },
  { key: 'right', label: 'Right' },
]

export const SetbackControls = () => {
  const zoning = useDevControlsStore((s) => s.zoning)
  const setbacks = useDevControlsStore((s) => s.result.setbacks)
  const setbackOverrides = useDevControlsStore((s) => s.setbackOverrides)
  const setSetbackOverride = useDevControlsStore((s) => s.setSetbackOverride)
  const resetAllSetbackOverrides = useDevControlsStore((s) => s.resetAllSetbackOverrides)

  const hasAnyOverride = setbackOverrides !== undefined

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Setbacks
        </label>
        <Popover>
          <PopoverTrigger>
            <Info size={12} className="text-muted-foreground/50 transition-colors hover:text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="top" className="max-w-[280px]">
            <PopoverHeader>
              <PopoverTitle>Minimum Setbacks</PopoverTitle>
              <PopoverDescription>
                The minimum required distance from the lot boundary to the
                building face on each side. Determined by zoning classification
                (Table VIII.2) for residential zones, or RROW width (Table VIII.3)
                for commercial/industrial. Per PD 1096 IRR Rule VIII, Sec. 804.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2.5">
        {SIDES.map(({ key, label }) => {
          const isFirewall = zoning.firewallActive && zoning.firewallSides.includes(key as never)
          const base = setbacks.base[key]
          const override = setbackOverrides?.[key]
          const isCustom = override !== undefined
          const value = isFirewall ? 0 : (override ?? base)
          const isViolating = isCustom && !isFirewall && value < base - 0.01

          if (isFirewall) {
            return (
              <div key={key} className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium text-foreground">{label}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  Firewall — 0m
                </span>
              </div>
            )
          }

          return (
            <div key={key}>
              <LabSlider
                label={`${label} ${isCustom ? '' : '(Code)'}`}
                value={value}
                min={0}
                max={15}
                step={0.1}
                onChange={(v) => setSetbackOverride(key, v)}
                isViolating={isViolating}
                formatValue={(v) => `${v.toFixed(1)}m`}
                showRangeLabels={false}
                contextLine={isCustom ? `Code required: ${base.toFixed(1)}m` : undefined}
                contextLineType={isViolating ? 'error' : 'warning'}
              />
              {isCustom && (
                <button
                  onClick={() => setSetbackOverride(key, undefined)}
                  className="mt-0.5 text-[9px] text-primary hover:text-primary/80 transition-colors duration-150"
                >
                  Reset to code ({base.toFixed(1)}m)
                </button>
              )}
            </div>
          )
        })}
      </div>

      {hasAnyOverride && (
        <button
          onClick={resetAllSetbackOverrides}
          className="mt-2 text-[9px] text-primary hover:text-primary/80 transition-colors duration-150"
        >
          Reset all setbacks to code defaults
        </button>
      )}
    </div>
  )
}
