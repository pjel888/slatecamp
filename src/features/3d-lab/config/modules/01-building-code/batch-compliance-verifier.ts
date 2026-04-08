// src/features/3d-lab/config/modules/01-building-code/batch-compliance-verifier.ts
// Batch Compliance Verifier — Multi-Code Check Dashboard
// Visual summary of building compliance across PD 1096, RA 9514, BP 344.
// Shows a building cross-section with color-coded compliance status bars
// for each major code requirement.

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'
import { PD_1096, RA_9514, BP_344 } from '@/features/3d-lab/config/constants'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function bool(v: number | string | boolean): boolean { return v === true || v === 'true' || v === 1 }

// ─── Parameters ──────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  // Building basics
  { key: 'numStoreys', label: 'Number of Storeys', type: 'slider', min: 1, max: 10, step: 1, default: 3, group: 'Building' },
  { key: 'floorArea', label: 'Floor Area per Storey', type: 'slider', min: 50, max: 2000, step: 10, default: 300, unit: 'sqm', group: 'Building' },
  { key: 'ceilingHeight', label: 'Ceiling Height', type: 'slider', min: 2.4, max: 4.5, step: 0.1, default: 2.7, unit: 'm', decimals: 1, group: 'Building' },
  { key: 'occupancyType', label: 'Occupancy Type', type: 'dropdown', default: 'business',
    options: [
      { value: 'assembly', label: 'Assembly' },
      { value: 'business', label: 'Business' },
      { value: 'educational', label: 'Educational' },
      { value: 'residential', label: 'Residential' },
      { value: 'mercantile', label: 'Mercantile' },
      { value: 'industrial', label: 'Industrial' },
    ],
    group: 'Occupancy' },
  // Fire safety
  { key: 'numExits', label: 'Number of Exits', type: 'slider', min: 1, max: 6, step: 1, default: 2, group: 'Fire Safety' },
  { key: 'hasSprinkler', label: 'Sprinkler System', type: 'toggle', default: false, group: 'Fire Safety' },
  { key: 'maxTravelDist', label: 'Max Travel Distance', type: 'slider', min: 10, max: 80, step: 1, default: 30, unit: 'm', group: 'Fire Safety' },
  // Accessibility
  { key: 'hasAccessibleEntry', label: 'Accessible Entry', type: 'toggle', default: true, group: 'Accessibility' },
  { key: 'corridorWidth', label: 'Min Corridor Width', type: 'slider', min: 0.6, max: 2.0, step: 0.05, default: 1.2, unit: 'm', decimals: 2, group: 'Accessibility' },
  { key: 'hasElevator', label: 'Elevator (if >4 storeys)', type: 'toggle', default: false, group: 'Accessibility' },
]

// ─── Compliance Check Logic ──────────────────────────────────────────────────

interface CheckResult {
  code: string
  check: string
  pass: boolean
  detail: string
}

const runChecks = (p: Record<string, number | boolean | string>): CheckResult[] => {
  const storeys = num(p.numStoreys)
  const floorArea = num(p.floorArea)
  const ceilingH = num(p.ceilingHeight)
  const occType = String(p.occupancyType) as keyof typeof RA_9514.OCCUPANT_LOAD_FACTOR
  const exits = num(p.numExits)
  const sprinkler = bool(p.hasSprinkler)
  const travelDist = num(p.maxTravelDist)
  const accEntry = bool(p.hasAccessibleEntry)
  const corrWidth = num(p.corridorWidth)
  const elevator = bool(p.hasElevator)

  const occupantLoad = Math.ceil(floorArea / (RA_9514.OCCUPANT_LOAD_FACTOR[occType] ?? 9.3))
  const bldgHeight = storeys * ceilingH
  const isHighRise = bldgHeight >= RA_9514.HIGH_RISE_THRESHOLD_M

  const maxTravel = sprinkler
    ? (RA_9514.TRAVEL_DISTANCE.sprinklered[occType] ?? 61)
    : (RA_9514.TRAVEL_DISTANCE.noSprinkler[occType] ?? 46)

  const reqExits = occupantLoad > 1000 ? 4 : occupantLoad > 500 ? 3 : 2

  return [
    // PD 1096 checks
    {
      code: 'PD 1096',
      check: 'Ceiling Height',
      pass: ceilingH >= PD_1096.CEILING_HEIGHT.habitable,
      detail: `${ceilingH}m ${ceilingH >= PD_1096.CEILING_HEIGHT.habitable ? '≥' : '<'} ${PD_1096.CEILING_HEIGHT.habitable}m min`,
    },
    {
      code: 'PD 1096',
      check: 'High-Rise Classification',
      pass: true, // informational
      detail: `${bldgHeight.toFixed(1)}m — ${isHighRise ? 'HIGH-RISE (≥15m)' : 'Not high-rise'}`,
    },
    // RA 9514 checks
    {
      code: 'RA 9514',
      check: 'Number of Exits',
      pass: exits >= reqExits,
      detail: `${exits} provided ${exits >= reqExits ? '≥' : '<'} ${reqExits} required (OL: ${occupantLoad})`,
    },
    {
      code: 'RA 9514',
      check: 'Travel Distance',
      pass: travelDist <= maxTravel,
      detail: `${travelDist}m ${travelDist <= maxTravel ? '≤' : '>'} ${maxTravel}m max (${sprinkler ? 'sprinklered' : 'unsprinklered'})`,
    },
    {
      code: 'RA 9514',
      check: 'Sprinkler (High-Rise)',
      pass: !isHighRise || sprinkler,
      detail: isHighRise ? (sprinkler ? 'Required — installed' : 'Required — MISSING') : 'Not required',
    },
    // BP 344 checks
    {
      code: 'BP 344',
      check: 'Accessible Entry',
      pass: accEntry,
      detail: accEntry ? 'Provided' : 'MISSING — required for all public buildings',
    },
    {
      code: 'BP 344',
      check: 'Corridor Width',
      pass: corrWidth >= BP_344.MIN_CORRIDOR_WIDTH,
      detail: `${corrWidth}m ${corrWidth >= BP_344.MIN_CORRIDOR_WIDTH ? '≥' : '<'} ${BP_344.MIN_CORRIDOR_WIDTH}m min`,
    },
    {
      code: 'BP 344',
      check: 'Elevator Access',
      pass: storeys <= 4 || elevator,
      detail: storeys > 4 ? (elevator ? 'Required — provided' : 'Required — MISSING (>4 storeys)') : 'Not required (≤4 storeys)',
    },
  ]
}

