// src/lib/pd1096/types.ts
// ─── Canonical interfaces for PD 1096 IRR Rules VII & VIII ─────────────────
// ZERO framework dependencies. Pure TypeScript only.
// All values sourced exclusively from the 2004 Revised IRR (DPWH, April 2005).

// ─── ENUMS ──────────────────────────────────────────────────────────────────

export type ZoneClass =
  | 'R-1'
  | 'R-2-basic' | 'R-2-max'
  | 'R-3-basic' | 'R-3-max'
  | 'R-4' | 'R-5'
  | 'Com-1' | 'Com-2' | 'Com-3'
  | 'Ind-1' | 'Ind-2' | 'Ind-3'
  | 'Institutional' | 'Cultural'

export type LotType = 'interior' | 'corner' | 'through' | 'corner-through'

export type LabMode = 'sandbox' | 'exam'

export type CameraPreset = 'orbit' | 'top' | 'front' | 'isometric'

export type LayerKey =
  | 'setbacks' | 'ambf' | 'pso' | 'bhl' | 'flar'
  | 'floors' | 'isa' | 'usa' | 'tosl'
  | 'building' | 'rrow' | 'firewall'

export type FirewallSide = 'front' | 'rear' | 'left' | 'right'

// ─── INPUT TYPES ────────────────────────────────────────────────────────────

export interface LotParams {
  width: number           // meters
  depth: number           // meters
  type: LotType
}

export interface ZoningParams {
  zoneClass: ZoneClass
  firewallActive: boolean
  firewallSides: FirewallSide[]
}

export interface BuildingParams {
  proposedFootprintWidth: number    // meters
  proposedFootprintDepth: number    // meters
  proposedStoreys: number           // integer
  floorHeight: number               // meters per floor
}

export interface RROWParams {
  width: number           // meters — Road Right-of-Way width
}

export interface DevControlsInput {
  lot: LotParams
  zoning: ZoningParams
  building: BuildingParams
  rrow: RROWParams
  flarOverride?: number   // Optional user-adjusted FLAR within zone's allowed range
  bhlOverrideStoreys?: number  // Optional custom BHL (local ordinance override)
}

// ─── OUTPUT TYPES ───────────────────────────────────────────────────────────

export interface PerSideSetbacks {
  front: number           // meters
  rear: number            // meters
  left: number            // meters
  right: number           // meters
}

export interface SetbackResult {
  base: PerSideSetbacks
  incremental: number     // meters — §804.6 addition (same for side/rear)
  effective: PerSideSetbacks
  note: string
}

export interface AMBFCandidates {
  bySetbacks: number      // sqm — (width - L - R) × (depth - F - Rear)
  byPSO: number           // sqm — PSO% × TLA
  byTOSL: number          // sqm — (1 - TOSL%) × TLA (reduces to byPSO in canonical IRR)
  binding: number          // sqm — min(bySetbacks, byPSO)
  bindingSource: 'setback' | 'pso'
}

export interface ComplianceCheck {
  id: string
  label: string
  required: number
  actual: number
  unit: string
  compliant: boolean
  codeReference: string
  shortfall?: number      // if non-compliant: how much below required
  excess?: number         // if non-compliant: how much above allowed
}

export interface DevControlsResult {
  // ─── Site Area Components ───────────────────────────────────────────
  tla: number             // sqm — Total Lot Area
  setbacks: SetbackResult
  ambfCandidates: AMBFCandidates
  ambf: number            // sqm — effective binding AMBF
  tosl: number            // sqm — Total Open Space within Lot
  isa: number             // sqm — Impervious Surface Area
  usa: number             // sqm — Unpaved Surface Area
  maca: number            // sqm — Maximum Allowable Construction Area

  // ─── Floor Area ─────────────────────────────────────────────────────
  gfa: number             // sqm — Gross Floor Area (FLAR × TLA)
  tgfaByFlar: number      // sqm — FLAR-based TGFA (GFA × multiplier)
  tgfaByBhl: number       // sqm — BHL-based TGFA (BHL storeys × AMBF)
  tgfa: number            // sqm — governing TGFA = min(tgfaByFlar, tgfaByBhl)
  tgfaSource: 'flar' | 'bhl'  // which method is more restrictive
  flar: number            // ratio used (midpoint of range)
  proposedGFA: number     // sqm — proposed footprint × floors
  maxCompliantFloors: number  // max floors before TGFA or BHL violation

  // ─── Volumetric ─────────────────────────────────────────────────────
  bhlMeters: number       // meters — governing Building Height Limit
  bhlStoreys: number      // storeys — governing BHL
  bhlSource: 'zoning' | 'rrow' | 'custom'
  proposedHeight: number  // meters — proposedStoreys × floorHeight
  amvbInitial: number     // cubic meters — AMBF × BHL
  amvbFinal: number       // cubic meters — after angular plane ⚠️ AUDIT FLAG

  // ─── Ratios (decimal 0.0–1.0) ──────────────────────────────────────
  psoActual: number       // AMBF / TLA
  psoAllowed: number      // from Table VIII.1
  isaPercent: number      // from Table VIII.1
  usaPercent: number      // from Table VIII.1
  toslPercent: number     // TOSL / TLA

  // ─── Compliance ─────────────────────────────────────────────────────
  checks: ComplianceCheck[]
  overallCompliant: boolean
  closureIdentityValid: boolean   // TLA = AMBF + ISA + USA within ±0.01

  // ─── Geometry Feed (for R3F sizing) ─────────────────────────────────
  buildableWidth: number  // meters — lot width minus L+R setbacks
  buildableDepth: number  // meters — lot depth minus F+Rear setbacks
}

// ─── EXAM TYPES ─────────────────────────────────────────────────────────────

export interface ExamProblem {
  id: string
  question: string
  expectedAnswer: number
  tolerance: number       // acceptable answer delta
  unit: string
  codeReference: string
  derivationSteps: string[]
}
