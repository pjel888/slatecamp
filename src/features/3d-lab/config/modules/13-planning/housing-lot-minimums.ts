// src/features/3d-lab/config/modules/13-planning/housing-lot-minimums.ts
// Housing Lot Area Minimums — BP 220
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const HOUSING_MINIMUMS: Record<string, { minArea: number; minWidth: number; maxStoreys: number; label: string; color: string }> = {
  'socialized': { minArea: 36, minWidth: 4, maxStoreys: 2, label: 'Socialized Housing', color: '#2D9F6F' },
  'economic': { minArea: 64, minWidth: 6, maxStoreys: 3, label: 'Economic Housing', color: '#f59e0b' },
  'open-market': { minArea: 120, minWidth: 8, maxStoreys: 3, label: 'Open Market', color: '#3b82f6' },
}

const parameters: ParameterDef[] = [
  { key: 'housingType', label: 'Housing Type', type: 'dropdown', default: 'economic',
    options: Object.entries(HOUSING_MINIMUMS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Classification' },
  { key: 'lotArea', label: 'Lot Area', type: 'slider', min: 30, max: 200, step: 1, default: 70, unit: 'm²', group: 'Dimensions' },
  { key: 'lotWidth', label: 'Lot Width', type: 'slider', min: 3, max: 15, step: 0.5, default: 7, unit: 'm', decimals: 1, group: 'Dimensions' },
  { key: 'lotDepth', label: 'Lot Depth', type: 'slider', min: 10, max: 20, step: 0.5, default: 12, unit: 'm', decimals: 1, group: 'Dimensions' },
  { key: 'numStoreys', label: 'Number of Storeys', type: 'slider', min: 1, max: 3, step: 1, default: 2, unit: 'floors', group: 'Building' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const hType = str(params.housingType)
  const lotArea = num(params.lotArea)
  const lotW = num(params.lotWidth)
  const lotD = num(params.lotDepth)
  const storeys = num(params.numStoreys)
  const spec = HOUSING_MINIMUMS[hType] ?? HOUSING_MINIMUMS['economic']

  const areaFail = lotArea < spec.minArea
  const widthFail = lotW < spec.minWidth
  const storeyFail = storeys > spec.maxStoreys
  const anyViolation = areaFail || widthFail || storeyFail

  const scale = 0.2
  const lWs = lotW * scale
  const lDs = lotD * scale

  // Open space requirement: BP 220 requires minimum open space
  // Socialized: 3.5m² per unit, Economic: 4.5m², Open market: 7m²
  const openSpaceMin = hType === 'socialized' ? 3.5 : hType === 'economic' ? 4.5 : 7.0
  const openSpacePct = openSpaceMin / lotArea
  const openSpaceD = lDs * Math.min(openSpacePct, 0.5)

  // Building footprint: typical 60-70% max coverage
  const _maxCoverage = 0.70
  const bFootW = lWs * 0.85
  const bFootD = lDs * (1 - openSpacePct - 0.08)
  const storeySizeH = 0.25

  const inst: GeometryInstruction[] = []

  // Ground plane
  inst.push({ id: 'ground', type: 'box', position: [0, 0, 0], args: [lWs + 2.0, 0.02, lDs + 1.5], color: '#d4d4d8', opacity: 0.4, transparent: true })

  // Road at front
  inst.push({ id: 'road', type: 'box', position: [0, 0.01, lDs / 2 + 0.3], args: [lWs + 1.5, 0.03, 0.5], color: '#52525b' })

  // Lot boundary
  inst.push({ id: 'lot', type: 'box',
    position: [0, 0.02, 0],
    args: [lWs, 0.02, lDs],
    color: anyViolation ? '#fca5a5' : spec.color, opacity: 0.2, transparent: true,
    label: `${lotArea} m²` })

  // Lot borders
  inst.push({ id: 'lot-front', type: 'box', position: [0, 0.06, lDs / 2], args: [lWs, 0.08, 0.04], color: anyViolation ? '#D64545' : '#1B3FC4' })
  inst.push({ id: 'lot-back', type: 'box', position: [0, 0.06, -lDs / 2], args: [lWs, 0.08, 0.04], color: '#71717a' })
  inst.push({ id: 'lot-left', type: 'box', position: [-lWs / 2, 0.06, 0], args: [0.04, 0.08, lDs], color: '#71717a' })
  inst.push({ id: 'lot-right', type: 'box', position: [lWs / 2, 0.06, 0], args: [0.04, 0.08, lDs], color: '#71717a' })

  // Building (multi-storey)
  const buildZ = -(openSpaceD / 2)
  const totalBuildH = storeys * storeySizeH
  inst.push({ id: 'building', type: 'box',
    position: [0, totalBuildH / 2 + 0.03, buildZ],
    args: [bFootW, totalBuildH, bFootD],
    color: anyViolation ? '#fca5a5' : spec.color, opacity: 0.85, transparent: true,
    label: `${storeys}F building` })

  // Storey lines
  for (let s = 1; s < storeys; s++) {
    inst.push({ id: `storey-line-${s}`, type: 'box',
      position: [0, s * storeySizeH + 0.03, buildZ],
      args: [bFootW + 0.01, 0.015, bFootD + 0.01],
      color: '#1B3FC4', opacity: 0.5, transparent: true })
  }

  // Open space / yard area
  inst.push({ id: 'open-space', type: 'box',
    position: [0, 0.025, lDs / 2 - openSpaceD / 2],
    args: [lWs, 0.03, openSpaceD],
    color: '#2D9F6F', opacity: 0.4, transparent: true,
    label: `Open: ${openSpaceMin}m²` })

  // Min area indicator line
  const minAreaSqrtD = Math.sqrt(spec.minArea / (lotW / lotD)) * scale
  inst.push({ id: 'min-area-line', type: 'box',
    position: [0, 0.05, -lDs / 2 + minAreaSqrtD],
    args: [lWs + 0.1, 0.03, 0.03],
    color: areaFail ? '#D64545' : '#2D9F6F',
    label: `Min: ${spec.minArea} m²` })

  // Width dimension marker
  inst.push({ id: 'width-marker', type: 'box',
    position: [0, 0.1, lDs / 2 + 0.12],
    args: [lWs, 0.04, 0.02],
    color: widthFail ? '#D64545' : '#1B3FC4',
    label: `W: ${lotW}m (min ${spec.minWidth}m)` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'area-below-min', field: 'lotArea',
    check: (p) => {
      const spec = HOUSING_MINIMUMS[str(p.housingType)] ?? HOUSING_MINIMUMS['economic']
      return num(p.lotArea) < spec.minArea
    },
    message: 'Lot area is below the minimum required for this housing classification',
    codeCitation: 'BP 220 §5.2 — socialized min 36 m², economic min 64 m², open market min 120 m²',
    severity: 'error',
    position: () => [1.5, 0.5, 0],
  },
  {
    id: 'width-below-min', field: 'lotWidth',
    check: (p) => {
      const spec = HOUSING_MINIMUMS[str(p.housingType)] ?? HOUSING_MINIMUMS['economic']
      return num(p.lotWidth) < spec.minWidth
    },
    message: 'Lot width is below the minimum frontage for this housing classification',
    codeCitation: 'BP 220 §5.2 — socialized min 4m, economic min 6m, open market min 8m',
    severity: 'error',
    position: () => [0, 0.5, 1.5],
  },
  {
    id: 'storeys-exceed-max', field: 'numStoreys',
    check: (p) => {
      const spec = HOUSING_MINIMUMS[str(p.housingType)] ?? HOUSING_MINIMUMS['economic']
      return num(p.numStoreys) > spec.maxStoreys
    },
    message: 'Number of storeys exceeds maximum allowed for socialized housing lots',
    codeCitation: 'BP 220 §6 — socialized housing units shall not exceed 2 storeys',
    severity: 'warning',
    position: () => [0, 1.2, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-min-area', label: 'Minimum Lot Area', description: 'BP 220 sets binding minimum lot areas by housing type: socialized 36 m², economic 64 m², open market 120 m² — these are absolute floors that cannot be reduced', codeCitation: 'BP 220 §5.2', position: (p) => [num(p.lotWidth) * 0.2 / 2 + 0.4, 0.4, 0] },
  { id: 'ann-open-space', label: 'Minimum Open Space', description: 'Each housing unit must provide a minimum open space (yard, garden, service area): socialized 3.5 m², economic 4.5 m², open market 7 m² per BP 220 §5.3', codeCitation: 'BP 220 §5.3', position: (p) => [num(p.lotWidth) * 0.2 / 2 + 0.3, 0.2, num(p.lotDepth) * 0.2 / 2 - 0.3] },
  { id: 'ann-storeys', label: 'Storey Limit', description: 'Socialized housing units are limited to 2 storeys per BP 220 §6; economic and open market may be up to 3 storeys depending on local zoning', codeCitation: 'BP 220 §6', position: () => [-1.2, 0.8, 0] },
]

const presets: Preset[] = [
  { label: 'Economic Compliant', values: { housingType: 'economic', lotArea: 70, lotWidth: 7, lotDepth: 12, numStoreys: 2 } },
  { label: 'Socialized Compliant', values: { housingType: 'socialized', lotArea: 40, lotWidth: 4, lotDepth: 10, numStoreys: 2 } },
  { label: 'Socialized — Area Violation', values: { housingType: 'socialized', lotArea: 30, lotWidth: 3, lotDepth: 10, numStoreys: 2 } },
  { label: 'Open Market', values: { housingType: 'open-market', lotArea: 150, lotWidth: 10, lotDepth: 15, numStoreys: 3 } },
  { label: 'Economic Storey Violation', values: { housingType: 'socialized', lotArea: 40, lotWidth: 4, lotDepth: 10, numStoreys: 3 } },
]

export const housingLotMinimumsConfig: ParametricSceneConfig = {
  id: 'housing-lot-minimums',
  title: 'Housing Lot Area Minimums',
  description: 'Lot boundary with building footprint and open space showing minimum area, width, and storey limits for socialized, economic, and open market housing per BP 220 §5.2.',
  subject: 'bp-220',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [2.5, 3.5, 3.0], fov: 55 },
}
