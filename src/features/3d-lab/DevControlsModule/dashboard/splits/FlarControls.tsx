'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { lookupFLAR } from '@/lib/pd1096/zoningTables'
import { Info } from 'lucide-react'
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from '@/components/ui/popover'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

// ─── FLAR Controls (Left Column) ───────────────────────────────────────────
// Slider + zone range indicator + reset button. Metrics grid is in FlarInfo.

const EXPERIMENT_MIN = 0.50
const EXPERIMENT_MAX = 15.00

export function FlarControls() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const flarOverride = useDevControlsStore((s) => s.flarOverride)
  const setFlarOverride = useDevControlsStore((s) => s.setFlarOverride)
  const currentFlar = useDevControlsStore((s) => s.result.flar)

  const flarRange = lookupFLAR(zoneClass)
  const sliderValue = flarOverride ?? flarRange.mid
  const isOutOfRange = flarOverride !== undefined && (
    flarOverride < flarRange.min - 0.01 || flarOverride > flarRange.max + 0.01
  )
  const effectiveMax = Math.max(EXPERIMENT_MAX, flarRange.max)

  return (
    <div>
      <div className="mb-2 flex items-center gap-1.5">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Floor Area Ratio
        </label>
        <Popover>
          <PopoverTrigger>
            <Info size={12} className="text-muted-foreground/50 transition-colors hover:text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="top" className="max-w-[280px]">
            <PopoverHeader>
              <PopoverTitle>Floor Area Ratio (FLAR)</PopoverTitle>
              <PopoverDescription>
                The ratio of a building's total gross floor area to the total lot area.
                FLAR determines the maximum allowable construction area — a higher FLAR
                allows more floor area relative to the lot size. Governed by PD 1096 IRR
                Rule VII, Sec. 705 and Table VII.G.1.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </div>
      <LabSlider
        label="FLAR"
        value={sliderValue}
        min={EXPERIMENT_MIN}
        max={effectiveMax}
        step={0.05}
        onChange={(v) => setFlarOverride(v)}
        isViolating={isOutOfRange}
        formatValue={(v) => v.toFixed(2)}
        showRangeLabels={false}
        contextLine={
          `Zone: ${flarRange.min.toFixed(2)}${flarRange.min !== flarRange.max ? `–${flarRange.max.toFixed(2)}` : ''}`
        }
        contextLineType={isOutOfRange ? 'warning' : 'info'}
      />
      {isOutOfRange && (
        <p className="mt-0.5 text-[9px] text-amber-600">Outside zone range — experimentation mode</p>
      )}
      {flarOverride !== undefined && (
        <button
          onClick={() => setFlarOverride(undefined)}
          className="mt-1.5 text-[9px] text-primary hover:text-primary/80 transition-colors duration-150"
        >
          Reset to zone default ({flarRange.mid.toFixed(2)})
        </button>
      )}
    </div>
  )
}
