import type {
  AnnotationDef,
  GeometryInstruction,
  ParameterDef,
  ParametricSceneConfig,
  Preset,
  ViolationRule,
} from '@/features/3d-lab/types/templates'
import {
  BP344_RAMP_SOURCE_RULE_BY_ID,
  BP344_RAMP_SOURCE_RULES,
  BP344_RAMP_SOURCE_SHA256,
  getBp344RampSourceGateStatus,
} from './bp344-accessible-route-ramp-source'

type ParamValue = number | boolean | string
type ParamMap = Record<string, ParamValue>

type Bp344RampFormulaInput = {
  riseMm: number
  runMm: number
  clearWidthMm: number
  landingLengthMm: number
  handrailLowerMm: number
  handrailUpperMm: number
  handrailGripDiameterMm: number
  raisedEdgeMm: number
  tactileDepthMm: number
  tactileOffsetMm: number
  vehicularRiskAtLowerEnd: boolean
  lowerEndRailingProvided: boolean
}

type Bp344RampFormulaStatus = 'PASS' | 'REVIEW' | 'FAIL'

type Bp344RampFormulaResult = {
  slopeRatio: number
  status: Bp344RampFormulaStatus
  activeErrors: string[]
  activeWarnings: string[]
}

const toNumber = (value: ParamValue): number => (typeof value === 'number' ? value : Number(value))
const toBoolean = (value: ParamValue): boolean => value === true || value === 'true'
const mmToM = (value: ParamValue): number => toNumber(value) / 1000

const asRampFormulaInput = (params: ParamMap): Bp344RampFormulaInput => ({
  riseMm: toNumber(params.riseMm),
  runMm: toNumber(params.runMm),
  clearWidthMm: toNumber(params.clearWidthMm),
  landingLengthMm: toNumber(params.landingLengthMm),
  handrailLowerMm: toNumber(params.handrailLowerMm),
  handrailUpperMm: toNumber(params.handrailUpperMm),
  handrailGripDiameterMm: toNumber(params.handrailGripDiameterMm),
  raisedEdgeMm: toNumber(params.raisedEdgeMm),
  tactileDepthMm: toNumber(params.tactileDepthMm),
  tactileOffsetMm: toNumber(params.tactileOffsetMm),
  vehicularRiskAtLowerEnd: toBoolean(params.vehicularRiskAtLowerEnd),
  lowerEndRailingProvided: toBoolean(params.lowerEndRailingProvided),
})

const slopeRatioFor = (input: Pick<Bp344RampFormulaInput, 'riseMm' | 'runMm'>): number => {
  if (input.riseMm <= 0) return Number.POSITIVE_INFINITY
  return input.runMm / input.riseMm
}

const isSpecialReviewEnvelope = (input: Bp344RampFormulaInput): boolean => {
  const slopeRatio = slopeRatioFor(input)
  return slopeRatio >= 15 && slopeRatio < 20 && input.runMm <= 10_500 && input.riseMm <= 700
}

const evaluateBp344RampCompliance = (input: Bp344RampFormulaInput): Bp344RampFormulaResult => {
  const slopeRatio = slopeRatioFor(input)
  const activeErrors: string[] = []
  const activeWarnings: string[] = []
  const specialEnvelope = isSpecialReviewEnvelope(input)

  if (input.clearWidthMm < 1_200) activeErrors.push('bp344-ramp-clear-width-min')
  if (slopeRatio < 20 && !specialEnvelope) activeErrors.push('bp344-ramp-slope-general-max-1-20')
  if (slopeRatio < 20) {
    if (specialEnvelope) activeWarnings.push('bp344-ramp-special-1-15-envelope')
    else activeErrors.push('bp344-ramp-special-1-15-envelope')
  }
  if (input.landingLengthMm < 1_800) activeErrors.push('bp344-ramp-landing-length-min')
  if (input.riseMm > 170 && (input.handrailLowerMm !== 700 || input.handrailUpperMm !== 900)) {
    activeErrors.push('bp344-ramp-handrail-heights')
  }
  if (input.riseMm > 170 && (input.handrailGripDiameterMm < 30 || input.handrailGripDiameterMm > 40)) {
    activeErrors.push('bp344-ramp-handrail-grip-diameter')
  }
  if (input.raisedEdgeMm < 100) activeErrors.push('bp344-ramp-raised-edge-min')
  if (input.tactileDepthMm < 600) activeErrors.push('bp344-ramp-tactile-depth-min')
  if (input.tactileOffsetMm !== 300) activeErrors.push('bp344-ramp-tactile-offset-300')
  if (input.vehicularRiskAtLowerEnd && !input.lowerEndRailingProvided) {
    activeErrors.push('bp344-ramp-lower-end-railing-vehicular-risk')
  }

  return {
    slopeRatio,
    status: activeErrors.length > 0 ? 'FAIL' : activeWarnings.length > 0 ? 'REVIEW' : 'PASS',
    activeErrors,
    activeWarnings,
  }
}

