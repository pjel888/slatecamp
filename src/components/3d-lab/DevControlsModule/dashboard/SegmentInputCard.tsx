'use client'

import { useLotStore } from '../stores/useLotStore'
import { BoundaryTagSelector } from './BoundaryTagSelector'
import { BOUNDARY_TAG_COLORS } from '@/types/lot'
import type { LotSegment, BoundaryTag, SurveyorBearing } from '@/types/lot'

// Per-segment input card: bearing (N/S + °/'/″ + E/W), distance, boundary tag.
// Compact layout matching Philippine TCT/OCT notation.

export function SegmentInputCard({ segment, index }: {
  segment: LotSegment
  index: number
}) {
  const updateSegment = useLotStore((s) => s.updateSegment)
  const removeSegment = useLotStore((s) => s.removeSegment)

  const { bearing, distance, boundaryTag } = segment
  const borderColor = BOUNDARY_TAG_COLORS[boundaryTag]

  const updateBearing = (patch: Partial<SurveyorBearing>) => {
    updateSegment(segment.id, { bearing: { ...bearing, ...patch } })
  }

  return (
    <div
      className="rounded-r-md border border-l-[3px] bg-white p-2.5"
      style={{ borderLeftColor: borderColor }}
    >
      {/* Header: index + delete */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-mono text-[9px] font-medium text-[#8896A7]">{index + 1}</span>
        <button
          onClick={() => removeSegment(segment.id)}
          className="text-[10px] text-[#8896A7] hover:text-[#D64545] transition-colors duration-150"
        >
          ×
        </button>
      </div>

      {/* Bearing input row */}
      <div className="mb-1.5 flex items-center gap-0.5">
        {/* Base direction (N/S) */}
        <select
          value={bearing.base}
          onChange={(e) => updateBearing({ base: e.target.value as 'N' | 'S' })}
          className="w-9 rounded-sm border border-[#D4DAE3] bg-white px-1 py-0.5 font-mono text-[10px] text-[#1A2332]"
        >
          <option value="N">N</option>
          <option value="S">S</option>
        </select>

        {/* Degrees */}
        <input
          type="number" min={0} max={90} value={bearing.degrees}
          onChange={(e) => updateBearing({ degrees: Math.min(90, Math.max(0, Number(e.target.value))) })}
          className="w-8 rounded-sm border border-[#D4DAE3] px-1 py-0.5 text-center font-mono text-[10px] text-[#1A2332]"
        />
        <span className="font-mono text-[9px] text-[#8896A7]">°</span>

        {/* Minutes */}
        <input
          type="number" min={0} max={59} value={bearing.minutes}
          onChange={(e) => updateBearing({ minutes: Math.min(59, Math.max(0, Number(e.target.value))) })}
          className="w-7 rounded-sm border border-[#D4DAE3] px-1 py-0.5 text-center font-mono text-[10px] text-[#1A2332]"
        />
        <span className="font-mono text-[9px] text-[#8896A7]">'</span>

        {/* Seconds */}
        <input
          type="number" min={0} max={59} value={bearing.seconds}
          onChange={(e) => updateBearing({ seconds: Math.min(59, Math.max(0, Number(e.target.value))) })}
          className="w-7 rounded-sm border border-[#D4DAE3] px-1 py-0.5 text-center font-mono text-[10px] text-[#1A2332]"
        />
        <span className="font-mono text-[9px] text-[#8896A7]">"</span>

        {/* Turn direction (E/W) */}
        <select
          value={bearing.turn}
          onChange={(e) => updateBearing({ turn: e.target.value as 'E' | 'W' })}
          className="w-9 rounded-sm border border-[#D4DAE3] bg-white px-1 py-0.5 font-mono text-[10px] text-[#1A2332]"
        >
          <option value="E">E</option>
          <option value="W">W</option>
        </select>

        {/* Distance */}
        <input
          type="number" min={0.01} step={0.01} value={distance}
          onChange={(e) => updateSegment(segment.id, { distance: Math.max(0.01, Number(e.target.value)) })}
          className="ml-1 w-14 rounded-sm border border-[#D4DAE3] px-1 py-0.5 text-right font-mono text-[10px] text-[#1A2332]"
        />
        <span className="font-mono text-[9px] text-[#8896A7]">m</span>
      </div>

      {/* Boundary tag */}
      <BoundaryTagSelector
        value={boundaryTag}
        onChange={(tag) => updateSegment(segment.id, { boundaryTag: tag })}
      />
    </div>
  )
}
