// src/app/dashboard/3d-lab/_config/modules/base-shear-calculator.ts
// Base Shear Calculator — NSCP Chapter 2 §208.5
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const SOIL_TYPES: Record<string, { Cv: number; Ca: number; label: string }> = {
  'SA': { Cv: 0.32, Ca: 0.32, label: 'SA — Hard Rock' },
  'SB': { Cv: 0.40, Ca: 0.40, label: 'SB — Rock' },
  'SC': { Cv: 0.56, Ca: 0.40, label: 'SC — Very Dense/Soft Rock' },
  'SD': { Cv: 0.64, Ca: 0.44, label: 'SD — Stiff Soil' },
  'SE': { Cv: 0.96, Ca: 0.64, label: 'SE — Soft Soil' },
}

const parameters: ParameterDef[] = [
  { key: 'seismicZone', label: 'Seismic Zone', type: 'dropdown', default: 'Zone 4', options: [{ value: 'Zone 2', label: 'Zone 2 (Z=0.20)' }, { value: 'Zone 4', label: 'Zone 4 (Z=0.40)' }], group: 'Seismic' },
  { key: 'soilType', label: 'Soil Profile Type', type: 'dropdown', default: 'SD', options: Object.entries(SOIL_TYPES).map(([k, v]) => ({ value: k, label: v.label })), group: 'Site' },
  { key: 'buildingWeight', label: 'Building Weight W', type: 'slider', min: 1000, max: 50000, step: 1000, default: 10000, unit: 'kN', group: 'Building' },
  { key: 'period', label: 'Fundamental Period T', type: 'slider', min: 0.1, max: 3.0, step: 0.05, default: 0.5, unit: 's', decimals: 2, group: 'Building' },
  { key: 'RFactor', label: 'R Factor', type: 'slider', min: 3.5, max: 8.5, step: 0.5, default: 8.5, decimals: 1, group: 'System' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const zone = str(params.seismicZone)
  const soil = str(params.soilType)
  const W = num(params.buildingWeight)
  const T = num(params.period)
  const R = num(params.RFactor)
  const Z = zone === 'Zone 4' ? 0.40 : 0.20
  const I = 1.0
  const soilData = SOIL_TYPES[soil] ?? SOIL_TYPES['SD']
  const Cv = soilData.Cv * Z / 0.40
  const Ca = soilData.Ca * Z / 0.40
  // V = Cv*I*W / (R*T), max = 2.5*Ca*I*W/R, min = 0.11*Ca*I*W
  const Vcalc = (Cv * I * W) / (R * T)
  const Vmax = (2.5 * Ca * I * W) / R
  const Vmin = 0.11 * Ca * I * W
  const V = Math.min(Vcalc, Vmax)
  const Vfinal = Math.max(V, Vmin)
  const scale = 0.2
  const floors = 5
  const stH = 0.6
  const bW = 1.5
  const inst: GeometryInstruction[] = []

  // Foundation
  inst.push({ id: 'foundation', type: 'box', position: [0, -0.25, 0], args: [bW + 0.5, 0.5, bW + 0.5], color: '#3f3f46' })

  // Building stories
  for (let f = 0; f < floors; f++) {
    const fY = f * stH + stH / 2
    inst.push({ id: `floor-${f}`, type: 'box', position: [0, fY, 0], args: [bW, stH - 0.02, bW * 0.6], color: '#a1a1aa', opacity: 0.7, transparent: true })
    inst.push({ id: `slab-${f}`, type: 'box', position: [0, f * stH, 0], args: [bW + 0.1, 0.04, bW * 0.65], color: '#71717a' })
  }

  // Base shear arrow
  const vScale = Math.min(Vfinal / W, 0.5) * 3
  inst.push({ id: 'base-shear', type: 'box', position: [-(bW / 2 + vScale / 2 + 0.1), 0.02, 0], args: [vScale, 0.15, 0.4], color: '#dc2626', label: `V=${(Vfinal / 1000).toFixed(0)} MN` })
  inst.push({ id: 'base-arrow', type: 'cone', position: [-(bW / 2 + 0.05), 0.02, 0], rotation: [0, Math.PI / 2, 0], args: [0.12, 0.25, 8], color: '#dc2626' })

  // Distributed story shears (inverted triangle)
  for (let f = 0; f < floors; f++) {
    const fy = f * stH + stH / 2
    const storyForce = Vfinal * (f + 1) / ((floors * (floors + 1)) / 2)
    const sfScale = (storyForce / Vfinal) * vScale * 0.8
    inst.push({ id: `story-force-${f}`, type: 'box', position: [-(bW / 2 + sfScale / 2 + 0.05), fy, 0], args: [sfScale, 0.06, 0.3], color: '#f97316', opacity: 0.7, transparent: true })
  }

  // Weight arrow (down)
  inst.push({ id: 'weight-arrow', type: 'cone', position: [0, floors * stH + 0.5, 0], rotation: [Math.PI, 0, 0], args: [0.1, 0.4, 8], color: '#52525b', label: `W=${(W / 1000).toFixed(0)}MN` })
  // Period indicator
  inst.push({ id: 'period-bar', type: 'box', position: [bW / 2 + 0.5, T * stH / 0.5 / 2, 0], args: [0.2, T * stH / 0.5, 0.2], color: '#3b82f6', label: `T=${T.toFixed(2)}s` })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-formula', label: 'V = CvIW / RT', description: 'Base shear formula: V = (Cv × I × W) / (R × T); controlled by upper limit 2.5CaIW/R and lower limit 0.11CaIW', codeCitation: 'NSCP 2015 §208.5.1', position: () => [-3.5, 3, 0] },
  { id: 'ann-period', label: 'Fundamental Period T', description: 'Longer period structures (taller buildings) generally have lower base shear; T can be calculated or estimated', codeCitation: 'NSCP 2015 §208.5.2', position: () => [2, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Typical High-Rise Z4', values: { seismicZone: 'Zone 4', soilType: 'SD', buildingWeight: 15000, period: 1.0, RFactor: 8.5 } },
  { label: 'Low-Rise Z4', values: { seismicZone: 'Zone 4', soilType: 'SC', buildingWeight: 5000, period: 0.3, RFactor: 5.5 } },
  { label: 'Soft Soil Z4', values: { seismicZone: 'Zone 4', soilType: 'SE', buildingWeight: 10000, period: 0.8, RFactor: 8.5 } },
  { label: 'Zone 2 Low-Rise', values: { seismicZone: 'Zone 2', soilType: 'SB', buildingWeight: 3000, period: 0.25, RFactor: 3.5 } },
]

export const baseShearCalculatorConfig: ParametricSceneConfig = {
  id: 'base-shear-calculator',
  title: 'Base Shear Calculator',
  description: 'Building with base shear force arrows using V=CvIW/(RT) formula with soil profile, zone, and system R-factor per NSCP 2015 §208.5.',
  subject: 'nscp',
  parameters, geometry, annotations, presets,
  camera: { position: [4, 4, 5], fov: 55 },
}
