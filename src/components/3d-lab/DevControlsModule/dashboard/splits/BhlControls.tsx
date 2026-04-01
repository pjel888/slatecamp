'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { getZoningEntry, lookupRrowBhl } from '@/lib/pd1096/zoningTables'
import { Info } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover'

// ─── BHL Controls (Left Column) ────────────────────────────────────────────
// Slider + computed label + reset button. Metrics grid is in BhlInfo.

export function BhlControls() {
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
      <div className="mb-2 flex items-center gap-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Building Height Limit
        </label>
        <Popover>
          <PopoverTrigger>
            <Info size={12} className="text-muted-foreground/50 transition-colors hover:text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="top" className="max-w-[280px]">
            <PopoverHeader>
              <PopoverTitle>Building Height Limit (BHL)</PopoverTitle>
              <PopoverDescription>
                The maximum allowable building height in storeys and meters,
                determined by the zoning classification and the width of the
                adjacent Road Right-of-Way (RROW). The more restrictive value
                governs. Per PD 1096 IRR Rule VIII, Sec. 805 and Table VIII.3.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          BHL {isCustom ? '' : '(Computed)'}
        </label>
        <span className={`font-mono text-xs font-medium ${isCustom ? 'text-amber-600' : 'text-foreground'}`}>
          {r.bhlStoreys}F / {r.bhlMeters.toFixed(1)}m
        </span>
      </div>
      <input
        type="range" min={1} max={50} step={1}
        value={bhlOverride ?? computedBhl}
        onChange={(e) => setBhlOverride(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
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
        <p className="mt-0.5 text-[9px] text-amber-600">Custom BHL — local ordinance mode</p>
      )}
      {isCustom && (
        <button
          onClick={() => setBhlOverride(undefined)}
          className="mt-1.5 text-[9px] text-primary hover:text-primary/80 transition-colors duration-150"
        >
          Reset to computed ({computedBhl}F)
        </button>
      )}
    </div>
  )
}
