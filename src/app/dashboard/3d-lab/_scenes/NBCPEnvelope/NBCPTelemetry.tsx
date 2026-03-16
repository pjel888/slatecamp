// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPTelemetry.tsx
'use client'

import { memo } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNBCPStore } from '../../_stores/nbcpStore'

function Row({ label, value, state = 'normal', sub }: {
  label: string; value: string; state?: 'normal' | 'red' | 'amber' | 'green'; sub?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] text-zinc-500 shrink-0">{label}</span>
      <div className="text-right">
        <span className={cn(
          'text-[11px] font-bold tabular-nums font-mono',
          state === 'red'   && 'text-red-600',
          state === 'amber' && 'text-amber-600',
          state === 'green' && 'text-green-600',
          state === 'normal'&& 'text-zinc-900',
        )}>
          {value}
        </span>
        {sub && <div className="text-[9px] text-zinc-400">{sub}</div>}
      </div>
    </div>
  )
}

export const NBCPTelemetry = memo(function NBCPTelemetry() {
  const { computed, inputs } = useNBCPStore()
  const {
    tla, pso, ambf, ambf_by_setbacks, ambf_by_pso,
    bhl_effective, bhl_meters, bhl_source,
    flar, maxGFA, effectiveStoreys, effectiveHeight,
    tosl, tosl_pct,
    amvb, setbacks, violations,
  } = computed

  const fmt = (n: number, dp = 2) => n.toFixed(dp)
  const fmtArea = (n: number) => `${fmt(n)} sqm`

  const ambfConstrainedBySetbacks = ambf_by_setbacks < ambf_by_pso

  return (
    <div className="absolute right-4 top-4 bottom-4 z-10 w-64 overflow-y-auto
      bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-1.5">

      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">
        Computed Values
      </span>

      <Row
        label="TLA"
        value={fmtArea(tla)}
      />
      <Row
        label="PSO"
        value={`${(pso * 100).toFixed(0)}%`}
        sub={inputs.lotType}
      />
      <Row
        label="AMBF"
        value={fmtArea(ambf)}
        state={ambfConstrainedBySetbacks ? 'amber' : 'normal'}
        sub={ambfConstrainedBySetbacks ? 'setback-limited' : 'PSO-limited'}
      />
      <Row
        label="BHL"
        value={`${bhl_effective} storeys / ${fmt(bhl_meters, 2)}m`}
        state={bhl_source === 'rrow' ? 'amber' : 'normal'}
        sub={bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}
      />
      <Row
        label="FLAR"
        value={`${fmt(flar, 2)}×`}
      />
      <Row
        label="Max GFA"
        value={fmtArea(maxGFA)}
        state={effectiveStoreys < bhl_effective ? 'red' : 'normal'}
      />
      <Row
        label="Eff. Storeys"
        value={`${effectiveStoreys} × ${fmt(inputs.floorHeight, 1)}m = ${fmt(effectiveHeight, 1)}m`}
        state={effectiveStoreys < bhl_effective ? 'amber' : 'normal'}
      />
      <Row
        label="TOSL"
        value={`${fmtArea(tosl)} (${(tosl_pct * 100).toFixed(0)}%)`}
        state={tosl_pct > 0.35 ? 'green' : 'normal'}
      />
      <Row
        label="AMVB"
        value={`${fmt(amvb)} m³`}
      />

      {/* Setbacks */}
      <div className="pt-1 border-t border-border">
        <div className="text-[10px] text-zinc-400 mb-0.5">Setbacks</div>
        <div className="text-[10px] font-mono text-zinc-700">
          Front: {fmt(setbacks.front, 1)} | Rear: {fmt(setbacks.rear, 1)}
        </div>
        <div className="text-[10px] font-mono text-zinc-700">
          Left: {fmt(setbacks.left, 1)} | Right: {fmt(setbacks.right, 1)}
        </div>
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="pt-1 border-t border-red-200 space-y-1.5">
          {violations.map((v, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded px-2 py-1.5 flex gap-1.5">
              <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-red-700">{v.message}</p>
                <p className="text-[9px] text-red-500 mt-0.5">{v.codeCitation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
