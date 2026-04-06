// src/app/dashboard/3d-lab/_config/modules/accessible-elevator-cab.ts
// Accessible Elevator Cab — BP 344 2024 IRR §7.3
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'cabWidth', label: 'Cab Width', type: 'slider', min: 900, max: 2000, step: 50, default: 1200, unit: 'mm', group: 'Cab' },
  { key: 'cabDepth', label: 'Cab Depth', type: 'slider', min: 900, max: 2000, step: 50, default: 1400, unit: 'mm', group: 'Cab' },
  { key: 'cabHeight', label: 'Cab Height', type: 'slider', min: 2100, max: 2700, step: 50, default: 2400, unit: 'mm', group: 'Cab' },
  { key: 'controlHeight', label: 'Control Panel Height', type: 'slider', min: 800, max: 1400, step: 25, default: 1050, unit: 'mm', group: 'Controls' },
  { key: 'hasMirror', label: 'Rear Mirror', type: 'toggle', default: true, group: 'Features' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cW = mm(params.cabWidth)
  const cD = mm(params.cabDepth)
  const cH = mm(params.cabHeight)
  const ctrlH = mm(params.controlHeight)
  const hasMirror = Boolean(params.hasMirror)
  const wallT = 0.025
  const minW = 1.2
  const minD = 1.4
  const widthViolated = cW < minW
  const depthViolated = cD < minD
  const ctrlViolated = ctrlH < 0.9 || ctrlH > 1.2
  const inst: GeometryInstruction[] = []

  // Cab walls
  const wallColor = '#d4d4d8'
  inst.push({ id: 'cab-floor', type: 'box', position: [0, 0, 0], args: [cW, 0.05, cD], color: '#a1a1aa' })
  inst.push({ id: 'cab-ceiling', type: 'box', position: [0, cH, 0], args: [cW, 0.05, cD], color: wallColor })
  inst.push({ id: 'cab-back', type: 'box', position: [0, cH / 2, -(cD / 2 - wallT / 2)], args: [cW, cH, wallT], color: wallColor })
  inst.push({ id: 'cab-left', type: 'box', position: [-(cW / 2 - wallT / 2), cH / 2, 0], args: [wallT, cH, cD], color: wallColor })
  inst.push({ id: 'cab-right', type: 'box', position: [(cW / 2 - wallT / 2), cH / 2, 0], args: [wallT, cH, cD], color: wallColor })
  // Front (door opening)
  inst.push({ id: 'cab-front-l', type: 'box', position: [-(cW / 2 - (cW - 0.9) / 4), cH / 2, cD / 2 - wallT / 2], args: [(cW - 0.9) / 2, cH, wallT], color: wallColor, opacity: 0.4, transparent: true })
  inst.push({ id: 'cab-front-r', type: 'box', position: [(cW / 2 - (cW - 0.9) / 4), cH / 2, cD / 2 - wallT / 2], args: [(cW - 0.9) / 2, cH, wallT], color: wallColor, opacity: 0.4, transparent: true })

  // Door opening (900mm)
  inst.push({ id: 'door', type: 'box', position: [0, 1.05, cD / 2], args: [0.9, 2.1, 0.04], color: '#3b82f6', opacity: 0.4, transparent: true, label: '900mm' })

  // Handrail (back wall)
  inst.push({ id: 'handrail-back', type: 'cylinder', position: [0, 0.9, -(cD / 2 - 0.04)], rotation: [0, 0, Math.PI / 2], args: [0.019, 0.019, cW - 0.15, 8], color: '#71717a' })
  // Handrail left
  inst.push({ id: 'handrail-left', type: 'cylinder', position: [-(cW / 2 - 0.04), 0.9, 0], rotation: [Math.PI / 2, 0, 0], args: [0.019, 0.019, cD - 0.15, 8], color: '#71717a' })

  // Control panel
  const ctrlColor = ctrlViolated ? '#D64545' : '#3b82f6'
  inst.push({ id: 'ctrl-panel', type: 'box', position: [(cW / 2 - 0.05), ctrlH, 0], args: [0.02, 0.35, 0.25], color: ctrlColor })
  // Buttons
  for (let b = 0; b < 5; b++) {
    inst.push({ id: `btn-${b}`, type: 'sphere', position: [cW / 2 - 0.04, 0.9 + b * 0.06, 0.05], args: [0.012, 6, 6], color: '#D4951A' })
  }
  // Braille panel
  inst.push({ id: 'braille', type: 'box', position: [cW / 2 - 0.04, 1.1, -0.06], args: [0.01, 0.08, 0.15], color: '#D4951A', label: 'Braille' })

  // Control height limits
  inst.push({ id: 'ctrl-min', type: 'box', position: [cW / 2 + 0.2, 0.9, 0], args: [0.3, 0.01, 0.01], color: '#2D9F6F', label: '900mm' })
  inst.push({ id: 'ctrl-max', type: 'box', position: [cW / 2 + 0.2, 1.2, 0], args: [0.3, 0.01, 0.01], color: '#f97316', label: '1200mm' })
  inst.push({ id: 'ctrl-band', type: 'box', position: [cW / 2 + 0.2, 1.05, 0], args: [0.02, 0.3, 0.01], color: '#3b82f6', opacity: 0.4, transparent: true })

  // Rear mirror
  if (hasMirror) {
    inst.push({ id: 'mirror', type: 'box', position: [0, cH * 0.65, -(cD / 2 - 0.01)], args: [cW * 0.8, cH * 0.3, 0.01], color: '#bfdbfe', opacity: 0.5, transparent: true, label: 'Mirror' })
  }

  // Wheelchair turning circle
  inst.push({ id: 'wc-circle', type: 'cylinder', position: [0, 0.01, 0], args: [0.75, 0.75, 0.005, 32], color: widthViolated || depthViolated ? '#D64545' : '#f97316', opacity: 0.3, transparent: true })

  // Dimension indicators
  inst.push({ id: 'dim-width', type: 'box', position: [0, -0.1, 0], args: [cW, 0.01, 0.01], color: widthViolated ? '#D64545' : '#2D9F6F', label: `W: ${(cW * 1000).toFixed(0)}mm` })
  inst.push({ id: 'dim-depth', type: 'box', position: [0, -0.1, 0], args: [0.01, 0.01, cD], color: depthViolated ? '#D64545' : '#2D9F6F', label: `D: ${(cD * 1000).toFixed(0)}mm` })

  return inst
}

