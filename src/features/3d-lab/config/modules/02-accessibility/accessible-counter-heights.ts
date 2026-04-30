// src/features/3d-lab/config/modules/accessible-counter-heights.ts
// Accessible Counter Heights — BP 344 2024 IRR §9
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'counterHeight', label: 'Counter Height', type: 'slider', min: 700, max: 1000, step: 10, default: 860, unit: 'mm', group: 'Counter' },
  { key: 'kneeHeight', label: 'Knee Clearance Height', type: 'slider', min: 600, max: 800, step: 10, default: 680, unit: 'mm', group: 'Clearance' },
  { key: 'kneeDepth', label: 'Knee Clearance Depth', type: 'slider', min: 400, max: 800, step: 25, default: 500, unit: 'mm', group: 'Clearance' },
  { key: 'counterWidth', label: 'Counter Width', type: 'slider', min: 600, max: 2400, step: 100, default: 1200, unit: 'mm', group: 'Counter' },
  { key: 'showWheelchair', label: 'Show Wheelchair User', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const ctH = mm(params.counterHeight)
  const kH = mm(params.kneeHeight)
  const kD = mm(params.kneeDepth)
  const cW = mm(params.counterWidth)
  const showWC = Boolean(params.showWheelchair)
  const maxH = 0.86
  const minKH = 0.68
  const minKD = 0.5
  const heightViolated = ctH > maxH
  const kneeViolated = kH < minKH || kD < minKD
  const cD = 0.6
  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [cW + 2, 0.1, 3], color: '#a1a1aa' })
  // Back wall
  inst.push({ id: 'wall', type: 'box', position: [0, 1.5, -(cD / 2 + wallT + 0.05)], args: [cW + 1, 3.0, wallT], color: '#d4d4d8' })

  // Counter top
  inst.push({ id: 'counter-top', type: 'box', position: [0, ctH, 0], args: [cW, 0.04, cD], color: heightViolated ? '#fca5a5' : '#71717a' })

  // Counter body (solid section - right half)
  inst.push({ id: 'counter-solid', type: 'box', position: [cW / 4, ctH / 2, 0], args: [cW / 2, ctH, cD], color: '#a1a1aa' })

  // Knee clearance section (left half - accessible)
  inst.push({ id: 'knee-void', type: 'box', position: [-cW / 4, kH / 2, 0], args: [cW / 2, kH, kD], color: kneeViolated ? '#fca5a5' : '#bfdbfe', opacity: 0.3, transparent: true, label: `Knee: ${(kH * 1000).toFixed(0)}mm` })
  // Toe clearance
  inst.push({ id: 'toe-space', type: 'box', position: [-cW / 4, 0.15, 0], args: [cW / 2, 0.3, cD], color: '#e0f2fe', opacity: 0.3, transparent: true })

  // Max height indicator
  inst.push({ id: 'max-height', type: 'box', position: [cW / 2 + 0.3, maxH, 0], args: [0.4, 0.01, cD], color: heightViolated ? '#D64545' : '#2D9F6F', label: '860mm max' })
  // Height bar
  inst.push({ id: 'height-bar', type: 'box', position: [cW / 2 + 0.4, ctH / 2, 0], args: [0.03, ctH, 0.03], color: heightViolated ? '#D64545' : '#3b82f6', label: `${(ctH * 1000).toFixed(0)}mm` })

  // Knee clearance indicators
  inst.push({ id: 'knee-h-line', type: 'box', position: [-(cW / 2 + 0.3), kH, 0], args: [0.3, 0.01, cD], color: kneeViolated ? '#D64545' : '#2D9F6F', label: `${(kH * 1000).toFixed(0)}mm` })
  inst.push({ id: 'knee-d-line', type: 'box', position: [-cW / 4, kH / 2, cD / 2 + 0.1], args: [0.01, 0.01, kD], color: kneeViolated ? '#D64545' : '#3b82f6', label: `${(kD * 1000).toFixed(0)}mm deep` })

  // Standard counter section (right - non-accessible)
  inst.push({ id: 'std-label', type: 'sphere', position: [cW / 4, ctH + 0.1, 0], args: [0.06, 8, 8], color: '#71717a', label: 'Standard' })
  inst.push({ id: 'acc-label', type: 'sphere', position: [-cW / 4, kH + 0.15, 0], args: [0.06, 8, 8], color: '#3b82f6', label: 'Accessible' })

  // Wheelchair user
  if (showWC) {
    inst.push({ id: 'wc-user', type: 'box', position: [-cW / 4, 0.6, 0.6], args: [0.5, 1.0, 0.7], color: '#6366f1', opacity: 0.6, transparent: true })
    inst.push({ id: 'wc-head', type: 'sphere', position: [-cW / 4, 1.15, 0.6], args: [0.15, 8, 8], color: '#6366f1', opacity: 0.7, transparent: true })
    inst.push({ id: 'wc-wheel', type: 'cylinder', position: [-cW / 4 - 0.3, 0.28, 0.6], rotation: [0, 0, Math.PI / 2], args: [0.28, 0.05, 0.28, 12], color: '#52525b' })
    inst.push({ id: 'wc-wheel2', type: 'cylinder', position: [-cW / 4 + 0.3, 0.28, 0.6], rotation: [0, 0, Math.PI / 2], args: [0.28, 0.05, 0.28, 12], color: '#52525b' })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'counter-height', field: 'counterHeight',
    check: (p) => num(p.counterHeight) > 860,
    message: 'Accessible counter height exceeds 860mm maximum',
    codeCitation: 'BP 344 2024 IRR §9.1', severity: 'error',
    position: () => [2, 1, 0],
  },
  {
    id: 'knee-clearance', field: 'kneeHeight',
    check: (p) => num(p.kneeHeight) < 680 || num(p.kneeDepth) < 500,
    message: 'Knee clearance below minimum: 680mm height, 500mm depth required',
    codeCitation: 'BP 344 2024 IRR §9.1', severity: 'error',
    position: () => [-1, 1, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-max', label: 'Max 860mm Counter', description: 'Accessible counter surface must be maximum 860mm above finished floor for wheelchair users', codeCitation: 'BP 344 2024 IRR §9.1', position: (p) => [mm(p.counterWidth) / 2 + 0.8, 0.86, 0] },
  { id: 'ann-knee', label: 'Knee Clearance 680×500mm', description: 'Min 680mm knee clearance height and 500mm depth required under accessible counter for wheelchair approach', codeCitation: 'BP 344 2024 IRR §9.1', position: (p) => [-(mm(p.counterWidth) / 2) - 0.8, mm(p.kneeHeight) / 2, 0] },
]

const presets: Preset[] = [
  { label: 'Accessible Counter', values: { counterHeight: 860, kneeHeight: 680, kneeDepth: 500, counterWidth: 1200, showWheelchair: true } },
  { label: 'Low Counter', values: { counterHeight: 760, kneeHeight: 700, kneeDepth: 550, counterWidth: 1500, showWheelchair: true } },
  { label: 'Reception Desk', values: { counterHeight: 860, kneeHeight: 700, kneeDepth: 600, counterWidth: 2400, showWheelchair: true } },
  { label: 'Violation Demo', values: { counterHeight: 950, kneeHeight: 620, kneeDepth: 400, counterWidth: 1200, showWheelchair: false } },
]

export const accessibleCounterHeightsConfig: ParametricSceneConfig = {
  id: 'accessible-counter-heights',
  title: 'Accessible Counter Heights',
  description: 'Counter section showing max 860mm accessible height, 680mm knee clearance, 500mm knee depth per BP 344 2024 IRR §9.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 2, 4], fov: 50 },
}

