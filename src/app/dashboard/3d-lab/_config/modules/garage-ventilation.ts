// src/app/dashboard/3d-lab/_config/modules/garage-ventilation.ts
// Garage Ventilation — PD 1096 / PMEC
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'garageWidth', label: 'Garage Width', type: 'slider', min: 6, max: 40, step: 1, default: 20, unit: 'm', group: 'Garage' },
  { key: 'garageDepth', label: 'Garage Depth', type: 'slider', min: 6, max: 40, step: 1, default: 25, unit: 'm', group: 'Garage' },
  { key: 'garageHeight', label: 'Clear Height', type: 'slider', min: 2000, max: 3500, step: 100, default: 2500, unit: 'mm', group: 'Garage' },
  { key: 'ventOpeningPct', label: 'Vent Opening %', type: 'slider', min: 1, max: 25, step: 0.5, default: 5, unit: '%', decimals: 1, group: 'Ventilation' },
  { key: 'showAirflow', label: 'Show Airflow', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const gW = num(params.garageWidth)
  const gD = num(params.garageDepth)
  const gH = mm(params.garageHeight)
  const ventPct = num(params.ventOpeningPct)
  const showFlow = Boolean(params.showAirflow)
  const scale = 0.2
  const gWs = gW * scale
  const gDs = gD * scale
  const floorA = gW * gD
  const ventA = floorA * (ventPct / 100)
  const minVentA = floorA * 0.05 // 5% for mechanical parking
  const violated = ventPct < 5
  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [gWs, 0.1, gDs], color: '#52525b' })
  // Back wall
  inst.push({ id: 'wall-back', type: 'box', position: [0, gH / 2, -(gDs / 2 + wallT / 2)], args: [gWs, gH, wallT], color: '#d4d4d8' })
  // Left wall with vent openings
  const ventH = ventA / gD / scale
  inst.push({ id: 'wall-left-bot', type: 'box', position: [-(gWs / 2 + wallT / 2), gH * 0.15, 0], args: [wallT, gH * 0.3, gDs], color: '#d4d4d8' })
  inst.push({ id: 'wall-left-vent', type: 'box', position: [-(gWs / 2 + wallT / 2), gH * 0.5, 0], args: [wallT + 0.01, Math.min(ventH, gH * 0.4), gDs], color: violated ? '#fca5a5' : '#93c5fd', opacity: 0.5, transparent: true, label: `${ventPct}% vent` })
  inst.push({ id: 'wall-left-top', type: 'box', position: [-(gWs / 2 + wallT / 2), gH * 0.85, 0], args: [wallT, gH * 0.3, gDs], color: '#d4d4d8' })
  // Right wall (exhaust side, transparent)
  inst.push({ id: 'wall-right', type: 'box', position: [(gWs / 2 + wallT / 2), gH / 2, 0], args: [wallT, gH, gDs], color: '#d4d4d8', opacity: 0.1, transparent: true })
  // Ceiling
  inst.push({ id: 'ceiling', type: 'box', position: [0, gH + 0.05, 0], args: [gWs, 0.1, gDs], color: '#71717a' })

  // Parked cars
  const carCount = Math.min(Math.floor(gW / 3), 6)
  for (let c = 0; c < carCount; c++) {
    const cx = -(gWs / 2) + (c + 0.5) * (gWs / carCount)
    inst.push({ id: `car-${c}`, type: 'box', position: [cx, 0.6, 0], args: [0.45, 0.6, 1.0], color: '#6366f1', opacity: 0.6, transparent: true })
  }

  // Airflow indicators
  if (showFlow) {
    const arrowCount = 4
    for (let a = 0; a < arrowCount; a++) {
      const az = -(gDs / 2) + (a + 1) * gDs / (arrowCount + 1)
      inst.push({ id: `flow-${a}`, type: 'cone', position: [-gWs / 2 + 0.3, gH * 0.5, az], rotation: [0, -Math.PI / 2, 0], args: [0.1, 0.3, 8], color: '#3b82f6', opacity: 0.7, transparent: true })
      inst.push({ id: `flow-out-${a}`, type: 'cone', position: [gWs / 2 - 0.1, gH * 0.5, az], rotation: [0, -Math.PI / 2, 0], args: [0.1, 0.3, 8], color: '#dc2626', opacity: 0.7, transparent: true })
    }
  }

  // Min ventilation area indicator
  inst.push({ id: 'min-vent-indicator', type: 'box', position: [-(gWs / 2 + 0.5), gH * 0.5, 0], args: [0.3, Math.min(minVentA / gD / scale, gH * 0.4), gDs], color: violated ? '#dc2626' : '#16a34a', opacity: 0.4, transparent: true, label: 'Min 5%' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'min-vent-area', field: 'ventOpeningPct',
    check: (p) => num(p.ventOpeningPct) < 5,
    message: 'Parking garage ventilation openings below 5% of floor area minimum',
    codeCitation: 'PD 1096 / PMEC §309', severity: 'error',
    position: () => [3, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-nat-vent', label: '5% Natural Vent Rule', description: 'Naturally ventilated parking garages must have permanent openings of at least 5% of floor area on two opposite sides', codeCitation: 'PD 1096 / PMEC §309', position: () => [-4, 1.5, 0] },
  { id: 'ann-co', label: 'CO Detection', description: 'Enclosed parking requiring mechanical ventilation must have carbon monoxide detection per RA 9514', codeCitation: 'RA 9514 IRR Rule 12', position: () => [4, 1.5, 0] },
]

const presets: Preset[] = [
  { label: 'Small Compliant', values: { garageWidth: 12, garageDepth: 15, garageHeight: 2500, ventOpeningPct: 6, showAirflow: true } },
  { label: 'Large Garage', values: { garageWidth: 30, garageDepth: 35, garageHeight: 2700, ventOpeningPct: 8, showAirflow: true } },
  { label: 'Min Ventilation', values: { garageWidth: 20, garageDepth: 25, garageHeight: 2500, ventOpeningPct: 5, showAirflow: true } },
  { label: 'Violation Demo', values: { garageWidth: 20, garageDepth: 25, garageHeight: 2500, ventOpeningPct: 3, showAirflow: false } },
]

export const garageVentilationConfig: ParametricSceneConfig = {
  id: 'garage-ventilation',
  title: 'Garage Ventilation',
  description: 'Parking garage section with ventilation opening requirements (min 5% of floor area), airflow visualization, and CO detection per PD 1096.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [7, 4, 7], fov: 55 },
}
