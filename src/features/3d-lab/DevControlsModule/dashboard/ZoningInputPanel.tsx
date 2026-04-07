'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'
import { getAllZoneClasses, getZoningEntry } from '@/lib/pd1096/zoningTables'
import type { ZoneClass } from '@/lib/pd1096/types'

const ZONE_OPTIONS = getAllZoneClasses().map((zc) => ({
  value: zc,
  label: getZoningEntry(zc).label,
}))

export function ZoningInputPanel() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const flarOverride = useDevControlsStore((s) => s.flarOverride)
  const setZoneClass = useDevControlsStore((s) => s.setZoneClass)

  const entry = getZoningEntry(zoneClass)
  const isCustomized = flarOverride !== undefined

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Zoning Classification
        </label>
        {isCustomized && (
          <span className="rounded-sm bg-warning/10 px-1.5 py-0.5 text-[8px] font-medium text-warning">
            CUSTOM FLAR
          </span>
        )}
      </div>
      <select
        value={zoneClass}
        onChange={(e) => setZoneClass(e.target.value as ZoneClass)}
        className="w-full rounded-sm border border-border bg-card px-2 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
      >
        {ZONE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Table VIII.1 reference data */}
      <div className="mt-2 rounded-sm border border-border bg-surface-light p-2">
        <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mb-1">Table VIII.1 Reference</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
          <span className="text-muted-foreground">PSO</span>
          <span className="font-mono text-foreground">
            {entry.psoNoFirewall !== null ? `${(entry.psoNoFirewall * 100).toFixed(0)}%` : 'N/A (setback-only)'}
            {entry.psoWithFirewall !== null && ` / ${(entry.psoWithFirewall * 100).toFixed(0)}% (FW)`}
          </span>
          <span className="text-muted-foreground">ISA</span>
          <span className="font-mono text-foreground">{(entry.isaPercent * 100).toFixed(0)}% of TLA</span>
          <span className="text-muted-foreground">USA</span>
          <span className="font-mono text-foreground">{(entry.usaPercent * 100).toFixed(0)}% of TLA</span>
          <span className="text-muted-foreground">TOSL</span>
          <span className="font-mono text-foreground">{(entry.toslPercent * 100).toFixed(0)}% of TLA</span>
          <span className="text-muted-foreground">BHL</span>
          <span className="font-mono text-foreground">{entry.bhlStoreys}F / {entry.bhlMeters}m</span>
          <span className="text-muted-foreground">FLAR</span>
          <span className="font-mono text-foreground">
            {isCustomized
              ? <><span className="text-warning">{flarOverride!.toFixed(2)}</span> <span className="text-muted-foreground">({entry.flarMin}–{entry.flarMax})</span></>
              : `${entry.flarMin}–${entry.flarMax}`
            }
          </span>
        </div>
      </div>

      {/* Firewall controls moved to dedicated FirewallPanel */}
    </div>
  )
}
