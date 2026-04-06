// src/app/dashboard/3d-lab/_config/modules/accessible-door-clearances.ts
// Accessible Door Clearances — BP 344 2024 IRR
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'doorWidth', label: 'Door Clear Width', type: 'slider', min: 700, max: 1200, step: 25, default: 900, unit: 'mm', group: 'Door' },
  { key: 'doorHeight', label: 'Door Height', type: 'slider', min: 1800, max: 2400, step: 50, default: 2100, unit: 'mm', group: 'Door' },
  { key: 'approachType', label: 'Approach Type', type: 'dropdown', default: 'front', options: [{ value: 'front', label: 'Front Approach' }, { value: 'side-latch', label: 'Side: Latch Side' }, { value: 'side-hinge', label: 'Side: Hinge Side' }], group: 'Clearance' },
  { key: 'clearanceDepth', label: 'Manoeuvring Clearance', type: 'slider', min: 900, max: 1800, step: 50, default: 1500, unit: 'mm', group: 'Clearance' },
  { key: 'showWheelchair', label: 'Show Wheelchair', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const dW = mm(params.doorWidth)
  const dH = mm(params.doorHeight)
  const approach = str(params.approachType)
  const clrD = mm(params.clearanceDepth)
  const showWC = Boolean(params.showWheelchair)
  const wallT = 0.2
  const wallW = 4.5
  const wallH = 3.0
  const minDW = 0.9
  const minClr = approach === 'front' ? 1.5 : approach === 'side-latch' ? 1.5 : 1.2
  const doorViolated = dW < minDW
  const clrViolated = clrD < minClr
  const inst: GeometryInstruction[] = []

  // Wall
  const sideW = (wallW - dW) / 2
  inst.push({ id: 'wall-left', type: 'box', position: [-(dW / 2 + sideW / 2), wallH / 2, 0], args: [sideW, wallH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(dW / 2 + sideW / 2), wallH / 2, 0], args: [sideW, wallH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-top', type: 'box', position: [0, dH + (wallH - dH) / 2, 0], args: [dW, wallH - dH, wallT], color: '#d4d4d8' })

  // Door frame
  inst.push({ id: 'frame-left', type: 'box', position: [-(dW / 2 + 0.025), dH / 2, 0], args: [0.05, dH, wallT + 0.04], color: '#52525b' })
  inst.push({ id: 'frame-right', type: 'box', position: [(dW / 2 + 0.025), dH / 2, 0], args: [0.05, dH, wallT + 0.04], color: '#52525b' })
  inst.push({ id: 'frame-top', type: 'box', position: [0, dH + 0.025, 0], args: [dW + 0.1, 0.05, wallT + 0.04], color: '#52525b' })

  // Door leaf (open position)
  inst.push({ id: 'door-leaf', type: 'box', position: [-dW / 2 + 0.025, dH / 2, -dW / 2], rotation: [0, -Math.PI / 2, 0], args: [dW, dH - 0.05, 0.04], color: doorViolated ? '#fca5a5' : '#a1a1aa', opacity: 0.8, transparent: true })

  // Maneuvering clearance zone
  const clrColor = clrViolated ? '#fca5a5' : '#bfdbfe'
  if (approach === 'front') {
    inst.push({ id: 'clearance-push', type: 'box', position: [0, 0.005, wallT / 2 + clrD / 2], args: [dW + 0.6, 0.01, clrD], color: clrColor, opacity: 0.4, transparent: true, label: `${(clrD * 1000).toFixed(0)}mm clear` })
  } else if (approach === 'side-latch') {
    inst.push({ id: 'clearance-side', type: 'box', position: [dW / 2 + 0.3, 0.005, wallT / 2 + clrD / 2], args: [0.6, 0.01, clrD], color: clrColor, opacity: 0.4, transparent: true })
    inst.push({ id: 'clearance-main', type: 'box', position: [0, 0.005, wallT / 2 + clrD / 2], args: [dW, 0.01, clrD], color: clrColor, opacity: 0.4, transparent: true, label: `${(clrD * 1000).toFixed(0)}mm` })
  }

  // 1500mm turning circle
  if (showWC) {
    inst.push({ id: 'wc-icon', type: 'cylinder', position: [0, 0.01, wallT / 2 + 1.0], args: [0.75, 0.75, 0.01, 32], color: '#f97316', opacity: 0.3, transparent: true, label: '1500mm turn' })
    // Wheelchair user
    inst.push({ id: 'wc-body', type: 'box', position: [0, 0.7, wallT / 2 + 1.0], args: [0.7, 1.2, 0.9], color: '#6366f1', opacity: 0.6, transparent: true })
    inst.push({ id: 'wc-wheel', type: 'cylinder', position: [-0.35, 0.3, wallT / 2 + 1.0], rotation: [0, 0, Math.PI / 2], args: [0.28, 0.05, 0.28, 12], color: '#52525b' })
    inst.push({ id: 'wc-wheel2', type: 'cylinder', position: [0.35, 0.3, wallT / 2 + 1.0], rotation: [0, 0, Math.PI / 2], args: [0.28, 0.05, 0.28, 12], color: '#52525b' })
  }

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, wallT / 2 + clrD / 2], args: [wallW, 0.1, clrD + 1], color: '#a1a1aa' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'door-clear-width', field: 'doorWidth',
    check: (p) => num(p.doorWidth) < 900,
    message: 'Accessible door clear width must be minimum 900mm',
    codeCitation: 'BP 344 2024 IRR §5.1', severity: 'error',
    position: () => [0, 2.5, 1],
  },
  {
    id: 'maneuvering-clearance', field: 'clearanceDepth',
    check: (p) => {
      const minClr = str(p.approachType) === 'side-hinge' ? 1200 : 1500
      return num(p.clearanceDepth) < minClr
    },
    message: 'Insufficient maneuvering clearance for wheelchair approach',
    codeCitation: 'BP 344 2024 IRR §5.2', severity: 'error',
    position: () => [0, 1, 2],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-clear', label: 'Min 900mm Clear Width', description: 'Clear opening width measured from stop face to door face when open; 900mm minimum for wheelchair passage', codeCitation: 'BP 344 2024 IRR §5.1', position: () => [2.5, 1.5, 0] },
  { id: 'ann-maneuver', label: 'Maneuvering Clearance', description: '1500mm clearance required on latch/pull side for front approach; 1200mm for hinge side approach', codeCitation: 'BP 344 2024 IRR §5.2', position: () => [0, 0.5, 3] },
]

const presets: Preset[] = [
  { label: 'Standard Accessible', values: { doorWidth: 900, doorHeight: 2100, approachType: 'front', clearanceDepth: 1500, showWheelchair: true } },
  { label: 'Wide Accessible', values: { doorWidth: 1050, doorHeight: 2100, approachType: 'front', clearanceDepth: 1500, showWheelchair: true } },
  { label: 'Side Latch Approach', values: { doorWidth: 900, doorHeight: 2100, approachType: 'side-latch', clearanceDepth: 1500, showWheelchair: true } },
  { label: 'Violation Demo', values: { doorWidth: 800, doorHeight: 2100, approachType: 'front', clearanceDepth: 1000, showWheelchair: false } },
]

export const accessibleDoorClearancesConfig: ParametricSceneConfig = {
  id: 'accessible-door-clearances',
  title: 'Accessible Door Clearances',
  description: 'Door approach clearances for wheelchair users per BP 344 2024 IRR: 900mm clear width, 1500mm maneuvering clearance.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [3, 2.5, 5], fov: 50 },
}

