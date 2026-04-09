// src/features/3d-lab/config/modules/08-vertical/stairway-configurator.ts
// ─────────────────────────────────────────────────────────────────────────────
// StairCode PH — Multi-Law Parallel Compliance Explorer
// PD 1096 (NBCP) · BP 220 (Housing) · BP 344 (Accessibility) · RA 9514 (Fire)
//
// Architecture: Each law evaluates geometry independently via the parallel
// rule-set pattern. Conflicts are flagged — never averaged or merged.
// Color severity: RA 9514 > BP 344 > PD 1096 > BP 220
//
// v2 Refactor: Computation/geometry separation via ComputedStairState.
// The geometry function calls computeStairState() internally (adapter pattern)
// to preserve the ParametricSceneConfig.geometry signature.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
} from '@/features/3d-lab/types/templates'

import { computeStairState } from './stairway-computation'
import type { ComputedStairState, StairParams } from './stairway-types'

import {
  PD1096_MAX_RISER_HEIGHT_MM,
  PD1096_MIN_TREAD_DEPTH_MM,
  PD1096_MIN_HEADROOM_MM,
  PD1096_MAX_VERTICAL_RISE_MM,
  PD1096_MIN_WIDTH_HIGH_OCC_MM,
  PD1096_MIN_WIDTH_COMMERCIAL_MM,
  PD1096_MIN_WIDTH_RESIDENTIAL_MM,
  PD1096_HANDRAIL_MIN_HEIGHT_MM,
  PD1096_HANDRAIL_MAX_HEIGHT_MM,
  BP220_MAX_RISER_HEIGHT_MM,
  BP220_MIN_TREAD_DEPTH_MM,
  BP220_MIN_WIDTH_MM,
  BP344_MIN_ACCESSIBLE_WIDTH_MM,
  BP344_HANDRAIL_UPPER_HEIGHT_MM,
  RA9514_MAX_RISER_HEIGHT_MM,
  RA9514_MIN_TREAD_DEPTH_MM,
  RA9514_MIN_WIDTH_MM,
  RA9514_MAX_VERTICAL_RISE_MM,
  BLONDEL_COMFORT_MIN_MM,
  BLONDEL_COMFORT_MAX_MM,
  UNIFORMITY_TOLERANCE_MM,
  TREAD_THICKNESS_M,
  RISER_THICKNESS_M,
  STRINGER_THICKNESS_M,
  HANDRAIL_RADIUS_M,
  BP344_GHOST_RAIL_RADIUS_M,
  BP344_GHOST_OPACITY,
  BP344_GHOST_OFFSET_M,
  WIDTH_DEFICIT_OPACITY,
  HEADROOM_PLANE_OPACITY,
  HEADROOM_PASS_COLOR,
  LAW_COLORS,
  NEUTRAL_COLORS,
} from './stairway-constants'

import { ALL_PRESETS } from './stairway-presets'

// ─── Helpers (kept for violation rule position functions) ────────────────────

/** Convert mm parameter value to scene units (1 unit = 1 m) */
const mm = (v: number | string | boolean): number =>
  (typeof v === 'number' ? v : Number(v)) / 1000

const num = (v: number | string | boolean): number =>
  typeof v === 'number' ? v : Number(v)

const bool = (v: number | string | boolean): boolean =>
  v === true || v === 'true'

const str = (v: number | string | boolean): string =>
  String(v)

// Classification predicates (thin wrappers for violation rule checks)
const isBP220 = (p: StairParams): boolean => {
  const pt = str(p.projectType)
  return pt === 'bp220_socialized' || pt === 'bp220_economic'
}

