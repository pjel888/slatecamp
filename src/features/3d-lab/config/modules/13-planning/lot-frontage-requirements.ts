// src/features/3d-lab/config/modules/13-planning/lot-frontage-requirements.ts
// Lot Frontage Requirements — PD 957 / BP 220
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const SUBDIVISION_MINIMUMS: Record<string, { minFrontage: number; minArea: number; label: string; color: string }> = {
  'open': { minFrontage: 8, minArea: 120, label: 'Open Market', color: '#3b82f6' },
  'economic': { minFrontage: 6, minArea: 64, label: 'Economic Housing', color: '#f59e0b' },
  'socialized': { minFrontage: 3.5, minArea: 36, label: 'Socialized Housing', color: '#2D9F6F' },
}

const parameters: ParameterDef[] = [
  { key: 'subdivisionType', label: 'Subdivision Type', type: 'dropdown', default: 'open',
    options: Object.entries(SUBDIVISION_MINIMUMS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Classification' },
  { key: 'lotWidth', label: 'Lot Width (Frontage)', type: 'slider', min: 3, max: 20, step: 0.5, default: 10, unit: 'm', decimals: 1, group: 'Lot Dimensions' },
  { key: 'lotDepth', label: 'Lot Depth', type: 'slider', min: 10, max: 30, step: 0.5, default: 16, unit: 'm', decimals: 1, group: 'Lot Dimensions' },
  { key: 'isCornerLot', label: 'Corner Lot', type: 'toggle', default: false, group: 'Lot Type' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const subType = str(params.subdivisionType)
  const lotW = num(params.lotWidth)
  const lotD = num(params.lotDepth)
  const isCorner = params.isCornerLot === true || params.isCornerLot === 'true'
  const spec = SUBDIVISION_MINIMUMS[subType] ?? SUBDIVISION_MINIMUMS['open']

  const frontageFail = lotW < spec.minFrontage
  const areaFail = (lotW * lotD) < spec.minArea

  const scale = 0.18
  const lWs = lotW * scale
  const lDs = lotD * scale

  // Standard setbacks (simplified)
  const frontSB = subType === 'open' ? 3.0 : subType === 'economic' ? 2.0 : 1.5
  const sideSB = subType === 'open' ? 2.0 : 1.5
  const rearSB = subType === 'open' ? 2.0 : 2.0
  const frontSBs = frontSB * scale
  const sideSBs = sideSB * scale
  const rearSBs = rearSB * scale

  const inst: GeometryInstruction[] = []

  // Road (front)
  inst.push({ id: 'road', type: 'box',
    position: [0, 0, lDs / 2 + 0.3],
    args: [lWs + 0.8 + (isCorner ? 1.0 : 0), 0.04, 0.55],
    color: '#52525b', label: 'Road' })

  // Side road (corner lot)
  if (isCorner) {
    inst.push({ id: 'road-side', type: 'box',
      position: [lWs / 2 + 0.3, 0, 0],
      args: [0.55, 0.04, lDs + 0.8],
      color: '#52525b' })
  }

  // Lot boundary
  inst.push({ id: 'lot', type: 'box',
    position: [0, 0.01, 0],
    args: [lWs, 0.02, lDs],
    color: frontageFail || areaFail ? '#fca5a5' : spec.color, opacity: 0.25, transparent: true,
    label: `${(lotW * lotD).toFixed(0)} m²` })

  // Lot border lines
  inst.push({ id: 'lot-front', type: 'box', position: [0, 0.04, lDs / 2], args: [lWs, 0.06, 0.04], color: frontageFail ? '#D64545' : '#1B3FC4' })
  inst.push({ id: 'lot-back', type: 'box', position: [0, 0.04, -lDs / 2], args: [lWs, 0.06, 0.04], color: '#71717a' })
  inst.push({ id: 'lot-left', type: 'box', position: [-lWs / 2, 0.04, 0], args: [0.04, 0.06, lDs], color: '#71717a' })
  inst.push({ id: 'lot-right', type: 'box', position: [lWs / 2, 0.04, 0], args: [0.04, 0.06, lDs], color: isCorner ? '#1B3FC4' : '#71717a' })

  // Frontage dimension indicator
  inst.push({ id: 'frontage-marker', type: 'box',
    position: [0, 0.08, lDs / 2 + 0.08],
    args: [lWs, 0.04, 0.02],
    color: frontageFail ? '#D64545' : spec.color,
    label: `Frontage: ${lotW}m (min ${spec.minFrontage}m)` })

  // Buildable area (inside setbacks)
  const buildW = Math.max(0, lWs - sideSBs * 2 - (isCorner ? sideSBs : 0))
  const buildD = Math.max(0, lDs - frontSBs - rearSBs)
  const buildX = isCorner ? sideSBs / 2 : 0
  const buildZ = -rearSBs / 2 + frontSBs / 2
  if (buildW > 0 && buildD > 0) {
    inst.push({ id: 'buildable-area', type: 'box',
      position: [buildX - (isCorner ? sideSBs / 2 : 0), 0.015, buildZ - (frontSBs - rearSBs) / 2],
      args: [buildW, 0.03, buildD],
      color: '#bfdbfe', opacity: 0.5, transparent: true, label: 'Buildable Zone' })
  }

  // Front setback band
  inst.push({ id: 'front-setback', type: 'box',
    position: [0, 0.02, lDs / 2 - frontSBs / 2],
    args: [lWs, 0.03, frontSBs],
    color: '#f97316', opacity: 0.35, transparent: true,
    label: `Front SB: ${frontSB}m` })

  // Adjacent lot (right)
  inst.push({ id: 'adj-lot-right', type: 'box',
    position: [lWs + 0.05 + lWs / 2, 0.01, 0],
    args: [lWs, 0.015, lDs],
    color: '#e4e4e7', opacity: 0.35, transparent: true })

  // Adjacent lot (left)
  inst.push({ id: 'adj-lot-left', type: 'box',
    position: [-(lWs + 0.05 + lWs / 2), 0.01, 0],
    args: [lWs, 0.015, lDs],
    color: '#e4e4e7', opacity: 0.35, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'frontage-below-min', field: 'lotWidth',
    check: (p) => {
      const spec = SUBDIVISION_MINIMUMS[str(p.subdivisionType)] ?? SUBDIVISION_MINIMUMS['open']
      return num(p.lotWidth) < spec.minFrontage
    },
    message: 'Lot frontage is below the minimum required for the subdivision type',
    codeCitation: 'PD 957 §21 — open market min 8m; BP 220 §5.2 — economic min 6m, socialized min 3.5m',
    severity: 'error',
    position: () => [0, 0.5, 1.5],
  },
  {
    id: 'area-below-min', field: 'lotWidth',
    check: (p) => {
      const spec = SUBDIVISION_MINIMUMS[str(p.subdivisionType)] ?? SUBDIVISION_MINIMUMS['open']
      return (num(p.lotWidth) * num(p.lotDepth)) < spec.minArea
    },
    message: 'Lot area is below the minimum for the subdivision classification',
    codeCitation: 'PD 957 §21 — open market min 120 m²; BP 220 §5.2 — economic min 64 m², socialized min 36 m²',
    severity: 'error',
    position: () => [0, 0.5, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-frontage', label: 'Lot Frontage', description: 'Lot frontage is the width of the lot along the road right-of-way; PD 957 sets 8m minimum for open market, BP 220 sets 6m (economic) and 3.5m (socialized)', codeCitation: 'PD 957 §21; BP 220 §5.2', position: (p) => [0, 0.4, num(p.lotDepth) * 0.18 / 2 + 0.4] },
  { id: 'ann-corner', label: 'Corner Lot Premium', description: 'Corner lots have frontage on two roads, providing flexibility in building orientation but requiring additional setbacks on the side road per PD 957 and local zoning', codeCitation: 'PD 957 §21; Local Zoning Ordinance', position: (p) => [num(p.lotWidth) * 0.18 / 2 + 0.4, 0.3, 0], visibleWhen: (p) => p.isCornerLot === true || p.isCornerLot === 'true' },
  { id: 'ann-setback', label: 'Required Setbacks', description: 'Orange band shows the mandatory front setback; open market requires 3m front, economic 2m, socialized 1.5m per BP 220 and PD 957 subdivision standards', codeCitation: 'PD 957 §22; BP 220 §5.3', position: () => [1.0, 0.3, 0.8] },
]

const presets: Preset[] = [
  { label: 'Open Market Compliant', values: { subdivisionType: 'open', lotWidth: 10, lotDepth: 16, isCornerLot: false } },
  { label: 'Open Market Violation', values: { subdivisionType: 'open', lotWidth: 6, lotDepth: 14, isCornerLot: false } },
  { label: 'Economic Housing', values: { subdivisionType: 'economic', lotWidth: 7, lotDepth: 14, isCornerLot: false } },
  { label: 'Socialized Housing', values: { subdivisionType: 'socialized', lotWidth: 4, lotDepth: 10, isCornerLot: false } },
  { label: 'Corner Lot — Open Market', values: { subdivisionType: 'open', lotWidth: 10, lotDepth: 18, isCornerLot: true } },
]

export const lotFrontageRequirementsConfig: ParametricSceneConfig = {
  id: 'lot-frontage-requirements',
  title: 'Lot Frontage Requirements',
  description: 'Plan view showing lot frontage, depth, setbacks, and minimum dimensions for open market, economic, and socialized housing subdivisions per PD 957 §21 and BP 220 §5.2.',
  subject: 'pd-957',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [0, 6.0, 3.0], fov: 58 },
}
