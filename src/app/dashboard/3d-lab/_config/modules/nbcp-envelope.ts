// src/app/dashboard/3d-lab/_config/modules/nbcp-envelope.ts
// NBCP Building Envelope — PD 1096 Rule VII
// Simplified parametric version of the legacy NBCPEnvelope scene
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

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function str(v: number | string | boolean): string {
  return String(v)
}

// ─── Zoning PSO/BHL Table ───────────────────────────────────────────────────
// Simplified from PD 1096 IRR Rule VII

interface ZoningRule {
  pso: number       // % of TLA
  bhl: number       // storeys
  frontSetback: number  // meters
  sideSetback: number   // meters
  rearSetback: number   // meters
}

const ZONING_RULES: Record<string, ZoningRule> = {
  'R-1': { pso: 90, bhl: 3, frontSetback: 3, sideSetback: 1.5, rearSetback: 2 },
  'R-2': { pso: 80, bhl: 5, frontSetback: 4.5, sideSetback: 2, rearSetback: 2 },
  'R-3': { pso: 70, bhl: 9, frontSetback: 6, sideSetback: 3, rearSetback: 3 },
  'C-1': { pso: 80, bhl: 5, frontSetback: 3, sideSetback: 2, rearSetback: 2 },
  'C-2': { pso: 80, bhl: 12, frontSetback: 6, sideSetback: 3, rearSetback: 3 },
  'I-1': { pso: 70, bhl: 4, frontSetback: 8, sideSetback: 3, rearSetback: 5 },
}

