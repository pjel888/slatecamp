// src/app/dashboard/3d-lab/_config/modules/housing-open-space.ts
// Housing Open Space — PD 957 / BP 220
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const HOUSING_STANDARDS: Record<string, { minLot: number; minFloor: number; openSpace: number; label: string; color: string }> = {
  'PD957-single':    { minLot: 120, minFloor: 42, openSpace: 30, label: 'PD 957 — Single Detached', color: '#3b82f6' },
  'PD957-row':       { minLot: 60,  minFloor: 42, openSpace: 20, label: 'PD 957 — Rowhouse', color: '#6366f1' },
  'BP220-socialize': { minLot: 64,  minFloor: 22, openSpace: 15, label: 'BP 220 — Socialized', color: '#f97316' },
  'BP220-row':       { minLot: 28,  minFloor: 22, openSpace: 10, label: 'BP 220 — Socialized Rowhouse', color: '#D64545' },
  'PD957-condo':     { minLot: 0,   minFloor: 18, openSpace: 35, label: 'PD 957 — Condominium', color: '#2D9F6F' },
}

const parameters: ParameterDef[] = [
  { key: 'housingStandard', label: 'Housing Standard', type: 'dropdown', default: 'PD957-single',
    options: Object.entries(HOUSING_STANDARDS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Standard' },
  { key: 'lotWidth', label: 'Lot Width', type: 'slider', min: 5, max: 20, step: 0.5, default: 10, unit: 'm', decimals: 1, group: 'Lot' },
  { key: 'lotDepth', label: 'Lot Depth', type: 'slider', min: 8, max: 25, step: 0.5, default: 15, unit: 'm', decimals: 1, group: 'Lot' },
  { key: 'floorArea', label: 'Floor Area', type: 'slider', min: 15, max: 150, step: 1, default: 45, unit: 'sqm', group: 'Building' },
  { key: 'numStoreys', label: 'Storeys', type: 'slider', min: 1, max: 3, step: 1, default: 2, group: 'Building' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const stdKey = str(params.housingStandard)
  const lW = num(params.lotWidth)
  const lD = num(params.lotDepth)
  const floorA = num(params.floorArea)
  const storeys = num(params.numStoreys)
  const std = HOUSING_STANDARDS[stdKey] ?? HOUSING_STANDARDS['PD957-single']
  const lotArea = lW * lD
  const coverage = floorA / lotArea
  const openSpacePct = (1 - coverage) * 100
  const violatesLot = lotArea < std.minLot
  const violatesFloor = floorA < std.minFloor
  const violatesOpen = openSpacePct < std.openSpace
  const scale = 0.25
  const lWs = lW * scale
  const lDs = lD * scale
  const stH = 0.7
  const bA = Math.sqrt(floorA * (lW / lD)) * scale
  const bDs = Math.sqrt(floorA * (lD / lW)) * scale
  const frontSB = 1.5 * scale
  const sideSB = 0.75 * scale
  const inst: GeometryInstruction[] = []

  // Lot boundary
  const lotColor = violatesLot ? '#fca5a5' : '#d4d4d8'
  inst.push({ id: 'lot-floor', type: 'box', position: [0, -0.02, 0], args: [lWs, 0.04, lDs], color: '#4d7c0f', opacity: 0.25, transparent: true, label: `Lot: ${lotArea.toFixed(0)} sqm` })
  inst.push({ id: 'lot-left', type: 'box', position: [-lWs / 2, 0.04, 0], args: [0.04, 0.08, lDs], color: violatesLot ? '#D64545' : '#71717a' })
  inst.push({ id: 'lot-right', type: 'box', position: [lWs / 2, 0.04, 0], args: [0.04, 0.08, lDs], color: violatesLot ? '#D64545' : '#71717a' })
  inst.push({ id: 'lot-back', type: 'box', position: [0, 0.04, -lDs / 2], args: [lWs, 0.08, 0.04], color: violatesLot ? '#D64545' : '#71717a' })
  inst.push({ id: 'lot-front', type: 'box', position: [0, 0.04, lDs / 2], args: [lWs, 0.08, 0.04], color: '#D64545', label: 'Street' })

  // Setback zones
  inst.push({ id: 'setback-front', type: 'box', position: [0, 0.01, lDs / 2 - frontSB / 2], args: [lWs, 0.02, frontSB], color: '#f97316', opacity: 0.25, transparent: true, label: `${(1.5).toFixed(1)}m SB` })

  // Building footprint
  const buildingZ = -(lDs / 2) + frontSB + bDs / 2
  for (let s = 0; s < storeys; s++) {
    inst.push({ id: `story-${s}`, type: 'box', position: [0, s * stH + stH / 2, buildingZ], args: [bA, stH - 0.02, bDs], color: violatesFloor ? '#fca5a5' : std.color, opacity: 0.8, transparent: true })
    inst.push({ id: `floor-slab-${s}`, type: 'box', position: [0, s * stH, buildingZ], args: [bA + 0.03, 0.03, bDs + 0.03], color: '#71717a' })
  }
  // Roof
  inst.push({ id: 'roof', type: 'cone', position: [0, storeys * stH + 0.15, buildingZ], rotation: [0, Math.PI / 4, 0], args: [Math.min(bA, bDs) * 0.8, 0.3, 4], color: '#D64545' })

  // Open space indicator
  const openA = lotArea - floorA
  const openColor = violatesOpen ? '#fca5a5' : '#2D9F6F'
  const openS = Math.sqrt(openA) * scale
  inst.push({ id: 'open-space', type: 'box', position: [0, 0.005, lDs / 2 - frontSB - openS / 2], args: [Math.min(openS, lWs * 0.8), 0.01, Math.min(openS, lDs * 0.4)], color: openColor, opacity: 0.4, transparent: true, label: `Open: ${openA.toFixed(0)} sqm` })

  // Standards comparison bars
  inst.push({ id: 'lot-req-bar', type: 'box', position: [lWs / 2 + 0.5, std.minLot * 0.003, 0], args: [0.2, std.minLot * 0.006, 0.2], color: violatesLot ? '#D64545' : '#2D9F6F', label: `Min Lot: ${std.minLot} sqm` })
  inst.push({ id: 'floor-req-bar', type: 'box', position: [lWs / 2 + 0.9, std.minFloor * 0.005, 0], args: [0.2, std.minFloor * 0.01, 0.2], color: violatesFloor ? '#D64545' : '#3b82f6', label: `Min FA: ${std.minFloor} sqm` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'min-lot-area', field: 'lotWidth',
    check: (p) => {
      const std = HOUSING_STANDARDS[str(p.housingStandard)] ?? HOUSING_STANDARDS['PD957-single']
      return std.minLot > 0 && num(p.lotWidth) * num(p.lotDepth) < std.minLot
    },
    message: 'Lot area below minimum for selected housing standard',
    codeCitation: 'PD 957 / BP 220', severity: 'error',
    position: () => [3, 2, 0],
  },
  {
    id: 'min-floor-area', field: 'floorArea',
    check: (p) => {
      const std = HOUSING_STANDARDS[str(p.housingStandard)] ?? HOUSING_STANDARDS['PD957-single']
      return num(p.floorArea) < std.minFloor
    },
    message: 'Floor area below minimum for selected housing standard',
    codeCitation: 'PD 957 / BP 220', severity: 'error',
    position: () => [0, 2, -2],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-pd957', label: 'PD 957: Min 120 sqm Lot', description: 'PD 957 (Subdivision and Condominium Buyers Protective Decree): single detached min 120 sqm lot area, 42 sqm floor area', codeCitation: 'PD 957 §17', position: () => [-4, 2, 0] },
  { id: 'ann-bp220', label: 'BP 220: Socialized 64 sqm Lot', description: 'BP 220 (Socialized/Economic Housing): 64 sqm lot, 22 sqm floor area minimum; rowhouse 28 sqm lot', codeCitation: 'BP 220 §5', position: () => [4, 2, 0] },
]

const presets: Preset[] = [
  { label: 'PD 957 Single Detached', values: { housingStandard: 'PD957-single', lotWidth: 10, lotDepth: 15, floorArea: 65, numStoreys: 2 } },
  { label: 'PD 957 Rowhouse', values: { housingStandard: 'PD957-row', lotWidth: 6, lotDepth: 12, floorArea: 50, numStoreys: 2 } },
  { label: 'BP 220 Socialized', values: { housingStandard: 'BP220-socialize', lotWidth: 8, lotDepth: 10, floorArea: 25, numStoreys: 1 } },
  { label: 'Violation Demo', values: { housingStandard: 'PD957-single', lotWidth: 8, lotDepth: 10, floorArea: 30, numStoreys: 1 } },
]

export const housingOpenSpaceConfig: ParametricSceneConfig = {
  id: 'housing-open-space',
  title: 'Housing Open Space Requirements',
  description: 'Lot model showing PD 957 and BP 220 minimum lot areas, floor areas, and open space requirements for various housing types.',
  subject: 'housing',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 6, 5], fov: 55 },
}
