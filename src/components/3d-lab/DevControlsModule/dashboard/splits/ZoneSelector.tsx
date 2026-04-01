'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { getAllZoneClasses, getZoningEntry } from '@/lib/pd1096/zoningTables'
import type { ZoneClass } from '@/lib/pd1096/types'

// ─── Zone Selector (Left Column) ───────────────────────────────────────────
// Dropdown only. Table VIII.1 reference is in ZoneTableRef.

const ZONE_OPTIONS = getAllZoneClasses().map((zc) => ({
  value: zc,
  label: getZoningEntry(zc).label,
}))

export function ZoneSelector() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const flarOverride = useDevControlsStore((s) => s.flarOverride)
  const setZoneClass = useDevControlsStore((s) => s.setZoneClass)
  const isCustomized = flarOverride !== undefined

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Zoning Classification
        </label>
        {isCustomized && (
          <span className="rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-medium text-amber-600">
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
      <p className="mt-1 text-[10px] text-muted-foreground">
        Sets Table VIII.1 development controls
      </p>
    </div>
  )
}
