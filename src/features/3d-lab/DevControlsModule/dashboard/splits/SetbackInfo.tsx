'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import type { PerSideSetbacks } from '@/lib/pd1096/types'

// ─── Setback Info (Right Column) ──────────────────────────────────────────
// Metrics panel: base vs effective per side, buildable envelope, violations.

const SIDES: { key: keyof PerSideSetbacks; label: string }[] = [
  { key: 'front', label: 'Front' },
  { key: 'rear',  label: 'Rear' },
  { key: 'left',  label: 'Left' },
  { key: 'right', label: 'Right' },
]

export const SetbackInfo = () => {
  const setbacks = useDevControlsStore((s) => s.result.setbacks)
  const setbackOverrides = useDevControlsStore((s) => s.setbackOverrides)
  const lotW = useDevControlsStore((s) => s.lot.width)
  const lotD = useDevControlsStore((s) => s.lot.depth)
  const zoning = useDevControlsStore((s) => s.zoning)

  const buildableW = Math.max(0, lotW - setbacks.effective.left - setbacks.effective.right)
  const buildableD = Math.max(0, lotD - setbacks.effective.front - setbacks.effective.rear)
  const hasAnyOverride = setbackOverrides !== undefined

  return (
    <div className="rounded-sm border border-border bg-muted/30 p-3">
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        Setback Metrics
      </p>

      {/* Per-side: effective vs base */}
      <div className="space-y-1">
        {SIDES.map(({ key, label }) => {
          const base = setbacks.base[key]
          const effective = setbacks.effective[key]
          const isFirewall = zoning.firewallActive && zoning.firewallSides.includes(key as never)
          const isCustom = setbackOverrides?.[key] !== undefined
          const isViolating = isCustom && !isFirewall && effective < base - 0.01

          return (
            <div key={key} className="flex items-baseline justify-between text-[10px]">
              <span className="text-muted-foreground">{label}</span>
              <span className={`font-mono tabular-nums ${
                isFirewall ? 'text-muted-foreground'
                : isViolating ? 'text-destructive font-medium'
                : isCustom ? 'text-amber-600'
                : 'text-foreground'
              }`}>
                {effective.toFixed(1)}m
                {isCustom && !isFirewall && (
                  <span className="ml-1 text-[9px] text-muted-foreground">
                    / {base.toFixed(1)}m
                  </span>
                )}
                {isFirewall && (
                  <span className="ml-1 text-[9px]">fw</span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* Buildable envelope */}
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <p className="mb-1 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          Buildable Envelope
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
          <div className="flex items-baseline justify-between text-[10px]">
            <span className="text-muted-foreground">Width</span>
            <span className="font-mono text-xs font-medium tabular-nums text-foreground">
              {buildableW.toFixed(1)}
              <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">m</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between text-[10px]">
            <span className="text-muted-foreground">Depth</span>
            <span className="font-mono text-xs font-medium tabular-nums text-foreground">
              {buildableD.toFixed(1)}
              <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">m</span>
            </span>
          </div>
        </div>
      </div>

      {/* Override status */}
      {hasAnyOverride && (
        <p className="mt-1.5 text-[9px] text-amber-600">
          Custom setbacks — values may not comply with code
        </p>
      )}

      {/* Code note */}
      {setbacks.note && (
        <p className="mt-1.5 font-mono text-[8px] text-muted-foreground">{setbacks.note}</p>
      )}
    </div>
  )
}
