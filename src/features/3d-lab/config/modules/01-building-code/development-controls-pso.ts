// src/app/dashboard/3d-lab/_config/modules/development-controls-pso.ts
// Development Controls — PD 1096 Rule VII (PSO / TGFA / AMBF)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function str(v: number | string | boolean): string {
  return String(v)
}

// ─── Zoning Development Controls ────────────────────────────────────────────

interface DevControl {
  label: string
  pso: number    // % max site occupancy
  far: number    // max floor area ratio
  bhl: number    // max storeys
  setbackFront: number
  setbackSide: number
  setbackRear: number
}

const DEV_CONTROLS: Record<string, DevControl> = {
  'R-1': { label: 'R-1 Low Density', pso: 90, far: 1.5, bhl: 3, setbackFront: 3, setbackSide: 1.5, setbackRear: 2 },
  'R-2': { label: 'R-2 Medium Density', pso: 80, far: 2.5, bhl: 5, setbackFront: 4.5, setbackSide: 2, setbackRear: 2 },
  'R-3': { label: 'R-3 High Density', pso: 70, far: 4.0, bhl: 9, setbackFront: 6, setbackSide: 3, setbackRear: 3 },
  'C-1': { label: 'C-1 Commercial', pso: 80, far: 3.0, bhl: 5, setbackFront: 3, setbackSide: 2, setbackRear: 2 },
  'C-2': { label: 'C-2 General Commercial', pso: 80, far: 5.0, bhl: 12, setbackFront: 6, setbackSide: 3, setbackRear: 3 },
  'I-1': { label: 'I-1 Industrial', pso: 70, far: 2.0, bhl: 4, setbackFront: 8, setbackSide: 3, setbackRear: 5 },
}

