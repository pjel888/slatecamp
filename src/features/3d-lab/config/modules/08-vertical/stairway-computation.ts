// ──────────────────────────────────────────────────────────────────────────────
// stairway-computation.ts — Pure Computation Engine
// Transforms raw stair parameters into a single ComputedStairState object.
// ZERO Three.js, React, or store imports. Pure functions only.
// ──────────────────────────────────────────────────────────────────────────────

import type {
  StairParams,
  ComputedStairState,
  StairTypeConfig,
  ComfortZoneStatus,
  PitchStatus,
  ComplianceResult,
  PerLawEvaluation,
  ConflictFlag,
  InternationalComparisonDelta,
  StairDimensionDirection,
  StairDimensionKey,
  StairDimensionStatus,
  StairLawKey,
  StairLawStatus,
} from './stairway-types'

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
  PITCH_RAMP_THRESHOLD_DEG,
  PITCH_COMFORTABLE_MAX_DEG,
  PITCH_STEEP_MAX_DEG,
  UNIFORMITY_TOLERANCE_MM,
  LAW_COLORS,
} from './stairway-constants'

import {
  IBC_MAX_RISER_HEIGHT_MM,
  IBC_MIN_TREAD_DEPTH_MM,
  IBC_MIN_HEADROOM_MM,
  IBC_HANDRAIL_MAX_HEIGHT_MM,
  IBC_MIN_WIDTH_MM,
  IBC_MAX_VERTICAL_RISE_MM,
  ADA_MAX_RISER_HEIGHT_MM,
  ADA_MIN_TREAD_DEPTH_MM,
  ADA_HANDRAIL_MAX_HEIGHT_MM,
  ADA_MIN_ACCESSIBLE_WIDTH_MM,
  IRC_MAX_RISER_HEIGHT_MM,
  IRC_MIN_TREAD_DEPTH_MM,
  IRC_MIN_HEADROOM_MM,
  IRC_MIN_WIDTH_MM,
  IRC_MAX_VERTICAL_RISE_MM,
  IRC_HANDRAIL_MAX_HEIGHT_MM,
} from './stairway-constants-international'
import { getNormalizedTurningFlightSplit } from './stairway-geometry-contracts'

// ── Value Coercion Helpers ───────────────────────────────────────────────────

const num = (v: number | boolean | string): number =>
  typeof v === 'number' ? v : Number(v)

const bool = (v: number | boolean | string): boolean =>
  v === true || v === 'true'

const str = (v: number | boolean | string): string =>
  String(v)

const LAW_PRIORITY: StairLawKey[] = ['ra9514', 'bp344', 'pd1096', 'bp220']

const LAW_LABELS: Record<StairLawKey, string> = {
  pd1096: 'PD 1096',
  bp220: 'BP 220',
  bp344: 'BP 344',
  ra9514: 'RA 9514',
}

const LAW_STATUS_COLORS: Record<StairLawKey, string> = {
  pd1096: LAW_COLORS.PD_1096,
  bp220: LAW_COLORS.BP_220,
  bp344: LAW_COLORS.BP_344,
  ra9514: LAW_COLORS.RA_9514,
}

// ── Classification Predicates ────────────────────────────────────────────────

export const computeIsBP220 = (projectType: string): boolean =>
  projectType === 'bp220_socialized' || projectType === 'bp220_economic'

export const computeIsResidential = (projectType: string): boolean =>
  projectType === 'general_residential'

// ── Strictest Minimum Width ──────────────────────────────────────────────────

export const computeStrictestMinWidth = (
  isBP220: boolean,
  isHighOcc: boolean,
  isResidential: boolean,
  isAccessible: boolean,
  isExit: boolean,
): number => {
  const candidates: number[] = []

  // Base regime
  if (isBP220) {
    candidates.push(BP220_MIN_WIDTH_MM)
  } else if (isHighOcc) {
    candidates.push(PD1096_MIN_WIDTH_HIGH_OCC_MM)
  } else if (!isResidential) {
    candidates.push(PD1096_MIN_WIDTH_COMMERCIAL_MM)
  } else {
    candidates.push(PD1096_MIN_WIDTH_RESIDENTIAL_MM)
  }

  // Overlays
  if (isAccessible) candidates.push(BP344_MIN_ACCESSIBLE_WIDTH_MM)
  if (isExit) candidates.push(RA9514_MIN_WIDTH_MM)

  return Math.max(...candidates)
}

