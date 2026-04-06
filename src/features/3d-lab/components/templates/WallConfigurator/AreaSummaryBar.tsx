'use client'

import { useWallLabStore, computeAreaState } from '@/features/3d-lab/stores/useWallLabStore'

export function AreaSummaryBar() {
  const state = useWallLabStore((s) => s)
  const area = computeAreaState(state)

  return (
    <div className="flex divide-x divide-white/15 bg-[#1A2332] shrink-0">
      {[
        { label: 'Gross Area', value: area.grossAreaSqm.toFixed(2), unit: 'sqm', highlight: false },
        { label: 'Net Area', value: area.netAreaSqm.toFixed(2), unit: 'sqm', highlight: true },
        { label: 'Finish Area', value: area.finishAreaSqm.toFixed(2), unit: 'sqm', highlight: true },
      ].map((col) => (
        <div key={col.label} className="flex-1 flex flex-col items-center justify-center py-2.5 px-2 min-w-0">
          <span className="font-mono text-[8px] uppercase tracking-widest text-white/55 leading-none mb-1">
            {col.label}
          </span>
          <span
            className="font-mono text-[15px] font-medium tabular-nums leading-none"
            style={{ color: col.highlight ? '#F5A623' : '#ffffff' }}
          >
            {col.value}
          </span>
          <span className="font-mono text-[8px] text-white/40 leading-none mt-0.5">{col.unit}</span>
        </div>
      ))}
    </div>
  )
}
