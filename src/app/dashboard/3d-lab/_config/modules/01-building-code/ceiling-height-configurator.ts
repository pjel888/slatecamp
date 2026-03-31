// src/app/dashboard/3d-lab/_config/modules/ceiling-height-configurator.ts
// Ceiling Height Configurator — PD 1096 Rule VIII
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '../../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function mm(v: number | string | boolean): number {
  return num(v) / 1000
}

function str(v: number | string | boolean): string {
  return String(v)
}

// ─── PD 1096 Ceiling Height Requirements ────────────────────────────────────
// Rule VIII: Minimum ceiling heights depend on ventilation type and floor level

const MIN_HEIGHTS: Record<string, number> = {
  'Naturally Ventilated': 2700,      // 2.70m
  'Artificially Ventilated': 2400,   // 2.40m
  'Mezzanine': 1800,                 // 1.80m clear
}

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'ceilingHeight',
    label: 'Ceiling Height',
    type: 'slider',
    min: 1500,
    max: 4000,
    step: 10,
    default: 2700,
    unit: 'mm',
    group: 'Room Dimensions',
  },
  {
    key: 'roomWidth',
    label: 'Room Width',
    type: 'slider',
    min: 2000,
    max: 8000,
    step: 100,
    default: 4000,
    unit: 'mm',
    group: 'Room Dimensions',
  },
  {
    key: 'roomDepth',
    label: 'Room Depth',
    type: 'slider',
    min: 2000,
    max: 8000,
    step: 100,
    default: 5000,
    unit: 'mm',
    group: 'Room Dimensions',
  },
  {
    key: 'ventilationType',
    label: 'Ventilation Type',
    type: 'dropdown',
    default: 'Naturally Ventilated',
    options: [
      { value: 'Naturally Ventilated', label: 'Natural Ventilation' },
      { value: 'Artificially Ventilated', label: 'Artificial Ventilation (AC)' },
      { value: 'Mezzanine', label: 'Mezzanine Floor' },
    ],
    group: 'Code Requirements',
  },
  {
    key: 'numStoreys',
    label: 'Number of Storeys',
    type: 'slider',
    min: 1,
    max: 3,
    step: 1,
    default: 1,
    group: 'Building',
  },
  {
    key: 'showMezzanine',
    label: 'Show Mezzanine',
    type: 'toggle',
    default: false,
    group: 'Building',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const cH = mm(params.ceilingHeight)
  const rW = mm(params.roomWidth)
  const rD = mm(params.roomDepth)
  const ventType = str(params.ventilationType)
  const storeys = num(params.numStoreys)
  const showMezz = Boolean(params.showMezzanine)

  const minH = mm(MIN_HEIGHTS[ventType] ?? 2700)
  const violated = cH < minH

  const wallThickness = 0.15
  const floorThickness = 0.15
  const wallColor = '#d4d4d8'
  const floorColor = '#a1a1aa'
  const ceilingColor = violated ? '#fecaca' : '#e5e7eb'

  const instructions: GeometryInstruction[] = []

  for (let s = 0; s < storeys; s++) {
    const baseY = s * (cH + floorThickness)
    const prefix = `s${s}`

    // Floor slab
    instructions.push({
      id: `${prefix}-floor`,
      type: 'box',
      position: [0, baseY - floorThickness / 2, 0],
      args: [rW + wallThickness * 2, floorThickness, rD + wallThickness * 2],
      color: floorColor,
    })

    // Back wall
    instructions.push({
      id: `${prefix}-wall-back`,
      type: 'box',
      position: [0, baseY + cH / 2, -(rD / 2 + wallThickness / 2)],
      args: [rW + wallThickness * 2, cH, wallThickness],
      color: wallColor,
    })

    // Left wall
    instructions.push({
      id: `${prefix}-wall-left`,
      type: 'box',
      position: [-(rW / 2 + wallThickness / 2), baseY + cH / 2, 0],
      args: [wallThickness, cH, rD],
      color: wallColor,
    })

    // Right wall (transparent to see inside)
    instructions.push({
      id: `${prefix}-wall-right`,
      type: 'box',
      position: [(rW / 2 + wallThickness / 2), baseY + cH / 2, 0],
      args: [wallThickness, cH, rD],
      color: wallColor,
      opacity: 0.15,
      transparent: true,
    })

    // Ceiling / upper slab
    instructions.push({
      id: `${prefix}-ceiling`,
      type: 'box',
      position: [0, baseY + cH + floorThickness / 2, 0],
      args: [rW + wallThickness * 2, floorThickness, rD + wallThickness * 2],
      color: s === storeys - 1 ? ceilingColor : floorColor,
    })

    // Min height reference plane
    instructions.push({
      id: `${prefix}-min-height-plane`,
      type: 'box',
      position: [0, baseY + minH, 0],
      args: [rW, 0.005, rD],
      color: violated ? '#D64545' : '#2D9F6F',
      opacity: 0.25,
      transparent: true,
    })

    // Mezzanine (if enabled and first storey)
    if (showMezz && s === 0) {
      const mezzH = cH * 0.45
      instructions.push({
        id: 'mezzanine-slab',
        type: 'box',
        position: [rW / 4, baseY + mezzH, 0],
        args: [rW / 2, 0.1, rD * 0.8],
        color: '#fde68a',
        opacity: 0.7,
        transparent: true,
      })
      // Mezzanine clearance indicator
      const mezzClear = cH - mezzH - 0.1
      const mezzViolated = mezzClear < 1.8
      instructions.push({
        id: 'mezzanine-clearance',
        type: 'box',
        position: [rW / 4, baseY + mezzH + 0.1 + (cH - mezzH - 0.1) / 2, 0],
        args: [0.005, cH - mezzH - 0.1, 0.005],
        color: mezzViolated ? '#D64545' : '#2D9F6F',
      })
    }
  }

  // Human figure for scale (1.7m tall)
  instructions.push({
    id: 'human-figure',
    type: 'cylinder',
    position: [0, 0.85, rD / 4],
    args: [0.15, 0.2, 1.7, 8],
    color: '#6366f1',
    opacity: 0.5,
    transparent: true,
  })

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'min-ceiling-height',
    field: 'ceilingHeight',
    check: (p) => {
      const ventType = str(p.ventilationType)
      const minH = MIN_HEIGHTS[ventType] ?? 2700
      return num(p.ceilingHeight) < minH
    },
    message: 'Ceiling height below minimum for ventilation type',
    codeCitation: 'PD 1096 IRR Rule VIII',
    severity: 'error',
    position: (p) => [mm(p.roomWidth) / 2 + 0.3, mm(p.ceilingHeight) / 2, 0],
  },
  {
    id: 'mezzanine-clearance',
    field: 'showMezzanine',
    check: (p) => {
      if (!Boolean(p.showMezzanine)) return false
      const cH = mm(p.ceilingHeight)
      const mezzH = cH * 0.45
      const clearance = cH - mezzH - 0.1
      return clearance < 1.8
    },
    message: 'Mezzanine clearance below 1,800mm minimum',
    codeCitation: 'PD 1096 IRR Rule VIII',
    severity: 'error',
    position: (p) => [mm(p.roomWidth) / 4, mm(p.ceilingHeight) * 0.75, 0],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'ann-ceiling-height',
    label: 'Ceiling Height',
    description: 'Clear height from finished floor to ceiling soffit',
    codeCitation: 'PD 1096 IRR Rule VIII',
    position: (p) => [-(mm(p.roomWidth) / 2) - 0.3, mm(p.ceilingHeight) / 2, 0],
  },
  {
    id: 'ann-min-height',
    label: 'Minimum Height Line',
    description: 'Code-required minimum ceiling height for this ventilation type',
    codeCitation: 'PD 1096 IRR Rule VIII',
    position: (p) => {
      const minH = mm(MIN_HEIGHTS[str(p.ventilationType)] ?? 2700)
      return [mm(p.roomWidth) / 2 + 0.3, minH, 0]
    },
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'Standard Room',
    values: {
      ceilingHeight: 2700,
      roomWidth: 4000,
      roomDepth: 5000,
      ventilationType: 'Naturally Ventilated',
      numStoreys: 1,
      showMezzanine: false,
    },
  },
  {
    label: 'AC Room (Min)',
    values: {
      ceilingHeight: 2400,
      roomWidth: 3500,
      roomDepth: 4000,
      ventilationType: 'Artificially Ventilated',
      numStoreys: 1,
      showMezzanine: false,
    },
  },
  {
    label: 'With Mezzanine',
    values: {
      ceilingHeight: 3500,
      roomWidth: 6000,
      roomDepth: 6000,
      ventilationType: 'Naturally Ventilated',
      numStoreys: 1,
      showMezzanine: true,
    },
  },
  {
    label: 'Multi-Storey',
    values: {
      ceilingHeight: 2700,
      roomWidth: 4000,
      roomDepth: 5000,
      ventilationType: 'Naturally Ventilated',
      numStoreys: 3,
      showMezzanine: false,
    },
  },
  {
    label: 'Violation Demo',
    values: {
      ceilingHeight: 2200,
      roomWidth: 4000,
      roomDepth: 5000,
      ventilationType: 'Naturally Ventilated',
      numStoreys: 1,
      showMezzanine: false,
    },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const ceilingHeightConfiguratorConfig: ParametricSceneConfig = {
  id: 'ceiling-height-configurator',
  title: 'Ceiling Height Configurator',
  description:
    'Interactive room model showing minimum ceiling height requirements based on ventilation type per PD 1096 IRR Rule VIII. Includes mezzanine clearance checks.',
  subject: 'pd-1096',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [5, 3, 5],
    fov: 45,
  },
}