const isAccessible = (p: StairParams): boolean => bool(p.isAccessibleRoute)
const isExit = (p: StairParams): boolean => bool(p.isExitStair)
const isHighOcc = (p: StairParams): boolean => bool(p.isHighOccupancy)
const isResidential = (p: StairParams): boolean => str(p.projectType) === 'general_residential'

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  // ── Project Classification ────────────────────────────────────────────────
  {
    key: 'projectType',
    label: 'Project Type',
    type: 'dropdown',
    default: 'general_residential',
    options: [
      { value: 'general_residential', label: 'General Residential' },
      { value: 'commercial', label: 'Commercial / Institutional' },
      { value: 'school', label: 'School / University' },
      { value: 'hospital', label: 'Hospital / Healthcare' },
      { value: 'bp220_socialized', label: 'BP 220 — Socialized Housing' },
      { value: 'bp220_economic', label: 'BP 220 — Economic Housing' },
    ],
    group: 'Project Classification',
  },
  {
    key: 'isAccessibleRoute',
    label: 'Part of Accessible Route?',
    type: 'toggle',
    default: false,
    group: 'Project Classification',
  },
  {
    key: 'isExitStair',
    label: 'Required Exit Stair?',
    type: 'toggle',
    default: false,
    group: 'Project Classification',
  },
  {
    key: 'isHighOccupancy',
    label: 'Occupant Load > 50?',
    type: 'toggle',
    default: false,
    group: 'Project Classification',
  },

  // ── Stair Geometry ────────────────────────────────────────────────────────
  {
    key: 'stairWidth',
    label: 'Clear Width',
    type: 'slider',
    min: 500,
    max: 1500,
    step: 25,
    default: 900,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'riserHeight',
    label: 'Riser Height',
    type: 'slider',
    min: 100,
    max: 300,
    step: 5,
    default: 185,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'treadDepth',
    label: 'Tread Depth',
    type: 'slider',
    min: 150,
    max: 350,
    step: 5,
    default: 250,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'headroom',
    label: 'Headroom',
    type: 'slider',
    min: 1800,
    max: 2500,
    step: 50,
    default: 2100,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'handrailHeight',
    label: 'Handrail Height',
    type: 'slider',
    min: 600,
    max: 1200,
    step: 25,
    default: 900,
    unit: 'mm',
    group: 'Stair Geometry',
  },
  {
    key: 'numRisers',
    label: 'Number of Risers',
    type: 'slider',
    min: 3,
    max: 20,
    step: 1,
    default: 12,
    group: 'Stair Geometry',
  },

  // ── Learning Overlays ─────────────────────────────────────────────────────
  {
    key: 'showHistory',
    label: 'Show Historical Context',
    type: 'toggle',
    default: false,
    group: 'Learning Overlays',
  },
  {
    key: 'toleranceMode',
    label: 'Construction Tolerance Mode',
    type: 'toggle',
    default: false,
    group: 'Learning Overlays',
  },
  {
    key: 'toleranceRange',
    label: 'Tolerance Range',
    type: 'slider',
    min: 0,
    max: 20,
    step: 1,
    default: 5,
    unit: 'mm',
    group: 'Learning Overlays',
  },
]

// ─── Geometry Builder (Adapter Pattern) ────────────────────────────────────
// The ParametricSceneConfig.geometry signature takes raw params.
// Internally we compute state via the pure computation engine, then
// pass it to the geometry sub-builder.

