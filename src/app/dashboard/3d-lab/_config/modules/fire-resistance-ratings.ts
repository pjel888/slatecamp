// src/app/dashboard/3d-lab/_config/modules/fire-resistance-ratings.ts
// Fire Resistance Ratings — PD 1096 Rule II / RA 9514
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../_types/templates'

function str(v: number | string | boolean): string { return String(v) }
function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const CONSTRUCTION_TYPES: Record<string, { rating: number; color: string; material: string }> = {
  'Type I':   { rating: 4, color: '#16a34a', material: 'RC Frame + RC Walls' },
  'Type II':  { rating: 2, color: '#3b82f6', material: 'Protected Steel' },
  'Type III': { rating: 1, color: '#f97316', material: 'Heavy Timber' },
  'Type IV':  { rating: 1, color: '#eab308', material: 'Ordinary Construction' },
  'Type V':   { rating: 0, color: '#dc2626', material: 'Wood Frame' },
}

const parameters: ParameterDef[] = [
  { key: 'constructionType', label: 'Construction Type', type: 'dropdown', default: 'Type I',
    options: Object.keys(CONSTRUCTION_TYPES).map(k => ({ value: k, label: k })),
    group: 'Type' },
  { key: 'element', label: 'Building Element', type: 'dropdown', default: 'wall', options: [{ value: 'wall', label: 'Wall' }, { value: 'floor', label: 'Floor/Ceiling' }, { value: 'column', label: 'Column' }, { value: 'beam', label: 'Beam' }], group: 'Element' },
  { key: 'showFireSpread', label: 'Show Fire Spread', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cType = str(params.constructionType)
  const element = str(params.element)
  const showFire = Boolean(params.showFireSpread)
  const spec = CONSTRUCTION_TYPES[cType] ?? CONSTRUCTION_TYPES['Type I']
  const inst: GeometryInstruction[] = []

  // Base
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [8, 0.2, 3], color: '#52525b' })

  if (element === 'wall') {
    // Wall assembly layers
    inst.push({ id: 'wall-core', type: 'box', position: [0, 1.5, 0], args: [4, 3, 0.2], color: spec.color })
    inst.push({ id: 'wall-finish-a', type: 'box', position: [0, 1.5, -0.12], args: [4, 3, 0.02], color: '#f5f5f5' })
    inst.push({ id: 'wall-finish-b', type: 'box', position: [0, 1.5, 0.12], args: [4, 3, 0.02], color: '#f5f5f5' })
  } else if (element === 'column') {
    inst.push({ id: 'column-core', type: 'box', position: [0, 1.5, 0], args: [0.5, 3, 0.5], color: spec.color })
    // Cover layers
    for (let i = 0; i < spec.rating; i++) {
      inst.push({ id: `cover-${i}`, type: 'box', position: [0, 1.5, 0], args: [0.5 + i * 0.04, 3, 0.5 + i * 0.04], color: spec.color, opacity: 0.15, transparent: true })
    }
  } else if (element === 'beam') {
    inst.push({ id: 'beam-core', type: 'box', position: [0, 2.8, 0], args: [5, 0.5, 0.35], color: spec.color })
    inst.push({ id: 'slab', type: 'box', position: [0, 3.05, 0], args: [6, 0.1, 2], color: '#a1a1aa' })
  } else {
    // Floor slab
    inst.push({ id: 'floor-slab', type: 'box', position: [0, 1.5, 0], args: [5, 0.2, 2.5], color: spec.color })
    inst.push({ id: 'floor-finish', type: 'box', position: [0, 1.61, 0], args: [5, 0.02, 2.5], color: '#d4d4d8' })
    inst.push({ id: 'floor-ceiling', type: 'box', position: [0, 1.39, 0], args: [5, 0.02, 2.5], color: '#f5f5f5' })
  }

  // Fire rating timer bars (one per hour)
  for (let h = 0; h < 4; h++) {
    const active = h < spec.rating
    inst.push({ id: `hour-bar-${h}`, type: 'box', position: [3.5, h * 0.4 + 0.2, 0], args: [0.5, 0.3, 0.5], color: active ? spec.color : '#3f3f46', opacity: active ? 1 : 0.3, transparent: !active, label: active ? `${h + 1}hr` : '' })
  }

  // Fire spread visualization
  if (showFire) {
    inst.push({ id: 'fire-source', type: 'cone', position: [-2.5, 0.5, 0], rotation: [0, 0, 0], args: [0.3, 0.8, 8], color: '#dc2626', opacity: 0.8, transparent: true })
    inst.push({ id: 'fire-glow', type: 'sphere', position: [-2.5, 0.3, 0], args: [0.4, 12, 12], color: '#f97316', opacity: 0.4, transparent: true })
    if (spec.rating === 0) {
      inst.push({ id: 'fire-spread', type: 'box', position: [0, 1.5, 0], args: [4, 3, 0.5], color: '#dc2626', opacity: 0.3, transparent: true })
    }
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-type1', label: 'Type I: 4-Hour Rating', description: 'Type I (Fire-Resistive) — reinforced concrete members with 4-hour fire resistance rating', codeCitation: 'PD 1096 Rule II §201', position: () => [4.5, 3, 0] },
  { id: 'ann-type5', label: 'Type V: 0-Hour Rating', description: 'Type V (Wood Frame) — no fire resistance required; highest spread risk', codeCitation: 'PD 1096 Rule II §205', position: () => [-4.5, 3, 0] },
  { id: 'ann-code', label: 'RA 9514 Compliance', description: 'Construction type determines required fire protection systems, sprinklers, and egress design', codeCitation: 'RA 9514 IRR Rule 10', position: () => [0, 4, 2] },
]

const presets: Preset[] = [
  { label: 'Type I (Fire-Resistive)', values: { constructionType: 'Type I', element: 'column', showFireSpread: true } },
  { label: 'Type II (Protected)', values: { constructionType: 'Type II', element: 'beam', showFireSpread: true } },
  { label: 'Type V (Frame)', values: { constructionType: 'Type V', element: 'wall', showFireSpread: true } },
  { label: 'Floor Assembly', values: { constructionType: 'Type I', element: 'floor', showFireSpread: false } },
]

export const fireResistanceRatingsConfig: ParametricSceneConfig = {
  id: 'fire-resistance-ratings',
  title: 'Fire Resistance Ratings',
  description: 'Wall, floor, column, and beam sections showing fire ratings (0–4 hr) by construction type per PD 1096 Rule II and RA 9514.',
  subject: 'pd-1096',
  parameters, geometry, annotations, presets,
  camera: { position: [6, 4, 5], fov: 50 },
}
