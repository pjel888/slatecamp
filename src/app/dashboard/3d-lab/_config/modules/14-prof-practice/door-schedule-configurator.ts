// src/app/dashboard/3d-lab/_config/modules/door-schedule-configurator.ts
// Door Schedule Configurator — PD 1096 Rule VIII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'doorWidth', label: 'Door Clear Width', type: 'slider', min: 700, max: 1500, step: 50, default: 900, unit: 'mm', group: 'Door' },
  { key: 'doorHeight', label: 'Door Height', type: 'slider', min: 1800, max: 2400, step: 50, default: 2100, unit: 'mm', group: 'Door' },
  { key: 'doorType', label: 'Door Type', type: 'dropdown', default: 'Swing',
    options: [{ value: 'Swing', label: 'Single Swing' }, { value: 'Double', label: 'Double Swing' }, { value: 'Sliding', label: 'Sliding' }, { value: 'Fire', label: 'Fire Door (FD)' }],
    group: 'Door' },
  { key: 'wallThickness', label: 'Wall Thickness', type: 'slider', min: 100, max: 300, step: 25, default: 150, unit: 'mm', group: 'Wall' },
  { key: 'showHardware', label: 'Show Hardware', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const dW = mm(params.doorWidth)
  const dH = mm(params.doorHeight)
  const dType = str(params.doorType)
  const wT = mm(params.wallThickness)
  const showHW = Boolean(params.showHardware)
  const wallH = 2.8
  const wallW = 4.0
  const inst: GeometryInstruction[] = []

  // Wall segments
  const leftW = (wallW - dW) / 2 - 0.05
  inst.push({ id: 'wall-left', type: 'box', position: [-(dW / 2 + leftW / 2 + 0.05), wallH / 2, 0], args: [leftW, wallH, wT], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(dW / 2 + leftW / 2 + 0.05), wallH / 2, 0], args: [leftW, wallH, wT], color: '#d4d4d8' })
  inst.push({ id: 'wall-top', type: 'box', position: [0, dH + (wallH - dH) / 2, 0], args: [dW, wallH - dH, wT], color: '#d4d4d8' })

  // Door frame
  inst.push({ id: 'frame-left', type: 'box', position: [-(dW / 2 + 0.025), dH / 2, 0], args: [0.05, dH, wT + 0.02], color: '#71717a' })
  inst.push({ id: 'frame-right', type: 'box', position: [(dW / 2 + 0.025), dH / 2, 0], args: [0.05, dH, wT + 0.02], color: '#71717a' })
  inst.push({ id: 'frame-top', type: 'box', position: [0, dH + 0.025, 0], args: [dW + 0.1, 0.05, wT + 0.02], color: '#71717a' })

  // Door leaf
  const doorColor = dType === 'Fire' ? '#D64545' : '#a1a1aa'
  if (dType === 'Sliding') {
    inst.push({ id: 'door-leaf', type: 'box', position: [dW * 0.25, dH / 2, wT / 2 + 0.02], args: [dW * 0.95, dH - 0.05, 0.04], color: doorColor, opacity: 0.8, transparent: true })
  } else if (dType === 'Double') {
    inst.push({ id: 'door-left', type: 'box', position: [-dW / 4, dH / 2, -wT / 4], args: [dW / 2 - 0.02, dH - 0.05, 0.04], color: doorColor, opacity: 0.8, transparent: true })
    inst.push({ id: 'door-right', type: 'box', position: [dW / 4, dH / 2, -wT / 4], args: [dW / 2 - 0.02, dH - 0.05, 0.04], color: doorColor, opacity: 0.8, transparent: true })
  } else {
    inst.push({ id: 'door-leaf', type: 'box', position: [-dW / 4, dH / 2, -wT / 4], rotation: [0, 0.5, 0], args: [dW - 0.02, dH - 0.05, 0.04], color: doorColor, opacity: 0.8, transparent: true })
    // Swing arc indicator
    inst.push({ id: 'swing-arc', type: 'ring', position: [-dW / 2, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], args: [0, dW * 0.9, 8, 1, 0, Math.PI / 2], color: '#3b82f6', opacity: 0.25, transparent: true })
  }

  // Hardware
  if (showHW) {
    inst.push({ id: 'handle', type: 'cylinder', position: [dW / 2 - 0.08, 1.0, 0.05], args: [0.015, 0.015, 0.12, 8], color: '#D4951A' })
    inst.push({ id: 'hinge-top', type: 'box', position: [-(dW / 2 + 0.025), dH - 0.2, 0], args: [0.06, 0.1, 0.03], color: '#71717a' })
    inst.push({ id: 'hinge-bot', type: 'box', position: [-(dW / 2 + 0.025), 0.2, 0], args: [0.06, 0.1, 0.03], color: '#71717a' })
  }

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [wallW + 0.3, 0.1, 1.5], color: '#a1a1aa' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'min-door-width', field: 'doorWidth',
    check: (p) => num(p.doorWidth) < 900 && str(p.doorType) !== 'Fire',
    message: 'Accessible door minimum clear width is 900mm per BP 344',
    codeCitation: 'BP 344 2024 IRR §5.1', severity: 'error',
    position: () => [0, 2.5, 0],
  },
  {
    id: 'fire-door-swing', field: 'doorType',
    check: (p) => str(p.doorType) === 'Fire' && str(p.doorType) === 'Sliding',
    message: 'Fire doors must be self-closing swing type, not sliding',
    codeCitation: 'RA 9514 IRR §Rule 10', severity: 'error',
    position: () => [0, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-clear', label: 'Clear Width', description: 'Door clear width measured from stop to face of door in open position', codeCitation: 'BP 344 2024 IRR §5.1', position: (p) => [0, mm(p.doorHeight) + 0.4, 0.5] },
  { id: 'ann-frame', label: 'Door Frame', description: 'Door frame transmits loads to wall; fire doors require rated frames matching door rating', codeCitation: 'RA 9514 IRR §Rule 10', position: (p) => [mm(p.doorWidth) / 2 + 0.5, mm(p.doorHeight) / 2, 0] },
]

const presets: Preset[] = [
  { label: 'Standard Passage', values: { doorWidth: 900, doorHeight: 2100, doorType: 'Swing', wallThickness: 150, showHardware: true } },
  { label: 'Main Entry Double', values: { doorWidth: 1200, doorHeight: 2100, doorType: 'Double', wallThickness: 200, showHardware: true } },
  { label: 'Fire Door', values: { doorWidth: 900, doorHeight: 2100, doorType: 'Fire', wallThickness: 200, showHardware: true } },
  { label: 'Sliding Door', values: { doorWidth: 1200, doorHeight: 2100, doorType: 'Sliding', wallThickness: 150, showHardware: false } },
]

export const doorScheduleConfiguratorConfig: ParametricSceneConfig = {
  id: 'door-schedule-configurator',
  title: 'Door Schedule Configurator',
  description: 'Door types, dimensions, materials, and hardware per PD 1096 and BP 344 with accessibility and fire code compliance checks.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [3, 2, 4], fov: 50 },
}
