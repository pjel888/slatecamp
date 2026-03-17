// src/app/dashboard/3d-lab/_config/modules/accessible-corridor-widths.ts
// Accessible Corridor Widths — BP 344 2024 IRR §4
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'corridorWidth', label: 'Corridor Width', type: 'slider', min: 900, max: 3000, step: 50, default: 1800, unit: 'mm', group: 'Corridor' },
  { key: 'corridorLength', label: 'Corridor Length', type: 'slider', min: 3000, max: 20000, step: 500, default: 10000, unit: 'mm', group: 'Corridor' },
  { key: 'wcCount', label: 'Wheelchair Users', type: 'slider', min: 1, max: 2, step: 1, default: 1, group: 'Users' },
  { key: 'hasPassingBay', label: 'Has Passing Bay', type: 'toggle', default: false, group: 'Features' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cW = mm(params.corridorWidth)
  const cL = mm(params.corridorLength)
  const wcCount = num(params.wcCount)
  const hasBay = Boolean(params.hasPassingBay)
  const minW = wcCount >= 2 ? 1.8 : 1.5
  const violated = cW < minW
  const wallH = 2.8
  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [cW, 0.1, cL], color: '#a1a1aa' })
  // Ceiling
  inst.push({ id: 'ceiling', type: 'box', position: [0, wallH + 0.05, 0], args: [cW + wallT * 2, 0.1, cL], color: '#d4d4d8', opacity: 0.15, transparent: true })
  // Left wall
  inst.push({ id: 'wall-left', type: 'box', position: [-(cW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, cL], color: '#d4d4d8' })
  // Right wall (transparent)
  inst.push({ id: 'wall-right', type: 'box', position: [(cW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, cL], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Min width plane
  inst.push({ id: 'min-width-plane', type: 'box', position: [0, 0.01, 0], args: [minW, 0.005, cL], color: violated ? '#dc2626' : '#16a34a', opacity: 0.25, transparent: true, label: `Min: ${(minW * 1000).toFixed(0)}mm` })

  // Wheelchair users
  const wcColors = ['#6366f1', '#3b82f6']
  const wcPositions = wcCount >= 2 ? [[-cW / 4, 0], [cW / 4, 0]] : [[0, 0]]
  wcPositions.forEach(([wx, wz], i) => {
    // Chair base
    inst.push({ id: `wc-base-${i}`, type: 'box', position: [wx, 0.5, wz as number], args: [0.65, 0.9, 1.1], color: wcColors[i % 2], opacity: 0.7, transparent: true })
    // Wheels
    inst.push({ id: `wc-wl-${i}`, type: 'cylinder', position: [wx - 0.33, 0.28, wz as number], rotation: [0, 0, Math.PI / 2], args: [0.28, 0.05, 0.28, 12], color: '#52525b' })
    inst.push({ id: `wc-wr-${i}`, type: 'cylinder', position: [wx + 0.33, 0.28, wz as number], rotation: [0, 0, Math.PI / 2], args: [0.28, 0.05, 0.28, 12], color: '#52525b' })
    // Head
    inst.push({ id: `wc-head-${i}`, type: 'sphere', position: [wx, 1.1, wz as number], args: [0.15, 8, 8], color: wcColors[i % 2], opacity: 0.7, transparent: true })
  })

  // Passing bay (if enabled and corridor is narrow)
  if (hasBay) {
    const bayW = 1.8
    const bayL = 1.8
    const bayZ = 0
    inst.push({ id: 'passing-bay', type: 'box', position: [cW / 2 + bayW / 2, 0.005, bayZ], args: [bayW, 0.01, bayL], color: '#f97316', opacity: 0.35, transparent: true, label: 'Passing Bay' })
  }

  // Turning circle indicator
  inst.push({ id: 'turn-circle', type: 'cylinder', position: [0, 0.01, -cL / 3], args: [0.75, 0.75, 0.005, 32], color: '#f97316', opacity: 0.3, transparent: true, label: '1500mm' })

  // Dimension markers
  inst.push({ id: 'dim-left', type: 'box', position: [-(cW / 2) - 0.3, wallH / 2, 0], args: [0.02, wallH, 0.02], color: '#3b82f6' })
  inst.push({ id: 'dim-right', type: 'box', position: [(cW / 2) + 0.3, wallH / 2, 0], args: [0.02, wallH, 0.02], color: '#3b82f6' })
  inst.push({ id: 'dim-line', type: 'box', position: [0, wallH + 0.2, 0], args: [cW, 0.02, 0.02], color: violated ? '#dc2626' : '#3b82f6', label: `${(cW * 1000).toFixed(0)}mm` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'single-wc-width', field: 'corridorWidth',
    check: (p) => num(p.wcCount) === 1 && num(p.corridorWidth) < 1500,
    message: 'Corridor width below 1500mm for single wheelchair passage',
    codeCitation: 'BP 344 2024 IRR §4.1', severity: 'error',
    position: () => [2, 2, 0],
  },
  {
    id: 'double-wc-width', field: 'corridorWidth',
    check: (p) => num(p.wcCount) >= 2 && num(p.corridorWidth) < 1800,
    message: 'Corridor width below 1800mm for two wheelchairs to pass',
    codeCitation: 'BP 344 2024 IRR §4.1', severity: 'error',
    position: () => [2.5, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-single', label: 'Min 1500mm (1 WC)', description: 'Minimum corridor width of 1500mm required for single wheelchair passage', codeCitation: 'BP 344 2024 IRR §4.1', position: () => [-3, 2, 0] },
  { id: 'ann-double', label: 'Min 1800mm (2 WC)', description: 'Minimum corridor width of 1800mm required for two wheelchairs to pass each other', codeCitation: 'BP 344 2024 IRR §4.1', position: () => [3, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Single WC Passage', values: { corridorWidth: 1500, corridorLength: 8000, wcCount: 1, hasPassingBay: false } },
  { label: 'Double WC Passage', values: { corridorWidth: 1800, corridorLength: 12000, wcCount: 2, hasPassingBay: false } },
  { label: 'Narrow + Passing Bay', values: { corridorWidth: 1200, corridorLength: 10000, wcCount: 1, hasPassingBay: true } },
  { label: 'Violation Demo', values: { corridorWidth: 1100, corridorLength: 8000, wcCount: 2, hasPassingBay: false } },
]

export const accessibleCorridorWidthsConfig: ParametricSceneConfig = {
  id: 'accessible-corridor-widths',
  title: 'Accessible Corridor Widths',
  description: 'Corridor with wheelchair passing dimensions: 1500mm single, 1800mm two wheelchairs, per BP 344 2024 IRR §4.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 3, 6], fov: 50 },
}
