// src/app/dashboard/3d-lab/_utils/siteControlsCalculator.ts
// Pure function — no React, no Zustand, no side effects. Unit-testable in isolation.
// Implements site development control calculation per 2004 Revised IRR of PD 1096.
//
// AUTHORITY: "PD 1096 Rules VII & VIII — Formula Fact-Check & Corrections"
// ALL formulas are sourced from the Fact-Check corrections, which override the
// original engineering plan wherever they conflict.
//
// Enhanced for UX Plan §03: TGFA, BHL, floor-based parametrics.

import {
  ZoningClass,
  getBaseSetbacks,
} from '../_constants/nbcp'

import {
  SITE_CONTROL_TABLE,
  type SiteControlZoning,
} from '../_constants/siteControls'

// ─── I/O Types ────────────────────────────────────────────────────────────────

export interface SiteControlInputs {
  lotWidth: number          // meters, 5–100
  lotDepth: number          // meters, 5–100
  zoningClass: ZoningClass
  rrowWidth: number         // meters, 6–40 (needed for non-R-1 setbacks)
  numFloors: number         // 1–10 (UX Plan §03)
  floorHeight: number       // meters, 2.4–5.0 per floor (UX Plan §03)
}

export interface Violation {
  field: string
  message: string
  codeCitation: string
  severity: 'error' | 'warning'
}

export interface PerSideSetbacks {
  front: number
  rear: number
  left: number
  right: number
}

export interface SiteControlOutputs {
  // Step 1 — Lot
  tla: number               // Total Lot Area (sqm)

  // Step 2 — Setbacks (from Table VIII.2 / VIII.3)
  setbacks: PerSideSetbacks

  // Step 3 — Buildable envelope
  buildableWidth: number    // meters
  buildableDepth: number    // meters

  // Step 4 — AMBF (Rule VIII Sec. 803, Table VIII.1)
  ambf_by_setbacks: number  // setback-limited footprint (sqm)
  ambf_by_pso: number       // zoning-limited footprint (sqm)
  ambf: number              // Effective AMBF = min(by_setbacks, by_pso)

  // Step 5 — PSO (Rule VIII Sec. 803) — a RATIO, NOT an area
  pso: number               // 0.0–1.0 (e.g., 0.495 for 49.5% lot coverage)

  // Step 6 — Open space breakdown (Rule VIII Sec. 803, Table VIII.1)
  tosl: number              // Total Open Space within Lot (sqm) = TLA − AMBF
  isa: number               // Impervious Surface Area (sqm) = ISA% × TLA
  usa: number               // Unpaved Surface Area (sqm) = USA% × TLA

  // Step 7 — MACA (Rule VIII Sec. 803, note c) = AMBF + ISA
  maca: number              // Maximum Allowable Construction Area (sqm)

  // Step 8 — Floor-based outputs (UX Plan §03)
  buildingHeight: number    // meters = numFloors × floorHeight
  tgfa: number              // Total Gross Floor Area (sqm) = AMBF × numFloors
  bhl: number               // Building Height = numFloors × floorHeight
  footprintPct: number      // AMBF / TLA × 100

  // Zoning reference data (for UI display)
  zoningData: SiteControlZoning

  // Compliance
  violations: Violation[]
  compliance: {
    ambfOk: boolean         // AMBF ≤ maxPSO × TLA
    toslOk: boolean         // Actual TOSL ≥ minimum required TOSL
    identityOk: boolean     // AMBF + TOSL ≈ TLA (governing IRR identity)
    setbacksOk: boolean     // Buildable area > 0 after setbacks
    floorHeightOk: boolean  // Floor height ≥ 2.7m habitable
    message: string
  }
}

// ─── Calculator ───────────────────────────────────────────────────────────────

