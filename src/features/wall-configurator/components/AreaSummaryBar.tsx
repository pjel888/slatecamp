'use client'

import { useWallComputation } from '../hooks/useWallComputation'
import { useWallConfigStore } from '../store/useWallConfigStore'

export function AreaSummaryBar() {
  const step = useWallConfigStore((s) => s.step)
  const sides = useWallConfigStore((s) => s.config.sides)
  const { areaState } = useWallComputation()

  const hasGeometry = step >= 2
  const fmt = (n: number) => n.toFixed(2)

  return (
    <div className="bg-ink-primary">
      <dl className="flex divide-x divide-white/15">
        <div className="flex flex-1 flex-col px-4 py-3">
          <dt className="font-mono text-[8px] uppercase tracking-widest text-white/55">
            Gross Area
          </dt>
          <dd className="mt-0.5 font-mono text-[15px] font-medium tabular-nums text-white">
            {hasGeometry ? `${fmt(areaState.grossAreaSqm)} sqm` : '—'}
          </dd>
        </div>

        <div className="flex flex-1 flex-col px-4 py-3">
          <dt className="font-mono text-[8px] uppercase tracking-widest text-white/55">
            Openings
          </dt>
          <dd className="mt-0.5 font-mono text-[15px] font-medium tabular-nums text-white">
            {hasGeometry ? `${fmt(areaState.openingAreaSqm)} sqm` : '—'}
          </dd>
        </div>

        <div className="flex flex-1 flex-col px-4 py-3">
          <dt className="font-mono text-[8px] uppercase tracking-widest text-white/55">
            Net Area
          </dt>
          <dd className="mt-0.5 font-mono text-[15px] font-medium tabular-nums text-warning">
            {hasGeometry ? `${fmt(areaState.netAreaSqm)} sqm` : '—'}
          </dd>
        </div>

        <div className="flex flex-1 flex-col px-4 py-3">
          <dt className="font-mono text-[8px] uppercase tracking-widest text-white/55">
            {sides === 2 ? 'Finish Area (×2)' : 'Finish Area'}
          </dt>
          <dd className="mt-0.5 font-mono text-[15px] font-medium tabular-nums text-warning">
            {hasGeometry ? `${fmt(areaState.finishAreaSqm)} sqm` : '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}