// ─── Geometry ────────────────────────────────────────────────────────────────

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const checks = runChecks(params)
  const storeys = num(params.numStoreys)
  const ceilingH = num(params.ceilingHeight)
  const inst: GeometryInstruction[] = []

  const scale = 0.15
  const bW = 2.0 // building visual width
  const bD = 1.2 // building visual depth
  const floorH = ceilingH * scale
  const totalH = storeys * floorH

  // Building cross-section
  for (let i = 0; i < storeys; i++) {
    const y = i * floorH
    // Floor slab
    inst.push({
      id: `floor-${i}`,
      type: 'box',
      position: [0, y, 0],
      args: [bW, 0.02, bD],
      color: '#94a3b8',
    })
    // Floor label
    inst.push({
      id: `floor-label-${i}`,
      type: 'box',
      position: [-bW / 2 - 0.15, y + floorH / 2, 0],
      args: [0.2, floorH * 0.6, 0.01],
      color: '#e2e8f0',
      opacity: 0.5,
      transparent: true,
      label: `F${i + 1}`,
    })
  }
  // Roof slab
  inst.push({ id: 'roof', type: 'box', position: [0, totalH, 0], args: [bW, 0.03, bD], color: '#64748b' })

  // Compliance status bars (right side of building)
  const barX = bW / 2 + 0.4
  const barW = 0.25
  const barH = 0.12
  const barGap = 0.18

  checks.forEach((check, i) => {
    const y = totalH - (i + 1) * barGap
    const pass = check.pass

    // Status bar
    inst.push({
      id: `bar-${i}`,
      type: 'box',
      position: [barX, y, 0],
      args: [barW, barH, 0.02],
      color: pass ? '#2D9F6F' : '#D64545',
      opacity: 0.85,
      transparent: true,
      label: `${check.code}: ${check.check}`,
    })

    // Indicator dot
    inst.push({
      id: `dot-${i}`,
      type: 'sphere',
      position: [barX - barW / 2 - 0.06, y, 0],
      args: [0.03],
      color: pass ? '#2D9F6F' : '#D64545',
    })
  })

  // Summary score
  const passCount = checks.filter((c) => c.pass).length
  const total = checks.length
  const allPass = passCount === total

  inst.push({
    id: 'summary',
    type: 'box',
    position: [barX, totalH + 0.15, 0],
    args: [barW * 1.5, 0.15, 0.02],
    color: allPass ? '#2D9F6F' : '#D64545',
    opacity: 0.9,
    transparent: true,
    label: `${passCount}/${total} PASS`,
  })

  return inst
}

