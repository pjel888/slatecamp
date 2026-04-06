// src/app/dashboard/3d-lab/_config/modules/building-height-limits.ts
// Building Height Limits — PD 1096 Rule VII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const ZONE_LIMITS: Record<string, { maxH: number; label: string }> = {
  'R-1': { maxH: 10.5, label: 'R-1 Residential' },
  'R-2': { maxH: 15.0, label: 'R-2 Low-Rise Res.' },
  'C-1': { maxH: 15.0, label: 'C-1 Commercial' },
  'C-2': { maxH: 45.0, label: 'C-2 Commercial' },
  'I-1': { maxH: 15.0, label: 'I-1 Light Industry' },
  'MXD': { maxH: 60.0, label: 'Mixed Use' },
}

const parameters: ParameterDef[] = [
  { key: 'zoning', label: 'Zoning Classification', type: 'dropdown', default: 'R-1',
    options: Object.entries(ZONE_LIMITS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Zoning' },
  { key: 'buildingHeight', label: 'Building Height', type: 'slider', min: 3, max: 70, step: 0.5, default: 9, unit: 'm', decimals: 1, group: 'Building' },
  { key: 'numStoreys', label: 'Number of Storeys', type: 'slider', min: 1, max: 20, step: 1, default: 3, group: 'Building' },
  { key: 'constructionType', label: 'Construction Type', type: 'dropdown', default: 'Type I', options: [{ value: 'Type I', label: 'Type I (Fire-Resistive)' }, { value: 'Type II', label: 'Type II (Protected)' }, { value: 'Type III', label: 'Type III (Heavy Timber)' }, { value: 'Type IV', label: 'Type IV (Ordinary)' }, { value: 'Type V', label: 'Type V (Frame)' }], group: 'Construction' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const zone = str(params.zoning)
  const bH = num(params.buildingHeight)
  const storeys = num(params.numStoreys)
  const limit = ZONE_LIMITS[zone]?.maxH ?? 10.5
  const violated = bH > limit
  const scale = 0.15
  const bHs = bH * scale
  const limitS = limit * scale
  const bW = 3.0
  const bD = 2.5
  const stH = bHs / storeys
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.1, 0], args: [bW + 3, 0.2, bD + 3], color: '#52525b' })

  // Building floors
  for (let s = 0; s < storeys; s++) {
    const y = s * stH + stH / 2
    const floorColor = s * bH / storeys > limit ? '#fca5a5' : '#d4d4d8'
    inst.push({ id: `floor-${s}`, type: 'box', position: [0, y, 0], args: [bW, stH - 0.05, bD], color: floorColor, opacity: 0.85, transparent: true })
    inst.push({ id: `slab-${s}`, type: 'box', position: [0, s * stH, 0], args: [bW + 0.1, 0.05, bD + 0.1], color: '#71717a' })
  }
  // Roof
  inst.push({ id: 'roof', type: 'box', position: [0, bHs + 0.05, 0], args: [bW + 0.2, 0.1, bD + 0.2], color: '#52525b' })

  // Height limit plane
  inst.push({ id: 'limit-plane', type: 'box', position: [0, limitS, 0], args: [bW + 1.5, 0.02, bD + 1.5], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.5, transparent: true, label: `${limit}m limit` })

  // Height measurement arrow
  inst.push({ id: 'height-arrow', type: 'box', position: [-(bW / 2 + 0.3), bHs / 2, 0], args: [0.03, bHs, 0.03], color: violated ? '#D64545' : '#3b82f6', label: `${bH}m` })
  inst.push({ id: 'arrow-top', type: 'cone', position: [-(bW / 2 + 0.3), bHs + 0.1, 0], args: [0.08, 0.2, 6], color: violated ? '#D64545' : '#3b82f6' })

  // Neighbouring buildings for context
  inst.push({ id: 'neighbor-1', type: 'box', position: [bW + 1.5, limitS * 0.4, 0], args: [1.2, limitS * 0.8, bD * 0.8], color: '#71717a', opacity: 0.5, transparent: true })
  inst.push({ id: 'neighbor-2', type: 'box', position: [-(bW + 1.5), limitS * 0.3, 0], args: [1.2, limitS * 0.6, bD * 0.8], color: '#71717a', opacity: 0.5, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'height-limit', field: 'buildingHeight',
    check: (p) => {
      const limit = ZONE_LIMITS[str(p.zoning)]?.maxH ?? 10.5
      return num(p.buildingHeight) > limit
    },
    message: 'Building height exceeds zoning maximum for selected classification',
    codeCitation: 'PD 1096 IRR Rule VII / HLURB Zoning', severity: 'error',
    position: () => [2.5, 7, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-zone', label: 'Zoning Height Limit', description: 'Maximum allowable building height is set by local zoning ordinance aligned with PD 1096 construction type limits', codeCitation: 'PD 1096 IRR Rule VII', position: () => [3, 5, 0] },
  { id: 'ann-type', label: 'Construction Type', description: 'Type I (fire-resistive) allows greatest height; Type V (wood frame) is most restricted', codeCitation: 'PD 1096 IRR Table 7.01', position: () => [-3.5, 3, 0] },
]

const presets: Preset[] = [
  { label: 'R-1 Compliant', values: { zoning: 'R-1', buildingHeight: 9, numStoreys: 3, constructionType: 'Type I' } },
  { label: 'R-1 Violation', values: { zoning: 'R-1', buildingHeight: 13, numStoreys: 4, constructionType: 'Type II' } },
  { label: 'Commercial High-Rise', values: { zoning: 'C-2', buildingHeight: 45, numStoreys: 15, constructionType: 'Type I' } },
  { label: 'Mixed-Use Tower', values: { zoning: 'MXD', buildingHeight: 60, numStoreys: 18, constructionType: 'Type I' } },
]

export const buildingHeightLimitsConfig: ParametricSceneConfig = {
  id: 'building-height-limits',
  title: 'Building Height Limits',
  description: 'Building massing showing height limits by zoning classification and construction type per PD 1096 Rule VII.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 6, 7], fov: 50 },
}