const violations: ViolationRule[] = [
  { id: 'cab-width', field: 'cabWidth', check: (p) => num(p.cabWidth) < 1200, message: 'Elevator cab width below 1200mm minimum', codeCitation: 'BP 344 2024 IRR §7.3', severity: 'error', position: () => [1.5, 1.5, 0] },
  { id: 'cab-depth', field: 'cabDepth', check: (p) => num(p.cabDepth) < 1400, message: 'Elevator cab depth below 1400mm minimum', codeCitation: 'BP 344 2024 IRR §7.3', severity: 'error', position: () => [0, 1.5, 1.5] },
  { id: 'control-height', field: 'controlHeight', check: (p) => num(p.controlHeight) < 900 || num(p.controlHeight) > 1200, message: 'Control panel outside accessible range of 900–1200mm', codeCitation: 'BP 344 2024 IRR §7.3', severity: 'error', position: () => [1.5, 2, 0] },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-dim', label: 'Min 1200×1400mm Cab', description: 'Accessible elevator cab must accommodate standard wheelchair with 1200mm × 1400mm minimum clear floor area', codeCitation: 'BP 344 2024 IRR §7.3', position: (p) => [mm(p.cabWidth) / 2 + 0.5, mm(p.cabHeight) / 2, 0] },
  { id: 'ann-controls', label: 'Controls 900–1200mm', description: 'All operating controls must be between 900mm and 1200mm above finished floor level; Braille required', codeCitation: 'BP 344 2024 IRR §7.3', position: (p) => [mm(p.cabWidth) / 2 + 0.5, 1.05, 0] },
]

const presets: Preset[] = [
  { label: 'Accessible (Min)', values: { cabWidth: 1200, cabDepth: 1400, cabHeight: 2400, controlHeight: 1050, hasMirror: true } },
  { label: 'Generous Cab', values: { cabWidth: 1600, cabDepth: 1600, cabHeight: 2400, controlHeight: 1000, hasMirror: true } },
  { label: 'Bariatric Cab', values: { cabWidth: 1800, cabDepth: 2000, cabHeight: 2400, controlHeight: 1000, hasMirror: false } },
  { label: 'Violation Demo', values: { cabWidth: 1000, cabDepth: 1200, cabHeight: 2100, controlHeight: 1300, hasMirror: false } },
]

export const accessibleElevatorCabConfig: ParametricSceneConfig = {
  id: 'accessible-elevator-cab',
  title: 'Accessible Elevator Cab',
  description: 'Elevator cab 1200×1400mm with controls at 900–1200mm, Braille, handrails, and rear mirror per BP 344 2024 IRR §7.3.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [3, 2, 4], fov: 55 },
}

