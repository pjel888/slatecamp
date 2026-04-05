'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// ─── Reusable Slider ────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, step, unit, warning, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number
  unit: string; warning?: string; onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</label>
        <span className="font-mono text-xs font-medium text-foreground">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
        aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      />
      {warning && <p className="mt-0.5 text-[10px] text-warning">{warning}</p>}
    </div>
  )
}

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