export function calculateSiteControls(inputs: SiteControlInputs): SiteControlOutputs {
  const { lotWidth, lotDepth, zoningClass, rrowWidth, numFloors, floorHeight } = inputs
  const violations: Violation[] = []

  // Look up zoning data from Table VIII.1
  const zoningData = SITE_CONTROL_TABLE[zoningClass]

  // ── Step 1: TLA (Rule VIII Sec. 803) ─────────────────────────────────────
  const tla = lotWidth * lotDepth

  // ── Step 2: Setbacks (Rule VII Sec. 704 + Rule VIII Sec. 804) ────────────
  const bhlForSetbacks = zoningClass === ZoningClass.R1 ? 3 : 5
  const baseSetbacks = getBaseSetbacks(zoningClass, rrowWidth, bhlForSetbacks)

  const setbacks: PerSideSetbacks = {
    front: baseSetbacks.front,
    rear: baseSetbacks.rear,
    left: baseSetbacks.side,
    right: baseSetbacks.side,
  }

  // ── Step 3: Buildable envelope (Rule VII Sec. 704) ───────────────────────
  const buildableWidth = Math.max(0, lotWidth - setbacks.left - setbacks.right)
  const buildableDepth = Math.max(0, lotDepth - setbacks.front - setbacks.rear)

  // ── Step 4: AMBF (Rule VIII Sec. 803, Table VIII.1) ──────────────────────
  const ambf_by_setbacks = buildableWidth * buildableDepth
  const ambf_by_pso = zoningData.maxPSO * tla
  const ambf = Math.min(ambf_by_setbacks, ambf_by_pso)

  if (ambf <= 0) {
    violations.push({
      field: 'ambf',
      message: 'Required setbacks consume the entire lot — no buildable area remains. Increase lot dimensions.',
      codeCitation: 'IRR Rule VIII §803 + Rule VII §704',
      severity: 'error',
    })
  }

  // ── Step 5: PSO (Rule VIII Sec. 803, Table VIII.1) ───────────────────────
  const pso = tla > 0 ? ambf / tla : 0

  // ── Step 6: Open space (Rule VIII Sec. 803, Table VIII.1) ────────────────
  const tosl = tla - ambf
  const isa = zoningData.maxISA * tla
  const usa = zoningData.minUSA * tla

  // ── Step 7: MACA (Rule VIII Sec. 803, Table VIII.1, note c) ──────────────
  const maca = ambf + isa

  // ── Step 8: Floor-based outputs (UX Plan §03) ───────────────────────────
  const buildingHeight = numFloors * floorHeight
  const tgfa = ambf * numFloors
  const bhl = buildingHeight // alias for clarity in HUD
  const footprintPct = tla > 0 ? (ambf / tla) * 100 : 0

  // ── Validation guard: governing IRR identity ─────────────────────────────
  const identityDiff = Math.abs((ambf + tosl) - tla)
  const identityOk = identityDiff < 0.01

  if (!identityOk) {
    console.error(
      `[SiteControls] TLA identity violation: AMBF(${ambf}) + TOSL(${tosl}) = ${ambf + tosl}, expected TLA(${tla}). Diff: ${identityDiff}`,
    )
  }

  // ── Compliance checks ────────────────────────────────────────────────────
  const ambfOk = ambf <= ambf_by_pso + 0.01
  const minTosl = (1 - zoningData.maxPSO) * tla
  const toslOk = tosl >= minTosl - 0.01
  const setbacksOk = buildableWidth > 0 && buildableDepth > 0
  const floorHeightOk = floorHeight >= 2.7

  if (!ambfOk) {
    violations.push({
      field: 'ambf',
      message: `Building footprint (${ambf.toFixed(1)} sqm) exceeds max PSO allowance (${ambf_by_pso.toFixed(1)} sqm).`,
      codeCitation: 'IRR Rule VIII §803, Table VIII.1',
      severity: 'error',
    })
  }

  if (!toslOk) {
    violations.push({
      field: 'tosl',
      message: `Open space (${tosl.toFixed(1)} sqm) is below minimum required (${minTosl.toFixed(1)} sqm).`,
      codeCitation: 'IRR Rule VIII §803, Table VIII.1 (note d)',
      severity: 'error',
    })
  }

  if (!floorHeightOk) {
    violations.push({
      field: 'floorHeight',
      message: `Floor-to-floor height (${floorHeight.toFixed(1)}m) is below the 2.7m minimum for habitable rooms.`,
      codeCitation: 'PD 1096 IRR Rule VIII §808',
      severity: 'warning',
    })
  }

  const allChecks = [ambfOk, toslOk, identityOk, setbacksOk, floorHeightOk]
  const allPass = allChecks.every(Boolean)
  let message = 'All requirements met — this configuration is code-compliant.'
  if (!setbacksOk) {
    message = 'Required setbacks leave no buildable area. Increase lot dimensions.'
  } else if (!allPass) {
    const passCount = allChecks.filter(Boolean).length
    message = `${passCount}/${allChecks.length} requirements met. Adjust parameters to achieve compliance.`
  }

  return {
    tla,
    setbacks,
    buildableWidth,
    buildableDepth,
    ambf_by_setbacks,
    ambf_by_pso,
    ambf,
    pso,
    tosl,
    isa,
    usa,
    maca,
    buildingHeight,
    tgfa,
    bhl,
    footprintPct,
    zoningData,
    violations,
    compliance: {
      ambfOk,
      toslOk,
      identityOk,
      setbacksOk,
      floorHeightOk,
      message,
    },
  }
}
