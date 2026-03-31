// src/app/dashboard/3d-lab/_config/modules/carport-abutment-rules.ts
// Carport Abutment Rules — PD 1096 Rule VII §708
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'carportHeight', label: 'Carport Height', type: 'slider', min: 2000, max: 4500, step: 50, default: 3000, unit: 'mm', group: 'Carport' },
  { key: 'carportWidth', label: 'Carport Width', type: 'slider', min: 2500, max: 6000, step: 100, default: 3500, unit: 'mm', group: 'Carport' },
  { key: 'carportDepth', label: 'Carport Depth', type: 'slider', min: 5000, max: 8000, step: 100, default: 6000, unit: 'mm', group: 'Carport' },
  { key: 'solidWallHeight', label: 'Solid Wall Height', type: 'slider', min: 0, max: 3200, step: 50, default: 1500, unit: 'mm', group: 'Walls' },
  { key: 'showPropertyLine', label: 'Show Property Line', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cpH = mm(params.carportHeight)
  const cpW = mm(params.carportWidth)
  const cpD = mm(params.carportDepth)
  const solidH = mm(params.solidWallHeight)
  const showPropLine = Boolean(params.showPropertyLine)
  const maxH = 3.2
  const solidLimit = 1.5
  const heightViolated = cpH > maxH
  const solidViolated = solidH > solidLimit
  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.05, 0], args: [cpW + 4, 0.1, cpD + 4], color: '#52525b' })

  // Carport roof
  inst.push({ id: 'roof', type: 'box', position: [0, cpH, 0], args: [cpW, 0.15, cpD], color: '#71717a' })

  // Columns
  const colPos: [number, number][] = [[-cpW / 2, -cpD / 2], [cpW / 2, -cpD / 2], [-cpW / 2, cpD / 2], [cpW / 2, cpD / 2]]
  colPos.forEach(([cx, cz], i) => {
    inst.push({ id: `col-${i}`, type: 'box', position: [cx, cpH / 2, cz], args: [0.2, cpH, 0.2], color: '#a1a1aa' })
  })

  // Max height line
  inst.push({ id: 'max-height-plane', type: 'box', position: [0, maxH, 0], args: [cpW + 0.5, 0.02, cpD + 0.5], color: heightViolated ? '#D64545' : '#2D9F6F', opacity: 0.5, transparent: true, label: '3.20m max' })

  // Solid wall (below 1.50m)
  if (solidH > 0) {
    inst.push({ id: 'wall-solid', type: 'box', position: [-cpW / 2 - wallT / 2, solidH / 2, 0], args: [wallT, solidH, cpD], color: solidViolated ? '#fca5a5' : '#d4d4d8' })
    inst.push({ id: 'wall-solid-front', type: 'box', position: [0, solidH / 2, cpD / 2 + wallT / 2], args: [cpW, solidH, wallT], color: solidViolated ? '#fca5a5' : '#d4d4d8', opacity: 0.5, transparent: true })
  }

  // Perforated/open above 1.50m
  const perfH = cpH - Math.max(solidH, solidLimit)
  if (perfH > 0) {
    const perfY = Math.max(solidH, solidLimit) + perfH / 2
    // CHB perforated blocks (open lattice)
    const rows = Math.round(perfH / 0.2)
    for (let r = 0; r < Math.min(rows, 8); r++) {
      inst.push({ id: `perf-${r}`, type: 'box', position: [-cpW / 2 - wallT / 2, Math.max(solidH, solidLimit) + r * 0.2 + 0.1, 0], args: [wallT, 0.18, cpD], color: '#d4d4d8', opacity: 0.35, transparent: true })
    }
  }

  // Solid limit marker
  inst.push({ id: 'solid-limit-plane', type: 'box', position: [-cpW / 2 - 0.5, solidLimit, 0], args: [0.5, 0.02, cpD + 0.5], color: solidViolated ? '#D64545' : '#f97316', opacity: 0.6, transparent: true, label: '1.50m' })

  // Property line
  if (showPropLine) {
    inst.push({ id: 'prop-line', type: 'box', position: [-(cpW / 2 + 1.0), 0.01, 0], args: [0.05, 0.02, cpD + 3], color: '#D64545', label: 'Property Line' })
  }

  // Car
  inst.push({ id: 'car-body', type: 'box', position: [0, 0.75, 0], args: [1.9, 1.4, 4.5], color: '#3b82f6', opacity: 0.7, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'max-carport-height', field: 'carportHeight',
    check: (p) => mm(p.carportHeight) > 3.2,
    message: 'Carport height exceeds 3.20m maximum',
    codeCitation: 'PD 1096 IRR Rule VII §708', severity: 'error',
    position: () => [2.5, 4, 0],
  },
  {
    id: 'solid-wall-above-limit', field: 'solidWallHeight',
    check: (p) => mm(p.solidWallHeight) > 1.5,
    message: 'Solid wall above 1.50m — perforated blocks required above this height',
    codeCitation: 'PD 1096 IRR Rule VII §708', severity: 'error',
    position: () => [-2.5, 2.5, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-max-height', label: 'Max 3.20m Height', description: 'Carports shall not exceed 3.20m in height from finished grade to highest point of roof', codeCitation: 'PD 1096 IRR Rule VII §708', position: () => [2.5, 3.5, 0] },
  { id: 'ann-perforated', label: 'Perforated Above 1.50m', description: 'Side enclosures above 1.50m must use perforated/open materials (CHB hollow) for fire safety', codeCitation: 'PD 1096 IRR Rule VII §708', position: () => [-2.5, 2.5, 2] },
]

const presets: Preset[] = [
  { label: 'Compliant Carport', values: { carportHeight: 3000, carportWidth: 3500, carportDepth: 6000, solidWallHeight: 1500, showPropertyLine: true } },
  { label: 'Max Height', values: { carportHeight: 3200, carportWidth: 3500, carportDepth: 6000, solidWallHeight: 1500, showPropertyLine: true } },
  { label: 'Double Carport', values: { carportHeight: 3000, carportWidth: 5500, carportDepth: 6000, solidWallHeight: 1200, showPropertyLine: true } },
  { label: 'Violation Demo', values: { carportHeight: 3800, carportWidth: 3500, carportDepth: 6000, solidWallHeight: 2000, showPropertyLine: true } },
]

export const carportAbutmentRulesConfig: ParametricSceneConfig = {
  id: 'carport-abutment-rules',
  title: 'Carport Abutment Rules',
  description: 'Carport model: max 3.20m height, solid walls max 1.50m, perforated blocks required above per PD 1096 Rule VII §708.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 4, 6], fov: 50 },
}
