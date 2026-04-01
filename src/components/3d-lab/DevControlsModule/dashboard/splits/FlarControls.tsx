'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { lookupFLAR } from '@/lib/pd1096/zoningTables'

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

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Floor Area Ratio
      </label>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">FLAR</label>
        <span className={`font-mono text-xs font-medium ${isOutOfRange ? 'text-amber-600' : 'text-foreground'}`}>
          {currentFlar.toFixed(2)}
        </span>
      </div>
      <input
        type="range" min={EXPERIMENT_MIN} max={Math.max(EXPERIMENT_MAX, flarRange.max)}
        step={0.05} value={sliderValue}
        onChange={(e) => setFlarOverride(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-label="FLAR"
      />
      <div className="mt-0.5 flex justify-between text-[8px] text-muted-foreground">
        <span>{EXPERIMENT_MIN}</span>
        <span className="font-medium text-primary">
          Zone: {flarRange.min.toFixed(2)}{flarRange.min !== flarRange.max ? `–${flarRange.max.toFixed(2)}` : ''}
        </span>
        <span>{Math.max(EXPERIMENT_MAX, flarRange.max)}</span>
      </div>
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
