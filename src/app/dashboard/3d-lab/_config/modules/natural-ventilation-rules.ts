// src/app/dashboard/3d-lab/_config/modules/natural-ventilation-rules.ts
// Natural Ventilation Rules — PD 1096 Rule VIII §803
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 3000, max: 10000, step: 200, default: 5000, unit: 'mm', group: 'Room' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 3000, max: 10000, step: 200, default: 6000, unit: 'mm', group: 'Room' },
  { key: 'inletWidth', label: 'Inlet Opening Width', type: 'slider', min: 300, max: 2000, step: 50, default: 1200, unit: 'mm', group: 'Openings' },
  { key: 'outletWidth', label: 'Outlet Opening Width', type: 'slider', min: 300, max: 2000, step: 50, default: 1200, unit: 'mm', group: 'Openings' },
  { key: 'openingHeight', label: 'Opening Height', type: 'slider', min: 300, max: 1500, step: 50, default: 1000, unit: 'mm', group: 'Openings' },
  { key: 'showAirflow', label: 'Show Airflow', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const rW = mm(params.roomWidth)
  const rD = mm(params.roomDepth)
  const iW = mm(params.inletWidth)
  const oW = mm(params.outletWidth)
  const opH = mm(params.openingHeight)
  const showFlow = Boolean(params.showAirflow)
  const cH = 2.7
  const wallT = 0.15
  const floorA = rW * rD
  const totalOpenA = (iW + oW) * opH
  const minOpenA = floorA * 0.10
  const violated = totalOpenA < minOpenA
  const inst: GeometryInstruction[] = []

  // Room structure
  inst.push({ id: 'floor', type: 'box', position: [0, -0.075, 0], args: [rW, 0.15, rD], color: '#a1a1aa' })
  inst.push({ id: 'ceiling', type: 'box', position: [0, cH + 0.075, 0], args: [rW, 0.15, rD], color: '#d4d4d8', opacity: 0.2, transparent: true })
  inst.push({ id: 'wall-back', type: 'box', position: [0, cH / 2, -(rD / 2 + wallT / 2)], args: [rW, cH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: '#d4d4d8', opacity: 0.2, transparent: true })

  // Inlet opening (front wall, left side)
  const wY = 0.9 + opH / 2
  inst.push({ id: 'inlet-opening', type: 'box', position: [-rW / 4, wY, rD / 2 + wallT / 2], args: [iW, opH, wallT + 0.02], color: '#3b82f6', opacity: 0.4, transparent: true, label: 'Inlet' })
  // Front wall segments
  inst.push({ id: 'front-wall-r', type: 'box', position: [rW / 4, cH / 2, rD / 2 + wallT / 2], args: [(rW / 2 - iW / 2), cH, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Outlet opening (back wall, right side)
  inst.push({ id: 'outlet-opening', type: 'box', position: [rW / 4, wY + 0.2, -(rD / 2 + wallT / 2)], args: [oW, opH, wallT + 0.02], color: '#2D9F6F', opacity: 0.4, transparent: true, label: 'Outlet' })

  // Airflow path arrows
  if (showFlow) {
    const arrowCount = 5
    for (let a = 0; a < arrowCount; a++) {
      const t = a / (arrowCount - 1)
      const ax = -rW / 4 + t * (rW / 4 + rW / 4)
      const az = rD / 2 - t * rD
      inst.push({ id: `flow-${a}`, type: 'sphere', position: [ax, 1.2, az], args: [0.08, 8, 8], color: '#3b82f6', opacity: 0.6, transparent: true })
    }
    // Arrow indicators
    inst.push({ id: 'flow-arrow-1', type: 'cone', position: [-rW / 4, 1.2, rD / 4], rotation: [-Math.PI / 2, 0, 0], args: [0.12, 0.3, 8], color: '#3b82f6', opacity: 0.7, transparent: true })
    inst.push({ id: 'flow-arrow-2', type: 'cone', position: [rW / 4, 1.4, -rD / 4], rotation: [-Math.PI / 2, 0, 0], args: [0.12, 0.3, 8], color: '#2D9F6F', opacity: 0.7, transparent: true })
  }

  // 10% area indicator
  inst.push({ id: 'min-area-marker', type: 'box', position: [0, 0.01, 0], args: [Math.sqrt(minOpenA), 0.005, Math.sqrt(minOpenA)], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.3, transparent: true, label: `Min: ${minOpenA.toFixed(2)} m²` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'ventilation-area', field: 'inletWidth',
    check: (p) => {
      const floorA = mm(p.roomWidth) * mm(p.roomDepth)
      const totalOpenA = (mm(p.inletWidth) + mm(p.outletWidth)) * mm(p.openingHeight)
      return totalOpenA < floorA * 0.10
    },
    message: 'Total ventilation openings below 10% of floor area minimum',
    codeCitation: 'PD 1096 IRR Rule VIII §803', severity: 'error',
    position: () => [3, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-10pct', label: '10% Floor Area Rule', description: 'Total ventilation openings must equal at least 10% of floor area served for adequate air exchange', codeCitation: 'PD 1096 IRR Rule VIII §803', position: (p) => [-(mm(p.roomWidth) / 2) - 0.8, 1.5, 0] },
  { id: 'ann-cross', label: 'Cross Ventilation', description: 'Openings on opposite walls enable cross-ventilation; inlet low, outlet high maximises stack effect', codeCitation: 'PD 1096 IRR Rule VIII §803', position: (p) => [0, 2.8, 0] },
]

const presets: Preset[] = [
  { label: 'Cross Ventilated', values: { roomWidth: 5000, roomDepth: 6000, inletWidth: 1500, outletWidth: 1500, openingHeight: 1200, showAirflow: true } },
  { label: 'Min Compliant', values: { roomWidth: 4000, roomDepth: 5000, inletWidth: 1000, outletWidth: 1000, openingHeight: 1000, showAirflow: true } },
  { label: 'Large Room', values: { roomWidth: 8000, roomDepth: 9000, inletWidth: 2000, outletWidth: 1800, openingHeight: 1500, showAirflow: true } },
  { label: 'Violation Demo', values: { roomWidth: 6000, roomDepth: 8000, inletWidth: 600, outletWidth: 600, openingHeight: 600, showAirflow: false } },
]

export const naturalVentilationRulesConfig: ParametricSceneConfig = {
  id: 'natural-ventilation-rules',
  title: 'Natural Ventilation Rules',
  description: 'Room with adjustable openings showing the 10% floor area rule and cross-ventilation airflow per PD 1096 Rule VIII §803.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 5, 7], fov: 50 },
}
