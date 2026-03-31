// src/app/dashboard/3d-lab/_config/modules/vent-shaft-dimensions.ts
// Vent Shaft Dimensions — PD 1096 Rule VIII §806
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'shaftWidth', label: 'Shaft Width', type: 'slider', min: 300, max: 2000, step: 50, default: 700, unit: 'mm', group: 'Shaft Dimensions' },
  { key: 'shaftDepth', label: 'Shaft Depth', type: 'slider', min: 300, max: 2000, step: 50, default: 700, unit: 'mm', group: 'Shaft Dimensions' },
  { key: 'shaftHeight', label: 'Shaft Height', type: 'slider', min: 3000, max: 30000, step: 1000, default: 12000, unit: 'mm', group: 'Shaft Dimensions' },
  { key: 'numStoreys', label: 'Storeys Served', type: 'slider', min: 2, max: 10, step: 1, default: 4, group: 'Building' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const sW = mm(params.shaftWidth)
  const sD = mm(params.shaftDepth)
  const sH = mm(params.shaftHeight)
  const storeys = num(params.numStoreys)
  const wallT = 0.15
  const area = sW * sD
  // Min requirements: area ≥ 0.10 sqm/m height AND ≥ 1.00 sqm; min dimension ≥ 600mm
  const minArea = Math.max(sH * 0.10, 1.0)
  const minDim = 0.6
  const areaOk = area >= minArea
  const dimOk = sW >= minDim && sD >= minDim
  const stH = sH / storeys
  const inst: GeometryInstruction[] = []

  // Shaft walls
  inst.push({ id: 'shaft-back', type: 'box', position: [0, sH / 2, -(sD / 2 + wallT / 2)], args: [sW + wallT * 2, sH, wallT], color: areaOk ? '#d4d4d8' : '#fca5a5' })
  inst.push({ id: 'shaft-left', type: 'box', position: [-(sW / 2 + wallT / 2), sH / 2, 0], args: [wallT, sH, sD], color: areaOk ? '#d4d4d8' : '#fca5a5' })
  inst.push({ id: 'shaft-right', type: 'box', position: [(sW / 2 + wallT / 2), sH / 2, 0], args: [wallT, sH, sD], color: areaOk ? '#d4d4d8' : '#fca5a5' })
  inst.push({ id: 'shaft-front', type: 'box', position: [0, sH / 2, sD / 2 + wallT / 2], args: [sW + wallT * 2, sH, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Interior shaft (void)
  inst.push({ id: 'shaft-void', type: 'box', position: [0, sH / 2, 0], args: [sW, sH, sD], color: '#e0f2fe', opacity: 0.15, transparent: true })

  // Airflow arrows inside shaft
  const arrowCount = Math.min(storeys, 6)
  for (let i = 0; i < arrowCount; i++) {
    const ay = (i + 0.5) * (sH / arrowCount)
    inst.push({ id: `airflow-${i}`, type: 'cone', position: [0, ay, 0], rotation: [0, 0, 0], args: [sW * 0.2, sH / arrowCount * 0.4, 8], color: '#3b82f6', opacity: 0.6, transparent: true })
  }

  // Min area plane
  inst.push({ id: 'min-area-indicator', type: 'box', position: [0, 0.02, 0], args: [Math.sqrt(minArea), 0.01, Math.sqrt(minArea)], color: areaOk ? '#2D9F6F' : '#D64545', opacity: 0.4, transparent: true, label: `Min: ${minArea.toFixed(2)} m²` })

  // Floor intersections (vent openings)
  for (let s = 0; s < storeys; s++) {
    const fy = s * stH
    inst.push({ id: `vent-opening-${s}`, type: 'box', position: [0, fy + stH / 2, sD / 2 + wallT / 2], args: [Math.min(sW * 0.6, 0.5), stH * 0.3, 0.02], color: '#2D9F6F', opacity: 0.7, transparent: true })
  }

  // Dimension markers
  inst.push({ id: 'dim-width', type: 'box', position: [0, -0.2, 0], args: [sW, 0.02, 0.02], color: dimOk ? '#2D9F6F' : '#D64545', label: `W: ${(sW * 1000).toFixed(0)}mm` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'shaft-min-dimension', field: 'shaftWidth',
    check: (p) => mm(p.shaftWidth) < 0.6 || mm(p.shaftDepth) < 0.6,
    message: 'Vent shaft minimum dimension is 600mm in any direction',
    codeCitation: 'PD 1096 IRR Rule VIII §806', severity: 'error',
    position: () => [0, 2, 1.5],
  },
  {
    id: 'shaft-min-area', field: 'shaftWidth',
    check: (p) => {
      const area = mm(p.shaftWidth) * mm(p.shaftDepth)
      const minArea = Math.max(mm(p.shaftHeight) * 0.10, 1.0)
      return area < minArea
    },
    message: 'Shaft area insufficient: must be ≥ 0.10 m²/m height and ≥ 1.00 m² minimum',
    codeCitation: 'PD 1096 IRR Rule VIII §806', severity: 'error',
    position: () => [1.5, 4, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-area-rule', label: '0.10 m²/m Height Rule', description: 'Vent shaft cross-sectional area must be not less than 0.10 sqm per meter of shaft height, minimum 1.00 sqm', codeCitation: 'PD 1096 IRR Rule VIII §806', position: (p) => [mm(p.shaftWidth) / 2 + 0.8, mm(p.shaftHeight) / 2, 0] },
  { id: 'ann-min-dim', label: 'Min 600mm Dimension', description: 'No dimension of a vent shaft may be less than 600mm for adequate airflow and maintenance access', codeCitation: 'PD 1096 IRR Rule VIII §806', position: (p) => [0, mm(p.shaftHeight) + 0.6, 0] },
]

const presets: Preset[] = [
  { label: '4-Storey Min', values: { shaftWidth: 700, shaftDepth: 700, shaftHeight: 12000, numStoreys: 4 } },
  { label: '8-Storey Shaft', values: { shaftWidth: 1000, shaftDepth: 1000, shaftHeight: 24000, numStoreys: 8 } },
  { label: '2-Storey Small', values: { shaftWidth: 600, shaftDepth: 800, shaftHeight: 6000, numStoreys: 2 } },
  { label: 'Violation Demo', values: { shaftWidth: 400, shaftDepth: 400, shaftHeight: 12000, numStoreys: 4 } },
]

export const ventShaftDimensionsConfig: ParametricSceneConfig = {
  id: 'vent-shaft-dimensions',
  title: 'Vent Shaft Dimensions',
  description: 'Vent shaft with 0.10 m²/m height rule, 600mm min dimension, and 1.00 m² minimum area per PD 1096 Rule VIII §806.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 8, 5], fov: 50 },
}
