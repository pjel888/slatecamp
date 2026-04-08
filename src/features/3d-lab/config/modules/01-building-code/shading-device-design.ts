// src/features/3d-lab/config/modules/01-building-code/shading-device-design.ts
// Shading Device Design — PD 1096 Rule VIII for natural cooling
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const DEVICE_LABELS: Record<string, string> = {
  'overhang': 'Horizontal Overhang',
  'fin': 'Vertical Fin',
  'louver': 'Angled Louver',
  'egg-crate': 'Egg-Crate Grid',
}

const DIRECTION_SUN: Record<string, { azimuth: number; label: string }> = {
  'N': { azimuth: 0, label: 'North' },
  'S': { azimuth: 180, label: 'South' },
  'E': { azimuth: 90, label: 'East' },
  'W': { azimuth: 270, label: 'West' },
}

const parameters: ParameterDef[] = [
  { key: 'windowWidth', label: 'Window Width', type: 'slider', min: 0.6, max: 3.0, step: 0.1, default: 1.2, unit: 'm', decimals: 1, group: 'Window' },
  { key: 'windowHeight', label: 'Window Height', type: 'slider', min: 0.6, max: 2.4, step: 0.1, default: 1.2, unit: 'm', decimals: 1, group: 'Window' },
  { key: 'deviceType', label: 'Device Type', type: 'dropdown', default: 'overhang',
    options: Object.entries(DEVICE_LABELS).map(([k, v]) => ({ value: k, label: v })),
    group: 'Shading Device' },
  { key: 'projection', label: 'Projection Depth', type: 'slider', min: 0.1, max: 1.5, step: 0.05, default: 0.6, unit: 'm', decimals: 2, group: 'Shading Device' },
  { key: 'facingDirection', label: 'Facing Direction', type: 'dropdown', default: 'W',
    options: Object.entries(DIRECTION_SUN).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Orientation' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const wW = num(params.windowWidth)
  const wH = num(params.windowHeight)
  const deviceType = str(params.deviceType)
  const proj = num(params.projection)
  const direction = str(params.facingDirection)

  const wallH = 3.0
  const wallW = wW + 1.6
  const wallT = 0.25
  const windowSillH = 0.9
  const projectionRatio = proj / wH
  const isWestFacing = direction === 'W'
  const projectionOk = projectionRatio >= 0.3
  const westOk = !isWestFacing || proj >= 0.6

  const inst: GeometryInstruction[] = []

  // Wall section
  inst.push({ id: 'wall', type: 'box', position: [0, wallH / 2, 0], args: [wallW, wallH, wallT], color: '#d4d4d8' })

  // Window opening (recessed panel)
  inst.push({ id: 'window-glass', type: 'box', position: [0, windowSillH + wH / 2, -wallT / 2 + 0.02], args: [wW, wH, 0.04], color: '#93c5fd', opacity: 0.5, transparent: true, label: `${wW.toFixed(1)} × ${wH.toFixed(1)} m` })
  inst.push({ id: 'window-frame', type: 'box', position: [0, windowSillH + wH / 2, -wallT / 2 + 0.01], args: [wW + 0.05, wH + 0.05, 0.02], color: '#71717a' })

  // Shading device
  const deviceColor = (projectionOk && westOk) ? '#1B3FC4' : '#D64545'
  const deviceY = windowSillH + wH + 0.05

  if (deviceType === 'overhang') {
    inst.push({ id: 'device', type: 'box', position: [0, deviceY, -wallT / 2 - proj / 2], args: [wW + 0.2, 0.06, proj], color: deviceColor, label: `Proj: ${proj.toFixed(2)}m` })
  } else if (deviceType === 'fin') {
    // Two vertical fins at window sides
    inst.push({ id: 'device-left', type: 'box', position: [-wW / 2, windowSillH + wH / 2, -wallT / 2 - proj / 2], args: [0.06, wH, proj], color: deviceColor })
    inst.push({ id: 'device-right', type: 'box', position: [wW / 2, windowSillH + wH / 2, -wallT / 2 - proj / 2], args: [0.06, wH, proj], color: deviceColor, label: `Fin proj: ${proj.toFixed(2)}m` })
  } else if (deviceType === 'louver') {
    // Three angled louver blades
    const bladeCount = 3
    for (let i = 0; i < bladeCount; i++) {
      const by = windowSillH + wH * (i + 1) / (bladeCount + 1)
      inst.push({ id: `louver-${i}`, type: 'box', position: [0, by, -wallT / 2 - proj / 2], rotation: [0.4, 0, 0], args: [wW + 0.1, 0.04, proj], color: deviceColor })
    }
    inst.push({ id: 'louver-label', type: 'box', position: [wW / 2 + 0.5, deviceY, -wallT / 2 - proj / 2], args: [0.02, 0.02, 0.02], color: deviceColor, label: `Louver proj: ${proj.toFixed(2)}m` })
  } else {
    // Egg-crate: horizontal overhang + fins combined
    inst.push({ id: 'egg-h', type: 'box', position: [0, deviceY, -wallT / 2 - proj / 2], args: [wW + 0.2, 0.05, proj], color: deviceColor })
    inst.push({ id: 'egg-vl', type: 'box', position: [-wW / 4, windowSillH + wH / 2, -wallT / 2 - proj / 2], args: [0.05, wH, proj], color: deviceColor })
    inst.push({ id: 'egg-vr', type: 'box', position: [wW / 4, windowSillH + wH / 2, -wallT / 2 - proj / 2], args: [0.05, wH, proj], color: deviceColor, label: `Egg-Crate ${proj.toFixed(2)}m` })
  }

  // Shadow projection indicator (simplified trapezoid using box)
  const shadowLen = proj * 2.5
  inst.push({ id: 'shadow', type: 'box', position: [0, 0.01, -wallT / 2 - shadowLen / 2], args: [wW, 0.02, shadowLen], color: '#374151', opacity: 0.15, transparent: true, label: `Shadow zone` })

  // Projection ratio indicator bar
  const ratioH = projectionRatio * 2
  inst.push({ id: 'ratio-bar', type: 'box', position: [wallW / 2 + 0.5, ratioH / 2, 0], args: [0.2, ratioH, 0.2], color: projectionOk ? '#2D9F6F' : '#D64545', label: `Ratio: ${projectionRatio.toFixed(2)}` })
  inst.push({ id: 'ratio-min', type: 'box', position: [wallW / 2 + 0.5, 0.3, 0], args: [0.4, 0.02, 0.4], color: '#f97316', label: 'Min 0.3' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'projection-below-min', field: 'projection',
    check: (p) => num(p.projection) / num(p.windowHeight) < 0.3,
    message: 'Shading device projection ratio (depth ÷ window height) is below 0.30 — inadequate sun control for tropical climate',
    codeCitation: 'PD 1096 Rule VIII §808 / ASHRAE 189.1 Tropical Climate Adaptation', severity: 'error',
    position: () => [3, 2, 0],
  },
  {
    id: 'west-facing-insufficient', field: 'projection',
    check: (p) => str(p.facingDirection) === 'W' && num(p.projection) < 0.6,
    message: 'West-facing shading devices require minimum 0.60m projection to block afternoon low-angle sun per NBCP energy provisions',
    codeCitation: 'PD 1096 Rule VIII §808.4 / PGBC Green Building Code §4.2', severity: 'warning',
    position: () => [0, 2, -2],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-projection', label: 'Projection Ratio',
    description: 'The projection ratio (horizontal depth ÷ window head height) determines the cut-off angle of solar admission. PD 1096 Rule VIII §808 requires adequate shading for habitable rooms to reduce solar heat gain in the tropical climate.',
    codeCitation: 'PD 1096 Rule VIII §808',
    position: (p) => [(num(p.windowWidth) / 2) + 1.2, 2, 0],
  },
  {
    id: 'ann-orientation', label: 'Orientation Effect',
    description: 'East and west orientations receive low-angle morning and afternoon sun requiring deeper shading devices. North-south orientations are preferred for fenestration per PD 1096 Rule VIII passive solar design provisions.',
    codeCitation: 'PD 1096 Rule VIII §803.3',
    position: () => [0, 3.2, -1],
  },
]

const presets: Preset[] = [
  { label: 'Compliant Overhang W', values: { windowWidth: 1.2, windowHeight: 1.2, deviceType: 'overhang', projection: 0.7, facingDirection: 'W' } },
  { label: 'Inadequate Projection', values: { windowWidth: 1.5, windowHeight: 1.5, deviceType: 'overhang', projection: 0.2, facingDirection: 'S' } },
  { label: 'Egg-Crate North', values: { windowWidth: 2.4, windowHeight: 1.8, deviceType: 'egg-crate', projection: 0.6, facingDirection: 'N' } },
  { label: 'Vertical Fin East', values: { windowWidth: 1.2, windowHeight: 2.0, deviceType: 'fin', projection: 0.8, facingDirection: 'E' } },
]

export const shadingDeviceDesignConfig: ParametricSceneConfig = {
  id: 'shading-device-design',
  title: 'Shading Device Design',
  description: 'Window opening with adjustable shading device showing projection ratio, shadow zone, and orientation-based compliance per PD 1096 Rule VIII §808 natural cooling provisions for tropical climate.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 3, 5], fov: 50 },
}
