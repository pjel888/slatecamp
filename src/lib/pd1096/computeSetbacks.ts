// src/lib/pd1096/computeSetbacks.ts
// ─── Zero rendering imports. Pure arithmetic. ──────────────────────────────
// Computes minimum setbacks per PD 1096 IRR:
//   Table VIII.2 — Residential zones
//   Table VIII.3 — Commercial/Industrial zones (RROW-based)
//   Section 704.4c — Firewall adjacency (zeroes affected side)
//
// NOTE: §804.6 incremental setback (+0.30m/storey) has been removed from
// the base computation. It may be reintroduced as a dedicated stepped-massing
// feature in a future module.

import type { ZoneClass, ZoningParams, BuildingParams, RROWParams, PerSideSetbacks, SetbackResult } from './types'
import { RESIDENTIAL_SETBACKS, lookupCommercialSetbacks } from './zoningTables'

// ─── Zone classification helpers ────────────────────────────────────────────

const RESIDENTIAL_ZONES = new Set<ZoneClass>([
  'R-1', 'R-2-basic', 'R-2-max', 'R-3-basic', 'R-3-max', 'R-4', 'R-5',
])

type ResidentialZone = 'R-1' | 'R-2-basic' | 'R-2-max' | 'R-3-basic' | 'R-3-max' | 'R-4' | 'R-5'

function isResidential(zc: ZoneClass): zc is ResidentialZone {
  return RESIDENTIAL_ZONES.has(zc)
}

// ─── Base setback lookup ────────────────────────────────────────────────────

function getBaseSetbacks(
  zoneClass: ZoneClass,
  rrowWidth: number,
): { front: number; side: number; rear: number; note: string } {
  if (isResidential(zoneClass)) {
    const entry = RESIDENTIAL_SETBACKS[zoneClass]
    return { front: entry.front, side: entry.side, rear: entry.rear, note: entry.note }
  }

  // Commercial, Industrial, Institutional, Cultural — RROW-based (Table VIII.3)
  const c = lookupCommercialSetbacks(rrowWidth)
  const rrowNote = rrowWidth >= 30 ? 'RROW ≥ 30m'
    : rrowWidth >= 25 ? 'RROW 25–29m'
    : rrowWidth >= 20 ? 'RROW 20–24m'
    : rrowWidth >= 10 ? 'RROW 10–19m'
    : 'RROW < 10m'
  return { front: c.front, side: c.side, rear: c.rear, note: rrowNote }
}

// ─── Main computation ───────────────────────────────────────────────────────

export function computeSetbacks(
  zoning: ZoningParams,
  _building: BuildingParams, // retained for signature compatibility; not used
  rrow: RROWParams,
  setbackOverrides?: Partial<PerSideSetbacks>,
): SetbackResult {
  const { zoneClass, firewallActive, firewallSides } = zoning

  // Step 1: Base setbacks from table lookup — static per zone/RROW
  const base = getBaseSetbacks(zoneClass, rrow.width)

  // Step 2: Effective = base, then apply user overrides (if any)
  const effective: PerSideSetbacks = {
    front: setbackOverrides?.front ?? base.front,
    rear:  setbackOverrides?.rear  ?? base.rear,
    left:  setbackOverrides?.left  ?? base.side,
    right: setbackOverrides?.right ?? base.side,
  }

  // Step 3: Firewall adjacency — zero setback on firewalled sides (§704.4c)
  let note = base.note
  if (firewallActive && firewallSides.length > 0) {
    for (const side of firewallSides) {
      effective[side] = 0
    }
    note += ` | Firewall active on ${firewallSides.join(', ')} — setback = 0`
  }

  return {
    base: {
      front: base.front,
      rear: base.rear,
      left: base.side,
      right: base.side,
    },
    incremental: 0, // incremental removed — always 0
    effective,
    note,
  }
}
