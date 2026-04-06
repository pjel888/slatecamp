// src/app/dashboard/3d-lab/_config/modules/elevator-dimensions.ts
// Elevator Dimensions — PD 1096 & BP 344
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'cabWidth', label: 'Cab Width', type: 'slider', min: 900, max: 2400, step: 50, default: 1200, unit: 'mm', group: 'Cab Dimensions' },
  { key: 'cabDepth', label: 'Cab Depth', type: 'slider', min: 900, max: 2400, step: 50, default: 1400, unit: 'mm', group: 'Cab Dimensions' },
  { key: 'cabHeight', label: 'Cab Height', type: 'slider', min: 2100, max: 2700, step: 50, default: 2400, unit: 'mm', group: 'Cab Dimensions' },
  { key: 'doorWidth', label: 'Door Clear Width', type: 'slider', min: 700, max: 1200, step: 50, default: 900, unit: 'mm', group: 'Door' },
  { key: 'numStoreys', label: 'Building Storeys', type: 'slider', min: 2, max: 10, step: 1, default: 5, group: 'Shaft' },
  { key: 'showControls', label: 'Show Controls Height', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cW = mm(params.cabWidth)
  const cD = mm(params.cabDepth)
  const cH = mm(params.cabHeight)
  const dW = mm(params.doorWidth)
  const storeys = num(params.numStoreys)
  const showCtrl = Boolean(params.showControls)
  const shaftW = cW + 0.5
  const shaftD = cD + 0.5
  const shaftH = storeys * 3.0 + 1.5
  const wallT = 0.2
  const inst: GeometryInstruction[] = []

  // Shaft walls
  inst.push({ id: 'shaft-back', type: 'box', position: [0, shaftH / 2, -(shaftD / 2 + wallT / 2)], args: [shaftW + wallT * 2, shaftH, wallT], color: '#52525b' })
  inst.push({ id: 'shaft-left', type: 'box', position: [-(shaftW / 2 + wallT / 2), shaftH / 2, 0], args: [wallT, shaftH, shaftD], color: '#52525b' })
  inst.push({ id: 'shaft-right', type: 'box', position: [(shaftW / 2 + wallT / 2), shaftH / 2, 0], args: [wallT, shaftH, shaftD], color: '#52525b' })
  inst.push({ id: 'shaft-pit', type: 'box', position: [0, -0.6, 0], args: [shaftW, 1.2, shaftD], color: '#3f3f46' })

  // Cab at ground level
  const cabY = 0
  inst.push({ id: 'cab-floor', type: 'box', position: [0, cabY, 0], args: [cW, 0.05, cD], color: '#a1a1aa' })
  inst.push({ id: 'cab-ceiling', type: 'box', position: [0, cabY + cH, 0], args: [cW, 0.05, cD], color: '#d4d4d8' })
  inst.push({ id: 'cab-back', type: 'box', position: [0, cabY + cH / 2, -(cD / 2 - wallT / 2)], args: [cW, cH, wallT], color: '#d4d4d8', opacity: 0.8, transparent: true })
  inst.push({ id: 'cab-left', type: 'box', position: [-(cW / 2 - wallT / 2), cabY + cH / 2, 0], args: [wallT, cH, cD], color: '#d4d4d8', opacity: 0.8, transparent: true })
  inst.push({ id: 'cab-right', type: 'box', position: [(cW / 2 - wallT / 2), cabY + cH / 2, 0], args: [wallT, cH, cD], color: '#d4d4d8', opacity: 0.3, transparent: true })
  // Door opening
  inst.push({ id: 'door', type: 'box', position: [0, cabY + 1.05, cD / 2], args: [dW, 2.1, 0.05], color: '#3b82f6', opacity: 0.5, transparent: true, label: `${Math.round(dW * 1000)}mm` })

  // Floor landing markers
  for (let s = 0; s < storeys; s++) {
    const ly = s * 3.0
    inst.push({ id: `landing-${s}`, type: 'box', position: [0, ly - 0.02, shaftD / 2 + 0.3], args: [shaftW, 0.04, 0.6], color: s === 0 ? '#2D9F6F' : '#71717a' })
  }

  // Controls panel
  if (showCtrl) {
    inst.push({ id: 'ctrl-low', type: 'box', position: [cW / 2 - 0.08, 0.9, 0], args: [0.05, 0.05, 0.3], color: '#2D9F6F', label: '900mm' })
    inst.push({ id: 'ctrl-high', type: 'box', position: [cW / 2 - 0.08, 1.2, 0], args: [0.05, 0.05, 0.3], color: '#f97316', label: '1200mm' })
    inst.push({ id: 'ctrl-band', type: 'box', position: [cW / 2 - 0.08, 1.05, 0], args: [0.04, 0.3, 0.25], color: '#3b82f6', opacity: 0.4, transparent: true })
  }

  // Wheelchair turning circle
  inst.push({ id: 'wc-circle', type: 'cylinder', position: [0, 0.01, 0], args: [0.75, 0.75, 0.01, 32], color: '#f97316', opacity: 0.25, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'cab-width', field: 'cabWidth',
    check: (p) => num(p.cabWidth) < 1200,
    message: 'Elevator cab width below 1200mm minimum per BP 344',
    codeCitation: 'BP 344 2024 IRR §7.3', severity: 'error',
    position: () => [2, 2, 0],
  },
  {
    id: 'cab-depth', field: 'cabDepth',
    check: (p) => num(p.cabDepth) < 1400,
    message: 'Elevator cab depth below 1400mm minimum per BP 344',
    codeCitation: 'BP 344 2024 IRR §7.3', severity: 'error',
    position: () => [0, 2, 2],
  },
  {
    id: 'door-width', field: 'doorWidth',
    check: (p) => num(p.doorWidth) < 900,
    message: 'Elevator door clear width below 900mm minimum',
    codeCitation: 'BP 344 2024 IRR §7.3', severity: 'error',
    position: () => [0, 2.5, 1.5],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-cab', label: 'Min Cab 1200×1400mm', description: 'Accessible elevator cab must be minimum 1200mm wide × 1400mm deep to allow wheelchair manoeuvring', codeCitation: 'BP 344 2024 IRR §7.3', position: (p) => [mm(p.cabWidth) / 2 + 1, mm(p.cabHeight) / 2, 0] },
  { id: 'ann-door', label: 'Min Door 900mm Clear', description: 'Elevator door clear opening must be at least 900mm for wheelchair access', codeCitation: 'BP 344 2024 IRR §7.3', position: (p) => [0, 2.5, mm(p.cabDepth) / 2 + 0.8] },
  { id: 'ann-controls', label: 'Controls 900–1200mm', description: 'All control buttons shall be mounted between 900mm and 1200mm above finished floor', codeCitation: 'BP 344 2024 IRR §7.3', position: (p) => [mm(p.cabWidth) / 2 + 0.6, 1.05, 0], visibleWhen: (p) => Boolean(p.showControls) },
]

const presets: Preset[] = [
  { label: 'Accessible (Min)', values: { cabWidth: 1200, cabDepth: 1400, cabHeight: 2400, doorWidth: 900, numStoreys: 5, showControls: true } },
  { label: 'Standard Passenger', values: { cabWidth: 1600, cabDepth: 1600, cabHeight: 2400, doorWidth: 1100, numStoreys: 8, showControls: true } },
  { label: 'Service Elevator', values: { cabWidth: 2000, cabDepth: 2200, cabHeight: 2400, doorWidth: 1200, numStoreys: 6, showControls: false } },
  { label: 'Violation Demo', values: { cabWidth: 1000, cabDepth: 1200, cabHeight: 2100, doorWidth: 800, numStoreys: 4, showControls: true } },
]

export const elevatorDimensionsConfig: ParametricSceneConfig = {
  id: 'elevator-dimensions',
  title: 'Elevator Dimensions',
  description: 'Elevator cab and shaft dimensions with accessibility compliance checks per BP 344 2024 IRR and PD 1096.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 5, 7], fov: 45 },
}