const sourceRule = (id: string) => BP344_RAMP_SOURCE_RULE_BY_ID.get(id)
const citationFor = (id: string) => {
  const rule = sourceRule(id)
  return rule ? `BP 344 2024 IRR · p.${rule.page_locator} · ${rule.section_locator}` : 'BP 344 2024 IRR · source pending'
}
const sourceCardFor = (id: string) => sourceRule(id)?.source_card_id

const makeViolation = ({
  id,
  field,
  sourceRuleId,
  message,
  severity = 'error',
  check,
  position,
}: {
  id: string
  field: string
  sourceRuleId: string
  message: string
  severity?: 'error' | 'warning' | 'info'
  check: (params: ParamMap) => boolean
  position: (params: ParamMap) => [number, number, number]
}): ViolationRule => ({
  id,
  field,
  sourceRuleId,
  sourceCardId: sourceCardFor(sourceRuleId),
  codeCitation: citationFor(sourceRuleId),
  message,
  severity,
  check,
  position,
})

const parameters: ParameterDef[] = [
  { key: 'riseMm', label: 'Vertical Rise', type: 'slider', min: 150, max: 900, step: 50, default: 600, unit: 'mm', group: 'Ramp Geometry' },
  { key: 'runMm', label: 'Horizontal Run', type: 'slider', min: 3_000, max: 16_000, step: 250, default: 12_000, unit: 'mm', group: 'Ramp Geometry' },
  { key: 'clearWidthMm', label: 'Clear Width', type: 'slider', min: 900, max: 2_400, step: 50, default: 1_200, unit: 'mm', group: 'Ramp Geometry' },
  { key: 'landingLengthMm', label: 'Landing / Level Area', type: 'slider', min: 1_200, max: 2_400, step: 50, default: 1_800, unit: 'mm', group: 'Landings' },
  { key: 'handrailLowerMm', label: 'Lower Handrail Height', type: 'slider', min: 600, max: 800, step: 10, default: 700, unit: 'mm', group: 'Handrails' },
  { key: 'handrailUpperMm', label: 'Upper Handrail Height', type: 'slider', min: 800, max: 1_000, step: 10, default: 900, unit: 'mm', group: 'Handrails' },
  { key: 'handrailGripDiameterMm', label: 'Grip Diameter', type: 'slider', min: 20, max: 60, step: 1, default: 40, unit: 'mm', group: 'Handrails' },
  { key: 'raisedEdgeMm', label: 'Raised Edge', type: 'slider', min: 0, max: 200, step: 10, default: 100, unit: 'mm', group: 'Edge Protection' },
  { key: 'tactileDepthMm', label: 'Tactile Warning Depth', type: 'slider', min: 300, max: 900, step: 50, default: 600, unit: 'mm', group: 'Tactile Warnings' },
  { key: 'tactileOffsetMm', label: 'Tactile Offset from Ramp', type: 'slider', min: 0, max: 600, step: 25, default: 300, unit: 'mm', group: 'Tactile Warnings' },
  { key: 'vehicularRiskAtLowerEnd', label: 'Vehicular traffic at lower end', type: 'toggle', default: false, group: 'Site Context' },
  { key: 'lowerEndRailingProvided', label: 'Lower-end railing provided', type: 'toggle', default: false, group: 'Site Context', visibleWhen: (params) => toBoolean(params.vehicularRiskAtLowerEnd) },
]

const BP344_RAMP_PRESETS: Preset[] = [
  {
    id: 'bp344-ramp-general-1-20-minimums',
    label: '1:20 minimums',
    values: {
      riseMm: 600,
      runMm: 12_000,
      clearWidthMm: 1_200,
      landingLengthMm: 1_800,
      handrailLowerMm: 700,
      handrailUpperMm: 900,
      handrailGripDiameterMm: 40,
      raisedEdgeMm: 100,
      tactileDepthMm: 600,
      tactileOffsetMm: 300,
      vehicularRiskAtLowerEnd: false,
      lowerEndRailingProvided: false,
    },
  },
  {
    id: 'bp344-ramp-special-1-15-review',
    label: '1:15 review case',
    values: {
      riseMm: 700,
      runMm: 10_500,
      clearWidthMm: 1_200,
      landingLengthMm: 1_800,
      handrailLowerMm: 700,
      handrailUpperMm: 900,
      handrailGripDiameterMm: 40,
      raisedEdgeMm: 100,
      tactileDepthMm: 600,
      tactileOffsetMm: 300,
      vehicularRiskAtLowerEnd: false,
      lowerEndRailingProvided: false,
    },
  },
  {
    id: 'bp344-ramp-vehicular-risk-warning',
    label: 'Vehicular risk demo',
    values: {
      riseMm: 600,
      runMm: 12_000,
      clearWidthMm: 1_200,
      landingLengthMm: 1_800,
      handrailLowerMm: 700,
      handrailUpperMm: 900,
      handrailGripDiameterMm: 40,
      raisedEdgeMm: 100,
      tactileDepthMm: 600,
      tactileOffsetMm: 300,
      vehicularRiskAtLowerEnd: true,
      lowerEndRailingProvided: false,
    },
  },
]

