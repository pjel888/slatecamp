// src/features/3d-lab/config/modules/corridor-width-calculator.ts
// Corridor Width Calculator — PD 1096 Rule VIII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'corridorWidth', label: 'Corridor Width', type: 'slider', min: 700, max: 3000, step: 10, default: 1200, unit: 'mm', group: 'Corridor' },
  { key: 'corridorLength', label: 'Corridor Length', type: 'slider', min: 3000, max: 20000, step: 500, default: 10000, unit: 'mm', group: 'Corridor' },
  { key: 'occupantLoad', label: 'Occupant Load', type: 'slider', min: 10, max: 500, step: 5, default: 60, unit: 'persons', group: 'Occupancy' },
  { key: 'showWheelchair', label: 'Show Wheelchair Clearance', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cW = mm(params.corridorWidth)
  const cL = mm(params.corridorLength)
  const occupants = num(params.occupantLoad)
  const showWC = Boolean(params.showWheelchair)
  const minW = occupants > 50 ? 1.10 : 0.90
  const violated = cW < minW
  const wallH = 2.8
  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [cW, 0.1, cL], color: '#a1a1aa' })
  // Ceiling
  inst.push({ id: 'ceiling', type: 'box', position: [0, wallH + 0.05, 0], args: [cW + wallT * 2, 0.1, cL + wallT * 2], color: '#d4d4d8' })
  // Left wall
  inst.push({ id: 'wall-left', type: 'box', position: [-(cW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, cL], color: '#d4d4d8' })
  // Right wall
  inst.push({ id: 'wall-right', type: 'box', position: [(cW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, cL], color: '#d4d4d8', opacity: 0.2, transparent: true })
  // Min width indicator plane
  inst.push({ id: 'min-width-plane', type: 'box', position: [0, 0.01, 0], args: [minW, 0.005, cL], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.3, transparent: true })
  // Walking figures
  const figColors = ['#6366f1', '#3b82f6']
  for (let i = 0; i < 2; i++) {
    inst.push({ id: `person-${i}`, type: 'cylinder', position: [cW / 4 * (i === 0 ? -1 : 1), 0.85, 0], args: [0.2, 0.2, 1.7, 8], color: figColors[i], opacity: 0.7, transparent: true })
  }
  // Wheelchair clearance circle
  if (showWC) {
    inst.push({ id: 'wc-clearance', type: 'cylinder', position: [0, 0.01, cL / 4], args: [0.75, 0.75, 0.02, 32], color: '#f97316', opacity: 0.35, transparent: true, label: '1500mm turn' })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'min-corridor-width', field: 'corridorWidth',
    check: (p) => {
      const minW = num(p.occupantLoad) > 50 ? 1100 : 900
      return num(p.corridorWidth) < minW
    },
    message: 'Corridor width below minimum for occupant load',
    codeCitation: 'PD 1096 IRR Rule VIII §804', severity: 'error',
    position: (p) => [mm(p.corridorWidth) / 2 + 0.5, 1, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-width', label: 'Min 1100mm (>50 occ.)', description: 'Corridors serving more than 50 occupants shall not be less than 1100mm clear width', codeCitation: 'PD 1096 IRR Rule VIII §804', position: (p) => [-(mm(p.corridorWidth) / 2) - 0.5, 1.5, 0] },
  { id: 'ann-width-small', label: 'Min 900mm (≤50 occ.)', description: 'Corridors serving 50 or fewer occupants shall not be less than 900mm clear width', codeCitation: 'PD 1096 IRR Rule VIII §804', position: (p) => [mm(p.corridorWidth) / 2 + 0.5, 0.5, 0] },
]

const presets: Preset[] = [
  { label: 'Low Occupancy (Min)', values: { corridorWidth: 900, corridorLength: 8000, occupantLoad: 30, showWheelchair: false } },
  { label: 'High Occupancy (Min)', values: { corridorWidth: 1100, corridorLength: 15000, occupantLoad: 80, showWheelchair: true } },
  { label: 'Generous Corridor', values: { corridorWidth: 1800, corridorLength: 12000, occupantLoad: 100, showWheelchair: true } },
  { label: 'Violation Demo', values: { corridorWidth: 800, corridorLength: 10000, occupantLoad: 60, showWheelchair: false } },
]

export const corridorWidthCalculatorConfig: ParametricSceneConfig = {
  id: 'corridor-width-calculator',
  title: 'Corridor Width Calculator',
  description: 'Corridor width requirements based on occupant load per PD 1096: min 1100mm for >50 occupants, 900mm for ≤50 occupants.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 3, 6], fov: 50 },
}

