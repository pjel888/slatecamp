'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'

// ─── BHL Info (Right Column) ───────────────────────────────────────────────
// Computed metrics: BHL applied, source, AMVB, proposed height.

export function BhlInfo() {
  const bhlOverride = useDevControlsStore((s) => s.bhlOverride)
  const r = useDevControlsStore((s) => s.result)
  const isCustom = bhlOverride !== undefined
  const heightCompliant = r.proposedHeight <= r.bhlMeters

  return (
    <div className="rounded-sm border border-border bg-muted/30 p-3">
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        BHL Metrics
      </p>
      <div className="space-y-1">
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">BHL (applied)</span>
          <span className={`font-mono tabular-nums ${isCustom ? 'text-amber-600' : 'text-foreground'}`}>
            {r.bhlStoreys}F / {r.bhlMeters.toFixed(1)}m
          </span>
        </div>
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">Source</span>
          <span className="font-mono tabular-nums text-muted-foreground">{r.bhlSource}</span>
        </div>
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">AMVB</span>
          <span className="font-mono tabular-nums text-foreground">{r.amvbInitial.toFixed(0)} cu.m</span>
        </div>
        <div className="flex items-baseline justify-between text-[10px]">
          <span className="text-muted-foreground">Proposed height</span>
          <span className={`font-mono tabular-nums font-medium ${heightCompliant ? 'text-emerald-600' : 'text-destructive'}`}>
            {r.proposedHeight.toFixed(1)}m
          </span>
        </div>
      </div>
    </div>
  )
}
