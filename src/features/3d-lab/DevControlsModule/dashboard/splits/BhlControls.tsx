'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { getZoningEntry, lookupRrowBhl } from '@/lib/pd1096/zoningTables'
import { Info } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'
import { buildBhlControlDisplay } from './bhl-display'

// ─── BHL Controls (Left Column) ────────────────────────────────────────────
// Slider + computed label + reset button. Metrics grid is in BhlInfo.

export function BhlControls() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)
  const floorHeight = useDevControlsStore((s) => s.building.floorHeight)
  const bhlOverride = useDevControlsStore((s) => s.bhlOverride)
  const setBhlOverride = useDevControlsStore((s) => s.setBhlOverride)
  const r = useDevControlsStore((s) => s.result)

  const entry = getZoningEntry(zoneClass)
  const zoningBhl = entry.bhlStoreys
  const rrowBhl = lookupRrowBhl(rrowWidth)
  const computedBhl = Math.min(zoningBhl, rrowBhl)
  const currentBhlStoreys = r.bhlStoreys
  const isCustom = bhlOverride !== undefined
  const display = buildBhlControlDisplay({
    currentBhlStoreys,
    computedBhlStoreys: computedBhl,
    floorHeight,
    isCustom,
  })

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
      <LabSlider
        label={display.label}
        value={display.value}
        min={1}
        max={50}
        step={1}
        onChange={(v) => setBhlOverride(v)}
        isViolating={display.isViolating}
        formatValue={() => display.formattedValue}
        showRangeLabels={false}
        contextLine={`${display.contextLine} (zone: ${zoningBhl}F, RROW: ${rrowBhl}F)`}
      />
      {isCustom && (
        <p className="mt-0.5 text-[9px] text-amber-600">Custom BHL — local ordinance mode</p>
      )}
      {isCustom && (
        <button
          onClick={() => setBhlOverride(undefined)}
          className="mt-1.5 text-[9px] text-primary hover:text-primary/80 transition-colors duration-150"
        >
          {display.resetLabel}
        </button>
      )}
    </div>
  )
}
