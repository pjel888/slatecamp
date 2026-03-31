// src/app/dashboard/3d-lab/_config/modules/parking-slot-dimensions.ts
// Parking Slot Dimensions — PD 1096 Rule XIX
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }
function str(v: number | string | boolean): string { return String(v) }

const VEHICLE_SPECS: Record<string, { w: number; l: number; color: string; label: string }> = {
  'car':      { w: 2.50, l: 5.00, color: '#3b82f6', label: 'Standard Car (2.50×5.00m)' },
  'parallel': { w: 2.15, l: 6.00, color: '#6366f1', label: 'Parallel Car (2.15×6.00m)' },
  'truck':    { w: 3.60, l: 12.0, color: '#f97316', label: 'Truck/Bus (3.60×12.00m)' },
  'pwd':      { w: 3.70, l: 5.00, color: '#2D9F6F', label: 'PWD Van (3.70×5.00m)' },
}

const parameters: ParameterDef[] = [
  { key: 'vehicleType', label: 'Vehicle Type', type: 'dropdown', default: 'car',
    options: Object.entries(VEHICLE_SPECS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Slot Type' },
  { key: 'slotWidth', label: 'Slot Width', type: 'slider', min: 1800, max: 5000, step: 50, default: 2500, unit: 'mm', group: 'Dimensions' },
  { key: 'slotLength', label: 'Slot Length', type: 'slider', min: 3000, max: 15000, step: 100, default: 5000, unit: 'mm', group: 'Dimensions' },
  { key: 'numSlots', label: 'Number of Slots', type: 'slider', min: 1, max: 8, step: 1, default: 4, group: 'Layout' },
  { key: 'showDriveAisle', label: 'Show Drive Aisle', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const vType = str(params.vehicleType)
  const sW = mm(params.slotWidth)
  const sL = mm(params.slotLength)
  const n = num(params.numSlots)
  const showAisle = Boolean(params.showDriveAisle)
  const spec = VEHICLE_SPECS[vType]
  const violated = sW < spec.w || sL < spec.l
  const aisleW = vType === 'truck' ? 7.5 : 6.0
  const totalW = sW * n
  const inst: GeometryInstruction[] = []

  // Parking floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [totalW + 0.5, 0.1, sL + (showAisle ? aisleW : 0) + 0.5], color: '#52525b' })

  // Slots
  for (let i = 0; i < n; i++) {
    const sx = -(totalW / 2) + sW * i + sW / 2
    const slotColor = violated ? '#fca5a5' : '#71717a'
    inst.push({ id: `slot-${i}`, type: 'box', position: [sx, 0.005, -sL / 2 + (showAisle ? aisleW / 2 : 0)], args: [sW - 0.05, 0.01, sL], color: slotColor, opacity: 0.5, transparent: true })
    // Line markings
    inst.push({ id: `line-l-${i}`, type: 'box', position: [sx - sW / 2, 0.01, -sL / 2 + (showAisle ? aisleW / 2 : 0)], args: [0.05, 0.01, sL], color: '#ffffff' })
    // Vehicle silhouette
    if (i < n) {
      inst.push({ id: `vehicle-${i}`, type: 'box', position: [sx, 0.7, (showAisle ? aisleW / 2 : 0)], args: [spec.w - 0.1, 1.4, spec.l - 0.2], color: spec.color, opacity: 0.6, transparent: true })
      inst.push({ id: `veh-roof-${i}`, type: 'box', position: [sx, 1.5, (showAisle ? aisleW / 2 : 0)], args: [spec.w * 0.7, 0.5, spec.l * 0.5], color: spec.color })
    }
  }

  // Drive aisle
  if (showAisle) {
    inst.push({ id: 'drive-aisle', type: 'box', position: [0, 0.005, -(sL / 2 + aisleW / 2 - (showAisle ? aisleW / 2 : 0)) + aisleW / 2], args: [totalW + 0.5, 0.01, aisleW], color: '#f97316', opacity: 0.2, transparent: true, label: `Aisle ${aisleW}m` })
  }

  // Min size indicator
  inst.push({ id: 'min-indicator', type: 'box', position: [-(totalW / 2) - 0.5, 0.01, (showAisle ? aisleW / 2 : 0)], args: [0.05, 0.01, spec.l], color: violated ? '#D64545' : '#2D9F6F', label: `Min L: ${spec.l}m` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'slot-width', field: 'slotWidth',
    check: (p) => {
      const spec = VEHICLE_SPECS[str(p.vehicleType)]
      return mm(p.slotWidth) < spec.w
    },
    message: 'Parking slot width below minimum for selected vehicle type',
    codeCitation: 'PD 1096 IRR Rule XIX', severity: 'error',
    position: () => [0, 2, 0],
  },
  {
    id: 'slot-length', field: 'slotLength',
    check: (p) => {
      const spec = VEHICLE_SPECS[str(p.vehicleType)]
      return mm(p.slotLength) < spec.l
    },
    message: 'Parking slot length below minimum for selected vehicle type',
    codeCitation: 'PD 1096 IRR Rule XIX', severity: 'error',
    position: () => [0, 2, -3],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-std', label: 'Standard Car: 2.50×5.00m', description: 'Standard parking stall for passenger cars is 2.50m wide × 5.00m long', codeCitation: 'PD 1096 IRR Rule XIX', position: () => [5, 2, 0] },
  { id: 'ann-pwd', label: 'PWD Slot: 3.70×5.00m', description: 'Accessible PWD parking slot must be 3.70m wide to accommodate van-accessible ramps', codeCitation: 'BP 344 2024 IRR §4.3', position: () => [-5, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Standard Cars', values: { vehicleType: 'car', slotWidth: 2500, slotLength: 5000, numSlots: 5, showDriveAisle: true } },
  { label: 'Parallel Parking', values: { vehicleType: 'parallel', slotWidth: 2150, slotLength: 6000, numSlots: 4, showDriveAisle: true } },
  { label: 'Truck Bay', values: { vehicleType: 'truck', slotWidth: 3600, slotLength: 12000, numSlots: 2, showDriveAisle: true } },
  { label: 'PWD Slots', values: { vehicleType: 'pwd', slotWidth: 3700, slotLength: 5000, numSlots: 2, showDriveAisle: true } },
]

export const parkingSlotDimensionsConfig: ParametricSceneConfig = {
  id: 'parking-slot-dimensions',
  title: 'Parking Slot Dimensions',
  description: 'Parking floor with vehicle type toggles showing car, parallel, truck, and PWD slot dimensions per PD 1096 Rule XIX.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [8, 6, 8], fov: 55 },
}
