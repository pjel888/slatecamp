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
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Building Height Limit
      </label>

      {/* BHL slider — always interactive */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
            BHL {isCustom ? '' : '(Computed)'}
          </label>
          <span className={`font-mono text-xs font-medium ${isCustom ? 'text-[#D4951A]' : 'text-[#1A2332]'}`}>
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
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D4DAE3] accent-[#1B3FC4]"
          aria-label="BHL Storeys"
        />
        <div className="mt-0.5 flex justify-between text-[8px] text-[#8896A7]">
          <span>1F</span>
          <span className="font-medium text-[#1B3FC4]">
            Computed: {computedBhl}F (zone: {zoningBhl}F, RROW: {rrowBhl}F)
          </span>
          <span>50F</span>
        </div>
        {isCustom && (
          <p className="mt-0.5 text-[9px] text-[#D4951A]">
            Custom BHL — local ordinance mode
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="mt-2 rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] p-2">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
          <span className="text-[#8896A7]">BHL (applied)</span>
          <span className={`font-mono ${isCustom ? 'text-[#D4951A]' : 'text-[#1A2332]'}`}>
            {r.bhlStoreys}F / {r.bhlMeters.toFixed(1)}m
          </span>

          <span className="text-[#8896A7]">Source</span>
          <span className="font-mono text-[#8896A7]">{r.bhlSource}</span>

          <span className="text-[#8896A7]">AMVB</span>
          <span className="font-mono text-[#1A2332]">{r.amvbInitial.toFixed(0)} cu.m</span>

          <span className="text-[#8896A7]">Proposed height</span>
          <span className={`font-mono ${r.proposedHeight <= r.bhlMeters ? 'text-[#2D9F6F]' : 'text-[#D64545]'}`}>
            {r.proposedHeight.toFixed(1)}m
          </span>
        </div>
      </div>

      {/* Reset */}
      {isCustom && (
        <button
          onClick={() => setBhlOverride(undefined)}
          className="mt-1.5 text-[9px] text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
        >
          Reset to computed ({computedBhl}F)
        </button>
      )}
    </div>
  )
}
