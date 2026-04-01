'use client'

import { useLotStore } from '../stores/useLotStore'
import { SegmentInputCard } from './SegmentInputCard'
import { ClosureStatusBadge } from './ClosureStatusBadge'
import { SAMPLE_LOTS } from '@/data/sample-lots'

// Segment list container with "Add Segment" button.
// Shown when lot mode = 'surveyor'.

export function SurveyorLotInputs() {
  const segments = useLotStore((s) => s.segments)
  const addSegment = useLotStore((s) => s.addSegment)
  const clearSegments = useLotStore((s) => s.clearSegments)
  const loadPresetSegments = useLotStore((s) => s.loadPresetSegments)

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-widest text-[#8896A7]">Lot Boundary Segments</p>
          <p className="text-[8px] text-[#8896A7]">Enter bearings from your lot title</p>
        </div>
        {segments.length > 0 && (
          <button
            onClick={clearSegments}
            className="text-[9px] text-[#8896A7] hover:text-[#D64545] transition-colors duration-150"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sample lots dropdown */}
      <select
        defaultValue=""
        onChange={(e) => {
          const sample = SAMPLE_LOTS.find(s => s.label === e.target.value)
          if (sample) loadPresetSegments(sample.segments)
          e.target.value = ''
        }}
        className="mb-2 w-full rounded-sm border border-[#D4DAE3] bg-white px-2 py-1.5 font-mono text-[10px] text-[#8896A7] focus:border-[#1B3FC4] focus:outline-none"
      >
        <option value="" disabled>Sample Lots...</option>
        {SAMPLE_LOTS.map((s) => (
          <option key={s.label} value={s.label}>{s.label}</option>
        ))}
      </select>

      {/* Segment cards */}
      <div className="space-y-1.5 mb-2">
        {segments.map((seg, i) => (
          <SegmentInputCard key={seg.id} segment={seg} index={i} />
        ))}
      </div>

      {/* Add segment button */}
      <button
        onClick={() => addSegment()}
        className="w-full rounded-sm border border-dashed border-[#D4DAE3] px-2 py-1.5 font-mono text-[10px] text-[#8896A7] transition-colors duration-150 hover:border-solid hover:bg-[#F8F7F5]"
      >
        + Add Segment
      </button>

      {/* Closure status */}
      <div className="mt-2">
        <p className="text-[9px] font-medium uppercase tracking-widest text-[#8896A7] mb-1">Closure Status</p>
        <ClosureStatusBadge />
      </div>
    </div>
  )
}
