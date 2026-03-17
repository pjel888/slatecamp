// src/app/dashboard/3d-lab/_config/modules/stairway-configurator.ts
// Stairway Configurator — PD 1096 IRR Rule VIII §804
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Convert mm to scene units (1 unit = 1m) */
function mm(v: number | string | boolean): number {
  return (typeof v === 'number' ? v : Number(v)) / 1000
}

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function str(v: number | string | boolean): string {
  return String(v)
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'riserHeight',
    label: 'Riser Height',
    type: 'slider',
    min: 100,
    max: 250,
    step: 1,
    default: 180,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'treadDepth',
    label: 'Tread Depth',
    type: 'slider',
    min: 200,
    max: 350,
    step: 1,
    default: 280,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'stairWidth',
    label: 'Stair Width',
    type: 'slider',
    min: 600,
    max: 2000,
    step: 10,
    default: 1100,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'numRisers',
    label: 'Number of Risers',
    type: 'slider',
    min: 3,
    max: 20,
    step: 1,
    default: 12,
    group: 'Dimensions',
  },
  {
    key: 'headroom',
    label: 'Headroom',
    type: 'slider',
    min: 1800,
    max: 2500,
    step: 10,
    default: 2100,
    unit: 'mm',
    group: 'Clearances',
  },
  {
    key: 'handrailHeight',
    label: 'Handrail Height',
    type: 'slider',
    min: 700,
    max: 1000,
    step: 10,
    default: 860,
    unit: 'mm',
    group: 'Clearances',
  },
  {
    key: 'occupancyType',
    label: 'Occupancy Type',
    type: 'dropdown',
    default: '>50 occupants',
    options: [
      { value: '>50 occupants', label: '>50 occupants' },
      { value: '≤50 occupants', label: '≤50 occupants' },
      { value: 'Private (<10)', label: 'Private (<10)' },
    ],
    group: 'Code',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const rH = mm(params.riserHeight)
  const tD = mm(params.treadDepth)
  const sW = mm(params.stairWidth)
  const n = num(params.numRisers)
  const headroomM = mm(params.headroom)
  const hrH = mm(params.handrailHeight)

  // Violation states
  const riserViolated = num(params.riserHeight) > 200
  const treadViolated = num(params.treadDepth) < 250
  const headroomViolated = num(params.headroom) < 2000
  const handrailViolated =
    num(params.handrailHeight) < 800 || num(params.handrailHeight) > 900

  const occ = str(params.occupancyType)
  const widthViolated =
    (occ === '>50 occupants' && num(params.stairWidth) < 1100) ||
    (occ === '≤50 occupants' && num(params.stairWidth) < 900) ||
    (occ === 'Private (<10)' && num(params.stairWidth) < 750)

  const treadColor = treadViolated || widthViolated ? '#dc2626' : '#e5e7eb'
  const riserColor = riserViolated ? '#dc2626' : '#d1d5db'
  const handrailColor = handrailViolated ? '#dc2626' : '#3b82f6'

  const treadThickness = 0.03
  const riserThickness = 0.015
  const stringerThickness = 0.04
  const handrailRadius = 0.02

  const instructions: GeometryInstruction[] = []

  // 1. Base platform (landing at the bottom)
  instructions.push({
    id: 'base-platform',
    type: 'box',
    position: [0, -treadThickness / 2, tD / 2],
    args: [sW, treadThickness, tD],
    color: '#d1d5db',
  })

  // 2. Individual treads and risers
  for (let i = 0; i < n; i++) {
    const y = (i + 1) * rH
    const z = -(i * tD)

    // Tread
    instructions.push({
      id: `tread-${i}`,
      type: 'box',
      position: [0, y - treadThickness / 2, z],
      args: [sW, treadThickness, tD],
      color: treadColor,
    })

    // Riser (vertical face between treads)
    instructions.push({
      id: `riser-${i}`,
      type: 'box',
      position: [0, y - rH / 2, z + tD / 2],
      args: [sW, rH, riserThickness],
      color: riserColor,
    })
  }

  // 3. Stringer sides — thin boxes running along the stair slope
  const totalRise = n * rH
  const totalRun = (n - 1) * tD
  const stringerLength = Math.sqrt(totalRise * totalRise + totalRun * totalRun)
  const stringerAngle = Math.atan2(totalRise, totalRun)
  const stringerCenterY = totalRise / 2
  const stringerCenterZ = -(totalRun / 2 - tD / 2)

  for (const side of [-1, 1] as const) {
    instructions.push({
      id: `stringer-${side === -1 ? 'left' : 'right'}`,
      type: 'box',
      position: [
        side * (sW / 2 + stringerThickness / 2),
        stringerCenterY,
        stringerCenterZ,
      ],
      rotation: [stringerAngle, 0, 0],
      args: [stringerThickness, 0.02, stringerLength],
      color: '#a1a1aa',
    })
  }

  // 4. Handrails — thin cylinders at handrailHeight above each tread nosing
  const handrailLength = stringerLength
  for (const side of [-1, 1] as const) {
    instructions.push({
      id: `handrail-${side === -1 ? 'left' : 'right'}`,
      type: 'cylinder',
      position: [
        side * (sW / 2 + stringerThickness / 2),
        stringerCenterY + hrH * Math.cos(stringerAngle),
        stringerCenterZ + hrH * Math.sin(stringerAngle),
      ],
      rotation: [Math.PI / 2 + stringerAngle, 0, 0],
      args: [handrailRadius, handrailRadius, handrailLength, 8],
      color: handrailColor,
    })
  }

  // 5. Top landing
  const topY = n * rH
  const topZ = -((n - 1) * tD + tD / 2)
  instructions.push({
    id: 'top-landing',
    type: 'box',
    position: [0, topY - treadThickness / 2, topZ],
    args: [sW, treadThickness, tD],
    color: '#d1d5db',
  })

  // 6. Headroom indicator — transparent plane showing clearance zone
  const midTreadIndex = Math.floor(n / 2)
  const headroomY = midTreadIndex * rH + headroomM
  const headroomZ = -(midTreadIndex * tD - tD / 2)
  instructions.push({
    id: 'headroom-plane',
    type: 'box',
    position: [0, headroomY, headroomZ],
    args: [sW * 1.05, 0.005, totalRun + tD],
    color: headroomViolated ? '#fecaca' : '#dbeafe',
    opacity: 0.3,
    transparent: true,
  })

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'max-riser',
    field: 'riserHeight',
    check: (p) => num(p.riserHeight) > 200,
    message: 'Maximum riser height is 200mm',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight) / 2, 0],
  },
  {
    id: 'min-tread',
    field: 'treadDepth',
    check: (p) => num(p.treadDepth) < 250,
    message: 'Minimum tread depth is 250mm',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, mm(p.riserHeight), mm(p.treadDepth) / 2],
  },
  {
    id: 'min-headroom',
    field: 'headroom',
    check: (p) => num(p.headroom) < 2000,
    message: 'Minimum headroom is 2,000mm from nosing line',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const midI = Math.floor(num(p.numRisers) / 2)
      return [0, midI * mm(p.riserHeight) + mm(p.headroom), -(midI * mm(p.treadDepth))]
    },
  },
  {
    id: 'max-vertical-between-landings',
    field: 'numRisers',
    check: (p) => num(p.numRisers) * num(p.riserHeight) > 3600,
    message: 'Maximum 3,600mm vertical between landings',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const topY = num(p.numRisers) * mm(p.riserHeight)
      return [mm(p.stairWidth) / 2 + 0.15, topY / 2, 0]
    },
  },
  {
    id: 'min-width-50plus',
    field: 'stairWidth',
    check: (p) => str(p.occupancyType) === '>50 occupants' && num(p.stairWidth) < 1100,
    message: 'Minimum width 1,100mm for >50 occupants',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'min-width-50minus',
    field: 'stairWidth',
    check: (p) => str(p.occupancyType) === '≤50 occupants' && num(p.stairWidth) < 900,
    message: 'Minimum width 900mm for ≤50 occupants',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'min-width-private',
    field: 'stairWidth',
    check: (p) => str(p.occupancyType) === 'Private (<10)' && num(p.stairWidth) < 750,
    message: 'Minimum width 750mm for private stairs',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => [0, -0.1, mm(p.treadDepth) / 2],
  },
  {
    id: 'handrail-range',
    field: 'handrailHeight',
    check: (p) => num(p.handrailHeight) < 800 || num(p.handrailHeight) > 900,
    message: 'Handrails must be 800-900mm above nosing',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    severity: 'error',
    position: (p) => {
      const midI = Math.floor(num(p.numRisers) / 2)
      return [
        mm(p.stairWidth) / 2 + 0.15,
        midI * mm(p.riserHeight) + mm(p.handrailHeight),
        -(midI * mm(p.treadDepth)),
      ]
    },
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'riser-height',
    label: 'Riser Height',
    description: 'Vertical distance between consecutive treads',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => [
      -(mm(p.stairWidth) / 2) - 0.12,
      mm(p.riserHeight) / 2,
      0,
    ],
  },
  {
    id: 'tread-depth',
    label: 'Tread Depth',
    description: 'Horizontal depth of a single tread',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => [0, mm(p.riserHeight) + 0.08, 0],
  },
  {
    id: 'stair-width',
    label: 'Width',
    description: 'Clear width of the stair between stringers',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => [0, -0.08, mm(p.treadDepth) / 2 + 0.05],
  },
  {
    id: 'headroom-label',
    label: 'Headroom',
    description: 'Vertical clearance above nosing line',
    codeCitation: 'PD 1096 IRR Rule VIII §804',
    position: (p) => {
      const midI = Math.floor(num(p.numRisers) / 2)
      const y = midI * mm(p.riserHeight) + mm(p.headroom) / 2
      return [mm(p.stairWidth) / 2 + 0.15, y, -(midI * mm(p.treadDepth))]
    },
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'R-1 Standard',
    values: {
      riserHeight: 180,
      treadDepth: 280,
      stairWidth: 1100,
      numRisers: 12,
      headroom: 2100,
      handrailHeight: 860,
      occupancyType: '>50 occupants',
    },
  },
  {
    label: 'Accessible',
    values: {
      riserHeight: 150,
      treadDepth: 300,
      stairWidth: 1200,
      numRisers: 10,
      headroom: 2200,
      handrailHeight: 850,
      occupancyType: '>50 occupants',
    },
  },
  {
    label: 'Private Stair',
    values: {
      riserHeight: 190,
      treadDepth: 260,
      stairWidth: 800,
      numRisers: 14,
      headroom: 2050,
      handrailHeight: 870,
      occupancyType: 'Private (<10)',
    },
  },
  {
    label: 'Code Maximum',
    values: {
      riserHeight: 200,
      treadDepth: 250,
      stairWidth: 1100,
      numRisers: 18,
      headroom: 2000,
      handrailHeight: 900,
      occupancyType: '>50 occupants',
    },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const stairwayConfigurator: ParametricSceneConfig = {
  id: 'stairway-configurator',
  title: 'Stairway Configurator',
  description:
    'Interactive 3D stairway with real-time PD 1096 IRR Rule VIII §804 code compliance checking.',
  subject: 'Building Technology',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [3, 3, 3],
    fov: 45,
  },
}