const violations: ViolationRule[] = [
  makeViolation({
    id: 'bp344-ramp-clear-width-min',
    field: 'clearWidthMm',
    sourceRuleId: 'bp344_ramp_clear_width_min',
    message: 'Ramp clear width must be at least 1200 mm.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-clear-width-min'),
    position: (params) => [mmToM(params.clearWidthMm) / 2 + 0.35, 0.25, 0],
  }),
  makeViolation({
    id: 'bp344-ramp-slope-general-max-1-20',
    field: 'runMm',
    sourceRuleId: 'bp344_ramp_general_slope_max',
    message: 'General accessible ramp gradient must not be steeper than 1:20.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-slope-general-max-1-20'),
    position: () => [-1.4, 1.25, 0],
  }),
  makeViolation({
    id: 'bp344-ramp-special-1-15-envelope',
    field: 'runMm',
    sourceRuleId: 'bp344_ramp_special_slope_review',
    message: '1:15 cases require review and must remain within 10.50 m length and 700 mm rise.',
    severity: 'warning',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeWarnings.includes('bp344-ramp-special-1-15-envelope'),
    position: () => [-1.4, 1.55, 0],
  }),
  makeViolation({
    id: 'bp344-ramp-special-1-15-envelope-error',
    field: 'runMm',
    sourceRuleId: 'bp344_ramp_special_slope_review',
    message: 'Slope is outside both the 1:20 general rule and the bounded 1:15 special-case row.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-special-1-15-envelope'),
    position: () => [-1.4, 1.55, 0],
  }),
  makeViolation({
    id: 'bp344-ramp-landing-length-min',
    field: 'landingLengthMm',
    sourceRuleId: 'bp344_ramp_landing_length_min',
    message: 'Landings and terminal level areas must be at least 1800 mm.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-landing-length-min'),
    position: (params) => [0, 0.15, mmToM(params.runMm) / 2 + mmToM(params.landingLengthMm) / 2],
  }),
  makeViolation({
    id: 'bp344-ramp-handrail-heights',
    field: 'handrailUpperMm',
    sourceRuleId: 'bp344_ramp_handrail_heights',
    message: 'Required ramp handrails are 700 mm and 900 mm above the ramp surface where applicable.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-handrail-heights'),
    position: (params) => [mmToM(params.clearWidthMm) / 2 + 0.25, 1.1, 0],
  }),
  makeViolation({
    id: 'bp344-ramp-handrail-grip-diameter',
    field: 'handrailGripDiameterMm',
    sourceRuleId: 'bp344_ramp_handrail_trigger_and_grip',
    message: 'Full-grip handrail diameter must be 30–40 mm.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-handrail-grip-diameter'),
    position: (params) => [mmToM(params.clearWidthMm) / 2 + 0.25, 1.1, -1],
  }),
  makeViolation({
    id: 'bp344-ramp-raised-edge-min',
    field: 'raisedEdgeMm',
    sourceRuleId: 'bp344_ramp_raised_edge_min',
    message: 'Raised edge must be at least 100 mm.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-raised-edge-min'),
    position: (params) => [-mmToM(params.clearWidthMm) / 2 - 0.15, 0.15, 0],
  }),
  makeViolation({
    id: 'bp344-ramp-tactile-depth-min',
    field: 'tactileDepthMm',
    sourceRuleId: 'bp344_ramp_tactile_warning',
    message: 'Tactile warning strip depth must be 600 mm.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-tactile-depth-min'),
    position: (params) => [0, 0.12, mmToM(params.runMm) / 2 + mmToM(params.tactileOffsetMm) + mmToM(params.tactileDepthMm) / 2],
  }),
  makeViolation({
    id: 'bp344-ramp-tactile-offset-300',
    field: 'tactileOffsetMm',
    sourceRuleId: 'bp344_ramp_tactile_warning',
    message: 'Tactile warning blocks should be located 300 mm before/after the ramp run.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-tactile-offset-300'),
    position: (params) => [0, 0.12, -mmToM(params.runMm) / 2 - mmToM(params.tactileOffsetMm)],
  }),
  makeViolation({
    id: 'bp344-ramp-lower-end-railing-vehicular-risk',
    field: 'lowerEndRailingProvided',
    sourceRuleId: 'bp344_ramp_vehicular_traffic_railing',
    message: 'A railing must be provided across the lower end when traffic is possible.',
    check: (params) => evaluateBp344RampCompliance(asRampFormulaInput(params)).activeErrors.includes('bp344-ramp-lower-end-railing-vehicular-risk'),
    position: (params) => [0, 0.8, mmToM(params.runMm) / 2 + mmToM(params.landingLengthMm) + 0.1],
  }),
]

