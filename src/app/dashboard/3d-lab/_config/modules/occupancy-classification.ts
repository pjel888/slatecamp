// src/app/dashboard/3d-lab/_config/modules/occupancy-classification.ts
// Occupancy Classification — PD 1096 Rule VII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const OCCUPANCY_DATA: Record<string, { color: string; fireRating: string; egress: number; label: string }> = {
  'A': { color: '#3b82f6', fireRating: 'Type I (4hr)', egress: 2, label: 'Residential' },
  'B': { color: '#6366f1', fireRating: 'Type II (2hr)', egress: 2, label: 'Residential Hotel' },
  'C': { color: '#f97316', fireRating: 'Type II (2hr)', egress: 2, label: 'Education' },
  'D': { color: '#dc2626', fireRating: 'Type I (4hr)', egress: 3, label: 'Institutional' },
  'E': { color: '#16a34a', fireRating: 'Type II (2hr)', egress: 2, label: 'Business/Mercantile' },
  'F': { color: '#ca8a04', fireRating: 'Type I (4hr)', egress: 2, label: 'Industrial' },
  'G': { color: '#7c3aed', fireRating: 'Type I (4hr)', egress: 2, label: 'Storage/Hazardous' },
  'H': { color: '#0891b2', fireRating: 'Type II (2hr)', egress: 2, label: 'Assembly' },
  'I': { color: '#be185d', fireRating: 'Type II (2hr)', egress: 2, label: 'Assembly (Large)' },
  'J': { color: '#4d7c0f', fireRating: 'Type III (1hr)', egress: 1, label: 'Accessory' },
}

const parameters: ParameterDef[] = [
  { key: 'occupancyGroup', label: 'Occupancy Group', type: 'dropdown', default: 'A',
    options: Object.entries(OCCUPANCY_DATA).map(([k, v]) => ({ value: k, label: `Group ${k} — ${v.label}` })),
    group: 'Classification' },
  { key: 'numStoreys', label: 'Number of Storeys', type: 'slider', min: 1, max: 6, step: 1, default: 3, group: 'Building' },
  { key: 'floorArea', label: 'Floor Area', type: 'slider', min: 50, max: 2000, step: 50, default: 400, unit: 'sqm', group: 'Building' },
  { key: 'showEgressPaths', label: 'Show Egress Paths', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const group = str(params.occupancyGroup)
  const storeys = num(params.numStoreys)
  const area = num(params.floorArea)
  const showEgress = Boolean(params.showEgressPaths)
  const data = OCCUPANCY_DATA[group] ?? OCCUPANCY_DATA['A']
  const side = Math.sqrt(area) * 0.1
  const stH = 3.0
  const inst: GeometryInstruction[] = []

  // Base slab
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [side + 0.3, 0.2, side + 0.3], color: '#52525b' })

  for (let s = 0; s < storeys; s++) {
    const y = s * stH + stH / 2
    // Floor plate
    inst.push({ id: `floor-${s}`, type: 'box', position: [0, s * stH, 0], args: [side, 0.15, side], color: '#a1a1aa' })
    // Walls (4 sides, transparent front)
    inst.push({ id: `wall-back-${s}`, type: 'box', position: [0, y, -(side / 2 + 0.075)], args: [side, stH, 0.15], color: data.color, opacity: 0.8, transparent: true })
    inst.push({ id: `wall-left-${s}`, type: 'box', position: [-(side / 2 + 0.075), y, 0], args: [0.15, stH, side], color: data.color, opacity: 0.8, transparent: true })
    inst.push({ id: `wall-right-${s}`, type: 'box', position: [(side / 2 + 0.075), y, 0], args: [0.15, stH, side], color: data.color, opacity: 0.3, transparent: true })
    inst.push({ id: `wall-front-${s}`, type: 'box', position: [0, y, (side / 2 + 0.075)], args: [side, stH, 0.15], color: data.color, opacity: 0.15, transparent: true })
    // Fire rating band at slab
    inst.push({ id: `rating-band-${s}`, type: 'box', position: [0, s * stH + 0.08, 0], args: [side + 0.1, 0.05, side + 0.1], color: data.color })
  }
  // Roof
  inst.push({ id: 'roof', type: 'box', position: [0, storeys * stH, 0], args: [side + 0.3, 0.15, side + 0.3], color: '#71717a' })

  // Egress paths (stairs at corners)
  if (showEgress) {
    const egressCount = data.egress
    const positions: [number, number, number][] = [[-side / 2 - 0.5, 0.5, -side / 2 - 0.5], [side / 2 + 0.5, 0.5, -side / 2 - 0.5]]
    for (let e = 0; e < egressCount && e < positions.length; e++) {
      inst.push({ id: `egress-${e}`, type: 'box', position: positions[e], args: [0.9, storeys * stH, 0.9], color: '#16a34a', opacity: 0.6, transparent: true, label: `Exit ${e + 1}` })
    }
  }

  // Group label sphere on top
  inst.push({ id: 'group-marker', type: 'sphere', position: [0, storeys * stH + 0.8, 0], args: [0.4, 16, 16], color: data.color })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'egress-count', field: 'occupancyGroup',
    check: (p) => {
      const d = OCCUPANCY_DATA[str(p.occupancyGroup)]
      return d ? num(p.numStoreys) > 2 && d.egress < 2 : false
    },
    message: 'Buildings over 2 storeys require at least 2 egress stairways',
    codeCitation: 'PD 1096 Rule VII §701', severity: 'error',
    position: () => [3, 2, 3],
  },
  {
    id: 'high-hazard-storeys', field: 'occupancyGroup',
    check: (p) => str(p.occupancyGroup) === 'G' && num(p.numStoreys) > 2,
    message: 'Group G (Hazardous) occupancy: consult fire marshal for height limits',
    codeCitation: 'PD 1096 Rule VII §707', severity: 'warning',
    position: () => [3, 4, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-group', label: 'Occupancy Group', description: 'PD 1096 classifies buildings into Groups A–J based on use and hazard level', codeCitation: 'PD 1096 Rule VII', position: (p) => [Math.sqrt(num(p.floorArea)) * 0.05 + 1, num(p.numStoreys) * 3 + 1, 0] },
  { id: 'ann-egress', label: 'Required Egress', description: 'Minimum number of exits depends on occupancy group and occupant load', codeCitation: 'PD 1096 Rule VII §701', position: () => [-3, 1, -3] },
  { id: 'ann-fire-rating', label: 'Fire Resistance', description: 'Construction type and fire ratings are mandated per occupancy classification', codeCitation: 'PD 1096 Rule II', position: () => [0, 0.5, 3] },
]

const presets: Preset[] = [
  { label: 'Residential (Grp A)', values: { occupancyGroup: 'A', numStoreys: 3, floorArea: 200, showEgressPaths: true } },
  { label: 'Assembly Hall (Grp H)', values: { occupancyGroup: 'H', numStoreys: 1, floorArea: 1500, showEgressPaths: true } },
  { label: 'Industrial (Grp F)', values: { occupancyGroup: 'F', numStoreys: 2, floorArea: 800, showEgressPaths: true } },
  { label: 'Hospital (Grp D)', values: { occupancyGroup: 'D', numStoreys: 5, floorArea: 1000, showEgressPaths: true } },
]

export const occupancyClassificationConfig: ParametricSceneConfig = {
  id: 'occupancy-classification',
  title: 'Occupancy Classification',
  description: 'Interactive building sections showing 10 occupancy groups (A–J) per PD 1096 Rule VII with fire resistance ratings and egress requirements.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [8, 6, 8], fov: 45 },
}
