// src/lib/pd1096/computeSetbacks.ts
// ─── Zero rendering imports. Pure arithmetic. ──────────────────────────────
// Computes minimum setbacks per PD 1096 IRR:
//   Table VIII.2 — Residential zones
//   Table VIII.3 — Commercial/Industrial zones (RROW-based)
//   Section 804.6 — Incremental setback (+0.30m per storey above 2, cap 14)
//   Section 704.4c — Firewall adjacency (zeroes affected side)

import type { ZoneClass, ZoningParams, BuildingParams, PerSideSetbacks, SetbackResult } from './types'
import type { RROWParams } from './types'
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

// ─── Incremental setback — §804.6 ──────────────────────────────────────────
// +0.30m per storey above 2, capped at storey 14.
// Applied to side and rear setbacks only (front is not incremented).

function computeIncrement(proposedStoreys: number): number {
  const cappedStoreys = Math.min(proposedStoreys, 14)
  return 0.30 * Math.max(0, cappedStoreys - 2)
}

// ─── Main computation ───────────────────────────────────────────────────────

export function computeSetbacks(
  zoning: ZoningParams,
  building: BuildingParams,
  rrow: RROWParams,
): SetbackResult {
  const { zoneClass, firewallActive, firewallSides } = zoning

  // Step 1: Base setbacks from table lookup
  const base = getBaseSetbacks(zoneClass, rrow.width)

  // Step 2: Incremental adjustment per §804.6
  const increment = computeIncrement(building.proposedStoreys)

  // Step 3: Build effective setbacks (base + increment for side/rear)
  const effective: PerSideSetbacks = {
    front: base.front,
    rear: base.rear + increment,
    left: base.side + increment,
    right: base.side + increment,
  }

  // Step 4: Firewall adjacency — zero setback on firewalled sides (§704.4c)
  let note = base.note
  if (firewallActive && firewallSides.length > 0) {
    for (const side of firewallSides) {
      effective[side] = 0
    }
    note += ` | Firewall active on ${firewallSides.join(', ')} — setback = 0`
  }

  if (increment > 0) {
    note += ` | §804.6 increment +${increment.toFixed(2)}m (${Math.min(building.proposedStoreys, 14)} storeys)`
  }

  return {
    base: {
      front: base.front,
      rear: base.rear,
      left: base.side,
      right: base.side,
    },
    incremental: increment,
    effective,
    note,
  }
}
