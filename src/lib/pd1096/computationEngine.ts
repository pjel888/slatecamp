// src/lib/pd1096/computationEngine.ts
// ─── CRITICAL: Zero imports from React, Three.js, R3F, or any DOM API ──────
// This is the ONLY function called by the Zustand store. It orchestrates the
// 15-step canonical computation sequence from PD 1096 IRR Rules VII & VIII.
//
// Input: DevControlsInput (lot, zoning, building, rrow)
// Output: DevControlsResult (complete site analysis + compliance checks)

import type {
  DevControlsInput,
  DevControlsResult,
  ComplianceCheck,
  AMBFCandidates,
} from './types'
import { computeSetbacks } from './computeSetbacks'
import {
  getZoningEntry,
  lookupPSO,
  lookupFLAR,
  lookupTGFAMultiplier,
  lookupRrowBhl,
  CITATIONS,
} from './zoningTables'
import { ClosureIdentityViolationError } from './errors'

const FLOAT_TOLERANCE = 0.01 // sqm — acceptable floating-point rounding delta

export function computeDevControls(input: DevControlsInput): DevControlsResult {
  const { lot, zoning, building, rrow } = input
  const table = getZoningEntry(zoning.zoneClass)

  // ── STEP 0: TLA (Total Lot Area) ───────────────────────────────────
  const tla = lot.width * lot.depth

  // ── STEP 1–2: Setbacks (base + incremental §804.6 + firewall) ─────
  const setbacks = computeSetbacks(zoning, building, rrow)

  // ── STEP 3: Buildable envelope after setbacks ─────────────────────
  const buildableWidth = Math.max(0, lot.width - setbacks.effective.left - setbacks.effective.right)
  const buildableDepth = Math.max(0, lot.depth - setbacks.effective.front - setbacks.effective.rear)

  // ── STEP 4: AMBF candidates ───────────────────────────────────────
  // Three-way check per §704.4 (pedagogically shows all three;
  // binding computation is two-way min since TOSL reduces to PSO)
  const ambfBySetbacks = buildableWidth * buildableDepth

  const psoDecimal = lookupPSO(zoning.zoneClass, zoning.firewallActive)
  // R-1: PSO path not applicable — setback always governs
  const ambfByPSO = psoDecimal !== null ? psoDecimal * tla : Infinity
  // AMBF_TOSL = (1 - TOSL%) × TLA — mathematically identical to AMBF_PSO
  // because TOSL% = 100% - PSO%. Shown for pedagogical completeness.
  const ambfByTOSL = psoDecimal !== null ? (1 - table.toslPercent) * tla : Infinity

  // ── STEP 5: AMBF (binding — minimum of setback vs. PSO) ──────────
  const ambf = Math.min(ambfBySetbacks, ambfByPSO)
  const bindingSource: 'setback' | 'pso' = ambfBySetbacks <= ambfByPSO ? 'setback' : 'pso'

  const ambfCandidates: AMBFCandidates = {
    bySetbacks: ambfBySetbacks,
    byPSO: ambfByPSO === Infinity ? ambfBySetbacks : ambfByPSO,
    byTOSL: ambfByTOSL === Infinity ? ambfBySetbacks : ambfByTOSL,
    binding: ambf,
    bindingSource,
  }

  // ── STEP 6: TOSL (Total Open Space within Lot) ────────────────────
  const tosl = tla - ambf

  // ── STEP 7: ISA (Impervious Surface Area) ─────────────────────────
  // IRR canonical: ISA is % of TLA, NOT % of TOSL.
  // Then redistribute within TOSL to maintain closure identity.
  const isaFromTable = table.isaPercent * tla
  // ISA cannot exceed TOSL (the open space it must fit within)
  const isa = Math.min(isaFromTable, tosl)

  // ── STEP 8: USA (Unpaved Surface Area) ────────────────────────────
  // USA = TLA - AMBF - ISA (ensures closure identity)
  const usa = tla - ambf - isa

  // ── STEP 9: MACA (Maximum Allowable Construction Area) ────────────
  const maca = ambf + isa

  // ── STEP 10: Closure identity verification ────────────────────────
  // TLA = AMBF + ISA + USA — must hold within ±0.01 sqm
  const closureSum = ambf + isa + usa
  const closureValid = Math.abs(closureSum - tla) <= FLOAT_TOLERANCE
  if (!closureValid) {
    throw new ClosureIdentityViolationError(tla, ambf, isa, usa)
  }

  // ── STEP 11: GFA (Gross Floor Area) ───────────────────────────────
  const flarData = lookupFLAR(zoning.zoneClass)
  const flar = flarData.mid
  const gfa = tla * flar

  // ── STEP 12: TGFA (Total Gross Floor Area) ────────────────────────
  const tgfaMultiplier = lookupTGFAMultiplier(zoning.zoneClass)
  const tgfa = gfa * tgfaMultiplier

  // ── STEP 13: BHL (Building Height Limit) ──────────────────────────
  // Governing BHL = min(zoning BHL, RROW-based BHL)
  const zoningBhlStoreys = table.bhlStoreys
  const rrowBhlStoreys = lookupRrowBhl(rrow.width)
  const governingBhlStoreys = Math.min(zoningBhlStoreys, rrowBhlStoreys)
  const bhlSource: 'zoning' | 'rrow' = zoningBhlStoreys <= rrowBhlStoreys ? 'zoning' : 'rrow'
  const bhlMeters = governingBhlStoreys * building.floorHeight

  // ── STEP 14: AMVB (Allowable Maximum Volume of Building) ──────────
  // AMVB_initial = AMBF × BHL_meters
  const amvbInitial = ambf * bhlMeters
  // ⚠️ AUDIT FLAG: Angular plane volume reduction not fully specified.
  // tan(θ) = H / (S + ½ × RROW) — θ varies by zone and RROW width.
  // Only one reference value available: Com-3 / 14m RROW → θ ≈ 69.5°.
  // AMVB_final is set to AMVB_initial until full coefficient table is verified.
  const amvbFinal = amvbInitial

  // ── Proposed building metrics ─────────────────────────────────────
  const proposedFootprint = building.proposedFootprintWidth * building.proposedFootprintDepth
  const proposedGFA = proposedFootprint * building.proposedStoreys
  const proposedHeight = building.proposedStoreys * building.floorHeight

  // ── STEP 15: Compliance checks ────────────────────────────────────
  const psoActual = tla > 0 ? ambf / tla : 0
  const psoAllowed = psoDecimal ?? 1.0

  const checks: ComplianceCheck[] = [
    {
      id: 'ambf',
      label: 'Building Footprint (AMBF)',
      required: ambf,
      actual: proposedFootprint,
      unit: 'sqm',
      compliant: proposedFootprint <= ambf + FLOAT_TOLERANCE,
      codeReference: CITATIONS.ambf,
      excess: Math.max(0, proposedFootprint - ambf),
    },
    {
      id: 'tosl',
      label: 'Open Space (TOSL)',
      required: tosl,
      actual: tla - proposedFootprint,
      unit: 'sqm',
      compliant: (tla - proposedFootprint) >= tosl - FLOAT_TOLERANCE,
      codeReference: CITATIONS.tosl,
      shortfall: Math.max(0, tosl - (tla - proposedFootprint)),
    },
    {
      id: 'bhl',
      label: 'Building Height (BHL)',
      required: governingBhlStoreys,
      actual: building.proposedStoreys,
      unit: 'storeys',
      compliant: building.proposedStoreys <= governingBhlStoreys,
      codeReference: CITATIONS.bhl,
      excess: Math.max(0, building.proposedStoreys - governingBhlStoreys),
    },
    {
      id: 'tgfa',
      label: 'Total Gross Floor Area (TGFA)',
      required: tgfa,
      actual: proposedGFA,
      unit: 'sqm',
      compliant: proposedGFA <= tgfa + FLOAT_TOLERANCE,
      codeReference: CITATIONS.tgfa,
      excess: Math.max(0, proposedGFA - tgfa),
    },
    {
      id: 'floorHeight',
      label: 'Floor-to-Floor Height',
      required: 2.70,
      actual: building.floorHeight,
      unit: 'm',
      compliant: building.floorHeight >= 2.70,
      codeReference: 'PD 1096 IRR Rule VIII, Sec. 805 — Minimum ceiling height 2.70m',
      shortfall: Math.max(0, 2.70 - building.floorHeight),
    },
    {
      id: 'closure',
      label: 'Area Identity (TLA = AMBF+ISA+USA)',
      required: tla,
      actual: closureSum,
      unit: 'sqm',
      compliant: closureValid,
      codeReference: CITATIONS.closure,
    },
  ]

  return {
    tla,
    setbacks,
    ambfCandidates,
    ambf,
    tosl,
    isa,
    usa,
    maca,
    gfa,
    tgfa,
    flar,
    proposedGFA,
    bhlMeters,
    bhlStoreys: governingBhlStoreys,
    bhlSource,
    proposedHeight,
    amvbInitial,
    amvbFinal,
    psoActual,
    psoAllowed,
    isaPercent: table.isaPercent,
    usaPercent: table.usaPercent,
    toslPercent: tosl / (tla || 1),
    checks,
    overallCompliant: checks.every(c => c.compliant),
    closureIdentityValid: closureValid,
    buildableWidth,
    buildableDepth,
  }
}
