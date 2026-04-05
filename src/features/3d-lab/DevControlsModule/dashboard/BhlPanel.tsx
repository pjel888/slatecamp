'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { getZoningEntry, lookupRrowBhl } from '@/lib/pd1096/zoningTables'

// BHL Override — allows users to experiment with custom building height limits
// for local ordinance scenarios. When active, overrides the computed BHL.

export function BhlPanel() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)
  const bhlOverride = useDevControlsStore((s) => s.bhlOverride)
  const setBhlOverride = useDevControlsStore((s) => s.setBhlOverride)
  const r = useDevControlsStore((s) => s.result)

  const entry = getZoningEntry(zoneClass)
  const zoningBhl = entry.bhlStoreys
  const rrowBhl = lookupRrowBhl(rrowWidth)
  const computedBhl = Math.min(zoningBhl, rrowBhl)
  const isCustom = bhlOverride !== undefined

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Building Height Limit
      </label>

      {/* BHL slider — always interactive */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            BHL {isCustom ? '' : '(Computed)'}
          </label>
          <span className={`font-mono text-xs font-medium ${isCustom ? 'text-warning' : 'text-foreground'}`}>
            {r.bhlStoreys}F / {r.bhlMeters.toFixed(1)}m
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={bhlOverride ?? computedBhl}
          onChange={(e) => setBhlOverride(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          aria-label="BHL Storeys"
        />
        <div className="mt-0.5 flex justify-between text-[8px] text-muted-foreground">
          <span>1F</span>
          <span className="font-medium text-primary">
            Computed: {computedBhl}F (zone: {zoningBhl}F, RROW: {rrowBhl}F)
          </span>
          <span>50F</span>
        </div>
        {isCustom && (
          <p className="mt-0.5 text-[9px] text-warning">
            Custom BHL — local ordinance mode
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="mt-2 rounded-sm border border-border bg-surface-light p-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <span className="text-muted-foreground">BHL (applied)</span>
          <span className={`font-mono ${isCustom ? 'text-warning' : 'text-foreground'}`}>
            {r.bhlStoreys}F / {r.bhlMeters.toFixed(1)}m
          </span>

          <span className="text-muted-foreground">Source</span>
          <span className="font-mono text-muted-foreground">{r.bhlSource}</span>

          <span className="text-muted-foreground">AMVB</span>
          <span className="font-mono text-foreground">{r.amvbInitial.toFixed(0)} cu.m</span>

          <span className="text-muted-foreground">Proposed height</span>
          <span className={`font-mono ${r.proposedHeight <= r.bhlMeters ? 'text-success' : 'text-destructive'}`}>
            {r.proposedHeight.toFixed(1)}m
          </span>
        </div>
      </div>

      {/* Reset */}
      {isCustom && (
        <button
          onClick={() => setBhlOverride(undefined)}
          className="mt-1.5 text-[9px] text-primary hover:text-primary-700 transition-colors duration-150"
        >
          Reset to computed ({computedBhl}F)
        </button>
      )}
    </div>
  )
}
