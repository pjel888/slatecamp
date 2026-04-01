'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { useLotStore } from '../stores/useLotStore'
import { LotModeToggle } from './LotModeToggle'
import { SurveyorLotInputs } from './SurveyorLotInputs'
import { LotSummaryFooter } from './LotSummaryFooter'

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
        <label className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">{label}</label>
        <span className="font-mono text-xs font-medium text-[#1A2332]">
          {value.toFixed(step < 1 ? 1 : 0)} {unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#D4DAE3] accent-[#1B3FC4]"
        aria-label={label} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value}
      />
      {warning && <p className="mt-0.5 text-[10px] text-[#D4951A]">{warning}</p>}
    </div>
  )
}

export { Slider }

// ─── Basic Lot Inputs (rectangle mode) ──────────────────────────────────────

function BasicLotInputs() {
  const lot = useDevControlsStore((s) => s.lot)
  const setLot = useDevControlsStore((s) => s.setLot)

  return (
    <div>
      <p className="text-[9px] font-medium uppercase tracking-widest text-[#8896A7] mb-2">Lot Dimensions</p>
      <div className="space-y-3">
        <Slider label="Width (frontage)" value={lot.width} min={5} max={100} step={0.5} unit="m"
          onChange={(v) => setLot({ width: v })} />
        <Slider label="Depth" value={lot.depth} min={5} max={100} step={0.5} unit="m"
          onChange={(v) => setLot({ depth: v })} />
      </div>
    </div>
  )
}

// ─── Lot Input Panel (unified) ──────────────────────────────────────────────

export function LotInputPanel() {
  const mode = useLotStore((s) => s.mode)
  const rrowWidth = useDevControlsStore((s) => s.rrow.width)
  const setRrowWidth = useDevControlsStore((s) => s.setRrowWidth)

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Lot Parameters
      </label>

      {/* Mode toggle */}
      <div className="mb-3">
        <LotModeToggle />
      </div>

      {/* Mode-specific inputs */}
      {mode === 'rectangle' ? <BasicLotInputs /> : <SurveyorLotInputs />}

      {/* RROW — shared by both modes */}
      <div className="mt-3">
        <Slider label="RROW Width" value={rrowWidth} min={6} max={40} step={1} unit="m"
          onChange={setRrowWidth} />
      </div>

      {/* Summary footer — shared by both modes */}
      <div className="mt-3 border-t border-dashed border-[#D4DAE3] pt-2">
        <LotSummaryFooter />
      </div>
    </div>
  )
}
