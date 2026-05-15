// src/features/3d-lab/config/modules/08-vertical/stairway-code-compliance.ts
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

import { computeParallelDimensionFailures, computeStairState } from './stairway-computation'
import type {
  ComputedStairState,
  StairDimensionKey,
  StairLawKey,
  StairParams,
} from './stairway-types'

import {
  ADA_NOSING_MAX_PROJECTION_MM,
  ADA_NOSING_MAX_RADIUS_MM,
  ADA_HANDRAIL_MIN_HEIGHT_MM as _ADA_HR_MIN,
  ADA_HANDRAIL_MAX_HEIGHT_MM as _ADA_HR_MAX,
  ADA_HANDRAIL_WALL_CLEARANCE_MM,
  IBC_MAX_RISER_HEIGHT_MM,
  IBC_MIN_TREAD_DEPTH_MM,
} from './stairway-constants-international'

import {
  PD1096_MAX_RISER_HEIGHT_MM,
  PD1096_MIN_WIDTH_RESIDENTIAL_MM,
  BP220_MAX_RISER_HEIGHT_MM,
  BP220_MIN_WIDTH_MM,
  BP344_STAIR_CITATION,
  BP344_MAX_RISER_HEIGHT_MM,
  BP344_MIN_TREAD_DEPTH_MM,
  RA9514_MAX_RISER_HEIGHT_MM,
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
  HEADROOM_PLANE_OPACITY,
  HEADROOM_PASS_COLOR,
  CODE_VIOLATION_COLOR,
  NEUTRAL_COLORS,
} from './stairway-constants'

import { ALL_PRESETS } from './stairway-presets'
import { buildNosingProfile } from './stairway-nosing'
import {
  computeStraightStairJoinContract,
  computeStepTopHeightsMeters,
  computeVisualLandingDepthMeters,
} from './stairway-geometry-contracts'
import { validateStairGeometry } from './stairway-geometry-validator'
import { computeEgressRequirements } from './stairway-egress'

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

const isAccessible = (p: StairParams): boolean => bool(p.isAccessibleRoute)

const LAW_LABELS: Record<StairLawKey, string> = {
  pd1096: 'PD 1096',
  bp220: 'BP 220',
  bp344: 'BP 344',
  ra9514: 'RA 9514',
}

const DIMENSION_MESSAGES: Record<StairDimensionKey, string> = {
  riserHeight: 'Riser height',
  treadDepth: 'Tread depth',
  stairWidth: 'Stair width',
  headroom: 'Headroom',
  handrailHeight: 'Handrail height',
  verticalRise: 'Vertical rise',
}

