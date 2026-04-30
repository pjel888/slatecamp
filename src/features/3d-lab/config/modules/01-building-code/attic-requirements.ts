// src/features/3d-lab/config/modules/attic-requirements.ts
// Attic Requirements — PD 1096 Rule VIII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'atticHeight', label: 'Attic Clear Height', type: 'slider', min: 1200, max: 3000, step: 50, default: 1800, unit: 'mm', group: 'Attic' },
  { key: 'roofSpan', label: 'Roof Span', type: 'slider', min: 5000, max: 20000, step: 500, default: 10000, unit: 'mm', group: 'Roof' },
  { key: 'roofPitch', label: 'Roof Pitch', type: 'slider', min: 15, max: 45, step: 5, default: 30, unit: 'deg', group: 'Roof' },
  { key: 'hasAccessHatch', label: 'Has Access Hatch', type: 'toggle', default: true, group: 'Access' },
  { key: 'hatchSize', label: 'Hatch Size', type: 'slider', min: 400, max: 1000, step: 50, default: 600, unit: 'mm', group: 'Access' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const atticH = mm(params.atticHeight)
  const span = mm(params.roofSpan)
  const pitch = num(params.roofPitch)
  const hasHatch = Boolean(params.hasAccessHatch)
  const hatchSize = mm(params.hatchSize)
  const pitchRad = (pitch * Math.PI) / 180
  const _riseH = (span / 2) * Math.tan(pitchRad)
  const rafterLen = (span / 2) / Math.cos(pitchRad)
  const cH = 2.7
  const wallT = 0.15
  const minH = 1.8
  const violated = atticH < minH
  const hatchViolated = hatchSize < 0.6
  const inst: GeometryInstruction[] = []

  // Ground & walls
  inst.push({ id: 'floor', type: 'box', position: [0, -0.075, 0], args: [span + 1, 0.15, 4], color: '#a1a1aa' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(span / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, 4], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(span / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, 4], color: '#d4d4d8' })
  inst.push({ id: 'wall-back', type: 'box', position: [0, cH / 2, -2 - wallT / 2], args: [span + 1, cH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-front', type: 'box', position: [0, cH / 2, 2 + wallT / 2], args: [span + 1, cH, wallT], color: '#d4d4d8', opacity: 0.1, transparent: true })

  // Ceiling/floor slab
  inst.push({ id: 'ceiling-slab', type: 'box', position: [0, cH + 0.075, 0], args: [span + 1, 0.15, 4 + 0.3], color: '#71717a' })

  // Rafters (left)
  inst.push({ id: 'rafter-left', type: 'box', position: [-span / 4, cH + atticH / 2, 0], rotation: [0, 0, -pitchRad], args: [0.1, rafterLen * 0.8, 3.5], color: '#92400e', opacity: 0.8, transparent: true })
  // Rafters (right)
  inst.push({ id: 'rafter-right', type: 'box', position: [span / 4, cH + atticH / 2, 0], rotation: [0, 0, pitchRad], args: [0.1, rafterLen * 0.8, 3.5], color: '#92400e', opacity: 0.8, transparent: true })
  // Ridge
  inst.push({ id: 'ridge', type: 'box', position: [0, cH + atticH, 0], args: [0.15, 0.1, 4], color: '#78350f' })

  // Attic floor (ceiling of room below)
  inst.push({ id: 'attic-floor', type: 'box', position: [0, cH + 0.08, 0], args: [span - 0.3, 0.08, 3.5], color: '#a1a1aa' })

  // Min height reference
  inst.push({ id: 'min-height-plane', type: 'box', position: [0, cH + minH, 0], args: [span, 0.005, 3.8], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.4, transparent: true, label: `Min ${minH}m` })

  // Actual height indicator
  inst.push({ id: 'height-bar', type: 'box', position: [-(span / 2) - 0.4, cH + atticH / 2, 0], args: [0.03, atticH, 0.03], color: violated ? '#D64545' : '#3b82f6', label: `${atticH.toFixed(1)}m` })

  // Access hatch
  if (hasHatch) {
    inst.push({ id: 'hatch', type: 'box', position: [0, cH + 0.15, 0], args: [hatchSize, 0.12, hatchSize], color: hatchViolated ? '#D64545' : '#f97316', label: `${(hatchSize * 1000).toFixed(0)}mm hatch` })
    inst.push({ id: 'hatch-frame', type: 'box', position: [0, cH + 0.2, 0], args: [hatchSize + 0.06, 0.04, hatchSize + 0.06], color: '#52525b' })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'attic-clear-height', field: 'atticHeight',
    check: (p) => mm(p.atticHeight) < 1.8,
    message: 'Attic clear height below 1.80m minimum for usable attic space',
    codeCitation: 'PD 1096 IRR Rule VIII §808', severity: 'error',
    position: () => [3, 5, 0],
  },
  {
    id: 'hatch-size', field: 'hatchSize',
    check: (p) => Boolean(p.hasAccessHatch) && mm(p.hatchSize) < 0.6,
    message: 'Access hatch minimum dimension is 600mm',
    codeCitation: 'PD 1096 IRR Rule VIII §808', severity: 'error',
    position: () => [0, 3.2, 1],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-clearance', label: 'Min 1.80m Clear Height', description: 'Attic clear height measured from floor to lowest rafter or roof framing member', codeCitation: 'PD 1096 IRR Rule VIII §808', position: () => [4, 4.5, 0] },
  { id: 'ann-access', label: 'Access Hatch Required', description: 'Access hatch of minimum 600mm required for maintenance of attic space and roof structure', codeCitation: 'PD 1096 IRR Rule VIII §808', position: () => [0, 3.5, 2] },
]

const presets: Preset[] = [
  { label: 'Standard Attic', values: { atticHeight: 1800, roofSpan: 10000, roofPitch: 30, hasAccessHatch: true, hatchSize: 600 } },
  { label: 'Liveable Attic', values: { atticHeight: 2400, roofSpan: 12000, roofPitch: 35, hasAccessHatch: true, hatchSize: 800 } },
  { label: 'Low Pitch Roof', values: { atticHeight: 1200, roofSpan: 8000, roofPitch: 15, hasAccessHatch: true, hatchSize: 600 } },
  { label: 'Violation Demo', values: { atticHeight: 1400, roofSpan: 10000, roofPitch: 25, hasAccessHatch: false, hatchSize: 500 } },
]

export const atticRequirementsConfig: ParametricSceneConfig = {
  id: 'attic-requirements',
  title: 'Attic Requirements',
  description: 'Attic cross-section showing minimum 1.80m clear headroom, access hatch requirements, and roof pitch impact per PD 1096.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [7, 5, 5], fov: 50 },
}

