'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { Slider } from '../LotInputPanel'

// ─── Lot Controls (Left Column) ────────────────────────────────────────────
// Width, Depth, RROW sliders only. Summary readout is in LotSummary.

export function LotControls() {
  const lot = useDevControlsStore((s) => s.lot)
  const setLot = useDevControlsStore((s) => s.setLot)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)
  const setRrowWidth = useDevControlsStore((s) => s.setRrowWidth)

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Lot Parameters
      </label>
      <div className="space-y-3">
        <Slider label="Lot Width" value={lot.width} min={5} max={100} step={0.5} unit="m"
          onChange={(v) => setLot({ width: v })} />
        <Slider label="Lot Depth" value={lot.depth} min={5} max={100} step={0.5} unit="m"
          onChange={(v) => setLot({ depth: v })} />
        <Slider label="RROW Width" value={rrowWidth} min={6} max={40} step={1} unit="m"
          onChange={setRrowWidth} />
      </div>
    </div>
  )
}
