// src/app/dashboard/3d-lab/_config/modules/dead-live-load-toggles.ts
// Dead/Live Load Toggles — NSCP Chapter 2
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const OCCUPANCY_LOADS: Record<string, { dead: number; live: number; label: string }> = {
  'residential': { dead: 3.0, live: 1.9, label: 'Residential' },
  'office':      { dead: 2.5, live: 2.4, label: 'Office' },
  'retail':      { dead: 2.5, live: 4.8, label: 'Retail/Mercantile' },
  'assembly':    { dead: 3.0, live: 4.8, label: 'Assembly' },
  'storage':     { dead: 3.0, live: 7.2, label: 'Storage' },
}

const parameters: ParameterDef[] = [
  { key: 'occupancyType', label: 'Occupancy Type', type: 'dropdown', default: 'residential',
    options: Object.entries(OCCUPANCY_LOADS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Occupancy' },
  { key: 'showDeadLoad', label: 'Show Dead Loads', type: 'toggle', default: true, group: 'Loads' },
  { key: 'showLiveLoad', label: 'Show Live Loads', type: 'toggle', default: true, group: 'Loads' },
  { key: 'numFloors', label: 'Number of Floors', type: 'slider', min: 1, max: 6, step: 1, default: 3, group: 'Building' },
  { key: 'bayWidth', label: 'Bay Width', type: 'slider', min: 4, max: 10, step: 0.5, default: 6, unit: 'm', decimals: 1, group: 'Building' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const occ = str(params.occupancyType)
  const showDead = Boolean(params.showDeadLoad)
  const showLive = Boolean(params.showLiveLoad)
  const floors = num(params.numFloors)
  const bay = num(params.bayWidth)
  const loads = OCCUPANCY_LOADS[occ] ?? OCCUPANCY_LOADS['residential']
  const stH = 3.0
  const scale = 0.25
  const bays = 2
  const bW = bay * scale
  const totalW = bW * bays
  const inst: GeometryInstruction[] = []

  // Foundation
  inst.push({ id: 'foundation', type: 'box', position: [0, -0.3, 0], args: [totalW + 0.5, 0.4, bW + 0.5], color: '#3f3f46' })

  // Columns and beams
  for (let f = 0; f < floors; f++) {
    const baseY = f * stH
    // Columns (3 × 2 grid)
    for (let c = 0; c <= bays; c++) {
      const cx = -(bays * bW / 2) + c * bW
      for (let d = 0; d <= 1; d++) {
        const cz = d === 0 ? -bW / 2 : bW / 2
        inst.push({ id: `col-${f}-${c}-${d}`, type: 'box', position: [cx, baseY + stH / 2, cz], args: [0.08 * scale / scale, stH, 0.08 * scale / scale], color: '#a1a1aa' })
      }
    }
    // Floor slab
    inst.push({ id: `slab-${f}`, type: 'box', position: [0, baseY + stH - 0.05, 0], args: [totalW + 0.1, 0.15, bW + 0.1], color: '#71717a' })
    // Beams
    for (let c = 0; c < bays; c++) {
      const bx = -(bays * bW / 2) + c * bW + bW / 2
      inst.push({ id: `beam-${f}-${c}`, type: 'box', position: [bx, baseY + stH - 0.2, 0], args: [bW, 0.25, 0.15], color: '#a1a1aa' })
    }

    // Dead load arrows (slab self-weight)
    if (showDead) {
      const deadScale = loads.dead / 5.0
      const arrowCount = 5
      for (let a = 0; a < arrowCount; a++) {
        const ax = -(totalW / 2) + (a + 0.5) * (totalW / arrowCount)
        inst.push({ id: `dead-${f}-${a}`, type: 'cone', position: [ax, baseY + stH + deadScale * 0.4, 0], rotation: [Math.PI, 0, 0], args: [0.06, deadScale * 0.8, 6], color: '#52525b', opacity: 0.8, transparent: true })
      }
    }

    // Live load arrows (occupancy)
    if (showLive && f === floors - 1) {
      const liveScale = loads.live / 5.0
      const arrowCount = 5
      for (let a = 0; a < arrowCount; a++) {
        const ax = -(totalW / 2) + (a + 0.5) * (totalW / arrowCount)
        inst.push({ id: `live-${a}`, type: 'cone', position: [ax, baseY + stH + liveScale * 0.4, 0], rotation: [Math.PI, 0, 0], args: [0.08, liveScale * 0.8, 6], color: '#3b82f6', opacity: 0.8, transparent: true })
      }
    }
  }

  // Legend
  if (showDead) inst.push({ id: 'legend-dead', type: 'box', position: [totalW / 2 + 0.5, floors * stH / 2, 0], args: [0.15, loads.dead * 0.2, 0.15], color: '#52525b', label: `DL: ${loads.dead} kPa` })
  if (showLive) inst.push({ id: 'legend-live', type: 'box', position: [totalW / 2 + 0.9, floors * stH / 2, 0], args: [0.15, loads.live * 0.2, 0.15], color: '#3b82f6', label: `LL: ${loads.live} kPa` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'live-load-check', field: 'occupancyType',
    check: (p) => str(p.occupancyType) === 'storage' && num(p.numFloors) > 3,
    message: 'Storage live load 7.2 kPa — verify structural adequacy for multi-storey',
    codeCitation: 'NSCP 2015 Table 205-1', severity: 'warning',
    position: () => [3, 6, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-dead', label: 'Dead Loads (DL)', description: 'Dead loads = self-weight of structure + permanent fixtures; RC slab approx 3.0 kPa at 125mm thick', codeCitation: 'NSCP 2015 §204', position: () => [-4, 5, 0] },
  { id: 'ann-live', label: 'Live Loads (LL)', description: 'Live loads per occupancy: Residential 1.9 kPa, Office 2.4 kPa, Retail/Assembly 4.8 kPa, Storage 7.2 kPa', codeCitation: 'NSCP 2015 Table 205-1', position: () => [4, 5, 0] },
]

const presets: Preset[] = [
  { label: 'Residential', values: { occupancyType: 'residential', showDeadLoad: true, showLiveLoad: true, numFloors: 3, bayWidth: 6 } },
  { label: 'Office', values: { occupancyType: 'office', showDeadLoad: true, showLiveLoad: true, numFloors: 4, bayWidth: 7 } },
  { label: 'Assembly Hall', values: { occupancyType: 'assembly', showDeadLoad: false, showLiveLoad: true, numFloors: 1, bayWidth: 9 } },
  { label: 'Storage Facility', values: { occupancyType: 'storage', showDeadLoad: true, showLiveLoad: true, numFloors: 2, bayWidth: 8 } },
]

export const deadLiveLoadTogglesConfig: ParametricSceneConfig = {
  id: 'dead-live-load-toggles',
  title: 'Dead/Live Load Toggles',
  description: 'Building frame with toggleable dead (self-weight) and live loads by occupancy type per NSCP 2015 Table 205-1.',
  subject: 'nscp',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 5, 6], fov: 55 },
}
