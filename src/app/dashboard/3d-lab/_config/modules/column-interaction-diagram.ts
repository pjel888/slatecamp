// src/app/dashboard/3d-lab/_config/modules/column-interaction-diagram.ts
// Column Interaction Diagram — NSCP Chapter 4
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'colWidth', label: 'Column Width', type: 'slider', min: 200, max: 800, step: 25, default: 400, unit: 'mm', group: 'Section' },
  { key: 'colDepth', label: 'Column Depth', type: 'slider', min: 200, max: 800, step: 25, default: 400, unit: 'mm', group: 'Section' },
  { key: 'colHeight', label: 'Column Height', type: 'slider', min: 2700, max: 6000, step: 100, default: 3000, unit: 'mm', group: 'Section' },
  { key: 'rebarCount', label: 'Rebar Bars', type: 'slider', min: 4, max: 12, step: 2, default: 8, group: 'Reinforcement' },
  { key: 'rebarDiameter', label: 'Rebar Diameter', type: 'dropdown', default: '20', options: [{ value: '16', label: '16mm' }, { value: '20', label: '20mm' }, { value: '25', label: '25mm' }, { value: '32', label: '32mm' }], group: 'Reinforcement', unit: 'mm' },
  { key: 'axialLoad', label: 'Axial Load', type: 'slider', min: 100, max: 5000, step: 100, default: 1500, unit: 'kN', group: 'Loading' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cW = mm(params.colWidth)
  const cD = mm(params.colDepth)
  const cH = mm(params.colHeight)
  const nBars = num(params.rebarCount)
  const dBar = mm(String(params.rebarDiameter))
  const axial = num(params.axialLoad)
  const cover = 0.04
  const inst: GeometryInstruction[] = []

  // Foundation pad
  inst.push({ id: 'footing', type: 'box', position: [0, -0.3, 0], args: [cW * 2, 0.6, cD * 2], color: '#52525b' })
  // Column body
  const colColor = '#a1a1aa'
  inst.push({ id: 'column', type: 'box', position: [0, cH / 2, 0], args: [cW, cH, cD], color: colColor })
  // Beam stub at top
  inst.push({ id: 'beam-stub', type: 'box', position: [0, cH + 0.15, 0], args: [cW * 2.5, 0.3, cD], color: '#71717a' })

  // Longitudinal rebars
  const inner = { x: cW / 2 - cover - dBar / 2, z: cD / 2 - cover - dBar / 2 }
  const barsPerFace = Math.floor(nBars / 4)
  const rebarPositions: [number, number][] = []
  // Corners
  rebarPositions.push([-inner.x, -inner.z], [inner.x, -inner.z], [-inner.x, inner.z], [inner.x, inner.z])
  // Additional bars on faces
  for (let i = 1; i < barsPerFace; i++) {
    const t = i / barsPerFace
    rebarPositions.push([-inner.x + t * 2 * inner.x, -inner.z])
    rebarPositions.push([-inner.x + t * 2 * inner.x, inner.z])
  }
  rebarPositions.slice(0, nBars).forEach(([rx, rz], i) => {
    inst.push({ id: `rebar-${i}`, type: 'cylinder', position: [rx, cH / 2, rz], args: [dBar / 2, dBar / 2, cH - 0.05, 8], color: '#D64545' })
  })

  // Ties (stirrups every 200mm)
  const tieSpacing = 0.2
  const tieCount = Math.floor(cH / tieSpacing)
  for (let t = 0; t < tieCount; t++) {
    const ty = t * tieSpacing + tieSpacing / 2
    inst.push({ id: `tie-${t}`, type: 'box', position: [0, ty, cD / 2 - cover], args: [cW - cover * 2, 0.01, 0.01], color: '#f97316' })
    inst.push({ id: `tie-b-${t}`, type: 'box', position: [0, ty, -(cD / 2 - cover)], args: [cW - cover * 2, 0.01, 0.01], color: '#f97316' })
  }

  // Axial load arrow (scale with load)
  const arrowH = Math.min(0.3 + axial / 5000, 1.0)
  inst.push({ id: 'axial-arrow', type: 'cone', position: [0, cH + 0.3 + arrowH, 0], rotation: [Math.PI, 0, 0], args: [0.1, arrowH, 8], color: '#D64545' })

  // Cover dimension indicator
  inst.push({ id: 'cover-indicator', type: 'box', position: [cW / 2 - cover / 2, cH * 0.75, 0], args: [cover, 0.02, cD * 0.8], color: '#3b82f6', opacity: 0.5, transparent: true, label: '40mm cover' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'min-column-size', field: 'colWidth',
    check: (p) => num(p.colWidth) < 200 || num(p.colDepth) < 200,
    message: 'Column minimum dimension is 200mm',
    codeCitation: 'NSCP 2015 §410.8.1', severity: 'error',
    position: () => [1, 1.5, 0],
  },
  {
    id: 'rebar-ratio', field: 'rebarCount',
    check: (p) => {
      const area = mm(p.colWidth) * mm(p.colDepth)
      const dBar = mm(String(p.rebarDiameter))
      const rebarArea = num(p.rebarCount) * Math.PI * (dBar / 2) ** 2
      const ratio = rebarArea / area
      return ratio < 0.01 || ratio > 0.08
    },
    message: 'Steel ratio must be between 1% and 8% of gross section area',
    codeCitation: 'NSCP 2015 §410.9.1', severity: 'error',
    position: () => [0.5, 2, 0.5],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-cover', label: '40mm Cover', description: 'Minimum concrete cover for columns is 40mm to protect reinforcement from corrosion', codeCitation: 'NSCP 2015 §407.7.1', position: (p) => [mm(p.colWidth) / 2 + 0.4, mm(p.colHeight) * 0.75, 0] },
  { id: 'ann-ties', label: 'Column Ties', description: 'Lateral ties provide confinement and prevent buckling of longitudinal bars', codeCitation: 'NSCP 2015 §410.11', position: (p) => [-(mm(p.colWidth) / 2) - 0.5, mm(p.colHeight) / 2, 0] },
]

const presets: Preset[] = [
  { label: 'Typical Column', values: { colWidth: 400, colDepth: 400, colHeight: 3000, rebarCount: 8, rebarDiameter: '20', axialLoad: 1500 } },
  { label: 'Heavy Column', values: { colWidth: 600, colDepth: 600, colHeight: 4000, rebarCount: 12, rebarDiameter: '25', axialLoad: 4000 } },
  { label: 'Min Section', values: { colWidth: 200, colDepth: 200, colHeight: 2700, rebarCount: 4, rebarDiameter: '16', axialLoad: 300 } },
  { label: 'Wall Column', values: { colWidth: 200, colDepth: 600, colHeight: 3000, rebarCount: 8, rebarDiameter: '16', axialLoad: 1000 } },
]

export const columnInteractionDiagramConfig: ParametricSceneConfig = {
  id: 'column-interaction-diagram',
  title: 'Column Interaction Diagram',
  description: 'RC column section with axial load visualization, rebar placement, ties, and steel ratio checks per NSCP 2015.',
  subject: 'nscp',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [3, 3, 4], fov: 50 },
}
