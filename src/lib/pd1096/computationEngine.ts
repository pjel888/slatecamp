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
import { computeSetbackInsetPolygon } from '@/lib/lot-geometry/inset'
import { buildRectangularPolygon } from '@/lib/lot-geometry/polygon'
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
  // Use explicit area if provided (polygon lots), otherwise width × depth
  const tla = lot.area ?? (lot.width * lot.depth)

  // ── STEP 1–2: Setbacks (base + incremental §804.6 + firewall) ─────
  const setbacks = computeSetbacks(zoning, building, rrow)

  // ── STEP 3: Buildable envelope after setbacks ─────────────────────
  // For polygon lots: compute inset polygon area via per-edge offset.
  // For rectangular lots: simple width/depth subtraction (unchanged).
  let buildableWidth: number
  let buildableDepth: number
  let ambfBySetbacks: number

  if (lot.polygonVertices && lot.polygonVertices.length >= 3) {
    // Polygon lot: inset each edge by its boundary-tagged setback amount
    const lotPoly = buildRectangularPolygon(lot.width, lot.depth) // fallback structure
    // Build a proper polygon with edges for inset computation
    const polyWithEdges = (() => {
      const verts = lot.polygonVertices
      const N = verts.length
      // Assign boundary tags from lot.polygonEdgeTags if available,
      // otherwise default to 'front' (uses front setback — most conservative)
      const edgeTags = lot.polygonEdgeTags
      const edges = verts.map((v, i) => {
        const next = verts[(i + 1) % N]
        const dx = next.x - v.x
        const dz = next.z - v.z
        const len = Math.sqrt(dx * dx + dz * dz)
        const tag = edgeTags?.[i] ?? 'front'
        return {
          from: v, to: next,
          segmentId: `edge-${i}`,
          boundaryTag: tag as 'front' | 'rear' | 'left_side' | 'right_side',
          length: len,
          normalOutward: len > 0 ? { x: dz / len, z: -dx / len } : { x: 0, z: 0 },
        }
      })
      // Check winding: if area is negative (CW), flip normals
      let signedArea = 0
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N
        signedArea += verts[i].x * verts[j].z - verts[j].x * verts[i].z
      }
      if (signedArea < 0) {
        edges.forEach(e => { e.normalOutward.x *= -1; e.normalOutward.z *= -1 })
      }
      const xs = verts.map(v => v.x)
      const zs = verts.map(v => v.z)
      return {
        vertices: verts, edges, area: tla, perimeter: 0,
        centroid: { x: 0, z: 0 },
        closure: { isClosed: true, closureErrorMeters: 0, closureErrorRatio: 0, perimeterMeters: 0 },
        boundingBox: { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs), width: lot.width, depth: lot.depth },
      }
    })()

    const inset = computeSetbackInsetPolygon(polyWithEdges, {
      front: setbacks.effective.front,
      rear: setbacks.effective.rear,
      left: setbacks.effective.left,
      right: setbacks.effective.right,
    })
    ambfBySetbacks = inset.area
    // Use bounding box of inset polygon for compatibility
    if (inset.vertices.length > 0) {
      const ixs = inset.vertices.map(v => v.x)
      const izs = inset.vertices.map(v => v.z)
      buildableWidth = Math.max(...ixs) - Math.min(...ixs)
      buildableDepth = Math.max(...izs) - Math.min(...izs)
    } else {
      buildableWidth = 0
      buildableDepth = 0
    }
  } else {
    // Rectangular lot: simple subtraction (existing behavior)
    buildableWidth = Math.max(0, lot.width - setbacks.effective.left - setbacks.effective.right)
    buildableDepth = Math.max(0, lot.depth - setbacks.effective.front - setbacks.effective.rear)
    ambfBySetbacks = buildableWidth * buildableDepth
  }

  // ── STEP 4: AMBF candidates ───────────────────────────────────────
  // Three-way check per §704.4 (pedagogically shows all three;
  // binding computation is two-way min since TOSL reduces to PSO)

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
  // Use flarOverride as-is when provided (allows experimentation beyond zone range)
  const flar = input.flarOverride !== undefined
    ? Math.max(0.01, input.flarOverride)
    : flarData.mid
  const gfa = tla * flar

  // ── STEP 12: BHL (Building Height Limit) ──────────────────────────
  // BHL must be computed BEFORE TGFA because it feeds into BHL-based TGFA.
  // Governing BHL = min(zoning BHL, RROW-based BHL), or custom override.
  const zoningBhlStoreys = table.bhlStoreys
  const rrowBhlStoreys = lookupRrowBhl(rrow.width)
  const computedBhlStoreys = Math.min(zoningBhlStoreys, rrowBhlStoreys)

  const hasCustomBhl = input.bhlOverrideStoreys !== undefined && input.bhlOverrideStoreys > 0
  const governingBhlStoreys = hasCustomBhl ? input.bhlOverrideStoreys! : computedBhlStoreys
  const bhlSource: 'zoning' | 'rrow' | 'custom' = hasCustomBhl ? 'custom'
    : zoningBhlStoreys <= rrowBhlStoreys ? 'zoning' : 'rrow'
  const bhlMeters = governingBhlStoreys * building.floorHeight

  // ── STEP 13: AMVB (Allowable Maximum Volume of Building) ──────────
  // AMVB = AMBF × BHL — the absolute 3D boundary per NBCP.
  const amvbInitial = ambf * bhlMeters
  // ⚠️ AUDIT FLAG: Angular plane volume reduction not fully specified.
  const amvbFinal = amvbInitial

  // ── STEP 14: Dual-Method TGFA (Most Restrictive Governs) ─────────
  // Method 1: FLAR-based — TGFA = GFA × multiplier (Table VII.G.1)
  const tgfaMultiplier = lookupTGFAMultiplier(zoning.zoneClass)
  const tgfaByFlar = gfa * tgfaMultiplier

  // Method 2: BHL-based — TGFA = BHL (storeys) × AMBF (Table VII.1)
  // This is the floor area that fits within the AMVB envelope.
  const tgfaByBhl = governingBhlStoreys * ambf

  // The NBCP mandates: adopt the LOWER (more restrictive) result.
  // "The Allowable Maximum TGFA should not exceed the AMVB."
  const tgfa = Math.min(tgfaByFlar, tgfaByBhl)
  const tgfaSource: 'flar' | 'bhl' = tgfaByFlar <= tgfaByBhl ? 'flar' : 'bhl'

  // ── Proposed building metrics ─────────────────────────────────────
  const proposedFootprint = building.proposedFootprintWidth * building.proposedFootprintDepth
  const proposedGFA = proposedFootprint * building.proposedStoreys
  const proposedHeight = building.proposedStoreys * building.floorHeight

  // ── Max compliant floors — capped by BOTH TGFA and BHL ───────────
  // TGFA cap: how many floors fit within the governing TGFA
  const maxFloorsByTgfa = proposedFootprint > 0
    ? Math.floor(tgfa / proposedFootprint)
    : 0
  // BHL cap: can't exceed the governing BHL storeys
  const maxCompliantFloors = Math.min(maxFloorsByTgfa, governingBhlStoreys)

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
      id: 'isa',
      label: 'Impervious Surface Area (ISA)',
      required: table.isaPercent * tla,
      actual: isa,
      unit: 'sqm',
      compliant: isa <= table.isaPercent * tla + FLOAT_TOLERANCE,
      codeReference: CITATIONS.isa,
      excess: Math.max(0, isa - table.isaPercent * tla),
    },
    {
      id: 'usa',
      label: 'Unpaved Surface Area (USA)',
      required: table.usaPercent * tla,
      actual: usa,
      unit: 'sqm',
      compliant: usa >= table.usaPercent * tla - FLOAT_TOLERANCE,
      codeReference: CITATIONS.usa,
      shortfall: Math.max(0, table.usaPercent * tla - usa),
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
      id: 'amvb',
      label: 'Building Volume (AMVB)',
      required: amvbFinal,
      actual: proposedFootprint * proposedHeight,
      unit: 'cu.m',
      compliant: (proposedFootprint * proposedHeight) <= amvbFinal + FLOAT_TOLERANCE,
      codeReference: CITATIONS.amvb,
      excess: Math.max(0, (proposedFootprint * proposedHeight) - amvbFinal),
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
    tgfaByFlar,
    tgfaByBhl,
    tgfa,
    tgfaSource,
    flar,
    proposedGFA,
    maxCompliantFloors,
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
