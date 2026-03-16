// src/app/dashboard/3d-lab/_utils/nbcpCalculator.ts
// Pure function — no React, no Zustand, no side effects. Unit-testable in isolation.
// Implements sequential development control calculation per 2004 Revised IRR of PD 1096.

import {
  ZoningClass,
  LotType,
  ZONING_TABLE,
  FIREWALL_ALLOWED,
  GFA_CONVERSION,
  getRrowBhl,
  getBaseSetbacks,
  type FirewallSide,
} from '../_constants/nbcp'

// ─── I/O Types ────────────────────────────────────────────────────────────────

export interface FirewallInputs {
  front: boolean
  rear: boolean
  left: boolean
  right: boolean
}

export interface NBCPInputs {
  lotWidth: number      // meters, 5–200
  lotDepth: number      // meters, 5–200
  zoningClass: ZoningClass
  lotType: LotType
  rrowWidth: number     // meters, 6–40
  floorHeight: number   // meters per storey, 2.7–4.0 (design assumption)
  firewalls: FirewallInputs
}

export interface Violation {
  field: string
  message: string
  codeCitation: string
}

export interface PerSideSetbacks {
  front: number
  rear: number
  left: number
  right: number
}

export interface NBCPComputed {
  // Step 1 — Lot
  tla: number

  // Step 2 — BHL
  bhl_zoning: number       // from ZONING_TABLE (storeys)
  bhl_rrow: number         // from RROW_BHL_TABLE (storeys)
  bhl_effective: number    // min(bhl_zoning, bhl_rrow)
  bhl_meters: number       // bhl_effective × floorHeight
  bhl_source: 'zoning' | 'rrow'

  // Step 3 — Setbacks
  setbacks: PerSideSetbacks
  incrementalSetback: number  // 0.30 × min(bhl_effective - 2, 12), ≥ 0

  // Step 4 — AMBF
  buildableWidth: number
  buildableDepth: number
  ambf_by_setbacks: number
  ambf_by_pso: number
  ambf: number             // min(by_setbacks, by_pso) — post-PSO

  // Step 5 — TOSL
  tosl: number
  tosl_pct: number         // 0.0–1.0

  // Step 6 — PSO
  pso: number              // 0.0–1.0

  // Step 7 — GFA / FLAR
  flar: number
  maxGFA: number           // tla × flar
  conversionFactor: number
  maxTGFA: number          // maxGFA × conversionFactor

  // Step 7 — AMVB (valid because ambf is already post-PSO from Step 4)
  amvb: number             // ambf × bhl_meters

  // Step 8 — Effective storeys (FLAR-BHL crosscheck)
  effectiveStoreys: number // min(bhl_effective, floor(maxGFA / ambf)), clamped ≥ 1
  effectiveHeight: number  // effectiveStoreys × floorHeight

  // Step 9 — Violations
  violations: Violation[]
}

// ─── Calculator ───────────────────────────────────────────────────────────────

/**
 * Pure function implementing the sequential development control calculation
 * from the 2004 Revised IRR of PD 1096 (Rules VII & VIII).
 *
 * Never throws. Invalid inputs produce violations[], not exceptions.
 * All section references are to the 2004 Revised IRR unless otherwise noted.
 */
