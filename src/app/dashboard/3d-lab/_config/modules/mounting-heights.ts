// src/app/dashboard/3d-lab/_config/modules/mounting-heights.ts
// Electrical Mounting Heights — PEC (Philippine Electrical Code)
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'outletHeight', label: 'Outlet Height', type: 'slider', min: 150, max: 600, step: 25, default: 300, unit: 'mm', group: 'Outlets' },
  { key: 'switchHeight', label: 'Switch Height', type: 'slider', min: 900, max: 1500, step: 25, default: 1200, unit: 'mm', group: 'Switches' },
  { key: 'panelHeight', label: 'Panel Breaker Handle', type: 'slider', min: 1500, max: 2100, step: 50, default: 1980, unit: 'mm', group: 'Panel' },
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 3000, max: 8000, step: 200, default: 5000, unit: 'mm', group: 'Room' },
  { key: 'showSpacing', label: 'Show Outlet Spacing', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const outH = mm(params.outletHeight)
  const swH = mm(params.switchHeight)
  const panH = mm(params.panelHeight)
  const rW = mm(params.roomWidth)
  const showSpacing = Boolean(params.showSpacing)
  const wallH = 2.8
  const wallT = 0.15
  const outViolated = outH < 0.3 || outH > 0.4
  const swViolated = swH < 1.1 || swH > 1.3
  const panViolated = panH > 1.98
  const inst: GeometryInstruction[] = []

  // Room walls
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [rW, 0.1, 2], color: '#a1a1aa' })
  inst.push({ id: 'wall', type: 'box', position: [0, wallH / 2, -1 - wallT / 2], args: [rW, wallH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wallT / 2), wallH / 2, -0.5], args: [wallT, wallH, 2], color: '#d4d4d8' })

  // Outlets (300mm from floor, max 1.8m apart)
  const outletCount = Math.floor(rW / 1.8) + 1
  for (let o = 0; o < outletCount; o++) {
    const ox = -(rW / 2) + o * (rW / (outletCount - 1 || 1))
    inst.push({ id: `outlet-${o}`, type: 'box', position: [ox, outH, -1 - wallT], args: [0.08, 0.08, 0.02], color: outViolated ? '#D64545' : '#D4951A' })
    // Spacing indicator
    if (showSpacing && o < outletCount - 1) {
      const nextX = -(rW / 2) + (o + 1) * (rW / (outletCount - 1 || 1))
      const midX = (ox + nextX) / 2
      const spacingDist = nextX - ox
      inst.push({ id: `spacing-${o}`, type: 'box', position: [midX, outH, -0.85], args: [spacingDist, 0.01, 0.01], color: spacingDist <= 1.8 ? '#2D9F6F' : '#D64545', label: `${(spacingDist).toFixed(1)}m` })
    }
  }
  // Outlet height line
  inst.push({ id: 'outlet-h-line', type: 'box', position: [-(rW / 2) - 0.3, outH / 2, -1], args: [0.02, outH, 0.02], color: outViolated ? '#D64545' : '#3b82f6', label: `${(outH * 1000).toFixed(0)}mm` })

  // Switches
  inst.push({ id: 'switch-1', type: 'box', position: [-(rW / 2) + 0.2, swH, -1 - wallT], args: [0.08, 0.1, 0.02], color: swViolated ? '#D64545' : '#3b82f6' })
  inst.push({ id: 'switch-2', type: 'box', position: [-(rW / 2) + 0.35, swH, -1 - wallT], args: [0.08, 0.1, 0.02], color: swViolated ? '#D64545' : '#3b82f6' })
  inst.push({ id: 'switch-h-line', type: 'box', position: [-(rW / 2) - 0.6, swH / 2, -1], args: [0.02, swH, 0.02], color: swViolated ? '#D64545' : '#3b82f6', label: `${(swH * 1000).toFixed(0)}mm` })

  // Panel board
  inst.push({ id: 'panel-box', type: 'box', position: [rW / 2 - 0.25, (panH - 0.4) / 2, -1 - wallT], args: [0.35, panH - 0.4, 0.06], color: '#52525b' })
  inst.push({ id: 'panel-handle', type: 'box', position: [rW / 2 - 0.25, panH, -1 - wallT - 0.01], args: [0.15, 0.04, 0.01], color: panViolated ? '#D64545' : '#2D9F6F', label: `Handle: ${(panH * 1000).toFixed(0)}mm` })
  inst.push({ id: 'panel-h-line', type: 'box', position: [rW / 2 + 0.3, panH / 2, -1], args: [0.02, panH, 0.02], color: panViolated ? '#D64545' : '#3b82f6', label: `${(panH * 1000).toFixed(0)}mm` })

  // Person for scale
  inst.push({ id: 'person', type: 'cylinder', position: [0, 0.85, 0], args: [0.2, 0.2, 1.7, 8], color: '#6366f1', opacity: 0.4, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'outlet-height', field: 'outletHeight',
    check: (p) => num(p.outletHeight) < 300,
    message: 'Outlet height below 300mm minimum from finished floor',
    codeCitation: 'PEC §2.30.2', severity: 'error',
    position: () => [-3, 0.5, 0],
  },
  {
    id: 'panel-height', field: 'panelHeight',
    check: (p) => num(p.panelHeight) > 1980,
    message: 'Panel board breaker handle exceeds 1980mm maximum height',
    codeCitation: 'PEC §2.30.6', severity: 'error',
    position: () => [3, 2.5, 0],
  },
  {
    id: 'switch-height', field: 'switchHeight',
    check: (p) => num(p.switchHeight) < 1100 || num(p.switchHeight) > 1300,
    message: 'Switch height outside standard 1100–1300mm range',
    codeCitation: 'PEC §2.30.2', severity: 'warning',
    position: () => [-3, 1.5, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-outlets', label: 'Outlets: 300mm, Max 1.8m Apart', description: 'Convenience outlets at 300mm from floor; spaced so no point on any wall is more than 1.8m from an outlet', codeCitation: 'PEC §2.30.2', position: () => [-3, 0.8, 0.5] },
  { id: 'ann-switches', label: 'Switches: 1200mm', description: 'Wall switches are typically located at 1200mm from finished floor', codeCitation: 'PEC §2.30.2', position: () => [-3, 1.5, 0.5] },
  { id: 'ann-panel', label: 'Panel: Max 1980mm', description: 'Highest circuit breaker handle on panel board must not exceed 1980mm above floor', codeCitation: 'PEC §2.30.6', position: () => [3, 2.2, 0.5] },
]

const presets: Preset[] = [
  { label: 'Standard Heights', values: { outletHeight: 300, switchHeight: 1200, panelHeight: 1980, roomWidth: 5000, showSpacing: true } },
  { label: 'Accessible Heights', values: { outletHeight: 400, switchHeight: 1100, panelHeight: 1200, roomWidth: 5000, showSpacing: true } },
  { label: 'Large Room', values: { outletHeight: 300, switchHeight: 1200, panelHeight: 1980, roomWidth: 8000, showSpacing: true } },
  { label: 'Violation Demo', values: { outletHeight: 150, switchHeight: 1400, panelHeight: 2100, roomWidth: 5000, showSpacing: false } },
]

export const mountingHeightsConfig: ParametricSceneConfig = {
  id: 'mounting-heights',
  title: 'Electrical Mounting Heights',
  description: 'Room showing outlet (300mm), switch (1200mm), and panel board (max 1980mm) mounting heights per PEC with spacing requirements.',
  subject: 'pec',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 2.5, 4], fov: 55 },
}
