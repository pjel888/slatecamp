'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// ─── Zone Class Display Names ──────────────────────────────────────────────

const ZONE_LABELS: Record<string, string> = {
  'R-1': 'R-1 Low-Density Residential',
  'R-2-basic': 'R-2 Basic Rowhouse',
  'R-2-master': 'R-2 Master-Planned',
  'R-3-basic': 'R-3 Basic Medium-Density',
  'R-3-max': 'R-3 Max Medium-Density',
  'R-4': 'R-4 High-Density Residential',
  'R-5': 'R-5 High-Rise Residential',
  'Com-1': 'C-1 Low-Intensity Commercial',
  'Com-2': 'C-2 Medium-Intensity Commercial',
  'Com-3': 'C-3 High-Intensity Commercial',
  'Ind-1': 'I-1 Light Industrial',
  'Ind-2': 'I-2 Medium Industrial',
  'Inst': 'Institutional',
}

// ─── Status Bar ────────────────────────────────────────────────────────────
// Full-width bottom bar showing persistent context: zone, FLAR, BHL.
// Format: "R-1 Low-Density Residential · FLAR 2.20 · BHL 3F/10m"

export function DevControlsStatusContent() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const result = useDevControlsStore((s) => s.result)

  const zoneLabel = ZONE_LABELS[zoneClass] ?? zoneClass
  const flar = result.flar.toFixed(2)
  const bhlStoreys = result.bhlStoreys
  const bhlMeters = result.bhlMeters.toFixed(0)

  return (
    <p className="truncate font-mono text-xs text-muted-foreground">
      {zoneLabel}
      <span className="mx-2 text-border">·</span>
      FLAR {flar}
      <span className="mx-2 text-border">·</span>
      BHL {bhlStoreys}F/{bhlMeters}m
    </p>
  )
}

export function StatusBar() {
  return (
    <div className="flex h-8 shrink-0 items-center border-t border-border bg-muted/50 px-4">
      <DevControlsStatusContent />
    </div>
  )
}
