// src/app/dashboard/3d-lab/_config/modules/court-requirements.ts
// Court Requirements — PD 1096 Rule VIII §805
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'courtWidth', label: 'Court Width', type: 'slider', min: 500, max: 5000, step: 100, default: 2000, unit: 'mm', group: 'Court Dimensions' },
  { key: 'courtDepth', label: 'Court Depth', type: 'slider', min: 500, max: 5000, step: 100, default: 3000, unit: 'mm', group: 'Court Dimensions' },
  { key: 'numStoreys', label: 'Number of Storeys', type: 'slider', min: 1, max: 8, step: 1, default: 3, group: 'Building' },
  { key: 'courtType', label: 'Court Type', type: 'dropdown', default: 'inner', options: [{ value: 'inner', label: 'Inner Court' }, { value: 'outer', label: 'Outer Court' }], group: 'Court Type' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cW = mm(params.courtWidth)
  const cD = mm(params.courtDepth)
  const storeys = num(params.numStoreys)
  const courtType = String(params.courtType)
  const stH = 3.0
  const wallT = 0.2
  const totalH = storeys * stH
  // Min width: 2.00m base + 0.30m per storey above 2nd
  const minW = 2.0 + Math.max(0, storeys - 2) * 0.3
  const violated = cW < minW
  const bW = cW + 3.0
  const bD = cD + 3.0
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.1, 0], args: [bW + 2, 0.2, bD + 2], color: '#52525b' })

  // Building walls around court
  inst.push({ id: 'bld-back', type: 'box', position: [0, totalH / 2, -(cD / 2 + 1.5 + wallT / 2)], args: [bW, totalH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'bld-front', type: 'box', position: [0, totalH / 2, cD / 2 + 1.5 + wallT / 2], args: [bW, totalH, wallT], color: '#d4d4d8', opacity: courtType === 'outer' ? 0.1 : 0.8, transparent: true })
  inst.push({ id: 'bld-left', type: 'box', position: [-(cW / 2 + 1.5 + wallT / 2), totalH / 2, 0], args: [wallT, totalH, cD + 3.0], color: '#d4d4d8' })
  inst.push({ id: 'bld-right', type: 'box', position: [(cW / 2 + 1.5 + wallT / 2), totalH / 2, 0], args: [wallT, totalH, cD + 3.0], color: '#d4d4d8' })

  // Court floor
  inst.push({ id: 'court-floor', type: 'box', position: [0, 0.005, 0], args: [cW, 0.01, cD], color: '#2D9F6F', opacity: 0.4, transparent: true })
  // Court walls (visible interior)
  inst.push({ id: 'court-wall-back', type: 'box', position: [0, totalH / 2, -(cD / 2)], args: [cW, totalH, wallT / 2], color: violated ? '#fca5a5' : '#a1a1aa', opacity: 0.6, transparent: true })
  inst.push({ id: 'court-wall-left', type: 'box', position: [-(cW / 2), totalH / 2, 0], args: [wallT / 2, totalH, cD], color: violated ? '#fca5a5' : '#a1a1aa', opacity: 0.6, transparent: true })

  // Min width indicator
  inst.push({ id: 'min-width-line', type: 'box', position: [0, 0.02, 0], args: [minW, 0.01, cD], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.4, transparent: true, label: `Min ${minW.toFixed(1)}m` })

  // Floor level markers
  for (let s = 0; s < storeys; s++) {
    inst.push({ id: `floor-line-${s}`, type: 'box', position: [cW / 2 + 0.3, s * stH, 0], args: [0.4, 0.05, cD + 3.5], color: '#71717a' })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'court-min-width', field: 'courtWidth',
    check: (p) => {
      const minW = 2.0 + Math.max(0, num(p.numStoreys) - 2) * 0.3
      return mm(p.courtWidth) < minW
    },
    message: 'Court width below minimum: 2.00m base + 300mm per storey above 2nd',
    codeCitation: 'PD 1096 IRR Rule VIII §805', severity: 'error',
    position: (p) => [mm(p.courtWidth) / 2 + 0.5, 2, 0],
  },
  {
    id: 'court-min-depth', field: 'courtDepth',
    check: (p) => mm(p.courtDepth) < 3.0,
    message: 'Court depth below recommended 3.00m for effective natural light',
    codeCitation: 'PD 1096 IRR Rule VIII §805', severity: 'warning',
    position: (p) => [0, 2, mm(p.courtDepth) / 2 + 0.5],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-min-width', label: 'Min Court Width', description: 'Minimum horizontal dimension: 2.00m for ≤2 storeys, +300mm for each additional storey above 2nd', codeCitation: 'PD 1096 IRR Rule VIII §805', position: (p) => [-(mm(p.courtWidth) / 2) - 0.8, num(p.numStoreys) * 3 / 2, 0] },
  { id: 'ann-sky-access', label: 'Sky Access', description: 'Courts must provide natural light and ventilation from sky; ratio of width to height affects performance', codeCitation: 'PD 1096 IRR Rule VIII §805', position: (p) => [0, num(p.numStoreys) * 3 + 0.8, 0] },
]

const presets: Preset[] = [
  { label: '2-Storey Min', values: { courtWidth: 2000, courtDepth: 3000, numStoreys: 2, courtType: 'inner' } },
  { label: '4-Storey Min', values: { courtWidth: 2600, courtDepth: 3500, numStoreys: 4, courtType: 'inner' } },
  { label: '6-Storey Min', values: { courtWidth: 3200, courtDepth: 4000, numStoreys: 6, courtType: 'inner' } },
  { label: 'Violation Demo', values: { courtWidth: 1500, courtDepth: 2000, numStoreys: 5, courtType: 'inner' } },
]

export const courtRequirementsConfig: ParametricSceneConfig = {
  id: 'court-requirements',
  title: 'Court Requirements',
  description: 'Building section showing courts growing with height: 2.00m base + 300mm per storey above 2nd floor per PD 1096 Rule VIII §805.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 6, 8], fov: 50 },
}

