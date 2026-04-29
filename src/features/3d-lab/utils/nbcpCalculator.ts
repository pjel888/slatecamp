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
} from '../constants/nbcp'

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
  floorsOverride: number  // 0 = use code-computed max; >0 = user-set (may exceed BHL to show violation)
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

  // Step 3 — Setbacks (base table values only, no incremental)
  setbacks: PerSideSetbacks

  // Step 4 — AMBF
  buildableWidth: number
  buildableDepth: number
  ambf_by_setbacks: number
  ambf_by_pso: number
  ambf: number             // min(by_setbacks, by_pso)

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

  // Step 7 — AMVB
  amvb: number             // ambf × bhl_meters

  // Step 8 — Code-allowed storeys (FLAR–BHL crosscheck)
  effectiveStoreys: number // min(bhl_effective, floor(maxGFA / ambf)), clamped ≥ 1
  effectiveHeight: number  // effectiveStoreys × floorHeight

  // Display storeys — either code max or user override (may exceed BHL)
  displayStoreys: number
  displayHeight: number

  // Step 9 — Violations (only true code violations)
  violations: Violation[]
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export function calculateEnvelope(inputs: NBCPInputs): NBCPComputed {
  const { lotWidth, lotDepth, zoningClass, lotType, rrowWidth, floorHeight, firewalls, floorsOverride } = inputs

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

  // ── Step 3: Setbacks — base table values only (no incremental §804.6) ────
  const allowed = new Set<FirewallSide>(FIREWALL_ALLOWED[zoningClass])
  const cleanFirewalls: FirewallInputs = {
    front: firewalls.front && allowed.has('front'),
    rear:  firewalls.rear  && allowed.has('rear'),
    left:  firewalls.left  && allowed.has('left'),
    right: firewalls.right && allowed.has('right'),
  }

  const base = getBaseSetbacks(zoningClass, rrowWidth, bhl_effective)

  // Per-side setbacks accounting for lot type and firewalls
  //   CORNER:  left side (secondary road) uses front setback
  //   THROUGH: rear also uses front setback (RROW on both sides)
  //   END:     right side uses front setback
  const rawSetbacks: PerSideSetbacks = {
    front: base.front,
    rear:  lotType === LotType.THROUGH ? base.front : base.rear,
    left:  lotType === LotType.CORNER  ? base.front : base.side,
    right: lotType === LotType.END     ? base.front : base.side,
  }

  const setbacks: PerSideSetbacks = {
    front: cleanFirewalls.front ? 0 : rawSetbacks.front,
    rear:  cleanFirewalls.rear  ? 0 : rawSetbacks.rear,
    left:  cleanFirewalls.left  ? 0 : rawSetbacks.left,
    right: cleanFirewalls.right ? 0 : rawSetbacks.right,
  }

  // ── Step 4: AMBF (IRR Rule VIII §802-803) ────────────────────────────────
  const buildableWidth   = Math.max(0, lotWidth  - setbacks.left  - setbacks.right)
  const buildableDepth   = Math.max(0, lotDepth  - setbacks.front - setbacks.rear)
  const ambf_by_setbacks = buildableWidth * buildableDepth

  const pso = lotType === LotType.CORNER ? zoning.pso_corner : zoning.pso_inside
  const ambf_by_pso = tla * pso
  const ambf = Math.min(ambf_by_setbacks, ambf_by_pso)

  if (ambf <= 0) {
    violations.push({
      field: 'ambf',
      message: 'Lot too small for required setbacks',
      codeCitation: 'IRR Rule VIII §802–803',
    })
  }

  // ── Step 5: TOSL ──────────────────────────────────────────────────────────
  const tosl     = tla - ambf
  const tosl_pct = tla > 0 ? tosl / tla : 0

  // ── Step 6: GFA / FLAR ───────────────────────────────────────────────────
  const flar             = zoning.flar
  const maxGFA           = tla * flar
  const conversionFactor = zoning.isResidential ? GFA_CONVERSION.residential : GFA_CONVERSION.nonResidential
  const maxTGFA          = maxGFA * conversionFactor

  // ── Step 7: AMVB ──────────────────────────────────────────────────────────
  const amvb = ambf * bhl_meters

  // ── Step 8: Effective storeys — FLAR–BHL crosscheck ──────────────────────
  let flarLimitedStoreys = ambf > 0 ? Math.floor(maxGFA / ambf) : 0
  if (flarLimitedStoreys < 1) flarLimitedStoreys = 1

  const effectiveStoreys = Math.min(bhl_effective, flarLimitedStoreys)
  const effectiveHeight  = effectiveStoreys * floorHeight

  // ── Display storeys — user override allows exceeding BHL to show violation ─
  const displayStoreys = floorsOverride > 0 ? floorsOverride : effectiveStoreys
  const displayHeight  = displayStoreys * floorHeight

  // Violations driven by the display (override) value
  if (displayStoreys > bhl_effective) {
    violations.push({
      field: 'bhl',
      message: `Height ${displayHeight.toFixed(1)}m (${displayStoreys}F) exceeds BHL ${bhl_meters.toFixed(1)}m (${bhl_effective}F)`,
      codeCitation: 'IRR Rule VII §707 + Table VII.2',
    })
  }

  return {
    tla,
    bhl_zoning, bhl_rrow, bhl_effective, bhl_meters, bhl_source,
    setbacks,
    buildableWidth, buildableDepth,
    ambf_by_setbacks, ambf_by_pso, ambf,
    tosl, tosl_pct,
    pso,
    flar, maxGFA, conversionFactor, maxTGFA,
    amvb,
    effectiveStoreys, effectiveHeight,
    displayStoreys, displayHeight,
    violations,
  }
}
