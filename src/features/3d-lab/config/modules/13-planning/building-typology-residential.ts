// src/app/dashboard/3d-lab/_config/modules/building-typology-residential.ts
// Building Typology — Residential Spatial Program
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'buildingType', label: 'Residential Type', type: 'dropdown', default: 'single', options: [{ value: 'single', label: 'Single Detached' }, { value: 'duplex', label: 'Duplex' }, { value: 'rowhouse', label: 'Rowhouse' }, { value: 'apartment', label: 'Apartment' }], group: 'Type' },
  { key: 'numBedrooms', label: 'Number of Bedrooms', type: 'slider', min: 1, max: 5, step: 1, default: 3, group: 'Program' },
  { key: 'numStoreys', label: 'Storeys', type: 'slider', min: 1, max: 4, step: 1, default: 2, group: 'Building' },
  { key: 'showSpaces', label: 'Show Space Labels', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const bType = str(params.buildingType)
  const br = num(params.numBedrooms)
  const storeys = num(params.numStoreys)
  const showSpaces = Boolean(params.showSpaces)
  const stH = 0.7
  const scale = 0.15
  const units = bType === 'duplex' ? 2 : bType === 'rowhouse' ? 3 : bType === 'apartment' ? 4 : 1
  const unitW = bType === 'single' ? 9 * scale : bType === 'apartment' ? 6 * scale : 6 * scale
  const totalW = unitW * units
  const inst: GeometryInstruction[] = []

  // Site
  inst.push({ id: 'site', type: 'box', position: [0, -0.05, 0], args: [totalW + 1, 0.1, 6 * scale + 1], color: '#4d7c0f', opacity: 0.3, transparent: true })
  inst.push({ id: 'ground', type: 'box', position: [0, -0.08, 0], args: [totalW + 2, 0.04, 6 * scale + 2], color: '#52525b' })

  for (let u = 0; u < units; u++) {
    const ux = -(totalW / 2) + unitW * u + unitW / 2
    // Footprint
    inst.push({ id: `unit-base-${u}`, type: 'box', position: [ux, -0.02, 0], args: [unitW - 0.05, 0.04, 6 * scale], color: '#a1a1aa' })
    for (let s = 0; s < storeys; s++) {
      const sy = s * stH + stH / 2
      const colors = ['#3b82f6', '#6366f1', '#0891b2', '#7c3aed']
      inst.push({ id: `unit-${u}-${s}`, type: 'box', position: [ux, sy, 0], args: [unitW - 0.05, stH - 0.03, 6 * scale - 0.05], color: colors[u % 4], opacity: 0.7, transparent: true })
      inst.push({ id: `slab-${u}-${s}`, type: 'box', position: [ux, s * stH, 0], args: [unitW - 0.03, 0.03, 6 * scale - 0.03], color: '#71717a' })
    }
    // Roof
    inst.push({ id: `roof-${u}`, type: 'cone', position: [ux, storeys * stH + 0.2, 0], rotation: [0, Math.PI / 4, 0], args: [unitW * 0.8, 0.4, 4], color: '#D64545' })
  }

  // Space program visualization (ground floor)
  if (showSpaces) {
    const firstUnit = -(totalW / 2) + unitW / 2
    const spaces: Array<{ label: string; w: number; c: string }> = [
      { label: 'Living', w: 0.35, c: '#3b82f6' },
      { label: 'Dining', w: 0.2, c: '#2D9F6F' },
      { label: 'Kitchen', w: 0.15, c: '#f97316' },
      { label: 'Toilet', w: 0.1, c: '#0891b2' },
    ]
    let spaceX = firstUnit - unitW / 2 + 0.05
    spaces.forEach((sp, i) => {
      const sw = sp.w * unitW
      inst.push({ id: `space-${i}`, type: 'box', position: [spaceX + sw / 2, 0.01, 0], args: [sw - 0.01, 0.02, 5 * scale - 0.1], color: sp.c, opacity: 0.35, transparent: true, label: sp.label })
      spaceX += sw
    })
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-pd957', label: 'PD 957: 120 sqm lot / 42 sqm floor', description: 'PD 957 subdivision standards: single detached min 120 sqm lot, 42 sqm floor area; rowhouse min 60 sqm lot', codeCitation: 'PD 957', position: () => [4, 2, 0] },
  { id: 'ann-bp220', label: 'BP 220: Socialized 64 sqm lot', description: 'BP 220 socialized housing: 64 sqm lot, 22 sqm floor area minimum for rowhouse', codeCitation: 'BP 220', position: () => [-4, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Single Detached', values: { buildingType: 'single', numBedrooms: 3, numStoreys: 2, showSpaces: true } },
  { label: 'Duplex House', values: { buildingType: 'duplex', numBedrooms: 3, numStoreys: 2, showSpaces: true } },
  { label: 'Rowhouse (BP 220)', values: { buildingType: 'rowhouse', numBedrooms: 2, numStoreys: 2, showSpaces: true } },
  { label: 'Apartment', values: { buildingType: 'apartment', numBedrooms: 1, numStoreys: 4, showSpaces: false } },
]

export const buildingTypologyResidentialConfig: ParametricSceneConfig = {
  id: 'building-typology-residential',
  title: 'Building Typology — Residential',
  description: 'Residential spatial program diagram showing single detached, duplex, rowhouse, and apartment types per PD 957 and BP 220 standards.',
  subject: 'planning',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 4, 5], fov: 55 },
}