const annotations: AnnotationDef[] = [
  {
    id: 'bp344-ramp-lower-landing-label',
    label: 'Lower 1.80 m level landing',
    description: 'Terminal level area shown as a flat pad before the ramp starts.',
    sourceRuleId: 'bp344_ramp_landing_length_min',
    sourceCardId: sourceCardFor('bp344_ramp_landing_length_min'),
    codeCitation: citationFor('bp344_ramp_landing_length_min'),
    position: (params) => [0, 0.46, mmToM(params.runMm) / 2 + mmToM(params.landingLengthMm) / 2],
  },
  {
    id: 'bp344-ramp-slope-surface-label',
    label: 'Sloped ramp run — check 1:20',
    description: 'The blue inclined walking surface is the live run/rise ratio being tested.',
    sourceRuleId: 'bp344_ramp_general_slope_max',
    sourceCardId: sourceCardFor('bp344_ramp_general_slope_max'),
    codeCitation: citationFor('bp344_ramp_general_slope_max'),
    position: (params) => [0, mmToM(params.riseMm) / 2 + 0.92, 0],
  },
  {
    id: 'bp344-ramp-upper-landing-label',
    label: 'Upper 1.80 m level landing',
    description: 'The upper landing is raised by the selected vertical rise and remains level.',
    sourceRuleId: 'bp344_ramp_landing_length_min',
    sourceCardId: sourceCardFor('bp344_ramp_landing_length_min'),
    codeCitation: citationFor('bp344_ramp_landing_length_min'),
    position: (params) => [0, mmToM(params.riseMm) + 0.46, -(mmToM(params.runMm) / 2 + mmToM(params.landingLengthMm) / 2)],
  },
  {
    id: 'bp344-ramp-clear-width-label',
    label: 'Clear width: min. 1.20 m',
    description: 'The walking surface width is isolated from handrails and raised edges.',
    sourceRuleId: 'bp344_ramp_clear_width_min',
    sourceCardId: sourceCardFor('bp344_ramp_clear_width_min'),
    codeCitation: citationFor('bp344_ramp_clear_width_min'),
    position: (params) => [mmToM(params.clearWidthMm) / 2 + 0.72, 0.34, mmToM(params.runMm) / 2 + 0.7],
  },
  {
    id: 'bp344-ramp-handrail-label',
    label: 'Dual handrails: 0.70 m / 0.90 m',
    description: 'Posts and two rail heights are shown on both sides to make the ramp read architecturally.',
    sourceRuleId: 'bp344_ramp_handrail_heights',
    sourceCardId: sourceCardFor('bp344_ramp_handrail_heights'),
    codeCitation: citationFor('bp344_ramp_handrail_heights'),
    position: (params) => [mmToM(params.clearWidthMm) / 2 + 0.92, mmToM(params.riseMm) / 2 + 1.22, -0.6],
  },
  {
    id: 'bp344-ramp-tactile-warning-label',
    label: 'Tactile warning blocks',
    description: 'Amber stud fields show the 600 mm warning zone offset from the ramp ends.',
    sourceRuleId: 'bp344_ramp_tactile_warning',
    sourceCardId: sourceCardFor('bp344_ramp_tactile_warning'),
    codeCitation: citationFor('bp344_ramp_tactile_warning'),
    position: (params) => [-(mmToM(params.clearWidthMm) / 2 + 0.72), 0.32, mmToM(params.runMm) / 2 + mmToM(params.tactileOffsetMm) + mmToM(params.tactileDepthMm) / 2],
  },
  {
    id: 'bp344-ramp-raised-edge-label',
    label: 'Raised edge: min. 100 mm',
    description: 'Dark curb strips on both ramp edges mark the required edge protection.',
    sourceRuleId: 'bp344_ramp_raised_edge_min',
    sourceCardId: sourceCardFor('bp344_ramp_raised_edge_min'),
    codeCitation: citationFor('bp344_ramp_raised_edge_min'),
    position: (params) => [-(mmToM(params.clearWidthMm) / 2 + 0.48), mmToM(params.riseMm) / 2 + 0.38, 0.9],
  },
  {
    id: 'bp344-route-context-door-clear-width',
    label: 'Route context: 900 mm door clear width',
    description: 'Door values are source-backed route context only in Phase 1; they are not pass/fail checks until deterministic tests are added.',
    sourceRuleId: 'bp344_route_door_clear_width',
    sourceCardId: sourceCardFor('bp344_route_door_clear_width'),
    codeCitation: citationFor('bp344_route_door_clear_width'),
    position: (params) => [-(mmToM(params.clearWidthMm) / 2 + 1.22), mmToM(params.riseMm) + 1.2, -(mmToM(params.runMm) / 2 + mmToM(params.landingLengthMm) + 0.1)],
  },
  {
    id: 'bp344-route-context-corridor-clear-width',
    label: 'Route context: 1500 mm corridor',
    description: 'Corridor clearance remains a source-pending QA annotation in this first dashboard card pass; no pass/fail label is shown.',
    sourceRuleId: 'bp344_route_corridor_clear_width',
    sourceCardId: sourceCardFor('bp344_route_corridor_clear_width'),
    codeCitation: citationFor('bp344_route_corridor_clear_width'),
    position: (params) => [mmToM(params.clearWidthMm) / 2 + 1.18, 0.72, mmToM(params.runMm) / 2 + mmToM(params.landingLengthMm) + 0.15],
  },
  {
    id: 'bp344-ramp-slope-ratio-label',
    label: 'Side profile: run ÷ rise',
    description: 'Horizontal run divided by vertical rise. 1:20 is the general rule; 1:15 is review-only special-case territory.',
    sourceRuleId: 'bp344_ramp_general_slope_max',
    sourceCardId: sourceCardFor('bp344_ramp_general_slope_max'),
    codeCitation: citationFor('bp344_ramp_general_slope_max'),
    position: (params) => [-(mmToM(params.clearWidthMm) / 2 + 1.25), mmToM(params.riseMm) + 0.42, -mmToM(params.runMm) / 2],
  },
]