function getZoning(zone: string): ZoningRule {
  return ZONING_RULES[zone] ?? ZONING_RULES['R-1']
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'lotWidth',
    label: 'Lot Width',
    type: 'slider',
    min: 8,
    max: 60,
    step: 1,
    default: 20,
    unit: 'm',
    group: 'Lot',
  },
  {
    key: 'lotDepth',
    label: 'Lot Depth',
    type: 'slider',
    min: 8,
    max: 60,
    step: 1,
    default: 25,
    unit: 'm',
    group: 'Lot',
  },
  {
    key: 'zoningClass',
    label: 'Zoning Classification',
    type: 'dropdown',
    default: 'R-1',
    options: [
      { value: 'R-1', label: 'R-1 Low Density Residential' },
      { value: 'R-2', label: 'R-2 Medium Density Residential' },
      { value: 'R-3', label: 'R-3 High Density Residential' },
      { value: 'C-1', label: 'C-1 Light Commercial' },
      { value: 'C-2', label: 'C-2 General Commercial' },
      { value: 'I-1', label: 'I-1 Light Industrial' },
    ],
    group: 'Zoning',
  },
  {
    key: 'floorHeight',
    label: 'Floor-to-Floor Height',
    type: 'slider',
    min: 2.7,
    max: 4.5,
    step: 0.1,
    default: 3.0,
    unit: 'm',
    decimals: 1,
    group: 'Building',
  },
  {
    key: 'numFloors',
    label: 'Number of Floors',
    type: 'slider',
    min: 1,
    max: 15,
    step: 1,
    default: 3,
    group: 'Building',
  },
  {
    key: 'hasFirewall',
    label: 'Firewall on Side',
    type: 'toggle',
    default: false,
    group: 'Building',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

const SCALE = 0.05 // 1 unit = 20m → multiply meters by 0.05

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const lotW = num(params.lotWidth)
  const lotD = num(params.lotDepth)
  const zone = str(params.zoningClass)
  const floorH = num(params.floorHeight)
  const floors = num(params.numFloors)
  const firewall = Boolean(params.hasFirewall)

  const zoning = getZoning(zone)
  const tla = lotW * lotD
  const pso = zoning.pso / 100
  const bhl = zoning.bhl

  // Setbacks (firewall reduces side to 0)
  const front = zoning.frontSetback
  const rear = zoning.rearSetback
  const left = firewall ? 0 : zoning.sideSetback
  const right = zoning.sideSetback

  // Buildable area
  const buildW = Math.max(1, lotW - left - right)
  const buildD = Math.max(1, lotD - front - rear)
  const buildingH = floors * floorH
  const bhlHeight = bhl * floorH

  // Scale to scene units
  const s = SCALE
  const lw = lotW * s
  const ld = lotD * s
  const bw = buildW * s
  const bd = buildD * s
  const bh = buildingH * s
  const bhlH = bhlHeight * s

  // Building offset from lot center
  const offsetX = ((left - right) / 2) * s
  const offsetZ = ((front - rear) / 2) * s

  const isOverHeight = floors > bhl
  const buildingColor = isOverHeight ? '#D64545' : '#1B3FC4'

  const instructions: GeometryInstruction[] = []

  // 1. Lot plate
  instructions.push({
    id: 'lot-plate',
    type: 'box',
    position: [0, -0.005, 0],
    args: [lw, 0.01, ld],
    color: '#e5e7eb',
  })

  // 2. Setback zones (front, rear, left, right)
  if (front > 0) {
    instructions.push({
      id: 'setback-front',
      type: 'box',
      position: [0, 0.001, (ld / 2) - (front * s / 2)],
      args: [lw, 0.002, front * s],
      color: '#bfdbfe',
      opacity: 0.5,
      transparent: true,
    })
  }
  if (rear > 0) {
    instructions.push({
      id: 'setback-rear',
      type: 'box',
      position: [0, 0.001, -(ld / 2) + (rear * s / 2)],
      args: [lw, 0.002, rear * s],
      color: '#bfdbfe',
      opacity: 0.5,
      transparent: true,
    })
  }
  if (left > 0) {
    instructions.push({
      id: 'setback-left',
      type: 'box',
      position: [-(lw / 2) + (left * s / 2), 0.001, 0],
      args: [left * s, 0.002, ld],
      color: '#bfdbfe',
      opacity: 0.5,
      transparent: true,
    })
  }
  if (right > 0) {
    instructions.push({
      id: 'setback-right',
      type: 'box',
      position: [(lw / 2) - (right * s / 2), 0.001, 0],
      args: [right * s, 0.002, ld],
      color: '#bfdbfe',
      opacity: 0.5,
      transparent: true,
    })
  }

  // 3. Building envelope
  instructions.push({
    id: 'building-envelope',
    type: 'box',
    position: [offsetX, bh / 2 + 0.01, -offsetZ],
    args: [bw, bh, bd],
    color: buildingColor,
    opacity: 0.65,
    transparent: true,
  })

  // 4. Floor plate lines
  for (let i = 1; i < floors; i++) {
    const y = i * floorH * s + 0.01
    instructions.push({
      id: `floor-line-${i}`,
      type: 'box',
      position: [offsetX, y, -offsetZ],
      args: [bw, 0.003, bd],
      color: '#1535A8',
      opacity: 0.4,
      transparent: true,
    })
  }

  // 5. BHL reference line
  instructions.push({
    id: 'bhl-line',
    type: 'box',
    position: [0, bhlH + 0.01, 0],
    args: [lw * 1.2, 0.004, 0.004],
    color: isOverHeight ? '#D64545' : '#2D9F6F',
  })

  // 6. Firewall indicator (if enabled)
  if (firewall) {
    instructions.push({
      id: 'firewall',
      type: 'box',
      position: [-(lw / 2) + 0.005, bh / 2 + 0.01, -offsetZ],
      args: [0.01, bh, bd],
      color: '#f97316',
      opacity: 0.8,
      transparent: true,
    })
  }

  // 7. Property line markers
  for (const dir of [-1, 1] as const) {
    instructions.push({
      id: `prop-fb-${dir}`,
      type: 'box',
      position: [0, 0.003, dir * ld / 2],
      args: [lw, 0.004, 0.006],
      color: '#374151',
    })
    instructions.push({
      id: `prop-lr-${dir}`,
      type: 'box',
      position: [dir * lw / 2, 0.003, 0],
      args: [0.006, 0.004, ld],
      color: '#374151',
    })
  }

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'bhl-exceeded',
    field: 'numFloors',
    check: (p) => {
      const zone = getZoning(str(p.zoningClass))
      return num(p.numFloors) > zone.bhl
    },
    message: 'Building exceeds BHL (Building Height Limit)',
    codeCitation: 'PD 1096 IRR Rule VII',
    severity: 'error',
    position: (p) => {
      const zone = getZoning(str(p.zoningClass))
      const bhlH = zone.bhl * num(p.floorHeight) * SCALE
      return [num(p.lotWidth) * SCALE * 0.6, bhlH + 0.01, 0]
    },
  },
  {
    id: 'pso-exceeded',
    field: 'lotWidth',
    check: (p) => {
      const lotW = num(p.lotWidth)
      const lotD = num(p.lotDepth)
      const zone = getZoning(str(p.zoningClass))
      const fw = Boolean(p.hasFirewall)
      const left = fw ? 0 : zone.sideSetback
      const buildW = Math.max(0, lotW - left - zone.sideSetback)
      const buildD = Math.max(0, lotD - zone.frontSetback - zone.rearSetback)
      const footprint = buildW * buildD
      const tla = lotW * lotD
      return tla > 0 && (footprint / tla) * 100 > zone.pso
    },
    message: 'Footprint exceeds PSO (Percentage of Site Occupancy)',
    codeCitation: 'PD 1096 IRR Rule VII',
    severity: 'warning',
    position: () => [0, 0.05, 0],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'ann-bhl',
    label: 'Building Height Limit',
    description: 'Maximum building height determined by zoning classification',
    codeCitation: 'PD 1096 IRR Rule VII',
    position: (p) => {
      const zone = getZoning(str(p.zoningClass))
      const bhlH = zone.bhl * num(p.floorHeight) * SCALE
      return [num(p.lotWidth) * SCALE * 0.65, bhlH + 0.01, 0]
    },
  },
  {
    id: 'ann-pso',
    label: 'PSO',
    description: 'Percentage of Site Occupancy — maximum buildable footprint ratio',
    codeCitation: 'PD 1096 IRR Rule VII',
    position: (p) => [0, 0.02, num(p.lotDepth) * SCALE / 2 + 0.1],
  },
  {
    id: 'ann-setbacks',
    label: 'Setbacks',
    description: 'Required minimum distances from property lines to building face',
    codeCitation: 'PD 1096 IRR Rule VII',
    position: (p) => [-(num(p.lotWidth) * SCALE / 2) - 0.1, 0.02, 0],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'R-1 Residential',
    values: {
      lotWidth: 15,
      lotDepth: 20,
      zoningClass: 'R-1',
      floorHeight: 3.0,
      numFloors: 2,
      hasFirewall: false,
    },
  },
  {
    label: 'R-2 Medium Density',
    values: {
      lotWidth: 20,
      lotDepth: 30,
      zoningClass: 'R-2',
      floorHeight: 3.0,
      numFloors: 5,
      hasFirewall: false,
    },
  },
  {
    label: 'C-2 Commercial',
    values: {
      lotWidth: 30,
      lotDepth: 40,
      zoningClass: 'C-2',
      floorHeight: 3.5,
      numFloors: 10,
      hasFirewall: false,
    },
  },
  {
    label: 'BHL Violation Demo',
    values: {
      lotWidth: 15,
      lotDepth: 20,
      zoningClass: 'R-1',
      floorHeight: 3.0,
      numFloors: 5,
      hasFirewall: false,
    },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const nbcpEnvelopeConfig: ParametricSceneConfig = {
  id: 'nbcp-envelope',
  title: 'NBCP Building Envelope',
  description:
    'Interactive building envelope showing FAR, setbacks, BHL, and PSO per PD 1096 IRR Rule VII. Adjust lot dimensions and zoning to see how development controls shape the buildable volume.',
  subject: 'pd-1096',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [4, 3, 4],
    fov: 45,
  },
}
