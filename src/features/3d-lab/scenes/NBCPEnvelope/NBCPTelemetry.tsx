// src/app/dashboard/3d-lab/_scenes/NBCPEnvelope/NBCPTelemetry.tsx
'use client'

import { memo } from 'react'
import { Warning } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { useNBCPStore } from '@/features/3d-lab/stores/nbcpStore'

function Row({ label, desc, value, state = 'normal', sub }: {
  label: string
  desc: string
  value: string
  state?: 'normal' | 'red' | 'amber' | 'green'
  sub?: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-foreground">{label}</span>
          <div className="text-[11px] text-muted-foreground leading-tight">{desc}</div>
        </div>
        <div className="text-right shrink-0">
          <span className={cn(
            'text-[11px] font-bold tabular-nums font-mono',
            state === 'red'    && 'text-red-600',
            state === 'amber'  && 'text-amber-600',
            state === 'green'  && 'text-green-600',
            state === 'normal' && 'text-foreground',
          )}>
            {value}
          </span>
          {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
        </div>
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
    displayStoreys, displayHeight: _displayHeight,
    tosl, tosl_pct,
    amvb, setbacks, violations,
  } = computed

  const fmt = (n: number, dp = 2) => n.toFixed(dp)
  const fmtArea = (n: number) => `${fmt(n)} sqm`

  const ambfConstrainedBySetbacks = ambf_by_setbacks < ambf_by_pso

  return (
    <div className="absolute right-4 top-4 bottom-4 z-10 w-72 overflow-y-auto
      bg-card/90 backdrop-blur-sm border border-border rounded-md shadow-lg p-3 space-y-2">

      <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
        Development Controls
      </span>

      <Row
        label="TLA — Total Lot Area"
        desc="The full area of the lot being developed"
        value={fmtArea(tla)}
      />
      <Row
        label="PSO — Percentage of Site Occupancy"
        desc="Max fraction of the lot that buildings may cover"
        value={`${(pso * 100).toFixed(0)}%`}
        sub={inputs.lotType}
      />
      <Row
        label="AMBF — Allowable Max Building Footprint"
        desc="The buildable floor area after setbacks and PSO"
        value={fmtArea(ambf)}
        state={ambfConstrainedBySetbacks ? 'amber' : 'normal'}
        sub={ambfConstrainedBySetbacks ? 'setback-limited' : 'PSO-limited'}
      />
      <Row
        label="BHL — Building Height Limit"
        desc="Maximum number of storeys and height above grade"
        value={`${bhl_effective}F / ${fmt(bhl_meters, 1)}m`}
        state={bhl_source === 'rrow' ? 'amber' : 'normal'}
        sub={bhl_source === 'rrow' ? 'RROW-limited' : 'Zoning-limited'}
      />
      <Row
        label="FLAR — Floor to Lot Area Ratio"
        desc="Multiplier that sets the max total floor area allowed"
        value={`${fmt(flar, 2)}×`}
      />
      <Row
        label="Max GFA — Gross Floor Area"
        desc="Maximum total floor area across all storeys (TLA × FLAR)"
        value={fmtArea(maxGFA)}
      />
      <Row
        label="Allowable Storeys"
        desc="Code-permitted floors after applying both BHL and FLAR"
        value={`${effectiveStoreys}F × ${fmt(inputs.floorHeight, 1)}m = ${fmt(effectiveHeight, 1)}m`}
        state={displayStoreys > bhl_effective ? 'red' : 'normal'}
        sub={displayStoreys > bhl_effective ? `Displaying ${displayStoreys}F — exceeds BHL` : undefined}
      />
      <Row
        label="TOSL — Total Open Space on Lot"
        desc="Unbuilt area remaining after AMBF is applied"
        value={`${fmtArea(tosl)} (${(tosl_pct * 100).toFixed(0)}%)`}
        state={tosl_pct > 0.35 ? 'green' : 'normal'}
      />
      <Row
        label="AMVB — Allowable Max Volume of Building"
        desc="AMBF × BHL height — the code-permitted building volume"
        value={`${fmt(amvb)} m³`}
      />

      {/* Setbacks */}
      <div className="pt-1 border-t border-border space-y-1">
        <div className="text-[11px] font-bold text-foreground">Required Setbacks</div>
        <div className="text-[11px] text-muted-foreground leading-tight">
          Minimum clearance between property line and building face
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1">
          <div className="text-[11px] font-mono text-foreground">Front: {fmt(setbacks.front, 1)}m</div>
          <div className="text-[11px] font-mono text-foreground">Rear: {fmt(setbacks.rear, 1)}m</div>
          <div className="text-[11px] font-mono text-foreground">Left: {fmt(setbacks.left, 1)}m</div>
          <div className="text-[11px] font-mono text-foreground">Right: {fmt(setbacks.right, 1)}m</div>
        </div>
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <div className="pt-1 border-t border-red-200 space-y-1.5">
          {violations.map((v, i) => (
            <div key={i} className="bg-red-50 border border-red-200 rounded px-2 py-1.5 flex gap-1.5">
              <SCIcon icon={Warning} size="xs" className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-red-700">{v.message}</p>
                <p className="text-[11px] text-red-500 mt-0.5">{v.codeCitation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})
