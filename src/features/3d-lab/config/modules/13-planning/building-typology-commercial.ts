// src/features/3d-lab/config/modules/building-typology-commercial.ts
// Building Typology — Commercial Area Allocation
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'commercialType', label: 'Commercial Type', type: 'dropdown', default: 'retail', options: [{ value: 'retail', label: 'Retail Strip Mall' }, { value: 'mall', label: 'Shopping Mall' }, { value: 'office', label: 'Office Building' }, { value: 'mixeduse', label: 'Mixed-Use' }], group: 'Type' },
  { key: 'floors', label: 'Floors', type: 'slider', min: 1, max: 8, step: 1, default: 3, group: 'Building' },
  { key: 'buildingWidth', label: 'Building Width', type: 'slider', min: 10, max: 50, step: 2, default: 24, unit: 'm', group: 'Building' },
  { key: 'showAllocation', label: 'Show Area Allocation', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cType = str(params.commercialType)
  const floors = num(params.floors)
  const bW = num(params.buildingWidth)
  const showAlloc = Boolean(params.showAllocation)
  const scale = 0.15
  const bWs = bW * scale
  const bDs = bW * 0.6 * scale
  const stH = 0.65
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.05, 0], args: [bWs + 3, 0.1, bDs + 3], color: '#52525b' })

  // Floor allocations
  const allocations: Record<string, Array<{ label: string; portion: number; color: string }>> = {
    retail:    [{ label: 'Retail', portion: 0.7, color: '#f97316' }, { label: 'Circ', portion: 0.15, color: '#71717a' }, { label: 'Services', portion: 0.15, color: '#a1a1aa' }],
    mall:      [{ label: 'GLA', portion: 0.65, color: '#f97316' }, { label: 'Atrium', portion: 0.1, color: '#fde68a' }, { label: 'Circ', portion: 0.15, color: '#71717a' }, { label: 'Utility', portion: 0.1, color: '#52525b' }],
    office:    [{ label: 'Net Office', portion: 0.6, color: '#3b82f6' }, { label: 'Lobby', portion: 0.1, color: '#93c5fd' }, { label: 'Circ', portion: 0.2, color: '#71717a' }, { label: 'Core', portion: 0.1, color: '#52525b' }],
    mixeduse:  [{ label: 'Residential', portion: 0.45, color: '#2D9F6F' }, { label: 'Retail', portion: 0.3, color: '#f97316' }, { label: 'Office', portion: 0.15, color: '#3b82f6' }, { label: 'Circ', portion: 0.1, color: '#71717a' }],
  }
  const alloc = allocations[cType] ?? allocations['office']

  for (let f = 0; f < floors; f++) {
    const fy = f * stH
    if (showAlloc) {
      let xOffset = -bWs / 2
      alloc.forEach((zone, z) => {
        const zoneW = zone.portion * bWs
        inst.push({ id: `zone-${f}-${z}`, type: 'box', position: [xOffset + zoneW / 2, fy + stH / 2, 0], args: [zoneW - 0.01, stH - 0.02, bDs * 0.9], color: zone.color, opacity: 0.75, transparent: true, label: f === 0 ? zone.label : undefined })
        xOffset += zoneW
      })
    } else {
      inst.push({ id: `floor-${f}`, type: 'box', position: [0, fy + stH / 2, 0], args: [bWs, stH - 0.02, bDs], color: '#3b82f6', opacity: 0.7, transparent: true })
    }
    inst.push({ id: `slab-${f}`, type: 'box', position: [0, fy, 0], args: [bWs + 0.05, 0.03, bDs + 0.05], color: '#71717a' })
    // Glazing on front facade
    inst.push({ id: `glazing-${f}`, type: 'box', position: [0, fy + stH / 2, bDs / 2], args: [bWs * 0.85, stH * 0.7, 0.02], color: '#bfdbfe', opacity: 0.4, transparent: true })
  }

  // Roof
  inst.push({ id: 'roof', type: 'box', position: [0, floors * stH + 0.025, 0], args: [bWs + 0.1, 0.05, bDs + 0.1], color: '#52525b' })
  if (cType === 'mall') {
    inst.push({ id: 'skylight-atrium', type: 'box', position: [0, floors * stH + 0.1, 0], args: [bWs * 0.3, 0.08, bDs * 0.6], color: '#93c5fd', opacity: 0.5, transparent: true })
  }

  // Parking
  inst.push({ id: 'parking', type: 'box', position: [0, -0.03, bDs / 2 + 0.8], args: [bWs, 0.02, 1.0], color: '#3f3f46' })
  for (let p = 0; p < Math.min(Math.floor(bW / 5), 6); p++) {
    const px = -(bWs / 2) + (p + 0.5) * (bWs / Math.min(Math.floor(bW / 5), 6))
    inst.push({ id: `car-${p}`, type: 'box', position: [px, 0.2, bDs / 2 + 0.8], args: [0.35, 0.25, 0.7], color: '#6366f1', opacity: 0.5, transparent: true })
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-gla', label: 'Gross Leasable Area (GLA)', description: 'Commercial buildings designed around GLA efficiency; typical retail 65–70%, office 60–65% of gross floor area', position: () => [4, 3, 0] },
  { id: 'ann-efficiency', label: 'Net-to-Gross Ratio', description: 'Office buildings target 75–85% net-to-gross efficiency; remainder is circulation, core, and services', position: () => [4, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Retail Strip', values: { commercialType: 'retail', floors: 1, buildingWidth: 30, showAllocation: true } },
  { label: 'Shopping Mall', values: { commercialType: 'mall', floors: 4, buildingWidth: 50, showAllocation: true } },
  { label: 'Office Tower', values: { commercialType: 'office', floors: 8, buildingWidth: 24, showAllocation: true } },
  { label: 'Mixed-Use', values: { commercialType: 'mixeduse', floors: 6, buildingWidth: 32, showAllocation: true } },
]

export const buildingTypologyCommercialConfig: ParametricSceneConfig = {
  id: 'building-typology-commercial',
  title: 'Building Typology — Commercial',
  description: 'Commercial area allocation model showing GLA, circulation, and service zones for retail, mall, office, and mixed-use typologies.',
  subject: 'planning',
  parameters, geometry, annotations, presets,
  camera: { position: [6, 4, 6], fov: 55 },
}

