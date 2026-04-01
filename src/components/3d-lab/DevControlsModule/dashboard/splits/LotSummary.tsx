'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'

// ─── Lot Summary (Right Column) ────────────────────────────────────────────
// Area and frontage readouts. Reactive from store.

export function LotSummary() {
  const lot = useDevControlsStore((s) => s.lot)
  const tla = useDevControlsStore((s) => s.result.tla)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)

  return (
    <div className="rounded-sm border border-border bg-muted/30 p-3">
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        Lot Summary
      </p>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">Total Lot Area</span>
          <span className="font-mono font-medium tabular-nums text-foreground">{tla.toFixed(1)} sqm</span>
        </div>
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">Frontage</span>
          <span className="font-mono font-medium tabular-nums text-foreground">{lot.width.toFixed(1)} m</span>
        </div>
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">Lot Depth</span>
          <span className="font-mono font-medium tabular-nums text-foreground">{lot.depth.toFixed(1)} m</span>
        </div>
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">RROW</span>
          <span className="font-mono font-medium tabular-nums text-foreground">{rrowWidth} m</span>
        </div>
      </div>
    </div>
  )
}