function geometry(params: ParamMap): GeometryInstruction[] {
  const input = asRampFormulaInput(params)
  const result = evaluateBp344RampCompliance(input)
  const runM = mmToM(input.runMm)
  const riseM = mmToM(input.riseMm)
  const widthM = mmToM(input.clearWidthMm)
  const landingM = mmToM(input.landingLengthMm)
  const tactileM = mmToM(input.tactileDepthMm)
  const tactileOffsetM = mmToM(input.tactileOffsetMm)
  const raisedEdgeM = mmToM(input.raisedEdgeMm)
  const lowerRailM = mmToM(input.handrailLowerMm)
  const upperRailM = mmToM(input.handrailUpperMm)
  const rampLengthM = Math.sqrt(runM * runM + riseM * riseM)
  const angle = Math.atan2(riseM, runM)
  const railOffset = widthM / 2 + 0.12
  const sideProfileX = -(widthM / 2 + 0.82)
  const corridorWidthM = 1.5
  const doorClearM = 0.9
  const landingColor = input.landingLengthMm < 1800 ? '#FCA5A5' : '#D6E4F0'
  const tactileColor = input.tactileDepthMm < 600 || input.tactileOffsetMm !== 300 ? '#EF4444' : '#D97706'
  const edgeColor = input.raisedEdgeMm < 100 ? '#EF4444' : '#334155'
  const railColor = input.handrailLowerMm !== 700 || input.handrailUpperMm !== 900 ? '#EF4444' : '#1D4ED8'
  const upperRailColor = input.handrailUpperMm !== 900 || input.handrailGripDiameterMm > 40 || input.handrailGripDiameterMm < 30 ? '#EF4444' : '#172554'
  const rampColor = result.status === 'FAIL' ? '#FCA5A5' : result.status === 'REVIEW' ? '#FDE68A' : '#60A5FA'
  const wedgeColor = result.status === 'FAIL' ? '#FEE2E2' : result.status === 'REVIEW' ? '#FEF3C7' : '#DBEAFE'
  const inst: GeometryInstruction[] = []

  const rampDeckYAt = (t: number) => riseM * t
  const rampZAt = (t: number) => runM / 2 - runM * t
  const sideProfilePoints: [number, number][] = [
    [-runM / 2, 0],
    [runM / 2, riseM],
    [runM / 2, 0],
  ]

  const makeTactileStudPositions = (centerZ: number, y: number): [number, number, number][] => {
    const columns = Math.max(4, Math.floor(widthM / 0.2))
    const rows = Math.max(3, Math.floor(tactileM / 0.18))
    const positions: [number, number, number][] = []

    for (let xIndex = 0; xIndex < columns; xIndex += 1) {
      const x = -widthM / 2 + ((xIndex + 0.5) * widthM) / columns
      for (let zIndex = 0; zIndex < rows; zIndex += 1) {
        const z = centerZ - tactileM / 2 + ((zIndex + 0.5) * tactileM) / rows
        positions.push([x, y, z])
      }
    }

    return positions
  }

  const postStops = [0, 0.16, 0.32, 0.48, 0.64, 0.8, 1]
  const makePostPositions = (x: number): [number, number, number][] => postStops.map((t) => [
    x,
    rampDeckYAt(t) + upperRailM / 2,
    rampZAt(t),
  ])

  inst.push({
    id: 'site-context-base-plane',
    type: 'box',
    position: [0, -0.055, 0],
    args: [Math.max(corridorWidthM, widthM) + 2.4, 0.06, runM + landingM * 2 + 2.6],
    color: '#E5E7EB',
    opacity: 0.72,
    transparent: true,
  })
  inst.push({
    id: 'accessible-route-centerline',
    type: 'box',
    position: [0, 0.01, 0],
    args: [0.055, 0.02, runM + landingM * 2],
    color: '#2563EB',
    opacity: 0.35,
    transparent: true,
  })
  inst.push({
    id: 'lower-approach-1500-context',
    type: 'box',
    position: [0, 0.005, runM / 2 + landingM + 0.55],
    args: [corridorWidthM, 0.045, 1.1],
    color: '#BFDBFE',
    opacity: 0.62,
    transparent: true,
    label: '1500 mm approach context',
  })
  inst.push({
    id: 'lower-landing-1800',
    type: 'box',
    position: [0, 0.035, runM / 2 + landingM / 2],
    args: [widthM + 0.28, 0.07, landingM],
    color: landingColor,
    label: `${input.landingLengthMm}mm lower landing`,
  })
  inst.push({
    id: 'upper-landing-1800',
    type: 'box',
    position: [0, riseM + 0.035, -(runM / 2 + landingM / 2)],
    args: [widthM + 0.28, 0.07, landingM],
    color: landingColor,
    label: `${input.landingLengthMm}mm upper landing`,
  })
  inst.push({
    id: 'upper-door-threshold-900-context',
    type: 'box',
    position: [0, riseM + 0.055, -(runM / 2 + landingM + 0.08)],
    args: [doorClearM, 0.08, 0.12],
    color: '#A7F3D0',
    label: '900 mm door context',
  })

  inst.push({
    id: 'ramp-solid-wedge',
    type: 'extruded-profile',
    position: [-widthM / 2, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    args: [],
    profilePoints: sideProfilePoints,
    extrudeDepth: widthM,
    color: wedgeColor,
    opacity: 0.62,
    transparent: true,
    label: `solid ramp wedge 1:${result.slopeRatio.toFixed(1)}`,
  })
  inst.push({
    id: 'ramp-walking-surface',
    type: 'box',
    position: [0, riseM / 2 + 0.06, 0],
    rotation: [angle, 0, 0],
    args: [widthM, 0.09, rampLengthM],
    color: rampColor,
    label: `walking surface 1:${result.slopeRatio.toFixed(1)}`,
  })
  inst.push({
    id: 'left-raised-edge-100',
    type: 'box',
    position: [-(widthM / 2 + 0.045), riseM / 2 + Math.max(raisedEdgeM, 0.03) / 2 + 0.08, 0],
    rotation: [angle, 0, 0],
    args: [0.09, Math.max(0.03, raisedEdgeM), rampLengthM],
    color: edgeColor,
  })
  inst.push({
    id: 'right-raised-edge-100',
    type: 'box',
    position: [widthM / 2 + 0.045, riseM / 2 + Math.max(raisedEdgeM, 0.03) / 2 + 0.08, 0],
    rotation: [angle, 0, 0],
    args: [0.09, Math.max(0.03, raisedEdgeM), rampLengthM],
    color: edgeColor,
  })

  const arrowT = 0.62
  inst.push({
    id: 'ramp-travel-direction-arrow-shaft',
    type: 'box',
    position: [0, riseM / 2 + 0.16, 0],
    rotation: [angle, 0, 0],
    args: [0.16, 0.028, Math.min(2.6, runM * 0.32)],
    color: '#1E40AF',
  })
  inst.push({
    id: 'ramp-travel-direction-arrowhead',
    type: 'cone',
    position: [0, rampDeckYAt(arrowT) + 0.18, rampZAt(arrowT)],
    rotation: [-(Math.PI / 2 - angle), 0, 0],
    args: [0.19, 0.46, 3],
    color: '#1E3A8A',
  })

  const lowerTactileZ = runM / 2 + tactileOffsetM + tactileM / 2
  const upperTactileZ = -(runM / 2 + tactileOffsetM + tactileM / 2)
  inst.push({
    id: 'lower-tactile-600',
    type: 'box',
    position: [0, 0.065, lowerTactileZ],
    args: [widthM, 0.05, tactileM],
    color: tactileColor,
    label: `${input.tactileDepthMm}mm tactile warning`,
  })
  inst.push({
    id: 'upper-tactile-600',
    type: 'box',
    position: [0, riseM + 0.065, upperTactileZ],
    args: [widthM, 0.05, tactileM],
    color: tactileColor,
    label: `${input.tactileDepthMm}mm tactile warning`,
  })
  inst.push({
    id: 'lower-tactile-studs',
    type: 'instanced',
    position: [0, 0, 0],
    args: [],
    color: '#78350F',
    instancedShape: 'cylinder',
    instancedShapeArgs: [0.035, 0.035, 0.022, 12],
    instancedPositions: makeTactileStudPositions(lowerTactileZ, 0.103),
  })
  inst.push({
    id: 'upper-tactile-studs',
    type: 'instanced',
    position: [0, 0, 0],
    args: [],
    color: '#78350F',
    instancedShape: 'cylinder',
    instancedShapeArgs: [0.035, 0.035, 0.022, 12],
    instancedPositions: makeTactileStudPositions(upperTactileZ, riseM + 0.103),
  })

  inst.push({
    id: 'handrail-posts-left',
    type: 'instanced',
    position: [0, 0, 0],
    args: [],
    color: railColor,
    instancedShape: 'cylinder',
    instancedShapeArgs: [0.018, 0.018, Math.max(0.3, upperRailM), 10],
    instancedPositions: makePostPositions(-railOffset),
  })
  inst.push({
    id: 'handrail-posts-right',
    type: 'instanced',
    position: [0, 0, 0],
    args: [],
    color: railColor,
    instancedShape: 'cylinder',
    instancedShapeArgs: [0.018, 0.018, Math.max(0.3, upperRailM), 10],
    instancedPositions: makePostPositions(railOffset),
  })
  inst.push({
    id: 'lower-handrail-left-700',
    type: 'cylinder',
    position: [-railOffset, riseM / 2 + lowerRailM, 0],
    rotation: [Math.PI / 2 - angle, 0, 0],
    args: [0.018, 0.018, rampLengthM + 0.3, 12],
    color: railColor,
  })
  inst.push({
    id: 'lower-handrail-right-700',
    type: 'cylinder',
    position: [railOffset, riseM / 2 + lowerRailM, 0],
    rotation: [Math.PI / 2 - angle, 0, 0],
    args: [0.018, 0.018, rampLengthM + 0.3, 12],
    color: railColor,
  })
  inst.push({
    id: 'upper-handrail-left-900',
    type: 'cylinder',
    position: [-railOffset, riseM / 2 + upperRailM, 0],
    rotation: [Math.PI / 2 - angle, 0, 0],
    args: [0.022, 0.022, rampLengthM + 0.3, 12],
    color: upperRailColor,
  })
  inst.push({
    id: 'upper-handrail-right-900',
    type: 'cylinder',
    position: [railOffset, riseM / 2 + upperRailM, 0],
    rotation: [Math.PI / 2 - angle, 0, 0],
    args: [0.022, 0.022, rampLengthM + 0.3, 12],
    color: upperRailColor,
  })
  const railSides: Array<{ x: number; side: 'left' | 'right' }> = [
    { x: -railOffset, side: 'left' },
    { x: railOffset, side: 'right' },
  ]
  railSides.forEach(({ x, side }) => {
    const landingRails = [
      { id: `${side}-lower-landing-handrail-700`, height: lowerRailM, color: railColor },
      { id: `${side}-lower-landing-handrail-900`, height: upperRailM, color: upperRailColor },
      { id: `${side}-upper-landing-handrail-700`, height: lowerRailM, color: railColor },
      { id: `${side}-upper-landing-handrail-900`, height: upperRailM, color: upperRailColor },
    ]

    landingRails.forEach((rail) => {
      const isUpper = rail.id.includes('upper-landing')
      const railRadius = rail.height === upperRailM ? 0.022 : 0.018
      inst.push({
        id: rail.id,
        type: 'cylinder',
        position: [x, (isUpper ? riseM : 0) + rail.height, isUpper ? -(runM / 2 + landingM / 2) : runM / 2 + landingM / 2],
        rotation: [Math.PI / 2, 0, 0],
        args: [railRadius, railRadius, landingM + 0.22, 12],
        color: rail.color,
      })
    })
  })

  inst.push({
    id: 'side-profile-slope-wedge',
    type: 'extruded-profile',
    position: [sideProfileX, 0.012, 0],
    rotation: [0, Math.PI / 2, 0],
    args: [],
    profilePoints: sideProfilePoints,
    extrudeDepth: 0.055,
    color: '#0F172A',
    opacity: 0.2,
    transparent: true,
    label: `side profile 1:${result.slopeRatio.toFixed(1)}`,
  })
  inst.push({
    id: 'side-profile-run-dimension',
    type: 'box',
    position: [sideProfileX - 0.055, 0.04, 0],
    args: [0.04, 0.04, runM],
    color: '#475569',
    label: `${runM.toFixed(2)}m run`,
  })
  inst.push({
    id: 'side-profile-rise-dimension',
    type: 'box',
    position: [sideProfileX - 0.055, riseM / 2, -runM / 2],
    args: [0.04, Math.max(0.04, riseM), 0.04],
    color: '#475569',
    label: `${riseM.toFixed(2)}m rise`,
  })

  inst.push({ id: 'upper-door-frame-left', type: 'box', position: [-doorClearM / 2, riseM + 0.92, -(runM / 2 + landingM + 0.12)], args: [0.06, 1.78, 0.07], color: '#0F766E' })
  inst.push({ id: 'upper-door-frame-right', type: 'box', position: [doorClearM / 2, riseM + 0.92, -(runM / 2 + landingM + 0.12)], args: [0.06, 1.78, 0.07], color: '#0F766E' })
  inst.push({ id: 'upper-door-frame-lintel', type: 'box', position: [0, riseM + 1.78, -(runM / 2 + landingM + 0.12)], args: [doorClearM + 0.12, 0.08, 0.07], color: '#0F766E' })

  inst.push({ id: 'wheelchair-main-wheel-left', type: 'ring', position: [-0.24, 0.3, runM / 2 + landingM * 0.44], args: [0.16, 0.22], color: '#0F172A' })
  inst.push({ id: 'wheelchair-main-wheel-right', type: 'ring', position: [0.24, 0.3, runM / 2 + landingM * 0.44], args: [0.16, 0.22], color: '#0F172A' })
  inst.push({ id: 'wheelchair-seat', type: 'box', position: [0, 0.58, runM / 2 + landingM * 0.44], args: [0.48, 0.07, 0.05], color: '#0F172A' })
  inst.push({ id: 'wheelchair-user-body', type: 'box', position: [0, 0.86, runM / 2 + landingM * 0.44], args: [0.2, 0.38, 0.05], color: '#1D4ED8' })
  inst.push({ id: 'wheelchair-user-head', type: 'sphere', position: [0, 1.15, runM / 2 + landingM * 0.44], args: [0.11, 16, 12], color: '#1D4ED8' })

  if (input.vehicularRiskAtLowerEnd) {
    inst.push({ id: 'vehicular-risk-zone', type: 'box', position: [0, 0.04, runM / 2 + landingM + 0.35], args: [widthM + 0.7, 0.04, 0.55], color: '#F97316', opacity: 0.46, transparent: true, label: 'traffic risk' })
    inst.push({ id: 'lower-end-railing', type: 'box', position: [0, 0.75, runM / 2 + landingM + 0.06], args: [widthM + 0.42, 0.08, 0.08], color: input.lowerEndRailingProvided ? '#16A34A' : '#EF4444' })
  }

  return inst
}

const sourceGateStatus = getBp344RampSourceGateStatus()

export const bp344AccessibleRouteRampConfig: ParametricSceneConfig = {
  id: 'bp344-accessible-route-ramp',
  title: 'BP 344 Accessible Route Ramp',
  description: 'Dashboard QA preview for a diagrammatic BP 344 accessible ramp with source-rule metadata, formula checks, source-pending status, and route-context annotations.',
  subject: 'bp-344',
  parameters,
  geometry,
  violations,
  annotations,
  presets: BP344_RAMP_PRESETS,
  sourceTruth: {
    sourceRules: [...BP344_RAMP_SOURCE_RULES],
    sourceSha256: BP344_RAMP_SOURCE_SHA256,
    sourceGateStatus: sourceGateStatus.status,
    canShowSourceBackedCompliance: sourceGateStatus.canShowSourceBackedCompliance,
  },
  camera: {
    position: [7.2, 4.2, 10.8],
    target: [0, 0.65, 0],
    fov: 43,
    presets: {
      top: { position: [0, 14, 0.01], target: [0, 0, 0], fov: 35 },
      front: { position: [0, 2.6, 12.5], target: [0, 0.65, 0], fov: 40 },
      'iso-ne': { position: [7.2, 4.2, 10.8], target: [0, 0.65, 0], fov: 43 },
    },
    zoomToFit: { position: [7.2, 4.2, 10.8], target: [0, 0.65, 0], fov: 43 },
    resetPreset: 'iso-ne',
  },
  scale: 1,
  contextScenario: 'Dashboard QA preview for checking a BP 344 accessible ramp before learner release. Source-backed compliance labels remain disabled until the source-card reviewer memo is attached.',
  leaQuestionCount: 2,
  leaQuestionType: 'code compliance and dimensional recall',
  supportedPhases: ['guided', 'sandbox', 'challenge'],
  hasChallengeMode: true,
  showHumanScale: true,
  alwaysShowAnnotations: true,
  defaultVisibleAnnotationIds: [
    'bp344-ramp-lower-landing-label',
    'bp344-ramp-slope-surface-label',
    'bp344-ramp-upper-landing-label',
    'bp344-ramp-slope-ratio-label',
  ],
}

export {
  BP344_RAMP_PRESETS,
  evaluateBp344RampCompliance,
}
export type {
  Bp344RampFormulaInput,
  Bp344RampFormulaResult,
  Bp344RampFormulaStatus,
}
