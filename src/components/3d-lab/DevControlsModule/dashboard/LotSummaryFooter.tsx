'use client'

import { useLotStore } from '../stores/useLotStore'

// Shared footer: area, perimeter, segment count.
// Displayed in both rectangle and surveyor modes.

export function LotSummaryFooter() {
  const mode = useLotStore((s) => s.mode)
  const polygon = useLotStore((s) => s.computedPolygon)
  const rectangle = useLotStore((s) => s.rectangle)

  const area = mode === 'rectangle'
    ? rectangle.width * rectangle.depth
    : polygon?.area ?? 0

  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-widest text-[#8896A7] mb-1">Lot Summary</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
        <span className="text-[#8896A7]">Area</span>
        <span className="font-mono text-[#1A2332] tabular-nums">{area.toFixed(1)} sq.m.</span>

        {mode === 'rectangle' && (
          <>
            <span className="text-[#8896A7]">Frontage</span>
            <span className="font-mono text-[#1A2332] tabular-nums">{rectangle.width.toFixed(1)} m</span>
          </>
        )}

        {mode === 'surveyor' && polygon && (
          <>
            <span className="text-[#8896A7]">Perimeter</span>
            <span className="font-mono text-[#1A2332] tabular-nums">{polygon.perimeter.toFixed(1)} m</span>
            <span className="text-[#8896A7]">Segments</span>
            <span className="font-mono text-[#1A2332] tabular-nums">{polygon.edges.length}</span>
          </>
        )}
      </div>
    </div>
  )
}