// ── Blondel Comfort ──────────────────────────────────────────────────────────

export const computeBlondelComfort = (
  riserHeight: number,
  treadDepth: number,
): { twoRPlusT: number; rPlusT: number; comfortStatus: ComfortZoneStatus } => {
  const twoRPlusT = 2 * riserHeight + treadDepth
  const rPlusT = riserHeight + treadDepth
  const comfortStatus: ComfortZoneStatus =
    twoRPlusT < BLONDEL_COMFORT_MIN_MM ? 'too-cramped' :
    twoRPlusT > BLONDEL_COMFORT_MAX_MM ? 'too-stretched' :
    'comfortable'
  return { twoRPlusT, rPlusT, comfortStatus }
}

// ── Pitch ────────────────────────────────────────────────────────────────────

export const computePitch = (
  riserHeight: number,
  treadDepth: number,
): { pitchAngle: number; pitchStatus: PitchStatus } => {
  const pitchAngle = Math.atan2(riserHeight, treadDepth) * (180 / Math.PI)
  const pitchStatus: PitchStatus =
    pitchAngle < PITCH_RAMP_THRESHOLD_DEG ? 'ramp-like' :
    pitchAngle <= PITCH_COMFORTABLE_MAX_DEG ? 'comfortable' :
    pitchAngle <= PITCH_STEEP_MAX_DEG ? 'steep' :
    'ladder-like'
  return { pitchAngle, pitchStatus }
}

// ── Geometry Metrics ─────────────────────────────────────────────────────────

export const computeGeometryMetrics = (
  numRisers: number,
  riserHeight: number,
  treadDepth: number,
): { totalRise: number; totalRun: number; stringerLength: number } => {
  const totalRise = numRisers * riserHeight
  const totalRun = (numRisers - 1) * treadDepth
  const stringerLength = Math.sqrt(totalRise ** 2 + totalRun ** 2)
  return { totalRise, totalRun, stringerLength }
}

// ── Seeded PRNG (mulberry32) ─────────────────────────────────────────────────

