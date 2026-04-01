'use client'

import { useLotStore } from '../stores/useLotStore'

// Shows polygon closure status: closed (green), open (red), or insufficient segments.

export function ClosureStatusBadge() {
  const polygon = useLotStore((s) => s.computedPolygon)
  const segments = useLotStore((s) => s.segments)
  const autoAdjust = useLotStore((s) => s.autoAdjust)
  const setAutoAdjust = useLotStore((s) => s.setAutoAdjust)

  if (segments.length < 3) {
    return (
      <div className="rounded-sm border border-[#D4DAE3] bg-[#F8F7F5] px-2 py-1.5">
        <span className="text-[9px] text-[#8896A7]">Need at least 3 segments to form a polygon</span>
      </div>
    )
  }

  if (!polygon) return null

  const { closure } = polygon
  const errorDisplay = closure.closureErrorMeters < 0.01
    ? '< 0.01m'
    : `${closure.closureErrorMeters.toFixed(2)}m`

  return (
    <div className={`rounded-sm border px-2 py-1.5 ${
      closure.isClosed
        ? 'border-[#2D9F6F]/20 bg-[#EDFAF4]'
        : 'border-[#D64545]/20 bg-[#FDF0F0]'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`h-1.5 w-1.5 rounded-full ${closure.isClosed ? 'bg-[#2D9F6F]' : 'bg-[#D64545]'}`} />
          <span className={`text-[10px] font-medium ${closure.isClosed ? 'text-[#2D9F6F]' : 'text-[#D64545]'}`}>
            {closure.isClosed ? 'Closed' : 'Open'}
          </span>
          <span className="font-mono text-[9px] text-[#8896A7]">
            error: {errorDisplay}
          </span>
        </div>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAdjust}
            onChange={(e) => setAutoAdjust(e.target.checked)}
            className="h-3 w-3 rounded-sm accent-[#1B3FC4]"
          />
          <span className="text-[8px] text-[#8896A7]">Bowditch</span>
        </label>
      </div>
      {!closure.isClosed && (
        <p className="mt-0.5 text-[8px] text-[#D64545]">
          Ratio: 1:{Math.round(1 / closure.closureErrorRatio)} (standard: 1:5000+)
        </p>
      )}
    </div>
  )
}