export function calculateEnvelope(inputs: NBCPInputs): NBCPComputed {
  const { lotWidth, lotDepth, zoningClass, lotType, rrowWidth, floorHeight, firewalls } = inputs

  const zoning = ZONING_TABLE[zoningClass]
  const violations: Violation[] = []

  // ── Step 1: TLA ───────────────────────────────────────────────────────────
  const tla = lotWidth * lotDepth

  // ── Step 2: BHL (IRR Rule VII §707 + Table VII.2) ────────────────────────
  const bhl_zoning = zoning.bhl_storeys
  const bhl_rrow   = getRrowBhl(rrowWidth)
  const bhl_effective = Math.min(bhl_zoning, bhl_rrow)
  const bhl_meters    = bhl_effective * floorHeight
  const bhl_source: 'zoning' | 'rrow' = bhl_rrow < bhl_zoning ? 'rrow' : 'zoning'
  // Note: use strict < (not <=). When RROW and zoning BHL are equal, neither is
  // more restrictive — source = 'zoning' avoids spurious amber building color.

  // ── Step 3: Setbacks (IRR Rule VIII Tables VIII.2 & VIII.3 + §804.6) ─────
  // Sanitize firewalls: disallowed sides forced to false
  const allowed = new Set<FirewallSide>(FIREWALL_ALLOWED[zoningClass])
  const cleanFirewalls: FirewallInputs = {
    front: firewalls.front && allowed.has('front'),
    rear:  firewalls.rear  && allowed.has('rear'),
    left:  firewalls.left  && allowed.has('left'),
    right: firewalls.right && allowed.has('right'),
  }

  // Base setbacks from table (before incremental)
  const base = getBaseSetbacks(zoningClass, rrowWidth, bhl_effective)

  // Incremental setback: 0.30m per storey above 2nd, capped at storey 14
  // IRR Rule VIII §804.6
  const incrementalStoreys   = Math.min(Math.max(bhl_effective - 2, 0), 12)
  const incrementalSetback   = incrementalStoreys * 0.30

  // Per-side setbacks accounting for lot type and firewalls
  // Lot type rules:
  //   CORNER:  left side (secondary road) uses front setback
  //   THROUGH: rear also uses front setback (RROW on both sides)
  //   END:     right side (secondary road-end, canonical) uses front setback
  const frontSb = base.front + incrementalSetback
  const sideSb  = base.side  + incrementalSetback
  const rearSb  = base.rear  + incrementalSetback

  const rawSetbacks: PerSideSetbacks = {
    front: frontSb,
    rear:  (lotType === LotType.THROUGH)           ? frontSb : rearSb,
    left:  (lotType === LotType.CORNER)            ? frontSb : sideSb,
    right: (lotType === LotType.END)               ? frontSb : sideSb,
  }

  const setbacks: PerSideSetbacks = {
    front: cleanFirewalls.front ? 0 : rawSetbacks.front,
    rear:  cleanFirewalls.rear  ? 0 : rawSetbacks.rear,
    left:  cleanFirewalls.left  ? 0 : rawSetbacks.left,
    right: cleanFirewalls.right ? 0 : rawSetbacks.right,
  }

  // ── Step 4: AMBF (IRR Rule VIII §802-803 + Rule VII Guidelines) ──────────
  const buildableWidth   = Math.max(0, lotWidth  - setbacks.left  - setbacks.right)
  const buildableDepth   = Math.max(0, lotDepth  - setbacks.front - setbacks.rear)
  const ambf_by_setbacks = buildableWidth * buildableDepth

  // PSO: CORNER gets pso_corner; all other lot types use pso_inside
  const pso = lotType === LotType.CORNER ? zoning.pso_corner : zoning.pso_inside
  const ambf_by_pso = tla * pso

  // Most stringent rule governs (IRR Rule VII Guidelines — sequential DC application)
  const ambf = Math.min(ambf_by_setbacks, ambf_by_pso)

  if (ambf <= 0) {
    violations.push({
      field: 'ambf',
      message: 'Lot too small for required setbacks',
      codeCitation: 'IRR Rule VIII §802–803',
    })
  }

  // ── Step 5: TOSL (IRR Rule VIII §804 + Guidelines §4) ────────────────────
  const tosl     = tla - ambf
  const tosl_pct = tla > 0 ? tosl / tla : 0

  // ── Step 6: GFA / FLAR (IRR Rule VII Guidelines Table VII.G.1) ───────────
  const flar             = zoning.flar
  const maxGFA           = tla * flar
  const conversionFactor = zoning.isResidential ? GFA_CONVERSION.residential : GFA_CONVERSION.nonResidential
  const maxTGFA          = maxGFA * conversionFactor

  // ── Step 7: AMVB (IRR Rule VII Guidelines — AMVB procedure) ─────────────
  // Valid because ambf is post-PSO (Step 4 already applied the most-stringent rule)
  const amvb = ambf * bhl_meters

  // ── Step 8: Effective storeys — FLAR–BHL crosscheck ─────────────────────
  // IRR Rule VII Guidelines (sequential DC application)
  let flarLimitedStoreys = ambf > 0 ? Math.floor(maxGFA / ambf) : 0

  if (flarLimitedStoreys < 1) {
    violations.push({
      field: 'flar',
      message: 'FLAR too restrictive: max GFA smaller than single-floor footprint',
      codeCitation: 'IRR Rule VII Guidelines Table VII.G.1',
    })
    flarLimitedStoreys = 1  // clamp so 3D scene always renders ≥1 storey
  } else if (flarLimitedStoreys < bhl_effective) {
    violations.push({
      field: 'flar',
      message: `FLAR limits building to ${flarLimitedStoreys} storeys (BHL allows ${bhl_effective})`,
      codeCitation: 'IRR Rule VII Guidelines Table VII.G.1',
    })
  }

  const effectiveStoreys = Math.min(bhl_effective, flarLimitedStoreys)
  const effectiveHeight  = effectiveStoreys * floorHeight

  return {
    tla,
    bhl_zoning, bhl_rrow, bhl_effective, bhl_meters, bhl_source,
    setbacks, incrementalSetback,
    buildableWidth, buildableDepth,
    ambf_by_setbacks, ambf_by_pso, ambf,
    tosl, tosl_pct,
    pso,
    flar, maxGFA, conversionFactor, maxTGFA,
    amvb,
    effectiveStoreys, effectiveHeight,
    violations,
  }
}
