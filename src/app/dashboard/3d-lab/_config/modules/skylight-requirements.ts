// src/app/dashboard/3d-lab/_config/modules/skylight-requirements.ts
// Skylight Requirements — PD 1096 Rule VIII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'skylightWidth', label: 'Skylight Width', type: 'slider', min: 500, max: 3000, step: 100, default: 1200, unit: 'mm', group: 'Skylight' },
  { key: 'skylightDepth', label: 'Skylight Depth', type: 'slider', min: 500, max: 3000, step: 100, default: 1200, unit: 'mm', group: 'Skylight' },
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 3000, max: 10000, step: 200, default: 5000, unit: 'mm', group: 'Room' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 3000, max: 10000, step: 200, default: 6000, unit: 'mm', group: 'Room' },
  { key: 'showLightCone', label: 'Show Light Cone', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const skW = mm(params.skylightWidth)
  const skD = mm(params.skylightDepth)
  const rW = mm(params.roomWidth)
  const rD = mm(params.roomDepth)
  const showLight = Boolean(params.showLightCone)
  const cH = 3.5
  const wallT = 0.15
  const floorA = rW * rD
  const skylightA = skW * skD
  const minA = floorA * 0.10
  const violated = skylightA < minA
  const inst: GeometryInstruction[] = []

  // Room structure
  inst.push({ id: 'floor', type: 'box', position: [0, -0.075, 0], args: [rW, 0.15, rD], color: '#a1a1aa' })
  inst.push({ id: 'wall-back', type: 'box', position: [0, cH / 2, -(rD / 2 + wallT / 2)], args: [rW, cH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: '#d4d4d8', opacity: 0.15, transparent: true })
  inst.push({ id: 'wall-front', type: 'box', position: [0, cH / 2, rD / 2 + wallT / 2], args: [rW, cH, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Roof with skylight cutout (simplified)
  inst.push({ id: 'roof-left', type: 'box', position: [-(rW / 2 - (rW - skW) / 4), cH + 0.075, 0], args: [(rW - skW) / 2, 0.15, rD], color: '#52525b' })
  inst.push({ id: 'roof-right', type: 'box', position: [(rW / 2 - (rW - skW) / 4), cH + 0.075, 0], args: [(rW - skW) / 2, 0.15, rD], color: '#52525b' })
  inst.push({ id: 'roof-back', type: 'box', position: [0, cH + 0.075, -(rD / 2 - (rD - skD) / 4)], args: [skW, 0.15, (rD - skD) / 2], color: '#52525b' })
  inst.push({ id: 'roof-front', type: 'box', position: [0, cH + 0.075, (rD / 2 - (rD - skD) / 4)], args: [skW, 0.15, (rD - skD) / 2], color: '#52525b' })

  // Skylight glazing
  inst.push({ id: 'skylight-glazing', type: 'box', position: [0, cH + 0.075, 0], args: [skW, 0.08, skD], color: violated ? '#fca5a5' : '#93c5fd', opacity: 0.55, transparent: true, label: `${(skylightA).toFixed(2)} m²` })

  // Skylight frame
  inst.push({ id: 'skylight-frame', type: 'box', position: [0, cH + 0.15, 0], args: [skW + 0.1, 0.1, skD + 0.1], color: '#71717a', opacity: 0.5, transparent: true })

  // Light cone
  if (showLight) {
    inst.push({ id: 'light-cone', type: 'cone', position: [0, cH / 2, 0], rotation: [Math.PI, 0, 0], args: [Math.max(skW, skD) * 0.7, cH, 8], color: '#fef9c3', opacity: 0.2, transparent: true })
    // Floor light pool
    inst.push({ id: 'light-pool', type: 'box', position: [0, 0.005, 0], args: [skW * 0.8, 0.01, skD * 0.8], color: '#fef08a', opacity: 0.5, transparent: true })
  }

  // Min area indicator
  inst.push({ id: 'min-area', type: 'box', position: [0, 0.01, 0], args: [Math.sqrt(minA), 0.005, Math.sqrt(minA)], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.3, transparent: true, label: `Min: ${minA.toFixed(2)} m²` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'skylight-area', field: 'skylightWidth',
    check: (p) => mm(p.skylightWidth) * mm(p.skylightDepth) < mm(p.roomWidth) * mm(p.roomDepth) * 0.10,
    message: 'Skylight area below 10% of room floor area minimum',
    codeCitation: 'PD 1096 IRR Rule VIII §803', severity: 'error',
    position: () => [3, 4, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-10pct', label: '10% Area Requirement', description: 'Skylights used to meet natural light requirements must provide at least 10% of floor area as glazed area', codeCitation: 'PD 1096 IRR Rule VIII §803', position: () => [4, 3.8, 0] },
  { id: 'ann-glazing', label: 'Glazing Materials', description: 'Skylights use tempered, laminated, or wired glass; slopes ≥3° for drainage', codeCitation: 'PD 1096 IRR Rule VIII', position: () => [0, 4.5, 0] },
]

const presets: Preset[] = [
  { label: 'Compliant Skylight', values: { skylightWidth: 1500, skylightDepth: 2000, roomWidth: 5000, roomDepth: 6000, showLightCone: true } },
  { label: 'Large Skylight', values: { skylightWidth: 2500, skylightDepth: 3000, roomWidth: 7000, roomDepth: 8000, showLightCone: true } },
  { label: 'Atrium Skylight', values: { skylightWidth: 3000, skylightDepth: 3000, roomWidth: 8000, roomDepth: 8000, showLightCone: true } },
  { label: 'Violation Demo', values: { skylightWidth: 600, skylightDepth: 600, roomWidth: 6000, roomDepth: 7000, showLightCone: false } },
]

export const skylightRequirementsConfig: ParametricSceneConfig = {
  id: 'skylight-requirements',
  title: 'Skylight Requirements',
  description: 'Roof section with adjustable skylight dimensions showing the 10% floor area rule for natural light per PD 1096 Rule VIII.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 6, 7], fov: 50 },
}