const buildGeometryFromState = (state: ComputedStairState): GeometryInstruction[] => {
  // Convert mm to scene units (meters)
  const rH = state.riserHeight / 1000
  const tD = state.treadDepth / 1000
  const sW = state.stairWidth / 1000
  const n = state.numRisers
  const headroomM = state.headroom / 1000
  const hrH = state.handrailHeight / 1000

  // Resolved colors from computation engine
  const rColor = state.riserColor ?? NEUTRAL_COLORS.RISER
  const tColor = state.treadColor ?? NEUTRAL_COLORS.TREAD
  const wColor = state.widthColor
  const headViol = state.headroomViolation
  const hrColor = state.handrailColor ?? NEUTRAL_COLORS.HANDRAIL

  // Geometry constants
  const totalRise = n * rH
  const totalRun = (n - 1) * tD
  const strLen = Math.sqrt(totalRise ** 2 + totalRun ** 2)
  const strAngle = Math.atan2(totalRise, totalRun)
  const strCY = totalRise / 2
  const strCZ = -(totalRun / 2 - tD / 2)

  const g: GeometryInstruction[] = []

  // ── 1. Base platform (bottom landing) ─────────────────────────────────────
  g.push({
    id: 'base-platform',
    type: 'box',
    position: [0, -TREAD_THICKNESS_M / 2, tD / 2],
    args: [sW, TREAD_THICKNESS_M, tD],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── 2. Treads & risers ────────────────────────────────────────────────────
  // When tolerance mode is active, each riser has a per-step height deviation.
  let cumulativeY = 0
  for (let i = 0; i < n; i++) {
    const riserDeviation = state.toleranceMode
      ? state.perStepRiserVariations[i] / 1000 // mm to meters
      : 0
    const thisRiserHeight = rH + riserDeviation
    cumulativeY += thisRiserHeight
    const z = -(i * tD)

    // Determine riser color: if this step violates uniformity, use PD 1096 color
    const isUniformityViolation = state.toleranceMode &&
      state.uniformityViolationIndices.includes(i)
    const thisRiserColor = isUniformityViolation
      ? LAW_COLORS.PD_1096
      : rColor

    g.push({
      id: `tread-${i}`,
      type: 'box',
      position: [0, cumulativeY - TREAD_THICKNESS_M / 2, z],
      args: [sW, TREAD_THICKNESS_M, tD],
      color: tColor,
    })

    g.push({
      id: `riser-${i}`,
      type: 'box',
      position: [0, cumulativeY - thisRiserHeight / 2, z + tD / 2],
      args: [sW, thisRiserHeight, RISER_THICKNESS_M],
      color: thisRiserColor,
    })
  }

  // ── 3. Primary handrails ──────────────────────────────────────────────────
  for (const s of [-1, 1] as const) {
    g.push({
      id: `handrail-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [
        s * (sW / 2 + STRINGER_THICKNESS_M / 2),
        strCY + hrH * Math.cos(strAngle),
        strCZ + hrH * Math.sin(strAngle),
      ],
      rotation: [Math.PI / 2 + strAngle, 0, 0],
      args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, strLen, 8],
      color: hrColor,
    })
  }

  // ── 5. Top landing ────────────────────────────────────────────────────────
  const topY = n * rH
  const topZ = -((n - 1) * tD + tD / 2)

  g.push({
    id: 'top-landing',
    type: 'box',
    position: [0, topY - TREAD_THICKNESS_M / 2, topZ],
    args: [sW, TREAD_THICKNESS_M, tD],
    color: NEUTRAL_COLORS.LANDING,
  })

  // ── 6. Headroom clearance plane ───────────────────────────────────────────
  const midI = Math.floor(n / 2)
  const headY = midI * rH + headroomM
  const headZ = -(midI * tD - tD / 2)

  g.push({
    id: 'headroom-plane',
    type: 'box',
    position: [0, headY, headZ],
    args: [sW * 1.05, 0.005, totalRun + tD],
    color: headViol ? LAW_COLORS.PD_1096 : HEADROOM_PASS_COLOR,
    opacity: HEADROOM_PLANE_OPACITY,
    transparent: true,
  })

  // ── 7. BP 344 Ghost Handrails (Accessible Route Overlay) ──────────────────
  if (state.isAccessibleRoute) {
    // Dual-height rails along the stair slope
    for (const hMm of [0.9, 0.7] as const) {
      for (const s of [-1, 1] as const) {
        g.push({
          id: `bp344-rail-${hMm * 1000}-${s < 0 ? 'L' : 'R'}`,
          type: 'cylinder',
          position: [
            s * (sW / 2 + STRINGER_THICKNESS_M / 2 + BP344_GHOST_OFFSET_M),
            strCY + hMm * Math.cos(strAngle),
            strCZ + hMm * Math.sin(strAngle),
          ],
          rotation: [Math.PI / 2 + strAngle, 0, 0],
          args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, strLen, 8],
          color: LAW_COLORS.BP_344,
          opacity: BP344_GHOST_OPACITY,
          transparent: true,
        })
      }
    }

    // 300 mm horizontal extensions at bottom and top of stair
    const extLen = 0.3
    for (const s of [-1, 1] as const) {
      const xPos = s * (sW / 2 + STRINGER_THICKNESS_M / 2 + BP344_GHOST_OFFSET_M)

      // Bottom extension
      g.push({
        id: `bp344-ext-bot-${s < 0 ? 'L' : 'R'}`,
        type: 'cylinder',
        position: [xPos, 0.9, tD / 2 + extLen / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, extLen, 8],
        color: LAW_COLORS.BP_344,
        opacity: BP344_GHOST_OPACITY,
        transparent: true,
      })

      // Top extension
      g.push({
        id: `bp344-ext-top-${s < 0 ? 'L' : 'R'}`,
        type: 'cylinder',
        position: [xPos, topY + 0.9, topZ - extLen / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, extLen, 8],
        color: LAW_COLORS.BP_344,
        opacity: BP344_GHOST_OPACITY,
        transparent: true,
      })
    }
  }

  // ── 8. Width deficit indicator planes ─────────────────────────────────────
  if (wColor) {
    const deficit = state.widthDeficit / 1000 // mm to meters
    if (deficit > 0) {
      for (const s of [-1, 1] as const) {
        g.push({
          id: `width-gap-${s < 0 ? 'L' : 'R'}`,
          type: 'box',
          position: [s * (sW / 2 + deficit / 4), totalRise / 2, strCZ],
          args: [deficit / 2, totalRise, totalRun + tD],
          color: wColor,
          opacity: WIDTH_DEFICIT_OPACITY,
          transparent: true,
        })
      }
    }
  }

  return g
}

// Adapter: ParametricSceneConfig.geometry signature → computation engine → sub-builder
const geometry = (p: StairParams): GeometryInstruction[] => {
  const state = computeStairState(p)
  return buildGeometryFromState(state)
}

// ─── Violation Rules ────────────────────────────────────────────────────────
// Organized by law. Each law evaluates independently.
// All threshold checks now use named constants from stairway-constants.ts.

const violations: ViolationRule[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PD 1096 — National Building Code (Base Regime)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'pd1096-max-riser',
    field: 'riserHeight',
    check: (p) => !isBP220(p) && num(p.riserHeight) > PD1096_MAX_RISER_HEIGHT_MM,
    message: `PD 1096: Maximum riser height is ${PD1096_MAX_RISER_HEIGHT_MM} mm`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'pd1096-min-tread',
    field: 'treadDepth',
    check: (p) => !isBP220(p) && num(p.treadDepth) < PD1096_MIN_TREAD_DEPTH_MM,
    message: `PD 1096: Minimum tread depth is ${PD1096_MIN_TREAD_DEPTH_MM} mm`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) + 0.06, 0],
  },
  {
    id: 'pd1096-min-headroom',
    field: 'headroom',
    check: (p) => num(p.headroom) < PD1096_MIN_HEADROOM_MM,
    message: `Minimum headroom clearance is ${PD1096_MIN_HEADROOM_MM} mm`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [0, mid * mm(p.riserHeight) + mm(p.headroom), -(mid * mm(p.treadDepth))]
    },
  },
  {
    id: 'pd1096-max-vertical',
    field: 'numRisers',
    check: (p) => num(p.numRisers) * num(p.riserHeight) > PD1096_MAX_VERTICAL_RISE_MM,
    message: `PD 1096: Max ${PD1096_MAX_VERTICAL_RISE_MM} mm vertical rise between landings`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [mm(p.stairWidth) / 2 + 0.15, topY / 2, 0]
    },
  },
  {
    id: 'pd1096-min-width-high-occ',
    field: 'stairWidth',
    check: (p) => !isBP220(p) && isHighOcc(p) && num(p.stairWidth) < PD1096_MIN_WIDTH_HIGH_OCC_MM,
    message: `PD 1096: Min width ${PD1096_MIN_WIDTH_HIGH_OCC_MM} mm for occupant load > 50`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'pd1096-min-width-commercial',
    field: 'stairWidth',
    check: (p) =>
      !isBP220(p) && !isHighOcc(p) && !isResidential(p) && num(p.stairWidth) < PD1096_MIN_WIDTH_COMMERCIAL_MM,
    message: `PD 1096: Min width ${PD1096_MIN_WIDTH_COMMERCIAL_MM} mm for 10–50 occupants`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'pd1096-min-width-residential',
    field: 'stairWidth',
    check: (p) =>
      !isBP220(p) && !isHighOcc(p) && isResidential(p) && num(p.stairWidth) < PD1096_MIN_WIDTH_RESIDENTIAL_MM,
    message: `PD 1096: Min width ${PD1096_MIN_WIDTH_RESIDENTIAL_MM} mm for private stairs (≤10 persons)`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'pd1096-handrail-range',
    field: 'handrailHeight',
    check: (p) =>
      !isBP220(p) &&
      (num(p.handrailHeight) < PD1096_HANDRAIL_MIN_HEIGHT_MM || num(p.handrailHeight) > PD1096_HANDRAIL_MAX_HEIGHT_MM),
    message: `PD 1096: Handrails must be ${PD1096_HANDRAIL_MIN_HEIGHT_MM}–${PD1096_HANDRAIL_MAX_HEIGHT_MM} mm above nosing`,
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        mm(p.stairWidth) / 2 + 0.15,
        mid * mm(p.riserHeight) + mm(p.handrailHeight),
        -(mid * mm(p.treadDepth)),
      ]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BP 220 — Socialized / Economic Housing
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'bp220-max-riser',
    field: 'riserHeight',
    check: (p) => isBP220(p) && num(p.riserHeight) > BP220_MAX_RISER_HEIGHT_MM,
    message: `BP 220: Maximum riser height is ${BP220_MAX_RISER_HEIGHT_MM} mm for housing`,
    codeCitation: 'BP 220 IRR · DHSUD',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'bp220-min-tread',
    field: 'treadDepth',
    check: (p) => isBP220(p) && num(p.treadDepth) < BP220_MIN_TREAD_DEPTH_MM,
    message: `BP 220: Minimum tread depth is ${BP220_MIN_TREAD_DEPTH_MM} mm`,
    codeCitation: 'BP 220 IRR · DHSUD',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) + 0.06, 0],
  },
  {
    id: 'bp220-min-width',
    field: 'stairWidth',
    check: (p) => isBP220(p) && num(p.stairWidth) < BP220_MIN_WIDTH_MM,
    message: `BP 220: Min interior stair width is ${BP220_MIN_WIDTH_MM} mm`,
    codeCitation: 'BP 220 IRR · DHSUD',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BP 344 — Accessibility Law (Overlay)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'bp344-min-width',
    field: 'stairWidth',
    check: (p) => isAccessible(p) && num(p.stairWidth) < BP344_MIN_ACCESSIBLE_WIDTH_MM,
    message: `BP 344: Min accessible stair width is ${BP344_MIN_ACCESSIBLE_WIDTH_MM} mm`,
    codeCitation: 'BP 344 IRR · DPWH',
    severity: 'error',
    position: (p) => [0, -0.12, mm(p.treadDepth) / 2],
  },
  {
    id: 'bp344-handrail-upper',
    field: 'handrailHeight',
    check: (p) => isAccessible(p) && num(p.handrailHeight) !== BP344_HANDRAIL_UPPER_HEIGHT_MM,
    message: `BP 344: Primary handrail must be at ${BP344_HANDRAIL_UPPER_HEIGHT_MM} mm (lower rail at 700 mm shown in 3D)`,
    codeCitation: 'BP 344 IRR · DPWH',
    severity: 'error',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.18,
        mid * mm(p.riserHeight) + 0.9,
        -(mid * mm(p.treadDepth)),
      ]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RA 9514 — Fire Code (Overlay)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'ra9514-max-riser',
    field: 'riserHeight',
    check: (p) => isExit(p) && num(p.riserHeight) > RA9514_MAX_RISER_HEIGHT_MM,
    message: `RA 9514: Max exit stair riser is ${RA9514_MAX_RISER_HEIGHT_MM} mm`,
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.12, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'ra9514-min-width',
    field: 'stairWidth',
    check: (p) => isExit(p) && num(p.stairWidth) < RA9514_MIN_WIDTH_MM,
    message: `RA 9514: Min exit stair width is ${RA9514_MIN_WIDTH_MM} mm`,
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => [0, -0.14, mm(p.treadDepth) / 2],
  },
  {
    id: 'ra9514-min-tread',
    field: 'treadDepth',
    check: (p) => isExit(p) && num(p.treadDepth) < RA9514_MIN_TREAD_DEPTH_MM,
    message: `RA 9514: Min exit stair tread is ${RA9514_MIN_TREAD_DEPTH_MM} mm`,
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) + 0.08, mm(p.treadDepth) / 2],
  },
  {
    id: 'ra9514-max-vertical',
    field: 'numRisers',
    check: (p) => isExit(p) && num(p.numRisers) * num(p.riserHeight) > RA9514_MAX_VERTICAL_RISE_MM,
    message: `RA 9514: Max ${RA9514_MAX_VERTICAL_RISE_MM} mm vertical rise between landings for exit stairs`,
    codeCitation: 'RA 9514 IRR · BFP',
    severity: 'error',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [-(mm(p.stairWidth) / 2) - 0.15, topY / 2, 0]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Cross-Law Conflict Warnings
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'conflict-riser-bp220-vs-pd1096',
    field: 'riserHeight',
    check: (p) =>
      isBP220(p) && num(p.riserHeight) > PD1096_MAX_RISER_HEIGHT_MM && num(p.riserHeight) <= BP220_MAX_RISER_HEIGHT_MM,
    message:
      `Conflict: Passes BP 220 (≤ ${BP220_MAX_RISER_HEIGHT_MM} mm) but exceeds PD 1096 baseline (≤ ${PD1096_MAX_RISER_HEIGHT_MM} mm). Confirm project is registered as housing with DHSUD.`,
    codeCitation: 'BP 220 vs PD 1096',
    severity: 'warning',
    position: (p) => [mm(p.stairWidth) / 2 + 0.2, mm(p.riserHeight), 0],
  },
  {
    id: 'conflict-width-bp220-vs-pd1096',
    field: 'stairWidth',
    check: (p) =>
      isBP220(p) && num(p.stairWidth) >= BP220_MIN_WIDTH_MM && num(p.stairWidth) < PD1096_MIN_WIDTH_RESIDENTIAL_MM,
    message:
      `Conflict: Passes BP 220 (≥ ${BP220_MIN_WIDTH_MM} mm) but below PD 1096 baseline (≥ ${PD1096_MIN_WIDTH_RESIDENTIAL_MM} mm). Valid only for qualifying housing projects.`,
    codeCitation: 'BP 220 vs PD 1096',
    severity: 'warning',
    position: (p) => [0, -0.16, mm(p.treadDepth) / 2],
  },
  {
    id: 'conflict-riser-exit-vs-pd1096',
    field: 'riserHeight',
    check: (p) =>
      isExit(p) &&
      !isBP220(p) &&
      num(p.riserHeight) > RA9514_MAX_RISER_HEIGHT_MM &&
      num(p.riserHeight) <= PD1096_MAX_RISER_HEIGHT_MM,
    message:
      `Stricter: Passes PD 1096 (≤ ${PD1096_MAX_RISER_HEIGHT_MM} mm) but exceeds RA 9514 exit maximum (≤ ${RA9514_MAX_RISER_HEIGHT_MM} mm). Redesign or declassify as exit stair.`,
    codeCitation: 'RA 9514 vs PD 1096',
    severity: 'warning',
    position: (p) => [
      mm(p.stairWidth) / 2 + 0.2,
      mm(p.riserHeight) / 2 + 0.05,
      0,
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Blondel Comfort Formula (Info — does NOT override element colors)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'blondel-comfort',
    field: 'riserHeight',
    check: (p) => {
      const twoRPlusT = 2 * num(p.riserHeight) + num(p.treadDepth)
      return twoRPlusT < BLONDEL_COMFORT_MIN_MM || twoRPlusT > BLONDEL_COMFORT_MAX_MM
    },
    message: `Blondel comfort formula: 2R+T should be ${BLONDEL_COMFORT_MIN_MM}–${BLONDEL_COMFORT_MAX_MM} mm`,
    codeCitation: "Blondel, Cours d'Architecture (1675) — 2R+T ergonomic formula",
    severity: 'info',
    position: (p) => {
      const n = num(p.numRisers)
      const rH = mm(p.riserHeight)
      const tD = mm(p.treadDepth)
      return [0.8, n * rH + 0.3, -(n * tD / 2)]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Dimensional Uniformity (Warning — tolerance mode only)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'uniformity-tolerance',
    field: 'toleranceRange',
    check: (p) => {
      if (!bool(p.toleranceMode)) return false
      const state = computeStairState(p)
      return state.uniformityViolationIndices.length > 0
    },
    message: `Per-step riser deviation exceeds ${UNIFORMITY_TOLERANCE_MM} mm tolerance`,
    codeCitation: 'IBC 2024 §1011.5.4 — Dimensional uniformity',
    severity: 'warning',
    position: (p) => {
      const state = computeStairState(p)
      const worstIdx = state.uniformityViolationIndices[0] ?? Math.floor(num(p.numRisers) / 2)
      return [0.5, (worstIdx + 1) * mm(p.riserHeight), -(worstIdx * mm(p.treadDepth))]
    },
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'riser-height',
    label: 'Riser Height',
    description: 'Vertical distance between consecutive treads',
    codeCitation: 'PD 1096 / BP 220',
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.12, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'tread-depth',
    label: 'Tread Depth',
    description: 'Horizontal depth of a single tread (exclusive of nosing)',
    codeCitation: 'PD 1096 / BP 220',
    position: (p) => [0, mm(p.riserHeight) + 0.08, 0],
  },
  {
    id: 'clear-width',
    label: 'Clear Width',
    description: 'Clear width of the stair',
    codeCitation: 'PD 1096 / BP 344',
    position: (p) => [0, -0.08, mm(p.treadDepth) / 2 + 0.05],
  },
  {
    id: 'headroom-label',
    label: 'Headroom',
    description: 'Vertical clearance above the nosing line',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      const y = mid * mm(p.riserHeight) + mm(p.headroom) / 2
      return [mm(p.stairWidth) / 2 + 0.15, y, -(mid * mm(p.treadDepth))]
    },
  },
  {
    id: 'handrail-height',
    label: 'Handrail',
    description: 'Height of primary handrail above stair nosing',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        mm(p.stairWidth) / 2 + 0.15,
        mid * mm(p.riserHeight) + mm(p.handrailHeight),
        -(mid * mm(p.treadDepth)),
      ]
    },
  },

  // BP 344 annotations — visible only when accessible route is active
  {
    id: 'bp344-upper-rail',
    label: 'BP 344 Upper (900 mm)',
    description: 'Required accessible handrail at 900 mm above nosing',
    codeCitation: 'BP 344 IRR · DPWH',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.2,
        mid * mm(p.riserHeight) + 0.9,
        -(mid * mm(p.treadDepth)),
      ]
    },
    visibleWhen: (p) => isAccessible(p),
  },
  {
    id: 'bp344-lower-rail',
    label: 'BP 344 Lower (700 mm)',
    description: 'Required accessible handrail at 700 mm above nosing',
    codeCitation: 'BP 344 IRR · DPWH',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.2,
        mid * mm(p.riserHeight) + 0.7,
        -(mid * mm(p.treadDepth)),
      ]
    },
    visibleWhen: (p) => isAccessible(p),
  },
  {
    id: 'bp344-extension',
    label: 'Extension (300 mm)',
    description: 'Handrails must extend 300 mm beyond first and last step',
    codeCitation: 'BP 344 IRR · DPWH',
    position: (p) => [
      mm(p.stairWidth) / 2 + 0.18,
      0.9,
      mm(p.treadDepth) / 2 + 0.15,
    ],
    visibleWhen: (p) => isAccessible(p),
  },

  // ── Blondel Comfort Annotation ────────────────────────────────────────────
  {
    id: 'blondel-formula',
    label: '2R+T Comfort',
    description:
      'Blondel ergonomic formula: 2R+T = 600–650 mm is the comfortable range. Current value computed from riser height and tread depth.',
    codeCitation: "Blondel, Cours d'Architecture (1675)",
    position: (p) => {
      const n = num(p.numRisers)
      const rH = mm(p.riserHeight)
      const tD = mm(p.treadDepth)
      return [0.8, n * rH + 0.3, -(n * tD / 2)]
    },
  },

  // ── Historical Context Annotations (visible when showHistory is ON) ───────
  {
    id: 'history-blondel',
    label: 'Blondel (1672)',
    description:
      "François Blondel, Royal Academy of Architecture, Paris. Discovered that 2R+T ≈ 630 mm matches human stride length. When R=0 (flat), stride ≈ 630 mm. When T=0 (ladder), rung spacing ≈ 315 mm (half stride).",
    codeCitation: 'Blondel, Cours d\'Architecture, 1675–1683',
    position: (p) => {
      const rH = mm(p.riserHeight)
      return [1.2, rH * 3, 0.2]
    },
    visibleWhen: (p) => bool(p.showHistory),
  },
  {
    id: 'history-templer',
    label: 'Templer (1976)',
    description:
      "John Templer's research on stair safety: 279 mm tread depth minimizes missteps. Basis for IBC's 11-inch (279 mm) minimum tread requirement.",
    codeCitation: 'Templer, J. "Stair Shape and Human Movement", 1976',
    position: (p) => {
      const rH = mm(p.riserHeight)
      const tD = mm(p.treadDepth)
      return [0, rH + 0.06, -tD]
    },
    visibleWhen: (p) => bool(p.showHistory),
  },
  {
    id: 'history-cocoanut-grove',
    label: 'Cocoanut Grove (1942)',
    description:
      'The Cocoanut Grove nightclub fire in Boston killed 492 people. Narrow, locked, and inward-opening exit doors caused fatal bottlenecks. This disaster drove modern exit stair width and vertical rise limits in fire codes worldwide, including RA 9514.',
    codeCitation: 'Cocoanut Grove fire, Boston, November 28, 1942',
    position: (p) => {
      const n = num(p.numRisers)
      const rH = mm(p.riserHeight)
      const tD = mm(p.treadDepth)
      return [-0.6, n * rH * 0.5, -(n * tD * 0.5)]
    },
    visibleWhen: (p) => bool(p.showHistory),
  },
  {
    id: 'history-uniformity',
    label: 'Uniformity Litigation (1970s–80s)',
    description:
      'Slip-and-fall litigation in the 1970s–80s established that inconsistent riser heights within a stair flight are a primary cause of missteps. This drove the 9.5 mm (⅜") maximum deviation tolerance in IBC §1011.5.4.',
    codeCitation: 'IBC Commentary, slip-and-fall case law precedent',
    position: (p) => {
      const rH = mm(p.riserHeight)
      return [0.6, rH * 5, -0.3]
    },
    visibleWhen: (p) => bool(p.showHistory),
  },
  {
    id: 'history-handrail-height',
    label: 'Handrail Height Origin',
    description:
      'Handrail height range (800–900 mm) derives from the 5th–95th percentile wrist height of standing adults. The dual-height requirement in BP 344 (700 mm + 900 mm) accommodates wheelchair users and children.',
    codeCitation: 'Ergonomic anthropometric data, human factors research',
    position: (p) => {
      const n = num(p.numRisers)
      const mid = Math.floor(n / 2)
      const rH = mm(p.riserHeight)
      const tD = mm(p.treadDepth)
      return [0.8, mid * rH + mm(p.handrailHeight), -(mid * tD)]
    },
    visibleWhen: (p) => bool(p.showHistory),
  },
]

// ─── Export ──────────────────────────────────────────────────────────────────

export const stairwayConfigurator: ParametricSceneConfig = {
  id: 'stairway-configurator',
  title: 'Stairway Configurator',
  description:
    'Multi-law 3D stair compliance explorer — PD 1096, BP 220, BP 344, and RA 9514 evaluated in parallel with conflict detection.',
  subject: 'Building Technology',
  parameters,
  geometry,
  violations,
  annotations,
  presets: ALL_PRESETS,
  camera: {
    position: [3, 3, 3],
    fov: 45,
  },
  contextScenario:
    "You're designing stairs for a mixed-use development in Quezon City. The project must satisfy multiple overlapping codes. Explore how PD 1096, BP 220, BP 344, and RA 9514 affect the same stair geometry.",
  leaQuestionCount: 12,
  leaQuestionType: 'code compliance',
  supportedPhases: ['guided', 'faded', 'sandbox', 'challenge'],
  hasChallengeMode: true,
}
