'use client'

import { useWallLabStore } from '@/features/3d-lab/stores/useWallLabStore'

export function GeometryStep() {
  const lengthM = useWallLabStore((s) => s.lengthM)
  const heightM = useWallLabStore((s) => s.heightM)
  const setGeometry = useWallLabStore((s) => s.setGeometry)

  const gross = (lengthM * heightM).toFixed(2)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-text-secondary leading-none">Length (m)</label>
          <input
            type="number"
            step={0.1}
            min={0.5}
            max={20}
            value={lengthM}
            onChange={(e) => setGeometry(parseFloat(e.target.value) || 0.5, heightM)}
            className="border border-border rounded-sm px-2 py-1.5 text-[13px] font-mono w-full focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-text-secondary leading-none">Height (m)</label>
          <input
            type="number"
            step={0.1}
            min={0.5}
            max={20}
            value={heightM}
            onChange={(e) => setGeometry(lengthM, parseFloat(e.target.value) || 0.5)}
            className="border border-border rounded-sm px-2 py-1.5 text-[13px] font-mono w-full focus:outline-none focus:border-primary transition-colors duration-150"
          />
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Gross area: <span className="font-mono">{gross}</span> sqm
      </p>
    </div>
  )
}
