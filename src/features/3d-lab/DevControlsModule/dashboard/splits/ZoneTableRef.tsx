'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { getZoningEntry } from '@/lib/pd1096/zoningTables'

// ─── Zone Table Reference (Right Column) ───────────────────────────────────
// Table VIII.1 reference card showing zone parameters.

export function ZoneTableRef() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const flarOverride = useDevControlsStore((s) => s.flarOverride)
  const entry = getZoningEntry(zoneClass)
  const isCustomized = flarOverride !== undefined

  return (
    <div className="rounded-sm border border-border bg-muted/30 p-3">
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        Table VIII.1 Reference
      </p>
      <div className="space-y-1">
        <Row label="PSO" value={
          entry.psoNoFirewall !== null
            ? `${(entry.psoNoFirewall * 100).toFixed(0)}%${entry.psoWithFirewall !== null ? ` / ${(entry.psoWithFirewall * 100).toFixed(0)}% (FW)` : ''}`
            : 'N/A (setback-only)'
        } />
        <Row label="ISA" value={`${(entry.isaPercent * 100).toFixed(0)}% of TLA`} />
        <Row label="USA" value={`${(entry.usaPercent * 100).toFixed(0)}% of TLA`} />
        <Row label="TOSL" value={`${(entry.toslPercent * 100).toFixed(0)}% of TLA`} />
        <Row label="BHL" value={`${entry.bhlStoreys}F / ${entry.bhlMeters}m`} />
        <Row label="FLAR" value={
          isCustomized
            ? `${flarOverride!.toFixed(2)} (${entry.flarMin}–${entry.flarMax})`
            : `${entry.flarMin}–${entry.flarMax}`
        } highlight={isCustomized} />
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-baseline justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums ${highlight ? 'text-amber-600' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  )
}