// ─── Violations ──────────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'ceiling-low',
    field: 'ceilingHeight',
    check: (p) => num(p.ceilingHeight) < PD_1096.CEILING_HEIGHT.habitable,
    message: `Ceiling height below ${PD_1096.CEILING_HEIGHT.habitable}m minimum for habitable rooms`,
    codeCitation: 'PD 1096 IRR Rule VII §701',
    severity: 'error',
    position: () => [0, 0.5, 0],
  },
  {
    id: 'exits-insufficient',
    field: 'numExits',
    check: (p) => {
      const occType = String(p.occupancyType) as keyof typeof RA_9514.OCCUPANT_LOAD_FACTOR
      const ol = Math.ceil(num(p.floorArea) / (RA_9514.OCCUPANT_LOAD_FACTOR[occType] ?? 9.3))
      const req = ol > 1000 ? 4 : ol > 500 ? 3 : 2
      return num(p.numExits) < req
    },
    message: 'Insufficient exits for occupant load',
    codeCitation: 'RA 9514 IRR Rule 10 §1005',
    severity: 'error',
    position: () => [0, 0.3, 0.8],
  },
  {
    id: 'travel-exceeded',
    field: 'maxTravelDist',
    check: (p) => {
      const occType = String(p.occupancyType) as keyof typeof RA_9514.TRAVEL_DISTANCE.noSprinkler
      const sprinkler = bool(p.hasSprinkler)
      const maxTravel = sprinkler
        ? (RA_9514.TRAVEL_DISTANCE.sprinklered[occType] ?? 61)
        : (RA_9514.TRAVEL_DISTANCE.noSprinkler[occType] ?? 46)
      return num(p.maxTravelDist) > maxTravel
    },
    message: 'Travel distance exceeds maximum for occupancy type',
    codeCitation: 'RA 9514 IRR Rule 10',
    severity: 'error',
    position: () => [0, 0.3, -0.5],
  },
  {
    id: 'no-elevator',
    field: 'hasElevator',
    check: (p) => num(p.numStoreys) > 4 && !bool(p.hasElevator),
    message: 'Buildings over 4 storeys require accessible elevator per BP 344',
    codeCitation: 'BP 344 2024 IRR §7.3',
    severity: 'error',
    position: () => [-1, 0.5, 0],
  },
  {
    id: 'corridor-narrow',
    field: 'corridorWidth',
    check: (p) => num(p.corridorWidth) < BP_344.MIN_CORRIDOR_WIDTH,
    message: `Corridor width below ${BP_344.MIN_CORRIDOR_WIDTH}m minimum for wheelchair access`,
    codeCitation: 'BP 344 2024 IRR §5.2',
    severity: 'error',
    position: () => [0, 0.2, 0],
  },
  {
    id: 'highrise-no-sprinkler',
    field: 'hasSprinkler',
    check: (p) => {
      const h = num(p.numStoreys) * num(p.ceilingHeight)
      return h >= RA_9514.HIGH_RISE_THRESHOLD_M && !bool(p.hasSprinkler)
    },
    message: 'High-rise buildings (≥15m) require automatic sprinkler system',
    codeCitation: 'RA 9514 IRR Rule 10',
    severity: 'error',
    position: () => [1, 1, 0],
  },
]

// ─── Annotations ─────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'multi-code',
    label: 'Multi-code compliance check: PD 1096 + RA 9514 + BP 344',
    description: 'Simultaneous verification against National Building Code, Fire Code, and Accessibility Law',
    position: () => [0, 0.1, -1],
    codeCitation: 'PD 1096 / RA 9514 / BP 344',
  },
]

// ─── Presets ─────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'Small Office (Compliant)',
    values: { numStoreys: 3, floorArea: 200, ceilingHeight: 2.7, occupancyType: 'business', numExits: 2, hasSprinkler: false, maxTravelDist: 30, hasAccessibleEntry: true, corridorWidth: 1.2, hasElevator: false },
  },
  {
    label: 'High-Rise (Non-Compliant)',
    values: { numStoreys: 8, floorArea: 800, ceilingHeight: 3.0, occupancyType: 'business', numExits: 2, hasSprinkler: false, maxTravelDist: 50, hasAccessibleEntry: true, corridorWidth: 0.8, hasElevator: false },
  },
  {
    label: 'Assembly Hall',
    values: { numStoreys: 2, floorArea: 500, ceilingHeight: 4.0, occupancyType: 'assembly', numExits: 3, hasSprinkler: true, maxTravelDist: 25, hasAccessibleEntry: true, corridorWidth: 1.5, hasElevator: false },
  },
  {
    label: 'School Building',
    values: { numStoreys: 4, floorArea: 400, ceilingHeight: 3.0, occupancyType: 'educational', numExits: 2, hasSprinkler: false, maxTravelDist: 35, hasAccessibleEntry: true, corridorWidth: 1.2, hasElevator: true },
  },
]

// ─── Config Export ───────────────────────────────────────────────────────────

export const batchComplianceVerifierConfig: ParametricSceneConfig = {
  id: 'batch-compliance-verifier',
  title: 'Batch Compliance Verifier',
  description: 'Multi-code compliance dashboard checking PD 1096, RA 9514, and BP 344 simultaneously. Adjust building parameters to see real-time pass/fail status across all applicable code requirements.',
  subject: 'pd-1096',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: { position: [3, 3, 3], fov: 45 },
  showHumanScale: false,
  scale: 1,
}