function getControls(zone: string): DevControl {
  return DEV_CONTROLS[zone] ?? DEV_CONTROLS['R-1']
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'zoningClass',
    label: 'Zoning Classification',
    type: 'dropdown',
    default: 'R-2',
    options: Object.entries(DEV_CONTROLS).map(([value, c]) => ({
      value,
      label: c.label,
    })),
    group: 'Zoning',
  },
  {
    key: 'lotWidth',
    label: 'Lot Width',
    type: 'slider',
    min: 8,
    max: 50,
    step: 1,
    default: 15,
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
    default: 20,
    unit: 'm',
    group: 'Lot',
  },
  {
    key: 'proposedFloors',
    label: 'Proposed Floors',
    type: 'slider',
    min: 1,
    max: 15,
    step: 1,
    default: 3,
    group: 'Proposal',
  },
  {
    key: 'floorHeight',
    label: 'Floor Height',
    type: 'slider',
    min: 2.7,
    max: 4.5,
    step: 0.1,
    default: 3.0,
    unit: 'm',
    decimals: 1,
    group: 'Proposal',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const zone = str(params.zoningClass)
  const lotW = num(params.lotWidth)
  const lotD = num(params.lotDepth)
  const floors = num(params.proposedFloors)
  const floorH = num(params.floorHeight)

  const ctrl = getControls(zone)
  const tla = lotW * lotD

  // Buildable area after setbacks
  const buildW = Math.max(1, lotW - ctrl.setbackSide * 2)
  const buildD = Math.max(1, lotD - ctrl.setbackFront - ctrl.setbackRear)

  // PSO check
  const footprint = buildW * buildD
  const _actualPSO = (footprint / tla) * 100

  // TGFA and FAR
  const tgfa = footprint * floors
  const actualFAR = tgfa / tla
  const _maxTGFA = ctrl.far * tla

  // Building height
  const buildingH = floors * floorH

  // BHL check
  const overBHL = floors > ctrl.bhl
  const overFAR = actualFAR > ctrl.far

  // Scale: 1 unit = 1m, but scale down for large lots
  const s = lotW > 30 || lotD > 40 ? 0.05 : 0.1

  const lw = lotW * s
  const ld = lotD * s
  const bw = buildW * s
  const bd = buildD * s
  const bh = buildingH * s

  const offsetZ = ((ctrl.setbackFront - ctrl.setbackRear) / 2) * s

  const buildColor = overBHL || overFAR ? '#D64545' : '#1B3FC4'

  const instructions: GeometryInstruction[] = []

  // 1. Lot plate
  instructions.push({
    id: 'lot',
    type: 'box',
    position: [0, -0.005, 0],
    args: [lw, 0.01, ld],
    color: '#e5e7eb',
  })

  // 2. Setback zones
  const sbF = ctrl.setbackFront * s
  const sbR = ctrl.setbackRear * s
  const sbS = ctrl.setbackSide * s

  if (sbF > 0) {
    instructions.push({
      id: 'sb-front',
      type: 'box',
      position: [0, 0.001, ld / 2 - sbF / 2],
      args: [lw, 0.002, sbF],
      color: '#fde68a',
      opacity: 0.4,
      transparent: true,
    })
  }
  if (sbR > 0) {
    instructions.push({
      id: 'sb-rear',
      type: 'box',
      position: [0, 0.001, -(ld / 2 - sbR / 2)],
      args: [lw, 0.002, sbR],
      color: '#fde68a',
      opacity: 0.4,
      transparent: true,
    })
  }
  if (sbS > 0) {
    for (const side of [-1, 1] as const) {
      instructions.push({
        id: `sb-side-${side === -1 ? 'left' : 'right'}`,
        type: 'box',
        position: [side * (lw / 2 - sbS / 2), 0.001, 0],
        args: [sbS, 0.002, ld],
        color: '#fde68a',
        opacity: 0.4,
        transparent: true,
      })
    }
  }

  // 3. Building volume
  instructions.push({
    id: 'building',
    type: 'box',
    position: [0, bh / 2 + 0.01, -offsetZ],
    args: [bw, bh, bd],
    color: buildColor,
    opacity: 0.6,
    transparent: true,
  })

  // 4. Floor lines
  for (let i = 1; i < floors; i++) {
    instructions.push({
      id: `floor-${i}`,
      type: 'box',
      position: [0, i * floorH * s + 0.01, -offsetZ],
      args: [bw, 0.003, bd],
      color: '#1535A8',
      opacity: 0.5,
      transparent: true,
    })
  }

  // 5. BHL reference line
  const bhlH = ctrl.bhl * floorH * s
  instructions.push({
    id: 'bhl-line',
    type: 'box',
    position: [0, bhlH + 0.01, 0],
    args: [lw * 1.15, 0.004, 0.004],
    color: overBHL ? '#D64545' : '#2D9F6F',
  })

  // 6. Max FAR ghost volume (if building exceeds it)
  if (overFAR) {
    const maxFloors = Math.floor(ctrl.far * tla / footprint)
    const maxH = maxFloors * floorH * s
    instructions.push({
      id: 'far-ghost',
      type: 'box',
      position: [0, maxH / 2 + 0.01, -offsetZ],
      args: [bw + 0.01, maxH, bd + 0.01],
      color: '#2D9F6F',
      opacity: 0.15,
      transparent: true,
    })
  }

  // 7. Property lines
  for (const dir of [-1, 1] as const) {
    instructions.push({
      id: `prop-fb-${dir}`,
      type: 'box',
      position: [0, 0.003, dir * ld / 2],
      args: [lw, 0.004, 0.005],
      color: '#374151',
    })
    instructions.push({
      id: `prop-lr-${dir}`,
      type: 'box',
      position: [dir * lw / 2, 0.003, 0],
      args: [0.005, 0.004, ld],
      color: '#374151',
    })
  }

  // 8. Road Right of Way indicator (front)
  instructions.push({
    id: 'rrow',
    type: 'box',
    position: [0, -0.005, ld / 2 + 0.15 * s],
    args: [lw * 1.3, 0.01, 0.3 * s],
    color: '#d1d5db',
  })

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'bhl-exceeded',
    field: 'proposedFloors',
    check: (p) => num(p.proposedFloors) > getControls(str(p.zoningClass)).bhl,
    message: 'Proposed floors exceed Building Height Limit (BHL)',
    codeCitation: 'PD 1096 IRR Rule VII',
    severity: 'error',
    position: (p) => {
      const ctrl = getControls(str(p.zoningClass))
      const s = num(p.lotWidth) > 30 ? 0.05 : 0.1
      return [num(p.lotWidth) * s * 0.6, ctrl.bhl * num(p.floorHeight) * s, 0]
    },
  },
  {
    id: 'far-exceeded',
    field: 'proposedFloors',
    check: (p) => {
      const ctrl = getControls(str(p.zoningClass))
      const lotW = num(p.lotWidth)
      const lotD = num(p.lotDepth)
      const tla = lotW * lotD
      const buildW = Math.max(1, lotW - ctrl.setbackSide * 2)
      const buildD = Math.max(1, lotD - ctrl.setbackFront - ctrl.setbackRear)
      const tgfa = buildW * buildD * num(p.proposedFloors)
      return (tgfa / tla) > ctrl.far
    },
    message: 'TGFA exceeds maximum FAR',
    codeCitation: 'PD 1096 IRR Rule VII',
    severity: 'error',
    position: (p) => {
      const s = num(p.lotWidth) > 30 ? 0.05 : 0.1
      return [0, num(p.proposedFloors) * num(p.floorHeight) * s + 0.1, 0]
    },
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'ann-pso',
    label: 'PSO',
    description: 'Percentage of Site Occupancy — ratio of building footprint to total lot area',
    codeCitation: 'PD 1096 IRR Rule VII',
    position: (p) => {
      const s = num(p.lotWidth) > 30 ? 0.05 : 0.1
      return [0, 0.02, num(p.lotDepth) * s / 2 + 0.1]
    },
  },
  {
    id: 'ann-bhl',
    label: 'BHL',
    description: 'Building Height Limit in storeys per zoning classification',
    codeCitation: 'PD 1096 IRR Rule VII',
    position: (p) => {
      const ctrl = getControls(str(p.zoningClass))
      const s = num(p.lotWidth) > 30 ? 0.05 : 0.1
      return [num(p.lotWidth) * s * 0.65, ctrl.bhl * num(p.floorHeight) * s, 0]
    },
  },
  {
    id: 'ann-tgfa',
    label: 'TGFA / FAR',
    description: 'Total Gross Floor Area and Floor Area Ratio — controls total buildable volume',
    codeCitation: 'PD 1096 IRR Rule VII',
    position: (p) => {
      const s = num(p.lotWidth) > 30 ? 0.05 : 0.1
      const bh = num(p.proposedFloors) * num(p.floorHeight) * s
      return [0, bh + 0.1, 0]
    },
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'R-1 Compliant',
    values: { zoningClass: 'R-1', lotWidth: 15, lotDepth: 20, proposedFloors: 2, floorHeight: 3.0 },
  },
  {
    label: 'R-2 Max Build',
    values: { zoningClass: 'R-2', lotWidth: 15, lotDepth: 20, proposedFloors: 5, floorHeight: 3.0 },
  },
  {
    label: 'C-2 High Rise',
    values: { zoningClass: 'C-2', lotWidth: 25, lotDepth: 35, proposedFloors: 12, floorHeight: 3.5 },
  },
  {
    label: 'BHL Violation',
    values: { zoningClass: 'R-1', lotWidth: 15, lotDepth: 20, proposedFloors: 5, floorHeight: 3.0 },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const developmentControlsPsoConfig: ParametricSceneConfig = {
  id: 'development-controls-pso',
  title: 'Development Controls (PSO/TGFA/AMBF)',
  description:
    'Interactive lot model showing how zoning classification controls PSO, FAR, TGFA, setbacks, and Building Height Limit per PD 1096 IRR Rule VII.',
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

