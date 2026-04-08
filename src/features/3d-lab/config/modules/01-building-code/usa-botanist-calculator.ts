// src/features/3d-lab/config/modules/01-building-code/usa-botanist-calculator.ts
// USA Botanist Calculator — PD 1096 Rule VII / HLURB Landscaping Guidelines
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const ZONING_USA: Record<string, { minUSA: number; treePerSqm: number; label: string }> = {
  'R-1': { minUSA: 50, treePerSqm: 200, label: 'R-1 Residential' },
  'R-2': { minUSA: 40, treePerSqm: 250, label: 'R-2 Res. Low-Rise' },
  'C-1': { minUSA: 30, treePerSqm: 350, label: 'C-1 Commercial' },
  'C-2': { minUSA: 15, treePerSqm: 500, label: 'C-2 Commercial' },
  'I-1': { minUSA: 25, treePerSqm: 400, label: 'I-1 Light Industry' },
}

const parameters: ParameterDef[] = [
  { key: 'lotArea', label: 'Lot Area', type: 'slider', min: 100, max: 2000, step: 10, default: 400, unit: 'm²', group: 'Lot' },
  { key: 'zoningType', label: 'Zoning Type', type: 'dropdown', default: 'R-1',
    options: Object.entries(ZONING_USA).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Zoning' },
  { key: 'treeCount', label: 'Tree Count', type: 'slider', min: 0, max: 20, step: 1, default: 4, group: 'Planting' },
  { key: 'shrubArea', label: 'Shrub Area', type: 'slider', min: 0, max: 200, step: 1, default: 20, unit: 'm²', group: 'Planting' },
  { key: 'pavePercent', label: 'Paved Coverage (%)', type: 'slider', min: 0, max: 50, step: 1, default: 20, unit: '%', group: 'Surfaces' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const lotArea = num(params.lotArea)
  const zone = str(params.zoningType)
  const treeCount = num(params.treeCount)
  const shrubArea = num(params.shrubArea)
  const pavePercent = num(params.pavePercent) / 100
  const spec = ZONING_USA[zone] ?? ZONING_USA['R-1']

  // Derive lot dimensions (assume square-ish)
  const lotSide = Math.sqrt(lotArea)
  const scale = 6 / lotSide // normalise to ~6 units wide
  const lW = lotSide * scale
  const lD = lotSide * scale

  const usaPercent = 100 - pavePercent * 100
  const usaViolated = usaPercent < spec.minUSA
  const reqTrees = Math.ceil(lotArea / spec.treePerSqm)
  const treeViolated = treeCount < reqTrees

  const inst: GeometryInstruction[] = []

  // Ground base
  inst.push({ id: 'lot-ground', type: 'box', position: [0, 0.01, 0], args: [lW, 0.02, lD], color: '#86efac', opacity: 0.4, transparent: true, label: `Lot: ${lotArea.toFixed(0)} m²` })

  // Lot boundary frame
  inst.push({ id: 'lot-front', type: 'box', position: [0, 0.06, lD / 2], args: [lW, 0.08, 0.05], color: '#D64545' })
  inst.push({ id: 'lot-back', type: 'box', position: [0, 0.06, -lD / 2], args: [lW, 0.08, 0.05], color: '#71717a' })
  inst.push({ id: 'lot-left', type: 'box', position: [-lW / 2, 0.06, 0], args: [0.05, 0.08, lD], color: '#71717a' })
  inst.push({ id: 'lot-right', type: 'box', position: [lW / 2, 0.06, 0], args: [0.05, 0.08, lD], color: '#71717a' })

  // Paved zone (front portion)
  const paveDepth = lD * pavePercent
  inst.push({ id: 'paved-zone', type: 'box', position: [0, 0.02, lD / 2 - paveDepth / 2], args: [lW, 0.04, paveDepth], color: '#a1a1aa', opacity: 0.6, transparent: true, label: `Paved ${(pavePercent * 100).toFixed(0)}%` })

  // Green (USA) zone
  const greenDepth = lD * (1 - pavePercent)
  inst.push({ id: 'usa-zone', type: 'box', position: [0, 0.02, -paveDepth / 2], args: [lW, 0.04, greenDepth], color: usaViolated ? '#fca5a5' : '#2D9F6F', opacity: 0.35, transparent: true, label: `USA: ${usaPercent.toFixed(0)}%` })

  // Shrub patches
  const shrubScale = Math.min(Math.sqrt(shrubArea) * scale * 0.15, lW * 0.6)
  inst.push({ id: 'shrub-patch', type: 'box', position: [-lW / 4, 0.05, -lD / 4], args: [shrubScale, 0.1, shrubScale], color: '#15803d', opacity: 0.7, transparent: true, label: `Shrubs: ${shrubArea}m²` })

  // Trees as cylinders + spheres
  const treesPerRow = Math.ceil(Math.sqrt(Math.min(treeCount, 20)))
  for (let i = 0; i < Math.min(treeCount, 20); i++) {
    const row = Math.floor(i / treesPerRow)
    const col = i % treesPerRow
    const tx = -lW / 3 + col * (lW * 0.6 / Math.max(treesPerRow - 1, 1))
    const tz = lD / 4 - row * (lD * 0.5 / Math.max(treesPerRow - 1, 1))
    inst.push({ id: `tree-trunk-${i}`, type: 'cylinder', position: [tx, 0.2, tz], args: [0.04, 0.04, 0.4, 8], color: '#78350f' })
    inst.push({ id: `tree-crown-${i}`, type: 'sphere', position: [tx, 0.55, tz], args: [0.25, 8, 8], color: treeViolated ? '#fca5a5' : '#166534' })
  }

  // Min USA indicator
  const minUSADepth = lD * (spec.minUSA / 100)
  inst.push({ id: 'min-usa-line', type: 'box', position: [0, 0.08, -lD / 2 + minUSADepth], args: [lW, 0.04, 0.04], color: '#f97316', label: `Min USA ${spec.minUSA}%` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'usa-below-minimum', field: 'pavePercent',
    check: (p) => {
      const spec = ZONING_USA[str(p.zoningType)] ?? ZONING_USA['R-1']
      return (100 - num(p.pavePercent)) < spec.minUSA
    },
    message: 'Uncovered Site Area (USA) is below the zoning minimum — reduce paved coverage',
    codeCitation: 'PD 1096 Rule VII §702 / HLURB Zoning Ordinance §6.3', severity: 'error',
    position: () => [3, 1.5, 0],
  },
  {
    id: 'insufficient-trees', field: 'treeCount',
    check: (p) => {
      const spec = ZONING_USA[str(p.zoningType)] ?? ZONING_USA['R-1']
      const reqTrees = Math.ceil(num(p.lotArea) / spec.treePerSqm)
      return num(p.treeCount) < reqTrees
    },
    message: 'Tree count is below HLURB landscaping requirement (1 tree per required lot area increment)',
    codeCitation: 'HLURB Model Zoning Ordinance §6.3.2 / DAO 2008-08 Urban Greening', severity: 'warning',
    position: () => [0, 1.5, 2],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-usa', label: 'Uncovered Site Area (USA)',
    description: 'USA is the percentage of lot area not covered by impervious surfaces. PD 1096 Rule VII sets minimum USA by zoning class to ensure stormwater infiltration and urban greenery.',
    codeCitation: 'PD 1096 Rule VII §702',
    position: (p) => [-(Math.sqrt(num(p.lotArea)) * 6 / Math.sqrt(num(p.lotArea))) / 2 - 0.8, 1, 0],
  },
  {
    id: 'ann-trees', label: 'Tree Planting Requirement',
    description: 'HLURB guidelines require minimum one tree per defined lot area increment. Trees must be indigenous species with at least 2.0m canopy spread at maturity.',
    codeCitation: 'HLURB Model Zoning Ordinance §6.3.2',
    position: () => [0, 1.5, -2],
  },
]

const presets: Preset[] = [
  { label: 'R-1 Compliant', values: { lotArea: 300, zoningType: 'R-1', treeCount: 4, shrubArea: 30, pavePercent: 30 } },
  { label: 'R-1 USA Violation', values: { lotArea: 300, zoningType: 'R-1', treeCount: 2, shrubArea: 10, pavePercent: 55 } },
  { label: 'C-1 Commercial', values: { lotArea: 800, zoningType: 'C-1', treeCount: 6, shrubArea: 60, pavePercent: 40 } },
  { label: 'I-1 Industrial', values: { lotArea: 1500, zoningType: 'I-1', treeCount: 8, shrubArea: 80, pavePercent: 45 } },
]

export const usaBotanistCalculatorConfig: ParametricSceneConfig = {
  id: 'usa-botanist-calculator',
  title: 'USA Botanist Calculator',
  description: 'Interactive lot plan showing Uncovered Site Area (USA) percentage, required tree count, and shrub patches per PD 1096 Rule VII §702 and HLURB landscaping guidelines by zoning classification.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 7, 5], fov: 50 },
}
