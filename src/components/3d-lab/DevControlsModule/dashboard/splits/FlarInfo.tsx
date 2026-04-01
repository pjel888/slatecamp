'use client'

import { useDevControlsStore } from '../../stores/useDevControlsStore'
import { lookupFLAR } from '@/lib/pd1096/zoningTables'

// ─── FLAR Info (Right Column) ──────────────────────────────────────────────
// Computed metrics grid: FLAR applied, GFA, TGFA, FAR proposed, max floors.

export function FlarInfo() {
  const zoneClass = useDevControlsStore((s) => s.zoning.zoneClass)
  const flarOverride = useDevControlsStore((s) => s.flarOverride)
  const r = useDevControlsStore((s) => s.result)

  const flarRange = lookupFLAR(zoneClass)
  const currentFlar = r.flar
  const proposedFAR = r.tla > 0 ? r.proposedGFA / r.tla : 0
  const farCompliant = r.proposedGFA <= r.tgfa
  const isOutOfRange = flarOverride !== undefined && (
    flarOverride < flarRange.min - 0.01 || flarOverride > flarRange.max + 0.01
  )

  return (
    <div className="rounded-sm border border-border bg-muted/30 p-3">
      <p className="mb-2 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
        FLAR Metrics
      </p>
      <div className="space-y-1">
        <Row label="FLAR (applied)" value={currentFlar.toFixed(2)} warn={isOutOfRange} />
        <Row label="Zone range" value={
          `${flarRange.min.toFixed(2)}${flarRange.min !== flarRange.max ? `–${flarRange.max.toFixed(2)}` : ' (fixed)'}`
        } muted />
        <Row label="GFA allowable" value={`${r.gfa.toFixed(0)} sqm`} />
        <Row label="TGFA (FLAR)" value={`${r.tgfaByFlar.toFixed(0)} sqm`}
          highlight={r.tgfaSource === 'flar'} suffix={r.tgfaSource === 'flar' ? '← governs' : ''} />
        <Row label="TGFA (BHL)" value={`${r.tgfaByBhl.toFixed(0)} sqm`}
          highlight={r.tgfaSource === 'bhl'} suffix={r.tgfaSource === 'bhl' ? '← governs' : ''} />
        <Row label="TGFA (governing)" value={`${r.tgfa.toFixed(0)} sqm`} bold />
        <Row label="FAR (proposed)" value={proposedFAR.toFixed(2)} pass={farCompliant} />
        <Row label="Proposed GFA" value={`${r.proposedGFA.toFixed(0)} sqm`} pass={farCompliant} />
        <Row label="Max floors" value={`${r.maxCompliantFloors}F`} highlight />
      </div>
    </div>
  )
}

function Row({ label, value, warn, muted, highlight, bold, pass, suffix }: {
  label: string; value: string
  warn?: boolean; muted?: boolean; highlight?: boolean; bold?: boolean
  pass?: boolean; suffix?: string
}) {
  let valueClass = 'text-foreground'
  if (warn) valueClass = 'text-amber-600'
  if (muted) valueClass = 'text-muted-foreground'
  if (highlight) valueClass = 'text-primary font-medium'
  if (bold) valueClass = 'text-foreground font-medium'
  if (pass === true) valueClass = 'text-emerald-600 font-medium'
  if (pass === false) valueClass = 'text-destructive font-medium'

  return (
    <div className="flex items-baseline justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-mono tabular-nums ${valueClass}`}>
        {value}{suffix && <span className="ml-1 text-[8px] text-primary">{suffix}</span>}
      </span>
    </div>
  )
}
