// src/features/3d-lab/config/modules/03-fire-code/fire-rated-barrier.ts
// Fire-Rated Barrier — RA 9514 IRR Rule 10 §10.2
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function _num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

// Required layers by fire rating (hours)
const RATING_LAYERS: Record<string, { gypsumLayers: number; insulationThick: number; label: string; studSpacing: number }> = {
  '1hr': { gypsumLayers: 1, insulationThick: 89, label: '1-Hour Rating', studSpacing: 600 },
  '2hr': { gypsumLayers: 2, insulationThick: 89, label: '2-Hour Rating', studSpacing: 400 },
  '3hr': { gypsumLayers: 2, insulationThick: 140, label: '3-Hour Rating', studSpacing: 400 },
  '4hr': { gypsumLayers: 3, insulationThick: 140, label: '4-Hour Rating', studSpacing: 300 },
}

const parameters: ParameterDef[] = [
  { key: 'barrierType', label: 'Barrier Type', type: 'dropdown', default: 'partition',
    options: [{ value: 'partition', label: 'Fire Partition' }, { value: 'wall', label: 'Fire Wall' }, { value: 'floor', label: 'Fire Floor/Ceiling' }],
    group: 'Assembly' },
  { key: 'fireRating', label: 'Fire Rating', type: 'dropdown', default: '2hr',
    options: Object.entries(RATING_LAYERS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Assembly' },
  { key: 'hasPenetration', label: 'Has Penetration', type: 'toggle', default: false, group: 'Penetration' },
  { key: 'penetrationType', label: 'Penetration Type', type: 'dropdown', default: 'pipe',
    options: [{ value: 'pipe', label: 'Pipe / Conduit' }, { value: 'duct', label: 'HVAC Duct' }, { value: 'cable', label: 'Cable Bundle' }],
    group: 'Penetration' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const rating = str(params.fireRating)
  const barrierType = str(params.barrierType)
  const hasPen = params.hasPenetration === true || params.hasPenetration === 'true'
  const penType = str(params.penetrationType)
  const spec = RATING_LAYERS[rating] ?? RATING_LAYERS['2hr']
  const isFloor = barrierType === 'floor'

  const wallH = isFloor ? 0.3 : 3.0
  const wallW = 2.5
  const wallD = 0.2
  const gypsumT = 0.015 * spec.gypsumLayers
  const insulT = spec.insulationThick / 1000
  const totalT = gypsumT * 2 + insulT + 0.09 // gypsum both sides + insulation + studs

  const inst: GeometryInstruction[] = []

  // Base/floor context
  inst.push({ id: 'floor-left', type: 'box', position: [-1.5, 0, -0.8], args: [3, 0.05, 1.6], color: '#e4e4e7', opacity: 0.5, transparent: true })
  inst.push({ id: 'floor-right', type: 'box', position: [1.5, 0, -0.8], args: [3, 0.05, 1.6], color: '#e4e4e7', opacity: 0.5, transparent: true })

  const cx = 0
  const cy = isFloor ? 1.2 : wallH / 2
  const cz = 0
  const rX = isFloor ? Math.PI / 2 : 0

  // Insulation core
  inst.push({ id: 'insulation', type: 'box', position: [cx, cy, cz], rotation: [rX, 0, 0],
    args: [wallW, isFloor ? wallD : wallH, insulT], color: '#fbbf24', opacity: 0.85, transparent: true, label: `Insulation ${spec.insulationThick}mm` })

  // Gypsum board — side A
  const gA = insulT / 2 + gypsumT / 2
  inst.push({ id: 'gypsum-a', type: 'box', position: [cx, cy, cz + gA + (isFloor ? 0 : 0)], rotation: [rX, 0, 0],
    args: [wallW, isFloor ? wallD : wallH, gypsumT], color: '#f1f5f9', opacity: 0.9, transparent: true, label: `Gypsum ×${spec.gypsumLayers}` })

  // Gypsum board — side B
  inst.push({ id: 'gypsum-b', type: 'box', position: [cx, cy, cz - (insulT / 2 + gypsumT / 2)], rotation: [rX, 0, 0],
    args: [wallW, isFloor ? wallD : wallH, gypsumT], color: '#f1f5f9', opacity: 0.9, transparent: true })

  // Steel studs (simplified as narrow boxes)
  const numStuds = Math.floor(wallW / (spec.studSpacing / 1000)) + 1
  for (let i = 0; i < numStuds; i++) {
    const sx = -wallW / 2 + i * (spec.studSpacing / 1000)
    inst.push({ id: `stud-${i}`, type: 'box',
      position: [sx, cy, cz], rotation: [rX, 0, 0],
      args: [0.04, isFloor ? wallD - 0.02 : wallH - 0.1, insulT - 0.01],
      color: '#94a3b8', opacity: 0.8, transparent: true })
  }

  // Rating badge
  inst.push({ id: 'rating-badge', type: 'box', position: [0, isFloor ? 1.8 : wallH + 0.15, 0],
    args: [0.6, 0.12, 0.02], color: '#1B3FC4', label: `${rating.toUpperCase()} Assembly` })

  // Penetration
  if (hasPen) {
    const pSize = penType === 'duct' ? 0.3 : penType === 'pipe' ? 0.1 : 0.08
    const pColor = '#6366f1'
    inst.push({ id: 'penetration', type: 'cylinder',
      position: [0.5, isFloor ? 1.2 : 1.3, 0],
      rotation: [Math.PI / 2, 0, 0],
      args: [pSize / 2, pSize / 2, totalT + 0.1, 12],
      color: pColor, opacity: 0.8, transparent: true, label: penType })

    // Firestop — show as red ring around penetration if unsealed
    const firestopColor = '#D64545'
    inst.push({ id: 'firestop-gap', type: 'ring',
      position: [0.5, isFloor ? 1.2 : 1.3, 0],
      rotation: [Math.PI / 2, 0, 0],
      args: [pSize / 2 + 0.01, pSize / 2 + 0.06, 16],
      color: firestopColor, opacity: 0.8, transparent: true, label: 'Unsealed — Violation' })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'unsealed-penetration', field: 'hasPenetration',
    check: (p) => (p.hasPenetration === true || p.hasPenetration === 'true'),
    message: 'Penetration through fire-rated barrier must be sealed with listed firestop assembly equal to barrier rating',
    codeCitation: 'RA 9514 IRR Rule 10 §10.2.6 — all penetrations through fire barriers shall be protected with approved firestop systems',
    severity: 'error',
    position: () => [0.5, 1.6, 0.3],
  },
  {
    id: 'partition-4hr-invalid', field: 'barrierType',
    check: (p) => str(p.barrierType) === 'partition' && str(p.fireRating) === '4hr',
    message: 'Fire partitions are not rated to 4-hour assemblies — use a fire wall for 4-hour separation',
    codeCitation: 'RA 9514 IRR Rule 10 §10.2.2 — fire partitions max 2-hour, fire walls up to 4-hour',
    severity: 'error',
    position: () => [-1, 2.5, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-gypsum', label: 'Type X Gypsum Board', description: 'Type X gypsum board (fire-rated) is required for all fire-rated assemblies; number of layers increases with fire rating per RA 9514 IRR Rule 10', codeCitation: 'RA 9514 IRR Rule 10 §10.2.3', position: () => [1.5, 1.5, 0.2] },
  { id: 'ann-insulation', label: 'Mineral Wool Insulation', description: 'Mineral wool or equivalent fire-rated insulation fills the cavity to slow heat transfer; thickness correlates to the required fire resistance rating', codeCitation: 'RA 9514 IRR Rule 10 §10.2.3', position: () => [1.5, 2.0, 0] },
  { id: 'ann-penetration', label: 'Penetration Firestop Required', description: 'All pipes, conduits, ducts, and cable bundles penetrating fire-rated barriers must be sealed with a listed firestop system that restores the barrier rating', codeCitation: 'RA 9514 IRR Rule 10 §10.2.6', position: () => [0.5, 2.0, 0.5], visibleWhen: (p) => p.hasPenetration === true || p.hasPenetration === 'true' },
]

const presets: Preset[] = [
  { label: '2-Hr Partition — No Penetration', values: { barrierType: 'partition', fireRating: '2hr', hasPenetration: false, penetrationType: 'pipe' } },
  { label: '1-Hr Partition with Pipe', values: { barrierType: 'partition', fireRating: '1hr', hasPenetration: true, penetrationType: 'pipe' } },
  { label: '4-Hr Fire Wall', values: { barrierType: 'wall', fireRating: '4hr', hasPenetration: false, penetrationType: 'pipe' } },
  { label: '2-Hr Floor/Ceiling', values: { barrierType: 'floor', fireRating: '2hr', hasPenetration: false, penetrationType: 'pipe' } },
  { label: 'Duct Penetration Violation', values: { barrierType: 'wall', fireRating: '2hr', hasPenetration: true, penetrationType: 'duct' } },
]

export const fireRatedBarrierConfig: ParametricSceneConfig = {
  id: 'fire-rated-barrier',
  title: 'Fire-Rated Barrier',
  description: 'Wall cross-section showing Type X gypsum, steel studs, and insulation layers for 1–4 hour fire-rated partition, wall, and floor/ceiling assemblies per RA 9514 IRR Rule 10.',
  subject: 'ra-9514',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [2.0, 2.0, 3.0], fov: 52 },
}