const mulberry32 = (seed: number): (() => number) => {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ── Tolerance Variations ─────────────────────────────────────────────────────

export const computeToleranceVariations = (
  numRisers: number,
  toleranceRange: number,
  seed: number = 1337,
): { perStepRiserVariations: number[]; uniformityViolationIndices: number[] } => {
  if (toleranceRange <= 0) {
    return {
      perStepRiserVariations: Array.from({ length: numRisers }, () => 0),
      uniformityViolationIndices: [],
    }
  }

  const rng = mulberry32(seed * numRisers)
  const variations = Array.from({ length: numRisers }, () =>
    (rng() * 2 - 1) * toleranceRange,
  )

  // Find min/max deviations in the flight
  const minDev = Math.min(...variations)
  const maxDev = Math.max(...variations)
  const flightRange = maxDev - minDev

  // Steps that exceed the 9.5mm tolerance between largest and smallest
  const violationIndices: number[] = []
  if (flightRange > UNIFORMITY_TOLERANCE_MM) {
    for (let i = 0; i < numRisers; i++) {
      // A step violates if removing it would not fix the range
      // Simplified: flag steps at the extremes that contribute to the violation
      if (
        Math.abs(variations[i] - minDev) < 0.01 ||
        Math.abs(variations[i] - maxDev) < 0.01
      ) {
        violationIndices.push(i)
      }
    }
    // If no extremes flagged (shouldn't happen), flag all
    if (violationIndices.length === 0) {
      for (let i = 0; i < numRisers; i++) {
        violationIndices.push(i)
      }
    }
  }

  return {
    perStepRiserVariations: variations,
    uniformityViolationIndices: violationIndices,
  }
}

// ── Per-Law Compliance Evaluators ────────────────────────────────────────────

const passEval = (citation: string): PerLawEvaluation => ({
  applies: false,
  passes: true,
  limit: 0,
  actual: 0,
  message: 'Not applicable',
  citation,
})

const toLawStatuses = (compliance: ComplianceResult): StairLawStatus[] =>
  LAW_PRIORITY.map((lawKey) => {
    const lawEvaluation = compliance[lawKey]

    return {
      lawKey,
      lawLabel: LAW_LABELS[lawKey],
      color: LAW_STATUS_COLORS[lawKey],
      applies: lawEvaluation.applies,
      passes: lawEvaluation.passes,
      limit: lawEvaluation.limit,
      actual: lawEvaluation.actual,
      message: lawEvaluation.message,
      citation: lawEvaluation.citation,
    }
  })

const computeDimensionStatus = (
  dimension: StairDimensionKey,
  direction: StairDimensionDirection,
  actual: number,
  compliance: ComplianceResult,
): StairDimensionStatus => {
  const laws = toLawStatuses(compliance)
  const activeLaw = laws.find((law) => law.applies) ?? null
  const failingLaw = laws.find((law) => law.applies && !law.passes) ?? null

  return {
    dimension,
    direction,
    actual,
    activeLawKey: activeLaw?.lawKey ?? null,
    failingLawKey: failingLaw?.lawKey ?? null,
    color: failingLaw?.color ?? null,
    laws,
    conflicts: compliance.conflicts,
  }
}

export const computeRiserCompliance = (
  riserHeight: number,
  isBP220: boolean,
  isExit: boolean,
): ComplianceResult => {
  const pd1096: PerLawEvaluation = !isBP220
    ? {
        applies: true,
        passes: riserHeight <= PD1096_MAX_RISER_HEIGHT_MM,
        limit: PD1096_MAX_RISER_HEIGHT_MM,
        actual: riserHeight,
        message: `PD 1096: Maximum riser height is ${PD1096_MAX_RISER_HEIGHT_MM} mm`,
        citation: 'PD 1096 IRR Rule VIII §804',
      }
    : passEval('PD 1096 IRR Rule VIII §804')

  const bp220: PerLawEvaluation = isBP220
    ? {
        applies: true,
        passes: riserHeight <= BP220_MAX_RISER_HEIGHT_MM,
        limit: BP220_MAX_RISER_HEIGHT_MM,
        actual: riserHeight,
        message: `BP 220: Maximum riser height is ${BP220_MAX_RISER_HEIGHT_MM} mm for housing`,
        citation: 'BP 220 IRR · DHSUD',
      }
    : passEval('BP 220 IRR · DHSUD')

  const ra9514: PerLawEvaluation = isExit
    ? {
        applies: true,
        passes: riserHeight <= RA9514_MAX_RISER_HEIGHT_MM,
        limit: RA9514_MAX_RISER_HEIGHT_MM,
        actual: riserHeight,
        message: `RA 9514: Max exit stair riser is ${RA9514_MAX_RISER_HEIGHT_MM} mm`,
        citation: 'RA 9514 IRR · BFP',
      }
    : passEval('RA 9514 IRR · BFP')

  const conflicts: ConflictFlag[] = []
  if (isBP220 && riserHeight > PD1096_MAX_RISER_HEIGHT_MM && riserHeight <= BP220_MAX_RISER_HEIGHT_MM) {
    conflicts.push({
      id: 'conflict-riser-bp220-vs-pd1096',
      laws: ['BP 220', 'PD 1096'],
      dimension: 'riserHeight',
      message: `Passes BP 220 (≤ ${BP220_MAX_RISER_HEIGHT_MM}) but exceeds PD 1096 (≤ ${PD1096_MAX_RISER_HEIGHT_MM}). Confirm DHSUD registration.`,
    })
  }
  if (isExit && !isBP220 && riserHeight > RA9514_MAX_RISER_HEIGHT_MM && riserHeight <= PD1096_MAX_RISER_HEIGHT_MM) {
    conflicts.push({
      id: 'conflict-riser-exit-vs-pd1096',
      laws: ['RA 9514', 'PD 1096'],
      dimension: 'riserHeight',
      message: `Passes PD 1096 (≤ ${PD1096_MAX_RISER_HEIGHT_MM}) but exceeds RA 9514 (≤ ${RA9514_MAX_RISER_HEIGHT_MM}). Redesign or declassify.`,
    })
  }

  return {
    pd1096,
    bp220,
    bp344: passEval('BP 344 IRR · DPWH'),
    ra9514,
    conflicts,
  }
}

export const computeTreadCompliance = (
  treadDepth: number,
  isBP220: boolean,
  isExit: boolean,
): ComplianceResult => {
  const pd1096: PerLawEvaluation = !isBP220
    ? {
        applies: true,
        passes: treadDepth >= PD1096_MIN_TREAD_DEPTH_MM,
        limit: PD1096_MIN_TREAD_DEPTH_MM,
        actual: treadDepth,
        message: `PD 1096: Minimum tread depth is ${PD1096_MIN_TREAD_DEPTH_MM} mm`,
        citation: 'PD 1096 IRR Rule VIII §804',
      }
    : passEval('PD 1096 IRR Rule VIII §804')

  const bp220: PerLawEvaluation = isBP220
    ? {
        applies: true,
        passes: treadDepth >= BP220_MIN_TREAD_DEPTH_MM,
        limit: BP220_MIN_TREAD_DEPTH_MM,
        actual: treadDepth,
        message: `BP 220: Minimum tread depth is ${BP220_MIN_TREAD_DEPTH_MM} mm`,
        citation: 'BP 220 IRR · DHSUD',
      }
    : passEval('BP 220 IRR · DHSUD')

  const ra9514: PerLawEvaluation = isExit
    ? {
        applies: true,
        passes: treadDepth >= RA9514_MIN_TREAD_DEPTH_MM,
        limit: RA9514_MIN_TREAD_DEPTH_MM,
        actual: treadDepth,
        message: `RA 9514: Min exit stair tread is ${RA9514_MIN_TREAD_DEPTH_MM} mm`,
        citation: 'RA 9514 IRR · BFP',
      }
    : passEval('RA 9514 IRR · BFP')

  return {
    pd1096,
    bp220,
    bp344: passEval('BP 344 IRR · DPWH'),
    ra9514,
    conflicts: [],
  }
}

export const computeWidthCompliance = (
  width: number,
  isBP220: boolean,
  isAccessible: boolean,
  isExit: boolean,
  isHighOcc: boolean,
  isResidential: boolean,
): ComplianceResult => {
  const pd1096: PerLawEvaluation = !isBP220
    ? (() => {
        let limit = PD1096_MIN_WIDTH_RESIDENTIAL_MM
        let msg = `Min width ${PD1096_MIN_WIDTH_RESIDENTIAL_MM} mm for private stairs`
        if (isHighOcc) {
          limit = PD1096_MIN_WIDTH_HIGH_OCC_MM
          msg = `Min width ${PD1096_MIN_WIDTH_HIGH_OCC_MM} mm for occupant load > 50`
        } else if (!isResidential) {
          limit = PD1096_MIN_WIDTH_COMMERCIAL_MM
          msg = `Min width ${PD1096_MIN_WIDTH_COMMERCIAL_MM} mm for 10–50 occupants`
        }
        return {
          applies: true,
          passes: width >= limit,
          limit,
          actual: width,
          message: `PD 1096: ${msg}`,
          citation: 'PD 1096 IRR Rule VIII §804',
        }
      })()
    : passEval('PD 1096 IRR Rule VIII §804')

  const bp220: PerLawEvaluation = isBP220
    ? {
        applies: true,
        passes: width >= BP220_MIN_WIDTH_MM,
        limit: BP220_MIN_WIDTH_MM,
        actual: width,
        message: `BP 220: Min interior stair width is ${BP220_MIN_WIDTH_MM} mm`,
        citation: 'BP 220 IRR · DHSUD',
      }
    : passEval('BP 220 IRR · DHSUD')

  const bp344: PerLawEvaluation = isAccessible
    ? {
        applies: true,
        passes: width >= BP344_MIN_ACCESSIBLE_WIDTH_MM,
        limit: BP344_MIN_ACCESSIBLE_WIDTH_MM,
        actual: width,
        message: `BP 344: Min accessible stair width is ${BP344_MIN_ACCESSIBLE_WIDTH_MM} mm`,
        citation: 'BP 344 IRR · DPWH',
      }
    : passEval('BP 344 IRR · DPWH')

  const ra9514: PerLawEvaluation = isExit
    ? {
        applies: true,
        passes: width >= RA9514_MIN_WIDTH_MM,
        limit: RA9514_MIN_WIDTH_MM,
        actual: width,
        message: `RA 9514: Min exit stair width is ${RA9514_MIN_WIDTH_MM} mm`,
        citation: 'RA 9514 IRR · BFP',
      }
    : passEval('RA 9514 IRR · BFP')

  const conflicts: ConflictFlag[] = []
  if (isBP220 && width >= BP220_MIN_WIDTH_MM && width < PD1096_MIN_WIDTH_RESIDENTIAL_MM) {
    conflicts.push({
      id: 'conflict-width-bp220-vs-pd1096',
      laws: ['BP 220', 'PD 1096'],
      dimension: 'stairWidth',
      message: `Passes BP 220 (≥ ${BP220_MIN_WIDTH_MM}) but below PD 1096 (≥ ${PD1096_MIN_WIDTH_RESIDENTIAL_MM}). Valid only for qualifying housing.`,
    })
  }

  return { pd1096, bp220, bp344, ra9514, conflicts }
}

export const computeHeadroomCompliance = (
  headroom: number,
): ComplianceResult => {
  const pd1096: PerLawEvaluation = {
    applies: true,
    passes: headroom >= PD1096_MIN_HEADROOM_MM,
    limit: PD1096_MIN_HEADROOM_MM,
    actual: headroom,
    message: `Minimum headroom clearance is ${PD1096_MIN_HEADROOM_MM} mm`,
    citation: 'PD 1096 IRR Rule VIII §804',
  }

  return {
    pd1096,
    bp220: passEval('BP 220 IRR · DHSUD'),
    bp344: passEval('BP 344 IRR · DPWH'),
    ra9514: passEval('RA 9514 IRR · BFP'),
    conflicts: [],
  }
}

export const computeHandrailCompliance = (
  handrailHeight: number,
  isBP220: boolean,
  isAccessible: boolean,
): ComplianceResult => {
  const pd1096: PerLawEvaluation = !isBP220
    ? {
        applies: true,
        passes: handrailHeight >= PD1096_HANDRAIL_MIN_HEIGHT_MM && handrailHeight <= PD1096_HANDRAIL_MAX_HEIGHT_MM,
        limit: PD1096_HANDRAIL_MAX_HEIGHT_MM,
        actual: handrailHeight,
        message: `PD 1096: Handrails must be ${PD1096_HANDRAIL_MIN_HEIGHT_MM}–${PD1096_HANDRAIL_MAX_HEIGHT_MM} mm above nosing`,
        citation: 'PD 1096 IRR Rule VIII §804',
      }
    : passEval('PD 1096 IRR Rule VIII §804')

  const bp344: PerLawEvaluation = isAccessible
    ? {
        applies: true,
        passes: handrailHeight === BP344_HANDRAIL_UPPER_HEIGHT_MM,
        limit: BP344_HANDRAIL_UPPER_HEIGHT_MM,
        actual: handrailHeight,
        message: `BP 344: Primary handrail must be at ${BP344_HANDRAIL_UPPER_HEIGHT_MM} mm (lower rail at 700 mm shown in 3D)`,
        citation: 'BP 344 IRR · DPWH',
      }
    : passEval('BP 344 IRR · DPWH')

  return {
    pd1096,
    bp220: passEval('BP 220 IRR · DHSUD'),
    bp344,
    ra9514: passEval('RA 9514 IRR · BFP'),
    conflicts: [],
  }
}

export const computeVerticalRiseCompliance = (
  totalRise: number,
  isExit: boolean,
): ComplianceResult => {
  const pd1096: PerLawEvaluation = {
    applies: true,
    passes: totalRise <= PD1096_MAX_VERTICAL_RISE_MM,
    limit: PD1096_MAX_VERTICAL_RISE_MM,
    actual: totalRise,
    message: `PD 1096: Max ${PD1096_MAX_VERTICAL_RISE_MM} mm vertical rise between landings`,
    citation: 'PD 1096 IRR Rule VIII §804',
  }

  const ra9514: PerLawEvaluation = isExit
    ? {
        applies: true,
        passes: totalRise <= RA9514_MAX_VERTICAL_RISE_MM,
        limit: RA9514_MAX_VERTICAL_RISE_MM,
        actual: totalRise,
        message: `RA 9514: Max ${RA9514_MAX_VERTICAL_RISE_MM} mm vertical rise for exit stairs`,
        citation: 'RA 9514 IRR · BFP',
      }
    : passEval('RA 9514 IRR · BFP')

  return {
    pd1096,
    bp220: passEval('BP 220 IRR · DHSUD'),
    bp344: passEval('BP 344 IRR · DPWH'),
    ra9514,
    conflicts: [],
  }
}

// ── UI / Scene Status Resolution ─────────────────────────────────────────────

export const resolveDimensionColor = (
  status: StairDimensionStatus,
): string | null => status.color

// ── International Comparison Deltas ──────────────────────────────────────────

const computeInternationalDeltas = (
  strictestMinWidth: number,
  isBP220: boolean,
  isAccessible: boolean,
  isExit: boolean,
  riserStatus: StairDimensionStatus,
  treadStatus: StairDimensionStatus,
  handrailStatus: StairDimensionStatus,
  verticalRiseStatus: StairDimensionStatus,
): InternationalComparisonDelta[] => {
  const phRiserLimit = riserStatus.activeLawKey === 'bp220'
    ? BP220_MAX_RISER_HEIGHT_MM
    : riserStatus.activeLawKey === 'ra9514'
      ? RA9514_MAX_RISER_HEIGHT_MM
      : PD1096_MAX_RISER_HEIGHT_MM
  const phTreadLimit = treadStatus.activeLawKey === 'bp220'
    ? BP220_MIN_TREAD_DEPTH_MM
    : treadStatus.activeLawKey === 'ra9514'
      ? RA9514_MIN_TREAD_DEPTH_MM
      : PD1096_MIN_TREAD_DEPTH_MM
  const phHandrailLimit = isAccessible
    ? BP344_HANDRAIL_UPPER_HEIGHT_MM
    : PD1096_HANDRAIL_MAX_HEIGHT_MM
  const phWidthLaw = isAccessible
    ? 'BP 344'
    : isExit
      ? 'RA 9514'
      : isBP220
        ? 'BP 220'
        : 'PD 1096'
  const phVerticalRiseLimit = verticalRiseStatus.activeLawKey === 'ra9514'
    ? RA9514_MAX_VERTICAL_RISE_MM
    : PD1096_MAX_VERTICAL_RISE_MM
  const phVerticalRiseLaw = verticalRiseStatus.activeLawKey === 'ra9514'
    ? 'RA 9514'
    : 'PD 1096'

  return [
    {
      dimension: 'riserHeight',
      phValue: phRiserLimit,
      ibcValue: IBC_MAX_RISER_HEIGHT_MM,
      adaValue: ADA_MAX_RISER_HEIGHT_MM,
      ircValue: IRC_MAX_RISER_HEIGHT_MM,
      phLaw: riserStatus.activeLawKey ? LAW_LABELS[riserStatus.activeLawKey] : 'PD 1096',
    },
    {
      dimension: 'treadDepth',
      phValue: phTreadLimit,
      ibcValue: IBC_MIN_TREAD_DEPTH_MM,
      adaValue: ADA_MIN_TREAD_DEPTH_MM,
      ircValue: IRC_MIN_TREAD_DEPTH_MM,
      phLaw: treadStatus.activeLawKey ? LAW_LABELS[treadStatus.activeLawKey] : 'PD 1096',
    },
    {
      dimension: 'headroom',
      phValue: PD1096_MIN_HEADROOM_MM,
      ibcValue: IBC_MIN_HEADROOM_MM,
      adaValue: 0, // ADA does not specify headroom
      ircValue: IRC_MIN_HEADROOM_MM,
      phLaw: 'PD 1096',
    },
    {
      dimension: 'handrailHeight',
      phValue: phHandrailLimit,
      ibcValue: IBC_HANDRAIL_MAX_HEIGHT_MM,
      adaValue: ADA_HANDRAIL_MAX_HEIGHT_MM,
      ircValue: IRC_HANDRAIL_MAX_HEIGHT_MM,
      phLaw: handrailStatus.activeLawKey ? LAW_LABELS[handrailStatus.activeLawKey] : 'PD 1096',
    },
    {
      dimension: 'stairWidth',
      phValue: strictestMinWidth,
      ibcValue: IBC_MIN_WIDTH_MM,
      adaValue: ADA_MIN_ACCESSIBLE_WIDTH_MM,
      ircValue: IRC_MIN_WIDTH_MM,
      phLaw: phWidthLaw,
    },
    {
      dimension: 'verticalRise',
      phValue: phVerticalRiseLimit,
      ibcValue: IBC_MAX_VERTICAL_RISE_MM,
      adaValue: 0,
      ircValue: IRC_MAX_VERTICAL_RISE_MM,
      phLaw: phVerticalRiseLaw,
    },
  ]
}

// ── Main Computation Function ────────────────────────────────────────────────

export const computeStairState = (params: StairParams): ComputedStairState => {
  // Extract raw parameters
  const projectType = str(params.projectType ?? 'general_residential')
  const isAccessibleRoute = bool(params.isAccessibleRoute ?? false)
  const isExitStair = bool(params.isExitStair ?? false)
  const isHighOccupancy = bool(params.isHighOccupancy ?? false)
  const stairWidth = num(params.stairWidth ?? 900)
  const riserHeight = num(params.riserHeight ?? 185)
  const treadDepth = num(params.treadDepth ?? 250)
  const headroom = num(params.headroom ?? 2100)
  const handrailHeight = num(params.handrailHeight ?? 900)
  const numRisers = num(params.numRisers ?? 12)
  const toleranceMode = bool(params.toleranceMode ?? false)
  const toleranceRange = num(params.toleranceRange ?? 5)

  // Stair type parsing
  const stairTypeStr = str(params.stairType ?? 'straight')
  const parsedStairType: StairTypeConfig = stairTypeStr === 'l-shape'
    ? {
        type: 'l-shape',
        turnDirection: str(params.turnDirection ?? 'right') as 'left' | 'right',
        risersBeforeTurn: num(params.risersBeforeTurn ?? 6),
      }
    : stairTypeStr === 'u-shape'
      ? { type: 'u-shape', risersBeforeTurn: num(params.risersBeforeTurn ?? 6) }
      : { type: 'straight' }
  const normalizedTurnSplit = getNormalizedTurningFlightSplit(parsedStairType, numRisers)
  const stairType: StairTypeConfig = parsedStairType.type === 'l-shape'
    ? {
        ...parsedStairType,
        risersBeforeTurn: normalizedTurnSplit?.before ?? parsedStairType.risersBeforeTurn,
      }
    : parsedStairType.type === 'u-shape'
      ? {
          ...parsedStairType,
          risersBeforeTurn: normalizedTurnSplit?.before ?? parsedStairType.risersBeforeTurn,
        }
      : parsedStairType

  // Classification flags
  const isBP220 = computeIsBP220(projectType)
  const isResidential = computeIsResidential(projectType)

  // Derived metrics
  const { twoRPlusT, rPlusT, comfortStatus } = computeBlondelComfort(riserHeight, treadDepth)
  const { pitchAngle, pitchStatus } = computePitch(riserHeight, treadDepth)
  const { totalRise, totalRun, stringerLength } = computeGeometryMetrics(numRisers, riserHeight, treadDepth)

  // Tolerance mode
  const { perStepRiserVariations, uniformityViolationIndices } = toleranceMode
    ? computeToleranceVariations(numRisers, toleranceRange)
    : { perStepRiserVariations: Array.from({ length: numRisers }, () => 0), uniformityViolationIndices: [] as number[] }

  const actualRiserHeights = Array.from({ length: numRisers }, (_, index) =>
    riserHeight + (perStepRiserVariations[index] ?? 0),
  )
  let cumulativeElevation = 0
  const actualTreadElevations = actualRiserHeights.map((height) => {
    cumulativeElevation += height
    return cumulativeElevation
  })
  const actualTotalRise = actualTreadElevations.at(-1) ?? 0

  // Width analysis
  const strictestMinWidth = computeStrictestMinWidth(isBP220, isHighOccupancy, isResidential, isAccessibleRoute, isExitStair)
  const widthDeficit = Math.max(0, strictestMinWidth - stairWidth)

  // Landing requirement
  const maxVerticalRise = isExitStair ? RA9514_MAX_VERTICAL_RISE_MM : PD1096_MAX_VERTICAL_RISE_MM
  const landingRequired = actualTotalRise > maxVerticalRise

  // Compliance evaluations
  const riserCompliance = computeRiserCompliance(riserHeight, isBP220, isExitStair)
  const treadCompliance = computeTreadCompliance(treadDepth, isBP220, isExitStair)
  const widthCompliance = computeWidthCompliance(stairWidth, isBP220, isAccessibleRoute, isExitStair, isHighOccupancy, isResidential)
  const headroomCompliance = computeHeadroomCompliance(headroom)
  const handrailCompliance = computeHandrailCompliance(handrailHeight, isBP220, isAccessibleRoute)
  const verticalRiseCompliance = computeVerticalRiseCompliance(actualTotalRise, isExitStair)

  const dimensionStatuses: Record<StairDimensionKey, StairDimensionStatus> = {
    riserHeight: computeDimensionStatus('riserHeight', 'max', riserHeight, riserCompliance),
    treadDepth: computeDimensionStatus('treadDepth', 'min', treadDepth, treadCompliance),
    stairWidth: computeDimensionStatus('stairWidth', 'min', stairWidth, widthCompliance),
    headroom: computeDimensionStatus('headroom', 'min', headroom, headroomCompliance),
    handrailHeight: computeDimensionStatus(
      'handrailHeight',
      isAccessibleRoute ? 'exact' : 'max',
      handrailHeight,
      handrailCompliance,
    ),
    verticalRise: computeDimensionStatus('verticalRise', 'max', actualTotalRise, verticalRiseCompliance),
  }

  // Resolved violation colors
  const riserColor = resolveDimensionColor(dimensionStatuses.riserHeight)
  const treadColor = resolveDimensionColor(dimensionStatuses.treadDepth)
  const widthColor = resolveDimensionColor(dimensionStatuses.stairWidth)
  const headroomViolation = dimensionStatuses.headroom.failingLawKey !== null
  const handrailColor = resolveDimensionColor(dimensionStatuses.handrailHeight)

  // International deltas
  const internationalDeltas = computeInternationalDeltas(
    strictestMinWidth,
    isBP220,
    isAccessibleRoute,
    isExitStair,
    dimensionStatuses.riserHeight,
    dimensionStatuses.treadDepth,
    dimensionStatuses.handrailHeight,
    dimensionStatuses.verticalRise,
  )

  return {
    projectType,
    isAccessibleRoute,
    isExitStair,
    isHighOccupancy,
    stairWidth,
    riserHeight,
    treadDepth,
    headroom,
    handrailHeight,
    numRisers,
    stairType,
    twoRPlusT,
    rPlusT,
    comfortStatus,
    pitchAngle,
    pitchStatus,
    totalRise,
    actualTotalRise,
    totalRun,
    stringerLength,
    landingRequired,
    actualRiserHeights,
    actualTreadElevations,
    normalizedTurningFlightSplit: normalizedTurnSplit,
    isBP220,
    isResidential,
    strictestMinWidth,
    widthDeficit,
    riserCompliance,
    treadCompliance,
    widthCompliance,
    headroomCompliance,
    handrailCompliance,
    verticalRiseCompliance,
    dimensionStatuses,
    riserColor,
    treadColor,
    widthColor,
    headroomViolation,
    handrailColor,
    toleranceMode,
    toleranceRange,
    perStepRiserVariations,
    uniformityViolationIndices,
    internationalDeltas,
  }
}
