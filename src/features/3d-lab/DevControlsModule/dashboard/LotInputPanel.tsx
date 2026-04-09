'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

// Re-export LabSlider as Slider for backward compatibility with existing imports
const Slider = ({
  label, value, min, max, step, unit, warning, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  unit: string; warning?: string; onChange: (v: number) => void
}) => (
  <LabSlider
    label={label}
    value={value}
    min={min}
    max={max}
    step={step}
    unit={unit}
    onChange={onChange}
    showRangeLabels={false}
    contextLine={warning}
    contextLineType="warning"
  />
)

export { Slider }

// ─── Lot Input Panel (Basic Lot — rectangular) ──────────────────────────────

export function LotInputPanel() {
  const lot = useDevControlsStore((s) => s.lot)
  const setLot = useDevControlsStore((s) => s.setLot)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)
  const setRrowWidth = useDevControlsStore((s) => s.setRrowWidth)
  const tla = useDevControlsStore((s) => s.result.tla)

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
      {/* Lot summary */}
      <div className="mt-2 border-t border-dashed border-border pt-2">
        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Lot Summary</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
          <span className="text-muted-foreground">Area</span>
          <span className="font-mono text-foreground tabular-nums">{tla.toFixed(1)} sq.m.</span>
          <span className="text-muted-foreground">Frontage</span>
          <span className="font-mono text-foreground tabular-nums">{lot.width.toFixed(1)} m</span>
        </div>
      </div>
    </div>
  )
}