const mulberry32 = (seed: number): (() => number) => {
  let state = seed | 0

  return () => {
    state = (state + 0x6D2B79F5) | 0
    let next = Math.imul(state ^ (state >>> 15), 1 | state)
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

const createComplianceViolationRule = ({
  id,
  field,
  dimension,
  lawKey,
  position,
  severity = 'error',
  codeCitation,
}: {
  id: string
  field: string
  dimension: StairDimensionKey
  lawKey: StairLawKey
  position?: (params: StairParams) => [number, number, number]
  severity?: 'error' | 'warning' | 'info'
  codeCitation?: string
}): ViolationRule => ({
  id,
  field,
  check: (params) => {
    const status = computeStairState(params).dimensionStatuses[dimension]
    const lawStatus = status.laws.find((law) => law.lawKey === lawKey)
    return Boolean(lawStatus?.applies && !lawStatus.passes)
  },
  message: `${LAW_LABELS[lawKey]}: ${DIMENSION_MESSAGES[dimension]} is outside the active requirement`,
  codeCitation: codeCitation ?? LAW_LABELS[lawKey],
  severity,
  position,
})

const createConflictViolationRule = ({
  id,
  field,
  dimension,
  conflictId,
  message,
  codeCitation,
  position,
}: {
  id: string
  field: string
  dimension: StairDimensionKey
  conflictId: string
  message: string
  codeCitation?: string
  position?: (params: StairParams) => [number, number, number]
}): ViolationRule => ({
  id,
  field,
  check: (params) =>
    computeStairState(params).dimensionStatuses[dimension].conflicts.some(
      (conflict) => conflict.id === conflictId,
    ),
  message,
  codeCitation,
  severity: 'warning',
  position,
})

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
    default: 1500,
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
    default: 150,
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
    default: 300,
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
    max: 24,
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
  {
    key: 'compareMode',
    label: 'International Comparison',
    type: 'toggle',
    default: false,
    group: 'Learning Overlays',
  },

  // ── Nosing Detail ─────────────────────────────────────────────────────────
  {
    key: 'nosingProjection',
    label: 'Nosing Projection',
    type: 'slider',
    min: 0,
    max: 40,
    step: 1,
    default: 25,
    unit: 'mm',
    group: 'Nosing Detail',
  },
  {
    key: 'nosingRadius',
    label: 'Edge Radius',
    type: 'slider',
    min: 0,
    max: 20,
    step: 1,
    default: 10,
    unit: 'mm',
    group: 'Nosing Detail',
  },
  {
    key: 'riserUndercut',
    label: 'Riser Undercut',
    type: 'slider',
    min: 0,
    max: 45,
    step: 1,
    default: 15,
    unit: '°',
    group: 'Nosing Detail',
  },
  {
    key: 'contrastStripWidth',
    label: 'Contrast Strip',
    type: 'slider',
    min: 0,
    max: 60,
    step: 1,
    default: 38,
    unit: 'mm',
    group: 'Nosing Detail',
  },
  {
    key: 'detailViewActive',
    label: 'Nosing Detail View',
    type: 'toggle',
    default: false,
    group: 'Nosing Detail',
  },

  // ── Handrail Detail ───────────────────────────────────────────────────────
  {
    key: 'handrailDiameter',
    label: 'Grip Diameter',
    type: 'slider',
    min: 20,
    max: 60,
    step: 1,
    default: 35,
    unit: 'mm',
    group: 'Handrail Detail',
  },
  {
    key: 'wallClearance',
    label: 'Wall Clearance',
    type: 'slider',
    min: 20,
    max: 80,
    step: 1,
    default: 45,
    unit: 'mm',
    group: 'Handrail Detail',
  },
  {
    key: 'handrailProfile',
    label: 'Profile Shape',
    type: 'dropdown',
    default: 'circular',
    options: [
      { value: 'circular', label: 'Circular' },
      { value: 'oval', label: 'Oval' },
      { value: 'rectangular-rounded', label: 'Rectangular (Rounded)' },
    ],
    group: 'Handrail Detail',
  },
  {
    key: 'handrailDetailActive',
    label: 'Handrail Detail View',
    type: 'toggle',
    default: false,
    group: 'Handrail Detail',
  },

  // ── User Safety ───────────────────────────────────────────────────────────
  {
    key: 'primaryUsers',
    label: 'Primary Users',
    type: 'dropdown',
    default: 'general',
    options: [
      { value: 'general', label: 'General' },
      { value: 'children', label: 'Children (Schools, Daycare)' },
      { value: 'elderly', label: 'Elderly (Healthcare, Senior)' },
      { value: 'mixed', label: 'Mixed (All Age Groups)' },
    ],
    group: 'User Safety',
  },

  // ── Material ──────────────────────────────────────────────────────────────
  {
    key: 'treadMaterial',
    label: 'Tread Material',
    type: 'dropdown',
    default: 'concrete',
    options: [
      { value: 'polished-marble', label: 'Polished Marble' },
      { value: 'honed-granite', label: 'Honed Granite' },
      { value: 'ceramic-tile', label: 'Ceramic Tile (Matte)' },
      { value: 'concrete', label: 'Concrete (Textured)' },
      { value: 'wood', label: 'Wood (Sealed)' },
      { value: 'steel', label: 'Steel (Diamond Plate)' },
    ],
    group: 'Material',
  },

  // ── Egress Calculator ─────────────────────────────────────────────────────
  {
    key: 'floorArea',
    label: 'Floor Area',
    type: 'slider',
    min: 50,
    max: 2000,
    step: 10,
    default: 300,
    unit: 'sqm',
    group: 'Egress Calculator',
  },
  {
    key: 'occupancyType',
    label: 'Occupancy Type',
    type: 'dropdown',
    default: 'business',
    options: [
      { value: 'assembly', label: 'Assembly (0.65 sqm/person)' },
      { value: 'business', label: 'Business (9.3 sqm/person)' },
      { value: 'educational', label: 'Educational (1.85 sqm/person)' },
      { value: 'residential', label: 'Residential (18.6 sqm/person)' },
      { value: 'mercantile', label: 'Mercantile (2.8 sqm/person)' },
      { value: 'industrial', label: 'Industrial (9.3 sqm/person)' },
    ],
    group: 'Egress Calculator',
  },
  {
    key: 'providedExits',
    label: 'Exits Provided',
    type: 'slider',
    min: 1,
    max: 6,
    step: 1,
    default: 2,
    group: 'Egress Calculator',
  },
  {
    key: 'isSprinklered',
    label: 'Sprinkler System?',
    type: 'toggle',
    default: false,
    group: 'Egress Calculator',
  },
  {
    key: 'evacuationActive',
    label: 'Evacuation Simulation',
    type: 'toggle',
    default: false,
    group: 'Egress Calculator',
  },
]

// ─── Geometry Builder (Adapter Pattern) ────────────────────────────────────
// The ParametricSceneConfig.geometry signature takes raw params.
// Internally we compute state via the pure computation engine, then
// pass it to the geometry sub-builder.

const buildStraightGeometry = (state: ComputedStairState, rawParams: StairParams): GeometryInstruction[] => {
  // Convert mm to scene units (meters)
  const rH = state.riserHeight / 1000
  const tD = state.treadDepth / 1000
  const sW = state.stairWidth / 1000
  const n = state.numRisers
  const headroomM = state.headroom / 1000
  const hrH = state.handrailHeight / 1000

  // The right-side law cards intentionally evaluate all four laws in parallel.
  // The model must use the same UX contract: if ANY law card shows a failure for
  // a physical dimension, the corresponding model part turns universal red.
  const parallelFailures = computeParallelDimensionFailures(rawParams)
  const verticalRiseViol = parallelFailures.verticalRise
  const stairBodyWidthViol = parallelFailures.stairWidth
  const stairBodyViol = verticalRiseViol || stairBodyWidthViol
  const rColor = parallelFailures.riserHeight || stairBodyViol ? CODE_VIOLATION_COLOR : NEUTRAL_COLORS.RISER
  const tColor = parallelFailures.treadDepth || stairBodyViol ? CODE_VIOLATION_COLOR : NEUTRAL_COLORS.TREAD
  const landingColor = stairBodyViol ? CODE_VIOLATION_COLOR : NEUTRAL_COLORS.LANDING
  const headViol = parallelFailures.headroom
  const hrColor = parallelFailures.handrailHeight ? CODE_VIOLATION_COLOR : NEUTRAL_COLORS.HANDRAIL
  const stepTopHeights = computeStepTopHeightsMeters(state)

  // Geometry constants
  const totalRise = stepTopHeights[stepTopHeights.length - 1] ?? n * rH
  const totalRun = (n - 1) * tD
  const landingDepth = computeVisualLandingDepthMeters(state.stairWidth)
  const joinContract = computeStraightStairJoinContract(tD, n, landingDepth)
  const railRun = Math.abs(joinContract.topJoinZ - joinContract.bottomJoinZ)
  const railRise = Math.max(totalRise - rH, 0)
  const strAngle = Math.atan2(railRise, Math.max(railRun, tD))

  const g: GeometryInstruction[] = []

  // ── 1. Base platform (bottom landing) ─────────────────────────────────────
  g.push({
    id: 'base-platform',
    type: 'box',
    position: [0, -TREAD_THICKNESS_M / 2, joinContract.bottomLandingCenterZ],
    args: [sW, TREAD_THICKNESS_M, joinContract.landingDepth],
    color: landingColor,
  })

  // ── 2. Treads & risers ────────────────────────────────────────────────────
  // When tolerance mode is active, each riser has a per-step height deviation.
  for (let i = 0; i < n; i++) {
    const previousTop = i === 0 ? 0 : (stepTopHeights[i - 1] ?? 0)
    const currentTop = stepTopHeights[i] ?? previousTop + rH
    const thisRiserHeight = currentTop - previousTop
    const z = -(i * tD)

    g.push({
      id: `tread-${i}`,
      type: 'box',
      position: [0, currentTop - TREAD_THICKNESS_M / 2, z],
      args: [sW, TREAD_THICKNESS_M, tD],
      color: tColor,
    })

    g.push({
      id: `riser-${i}`,
      type: 'box',
      position: [0, currentTop - thisRiserHeight / 2, z + tD / 2],
      args: [sW, thisRiserHeight, RISER_THICKNESS_M],
      color: rColor,
    })
  }

  // ── 3. Primary handrails ──────────────────────────────────────────────────
  for (const s of [-1, 1] as const) {
    const railStart: [number, number, number] = [
      s * (sW / 2 + STRINGER_THICKNESS_M / 2),
      (stepTopHeights[0] ?? rH) + hrH * Math.cos(strAngle),
      joinContract.bottomJoinZ,
    ]
    const railEnd: [number, number, number] = [
      s * (sW / 2 + STRINGER_THICKNESS_M / 2),
      totalRise + hrH * Math.cos(strAngle),
      joinContract.topJoinZ,
    ]
    const bottomExtensionStartZ = joinContract.bottomLandingCenterZ + joinContract.landingDepth / 2
    const topExtensionEndZ = joinContract.topLandingCenterZ - joinContract.landingDepth / 2
    const bottomExtensionLength = Math.abs(bottomExtensionStartZ - railStart[2])
    const topExtensionLength = Math.abs(railEnd[2] - topExtensionEndZ)
    const dx = railEnd[0] - railStart[0]
    const dy = railEnd[1] - railStart[1]
    const dz = railEnd[2] - railStart[2]
    const railLength = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2)

    g.push({
      id: `handrail-ext-bottom-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [railStart[0], railStart[1], (bottomExtensionStartZ + railStart[2]) / 2],
      rotation: [Math.PI / 2, 0, 0],
      args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, bottomExtensionLength, 8],
      color: hrColor,
    })

    g.push({
      id: `handrail-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [
        (railStart[0] + railEnd[0]) / 2,
        (railStart[1] + railEnd[1]) / 2,
        (railStart[2] + railEnd[2]) / 2,
      ],
      rotation: [Math.PI / 2 + strAngle, 0, 0],
      args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, railLength, 8],
      color: hrColor,
    })

    g.push({
      id: `handrail-ext-top-${s < 0 ? 'L' : 'R'}`,
      type: 'cylinder',
      position: [railEnd[0], railEnd[1], (railEnd[2] + topExtensionEndZ) / 2],
      rotation: [Math.PI / 2, 0, 0],
      args: [HANDRAIL_RADIUS_M, HANDRAIL_RADIUS_M, topExtensionLength, 8],
      color: hrColor,
    })
  }

  // ── 5. Top landing ────────────────────────────────────────────────────────
  const topY = totalRise
  const topZ = joinContract.topLandingCenterZ

  g.push({
    id: 'top-landing',
    type: 'box',
    position: [0, topY - TREAD_THICKNESS_M / 2, topZ],
    args: [sW, TREAD_THICKNESS_M, joinContract.landingDepth],
    color: landingColor,
  })

  // ── 6. Headroom clearance plane ───────────────────────────────────────────
  // Headroom is represented as vertical clearance above the upper walking
  // surface/2F landing datum. The reference plane must span the full walking
  // path in plan: from the outer end of the GF landing to the outer end of the
  // 2F landing, not only the top landing footprint.
  const headY = topY + headroomM
  const headStartZ = joinContract.topLandingCenterZ - joinContract.landingDepth / 2
  const headEndZ = joinContract.bottomLandingCenterZ + joinContract.landingDepth / 2
  const headZ = (headStartZ + headEndZ) / 2
  const headDepth = Math.abs(headEndZ - headStartZ)

  g.push({
    id: 'headroom-plane',
    type: 'box',
    position: [0, headY, headZ],
    args: [sW, 0.005, headDepth],
    color: headViol ? CODE_VIOLATION_COLOR : HEADROOM_PASS_COLOR,
    opacity: HEADROOM_PLANE_OPACITY,
    transparent: true,
    material: 'basic',
    depthWrite: false,
    cameraFitExclude: true,
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
            ((stepTopHeights[0] ?? rH) + totalRise) / 2 + hMm * Math.cos(strAngle),
            ((joinContract.firstTreadCenterZ + joinContract.lastTreadCenterZ) / 2) + hMm * Math.sin(strAngle),
          ],
          rotation: [Math.PI / 2 + strAngle, 0, 0],
          args: [
            BP344_GHOST_RAIL_RADIUS_M,
            BP344_GHOST_RAIL_RADIUS_M,
            Math.sqrt(railRun ** 2 + railRise ** 2),
            8,
          ],
          color: hrColor,
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
        position: [xPos, 0.9, joinContract.bottomJoinZ + extLen / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, extLen, 8],
        color: hrColor,
        opacity: BP344_GHOST_OPACITY,
        transparent: true,
      })

      // Top extension
      g.push({
        id: `bp344-ext-top-${s < 0 ? 'L' : 'R'}`,
        type: 'cylinder',
        position: [xPos, topY + 0.9, joinContract.topJoinZ - extLen / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [BP344_GHOST_RAIL_RADIUS_M, BP344_GHOST_RAIL_RADIUS_M, extLen, 8],
        color: hrColor,
        opacity: BP344_GHOST_OPACITY,
        transparent: true,
      })
    }
  }

  // ── 8. International Comparison Ghost Geometry (IBC overlay) ────────────────
  // When comparison mode is active, show ghost treads/risers at IBC dimensions.
  if (bool(rawParams.compareMode)) {
    const ibcRiserH = IBC_MAX_RISER_HEIGHT_MM / 1000  // 178mm in meters
    const ibcTreadD = IBC_MIN_TREAD_DEPTH_MM / 1000   // 279mm in meters
    const ghostColor = '#94a3b8' // Comparison ghost color (from UX plan)
    const ghostOpacity = 0.2

    for (let i = 0; i < n; i++) {
      const ibcY = (i + 1) * ibcRiserH
      const ibcZ = -(i * ibcTreadD)

      g.push({
        id: `compare-ibc-tread-${i}`,
        type: 'box',
        position: [0, ibcY - TREAD_THICKNESS_M / 2, ibcZ],
        args: [sW, TREAD_THICKNESS_M, ibcTreadD],
        color: ghostColor,
        opacity: ghostOpacity,
        transparent: true,
      })

      g.push({
        id: `compare-ibc-riser-${i}`,
        type: 'box',
        position: [0, ibcY - ibcRiserH / 2, ibcZ + ibcTreadD / 2],
        args: [sW, ibcRiserH, RISER_THICKNESS_M],
        color: ghostColor,
        opacity: ghostOpacity,
        transparent: true,
      })
    }
  }

  // ── 10. Nosing detail view (Task 2: wire extruded-profile) ──────────────────
  if (bool(rawParams.detailViewActive)) {
    const midIdx = Math.floor(n / 2)
    // Dim non-selected treads
    for (let i = 0; i < n; i++) {
      if (i !== midIdx) {
        const existing = g.find((inst) => inst.id === `tread-${i}`)
        if (existing) {
          existing.opacity = 0.3
          existing.transparent = true
        }
      }
    }
    // Add nosing extruded-profile at midpoint
    const nosingInst = buildNosingProfile(
      num(rawParams.nosingProjection ?? 25),
      num(rawParams.nosingRadius ?? 10),
      num(rawParams.riserUndercut ?? 15),
      num(rawParams.contrastStripWidth ?? 38),
      state.stairWidth,
      state.treadDepth,
      state.riserHeight,
    )
    const midY = stepTopHeights[midIdx] ?? ((midIdx + 1) * rH)
    const midZ = -(midIdx * tD)
    nosingInst.position = [-sW / 2, midY - rH, midZ + tD / 2]
    nosingInst.id = `nosing-detail-${midIdx}`
    g.push(nosingInst)
  }

  // ── 11. Handrail cross-section (Task 3: wire extruded-profile disc) ────────
  if (bool(rawParams.handrailDetailActive)) {
    const midN = Math.floor(n / 2)
    const sectionProfile = str(rawParams.handrailProfile ?? 'circular')
    const handrailDiameter = num(rawParams.handrailDiameter ?? 35) / 1000
    const wallClearance = num(rawParams.wallClearance ?? 45) / 1000
    const halfPrimary = handrailDiameter / 2
    const profilePoints: [number, number][] =
      sectionProfile === 'oval'
        ? Array.from({ length: 24 }, (_, index) => {
            const angle = (index / 24) * Math.PI * 2
            return [Math.cos(angle) * halfPrimary, Math.sin(angle) * (halfPrimary * 0.75)] as [number, number]
          })
        : sectionProfile === 'rectangular-rounded'
          ? [
              [-halfPrimary, -halfPrimary * 0.8],
              [halfPrimary, -halfPrimary * 0.8],
              [halfPrimary, halfPrimary * 0.8],
              [-halfPrimary, halfPrimary * 0.8],
            ]
          : Array.from({ length: 24 }, (_, index) => {
              const angle = (index / 24) * Math.PI * 2
              return [Math.cos(angle) * halfPrimary, Math.sin(angle) * halfPrimary] as [number, number]
            })
    g.push({
      id: 'handrail-cross-section',
      type: 'extruded-profile',
      position: [
        sW / 2 + STRINGER_THICKNESS_M / 2 + wallClearance,
        (stepTopHeights[midN] ?? (midN * rH)) + hrH,
        -(midN * tD),
      ],
      args: [],
      color: hrColor,
      profilePoints,
      extrudeDepth: 0.05,
    })
  }

  // ── 12. Children's ghost handrail at 711mm (Task 4) ────────────────────────
  const isChildMode = str(rawParams.primaryUsers ?? 'general') === 'children' ||
    str(rawParams.primaryUsers ?? 'general') === 'mixed'
  if (isChildMode) {
    const childHeight = 0.711 // 711mm in meters
    for (const s of [-1, 1] as const) {
      g.push({
        id: `children-rail-711-${s < 0 ? 'L' : 'R'}`,
        type: 'cylinder',
        position: [
          s * (sW / 2 + STRINGER_THICKNESS_M / 2),
          ((stepTopHeights[0] ?? rH) + totalRise) / 2 + childHeight * Math.cos(strAngle),
          ((joinContract.firstTreadCenterZ + joinContract.lastTreadCenterZ) / 2) + childHeight * Math.sin(strAngle),
        ],
        rotation: [Math.PI / 2 + strAngle, 0, 0],
        args: [HANDRAIL_RADIUS_M * 0.8, HANDRAIL_RADIUS_M * 0.8, Math.sqrt(railRun ** 2 + railRise ** 2), 8],
        color: '#94a3b8',
        opacity: 0.4,
        transparent: true,
      })
    }
  }

  // ── 13. Evacuation dots (Task 6: sphere instructions along stair) ──────────
  if (bool(rawParams.evacuationActive)) {
    const egress = computeEgressRequirements(
      num(rawParams.floorArea ?? 300),
      str(rawParams.occupancyType ?? 'business'),
      num(rawParams.providedExits ?? 2),
      state.stairWidth,
      bool(rawParams.isSprinklered ?? false),
    )
    const occupantLoad = egress.occupantLoad
    const dotCount = Math.min(Math.floor(occupantLoad / 2), 200)
    const isBottleneck = sW < 0.9
    const rngSeed = Math.round(state.stairWidth + state.numRisers * 31 + state.riserHeight * 17)
    const rng = mulberry32(rngSeed)

    for (let i = 0; i < dotCount; i++) {
      const t = i / Math.max(dotCount - 1, 1)
      const dotY = totalRise * (1 - t) + rH
      const dotZ = -(totalRun * (1 - t))
      const dotX = (rng() - 0.5) * sW * 0.6

      g.push({
        id: `evac-dot-${i}`,
        type: 'sphere',
        position: [dotX, dotY, dotZ],
        args: [0.08, 4, 4],
        color: isBottleneck ? '#E74C3C' : '#3B82F6',
        opacity: 0.7,
        transparent: true,
      })
    }
  }

  return g
}

