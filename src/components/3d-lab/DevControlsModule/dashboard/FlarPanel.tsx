'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { lookupFLAR } from '@/lib/pd1096/zoningTables'

// FAR & FLAR controls — always interactive.
// The slider range extends beyond the zone's prescribed range to allow
// experimentation. When the user moves outside the zone range, the
// "CUSTOM FLAR" badge activates on the ZoningInputPanel.

// Experimentation bounds — generous range for any zone
const EXPERIMENT_MIN = 0.50
const EXPERIMENT_MAX = 15.00

export function FlarPanel() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const flarOverride = useDevControlsStore((s) => s.flarOverride)
  const setFlarOverride = useDevControlsStore((s) => s.setFlarOverride)
  const r = useDevControlsStore((s) => s.result)

  const flarRange = lookupFLAR(zoneClass)
  const currentFlar = r.flar
  const sliderValue = flarOverride ?? flarRange.mid
  const proposedFAR = r.tla > 0 ? r.proposedGFA / r.tla : 0
  const farCompliant = r.proposedGFA <= r.tgfa

  // Is the current value outside the zone's prescribed range?
  const isOutOfRange = flarOverride !== undefined && (
    flarOverride < flarRange.min - 0.01 || flarOverride > flarRange.max + 0.01
  )

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Floor Area Ratios
      </label>

      {/* FLAR slider — always interactive */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
            FLAR
          </label>
          <span className={`font-mono text-xs font-medium ${isOutOfRange ? 'text-[#D4951A]' : 'text-[#1A2332]'}`}>
            {currentFlar.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={EXPERIMENT_MIN}
          max={Math.max(EXPERIMENT_MAX, flarRange.max)}
          step={0.05}
          value={sliderValue}
          onChange={(e) => setFlarOverride(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D4DAE3] accent-[#1B3FC4]"
          aria-label="FLAR"
        />
        <div className="mt-0.5 flex justify-between text-[8px] text-[#8896A7]">
          <span>{EXPERIMENT_MIN}</span>
          <span className="font-medium text-[#1B3FC4]">
            Zone: {flarRange.min.toFixed(2)}{flarRange.min !== flarRange.max ? `–${flarRange.max.toFixed(2)}` : ''}
          </span>
          <span>{Math.max(EXPERIMENT_MAX, flarRange.max)}</span>
        </div>
        {isOutOfRange && (
          <p className="mt-0.5 text-[9px] text-[#D4951A]">
            Outside zone range — experimentation mode
          </p>
        )}
      </div>

      {/* Computed metrics */}
      <div className="mt-2 rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] p-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <span className="text-[#8896A7]">FLAR (applied)</span>
          <span className={`font-mono ${isOutOfRange ? 'text-[#D4951A]' : 'text-[#1A2332]'}`}>{currentFlar.toFixed(2)}</span>

          <span className="text-[#8896A7]">Zone range</span>
          <span className="font-mono text-[#8896A7]">
            {flarRange.min.toFixed(2)}{flarRange.min !== flarRange.max ? ` – ${flarRange.max.toFixed(2)}` : ' (fixed)'}
          </span>

          <span className="text-[#8896A7]">GFA allowable</span>
          <span className="font-mono text-[#1A2332]">{r.gfa.toFixed(0)} sqm</span>

          <span className="text-[#8896A7]">TGFA (FLAR)</span>
          <span className={`font-mono ${r.tgfaSource === 'flar' ? 'text-[#1B3FC4] font-medium' : 'text-[#8896A7]'}`}>
            {r.tgfaByFlar.toFixed(0)} sqm {r.tgfaSource === 'flar' && '← governs'}
          </span>

          <span className="text-[#8896A7]">TGFA (BHL)</span>
          <span className={`font-mono ${r.tgfaSource === 'bhl' ? 'text-[#1B3FC4] font-medium' : 'text-[#8896A7]'}`}>
            {r.tgfaByBhl.toFixed(0)} sqm {r.tgfaSource === 'bhl' && '← governs'}
          </span>

          <span className="text-[#8896A7]">TGFA (governing)</span>
          <span className="font-mono text-[#1A2332] font-medium">{r.tgfa.toFixed(0)} sqm</span>

          <span className="text-[#8896A7]">FAR (proposed)</span>
          <span className={`font-mono font-medium ${farCompliant ? 'text-[#2D9F6F]' : 'text-[#D64545]'}`}>
            {proposedFAR.toFixed(2)}
          </span>

          <span className="text-[#8896A7]">Proposed GFA</span>
          <span className={`font-mono ${farCompliant ? 'text-[#1A2332]' : 'text-[#D64545]'}`}>
            {r.proposedGFA.toFixed(0)} sqm
          </span>

          <span className="text-[#8896A7]">Max floors (TGFA)</span>
          <span className="font-mono font-medium text-[#1B3FC4]">
            {r.maxCompliantFloors}F
          </span>
        </div>
      </div>

      {/* Reset to zone default */}
      {flarOverride !== undefined && (
        <button
          onClick={() => setFlarOverride(undefined)}
          className="mt-1.5 text-[9px] text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
        >
          Reset to zone default ({flarRange.mid.toFixed(2)})
        </button>
      )}
    </div>
  )
}