// Adapter: ParametricSceneConfig.geometry signature → computation engine → straight stair model

const geometry = (p: StairParams): GeometryInstruction[] => {
  const state = computeStairState(p)
  const builtGeometry = buildStraightGeometry(state, p)

  if (process.env.NODE_ENV !== 'production') {
    const report = validateStairGeometry(builtGeometry)

    if (report.hasErrors) {
      console.warn('Stairway geometry validation errors detected.', report.findings)
    }
  }

  return builtGeometry
}

// ─── Violation Rules ────────────────────────────────────────────────────────
// Organized by law. Each law evaluates independently.
// All threshold checks now use named constants from stairway-constants.ts.

const violations: ViolationRule[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PD 1096 — National Building Code (Base Regime)
  // ═══════════════════════════════════════════════════════════════════════════

  createComplianceViolationRule({
    id: 'pd1096-max-riser',
    field: 'riserHeight',
    dimension: 'riserHeight',
    lawKey: 'pd1096',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  }),
  createComplianceViolationRule({
    id: 'pd1096-min-tread',
    field: 'treadDepth',
    dimension: 'treadDepth',
    lawKey: 'pd1096',
    position: (p) => [0, mm(p.riserHeight) + 0.06, 0],
  }),
  createComplianceViolationRule({
    id: 'pd1096-min-headroom',
    field: 'headroom',
    dimension: 'headroom',
    lawKey: 'pd1096',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [0, mid * mm(p.riserHeight) + mm(p.headroom), -(mid * mm(p.treadDepth))]
    },
  }),
  createComplianceViolationRule({
    id: 'pd1096-max-vertical',
    field: 'numRisers',
    dimension: 'verticalRise',
    lawKey: 'pd1096',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [mm(p.stairWidth) / 2 + 0.15, topY / 2, 0]
    },
  }),
  createComplianceViolationRule({
    id: 'pd1096-min-width',
    field: 'stairWidth',
    dimension: 'stairWidth',
    lawKey: 'pd1096',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  }),
  createComplianceViolationRule({
    id: 'pd1096-handrail-range',
    field: 'handrailHeight',
    dimension: 'handrailHeight',
    lawKey: 'pd1096',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        mm(p.stairWidth) / 2 + 0.15,
        mid * mm(p.riserHeight) + mm(p.handrailHeight),
        -(mid * mm(p.treadDepth)),
      ]
    },
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // BP 220 — Socialized / Economic Housing
  // ═══════════════════════════════════════════════════════════════════════════

  createComplianceViolationRule({
    id: 'bp220-max-riser',
    field: 'riserHeight',
    dimension: 'riserHeight',
    lawKey: 'bp220',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  }),
  createComplianceViolationRule({
    id: 'bp220-min-tread',
    field: 'treadDepth',
    dimension: 'treadDepth',
    lawKey: 'bp220',
    position: (p) => [0, mm(p.riserHeight) + 0.06, 0],
  }),
  createComplianceViolationRule({
    id: 'bp220-min-width',
    field: 'stairWidth',
    dimension: 'stairWidth',
    lawKey: 'bp220',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // BP 344 — Accessibility Law (Overlay)
  // ═══════════════════════════════════════════════════════════════════════════

  createComplianceViolationRule({
    id: 'bp344-max-riser',
    field: 'riserHeight',
    dimension: 'riserHeight',
    lawKey: 'bp344',
    codeCitation: BP344_STAIR_CITATION,
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.14, mm(p.riserHeight) / 2, 0],
  }),
  createComplianceViolationRule({
    id: 'bp344-min-tread',
    field: 'treadDepth',
    dimension: 'treadDepth',
    lawKey: 'bp344',
    codeCitation: BP344_STAIR_CITATION,
    position: (p) => [0, mm(p.riserHeight) + 0.07, mm(p.treadDepth) / 2],
  }),
  createComplianceViolationRule({
    id: 'bp344-min-width',
    field: 'stairWidth',
    dimension: 'stairWidth',
    lawKey: 'bp344',
    codeCitation: BP344_STAIR_CITATION,
    position: (p) => [0, -0.12, mm(p.treadDepth) / 2],
  }),
  createComplianceViolationRule({
    id: 'bp344-handrail-upper',
    field: 'handrailHeight',
    dimension: 'handrailHeight',
    lawKey: 'bp344',
    codeCitation: BP344_STAIR_CITATION,
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [
        -(mm(p.stairWidth) / 2) - 0.18,
        mid * mm(p.riserHeight) + 0.9,
        -(mid * mm(p.treadDepth)),
      ]
    },
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // RA 9514 — Fire Code (Overlay)
  // ═══════════════════════════════════════════════════════════════════════════

  createComplianceViolationRule({
    id: 'ra9514-max-riser',
    field: 'riserHeight',
    dimension: 'riserHeight',
    lawKey: 'ra9514',
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.12, mm(p.riserHeight) / 2, 0],
  }),
  createComplianceViolationRule({
    id: 'ra9514-min-width',
    field: 'stairWidth',
    dimension: 'stairWidth',
    lawKey: 'ra9514',
    position: (p) => [0, -0.14, mm(p.treadDepth) / 2],
  }),
  createComplianceViolationRule({
    id: 'ra9514-min-tread',
    field: 'treadDepth',
    dimension: 'treadDepth',
    lawKey: 'ra9514',
    position: (p) => [0, mm(p.riserHeight) + 0.08, mm(p.treadDepth) / 2],
  }),
  createComplianceViolationRule({
    id: 'ra9514-max-vertical',
    field: 'numRisers',
    dimension: 'verticalRise',
    lawKey: 'ra9514',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [-(mm(p.stairWidth) / 2) - 0.15, topY / 2, 0]
    },
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // Cross-Law Conflict Warnings
  // ═══════════════════════════════════════════════════════════════════════════

  createConflictViolationRule({
    id: 'conflict-riser-bp220-vs-pd1096',
    field: 'riserHeight',
    dimension: 'riserHeight',
    conflictId: 'conflict-riser-bp220-vs-pd1096',
    message:
      `Conflict: Passes BP 220 (≤ ${BP220_MAX_RISER_HEIGHT_MM} mm) but exceeds PD 1096 baseline (≤ ${PD1096_MAX_RISER_HEIGHT_MM} mm). Confirm project is registered as housing with DHSUD.`,
    codeCitation: 'BP 220 vs PD 1096',
    position: (p) => [mm(p.stairWidth) / 2 + 0.2, mm(p.riserHeight), 0],
  }),
  createConflictViolationRule({
    id: 'conflict-width-bp220-vs-pd1096',
    field: 'stairWidth',
    dimension: 'stairWidth',
    conflictId: 'conflict-width-bp220-vs-pd1096',
    message:
      `Conflict: Passes BP 220 (≥ ${BP220_MIN_WIDTH_MM} mm) but below PD 1096 baseline (≥ ${PD1096_MIN_WIDTH_RESIDENTIAL_MM} mm). Valid only for qualifying housing projects.`,
    codeCitation: 'BP 220 vs PD 1096',
    position: (p) => [0, -0.16, mm(p.treadDepth) / 2],
  }),
  createConflictViolationRule({
    id: 'conflict-riser-exit-vs-pd1096',
    field: 'riserHeight',
    dimension: 'riserHeight',
    conflictId: 'conflict-riser-exit-vs-pd1096',
    message:
      `Stricter: Passes PD 1096 (≤ ${PD1096_MAX_RISER_HEIGHT_MM} mm) but exceeds RA 9514 exit maximum (≤ ${RA9514_MAX_RISER_HEIGHT_MM} mm). Redesign or declassify as exit stair.`,
    codeCitation: 'RA 9514 vs PD 1096',
    position: (p) => [
      mm(p.stairWidth) / 2 + 0.2,
      mm(p.riserHeight) / 2 + 0.05,
      0,
    ],
  }),

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

  // ═══════════════════════════════════════════════════════════════════════════
  // Nosing Profile Violations (Info — ADA/IBC reference, PH codes don't specify)
  // Active only when nosing detail view is active
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'nosing-projection-ada',
    field: 'nosingProjection',
    check: (p) => bool(p.detailViewActive) && num(p.nosingProjection) > ADA_NOSING_MAX_PROJECTION_MM,
    message: `ADA: Nosing projection exceeds ${ADA_NOSING_MAX_PROJECTION_MM} mm maximum`,
    codeCitation: 'ADA/ANSI A117.1 — Nosing projection ⚠️ UNVERIFIED',
    severity: 'info',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [0.6, (mid + 1) * mm(p.riserHeight), -(mid * mm(p.treadDepth))]
    },
  },
  {
    id: 'nosing-radius-ada',
    field: 'nosingRadius',
    check: (p) => bool(p.detailViewActive) && num(p.nosingRadius) > ADA_NOSING_MAX_RADIUS_MM,
    message: `ADA: Nosing edge radius exceeds ${ADA_NOSING_MAX_RADIUS_MM} mm maximum`,
    codeCitation: 'ADA/ANSI A117.1 — Nosing radius ⚠️ UNVERIFIED',
    severity: 'info',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [0.6, (mid + 1) * mm(p.riserHeight) + 0.05, -(mid * mm(p.treadDepth))]
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Handrail Graspability Violations (Info — ADA reference)
  // Active only when handrail detail view is active
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'handrail-diameter-ada',
    field: 'handrailDiameter',
    check: (p) => bool(p.handrailDetailActive) && (num(p.handrailDiameter) < 32 || num(p.handrailDiameter) > 38),
    message: 'ADA: Gripping surface diameter must be 32–38 mm',
    codeCitation: 'ADA/ANSI A117.1 §505 — Handrail gripping surface ⚠️ UNVERIFIED',
    severity: 'info',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [mm(p.stairWidth) / 2 + 0.25, mid * mm(p.riserHeight) + mm(p.handrailHeight), -(mid * mm(p.treadDepth))]
    },
  },
  {
    id: 'handrail-clearance-ada',
    field: 'wallClearance',
    check: (p) => bool(p.handrailDetailActive) && num(p.wallClearance) < ADA_HANDRAIL_WALL_CLEARANCE_MM,
    message: `ADA: Wall clearance must be at least ${ADA_HANDRAIL_WALL_CLEARANCE_MM} mm`,
    codeCitation: 'ADA/ANSI A117.1 §505 — Wall clearance ⚠️ UNVERIFIED',
    severity: 'info',
    position: (p) => {
      const mid = Math.floor(num(p.numRisers) / 2)
      return [mm(p.stairWidth) / 2 + 0.25, mid * mm(p.riserHeight) + mm(p.handrailHeight) - 0.05, -(mid * mm(p.treadDepth))]
    },
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'riser-height',
    label: 'Riser Height',
    description: 'Vertical distance between consecutive treads',
    codeCitation: `PD 1096 / BP 220 / BP 344 (${BP344_MAX_RISER_HEIGHT_MM} mm max when accessible)`,
    position: (p) => [-(mm(p.stairWidth) / 2) - 0.12, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'tread-depth',
    label: 'Tread Depth',
    description: 'Horizontal depth of a single tread (exclusive of nosing)',
    codeCitation: `PD 1096 / BP 220 / BP 344 (${BP344_MIN_TREAD_DEPTH_MM} mm min when accessible)`,
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
  id: 'stairway-code-compliance',
  title: 'Stairway Code Compliance',
  description:
    'Multi-law 3D stair compliance explorer — PD 1096, BP 220, BP 344, and RA 9514 evaluated in parallel with conflict detection.',
  subject: 'Building Technology',
  parameters,
  geometry,
  violations,
  annotations,
  presets: ALL_PRESETS,
  camera: {
    // Default module view: NW-framed perspective. The NW preset rotates the
    // current projection without forcing the orthographic isometric mode.
    position: [-8, 6, 8],
    target: [0, 1, 0],
    fov: 35,
    zoomToFit: { position: [-8, 6, 8], target: [0, 1, 0], zoom: 50 },
    resetPreset: 'iso-nw',
  },
  contextScenario:
    "You're designing stairs for a mixed-use development in Quezon City. The project must satisfy multiple overlapping codes. Explore how PD 1096, BP 220, BP 344, and RA 9514 affect the same stair geometry.",
  leaQuestionCount: 12,
  leaQuestionType: 'code compliance',
  supportedPhases: ['guided', 'faded', 'sandbox', 'challenge'],
  hasChallengeMode: true,
}
