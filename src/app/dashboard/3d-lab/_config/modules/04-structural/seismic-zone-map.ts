// src/app/dashboard/3d-lab/_config/modules/seismic-zone-map.ts
// Seismic Zone Map — NSCP Chapter 2 §208
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

// Simplified Philippine regions and their seismic zones
const REGIONS: Array<{ name: string; zone: number; x: number; z: number; size: [number, number] }> = [
  { name: 'Luzon North',   zone: 4, x: 0.3, z: -1.5, size: [1.2, 1.0] },
  { name: 'NCR/Metro MNL', zone: 4, x: -0.1, z: -0.3, size: [0.5, 0.4] },
  { name: 'Luzon South',   zone: 4, x: 0.0, z: 0.5, size: [1.0, 0.8] },
  { name: 'Visayas',       zone: 4, x: 0.4, z: 2.0, size: [1.5, 0.7] },
  { name: 'Palawan',       zone: 2, x: -1.2, z: 1.0, size: [0.4, 1.5] },
  { name: 'Mindanao W',    zone: 2, x: -0.3, z: 3.0, size: [0.8, 0.8] },
  { name: 'Mindanao E',    zone: 4, x: 0.8, z: 3.2, size: [1.0, 0.8] },
]

const parameters: ParameterDef[] = [
  { key: 'selectedZone', label: 'Highlight Zone', type: 'dropdown', default: 'Zone 4', options: [{ value: 'All', label: 'All Zones' }, { value: 'Zone 4', label: 'Zone 4 (Z=0.40)' }, { value: 'Zone 2', label: 'Zone 2 (Z=0.20)' }], group: 'Filter' },
  { key: 'showZFactor', label: 'Show Z-Factor Bars', type: 'toggle', default: true, group: 'Display' },
  { key: 'showFaults', label: 'Show Major Faults', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const highlight = str(params.selectedZone)
  const showZ = Boolean(params.showZFactor)
  const showFaults = Boolean(params.showFaults)
  const inst: GeometryInstruction[] = []

  // Ocean base
  inst.push({ id: 'ocean', type: 'box', position: [0, -0.1, 0], args: [6, 0.2, 8], color: '#0ea5e9', opacity: 0.3, transparent: true })
  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.05, 0], args: [6, 0.05, 8], color: '#2D9F6F', opacity: 0.2, transparent: true })

  // Island regions
  REGIONS.forEach((region, i) => {
    const zone4 = region.zone === 4
    const isHighlighted = highlight === 'All' || (highlight === 'Zone 4' && zone4) || (highlight === 'Zone 2' && !zone4)
    const color = zone4 ? '#D64545' : '#f97316'
    const h = zone4 ? 0.4 : 0.2
    inst.push({ id: `region-${i}`, type: 'box', position: [region.x, h / 2, region.z], args: [region.size[0], h, region.size[1]], color, opacity: isHighlighted ? 0.85 : 0.3, transparent: !isHighlighted, label: region.name })
    // Zone label
    inst.push({ id: `zone-label-${i}`, type: 'sphere', position: [region.x, h + 0.12, region.z], args: [0.1, 8, 8], color })
  })

  // Major faults
  if (showFaults) {
    // Valley Fault System (Metro Manila)
    inst.push({ id: 'valley-fault', type: 'box', position: [-0.3, 0.25, 0], rotation: [0, 0.2, 0], args: [0.04, 0.3, 2.5], color: '#7c3aed', label: 'Valley Fault' })
    // Marikina Fault
    inst.push({ id: 'marikina-fault', type: 'box', position: [0.1, 0.25, 0.8], rotation: [0, 0.15, 0], args: [0.04, 0.3, 1.8], color: '#7c3aed', opacity: 0.7, transparent: true })
    // Philippine Fault System (Luzon-Visayas-Mindanao)
    inst.push({ id: 'pfs', type: 'box', position: [0.8, 0.25, 1.0], rotation: [0, -0.15, 0], args: [0.06, 0.4, 6.0], color: '#D64545', opacity: 0.5, transparent: true, label: 'Philippine Fault' })
  }

  // Z-Factor comparison bars
  if (showZ) {
    inst.push({ id: 'z4-bar', type: 'box', position: [2.5, 0.6, -1.5], args: [0.4, 1.2, 0.4], color: '#D64545', label: 'Z=0.40' })
    inst.push({ id: 'z2-bar', type: 'box', position: [2.5, 0.3, -0.5], args: [0.4, 0.6, 0.4], color: '#f97316', label: 'Z=0.20' })
    inst.push({ id: 'z-base', type: 'box', position: [2.5, 0, -1.0], args: [0.5, 0.05, 1.2], color: '#52525b' })
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-zone4', label: 'Zone 4 (Z=0.40)', description: 'Zone 4 covers most of the Philippines including NCR, Luzon, Visayas, and Eastern Mindanao — highest seismic risk', codeCitation: 'NSCP 2015 Figure 208-1', position: () => [2.5, 2, -2] },
  { id: 'ann-zone2', label: 'Zone 2 (Z=0.20)', description: 'Zone 2 covers Palawan and parts of Western Mindanao — moderate seismic risk', codeCitation: 'NSCP 2015 Figure 208-1', position: () => [-2.5, 1, 1] },
]

const presets: Preset[] = [
  { label: 'All Zones', values: { selectedZone: 'All', showZFactor: true, showFaults: true } },
  { label: 'Zone 4 Highlighted', values: { selectedZone: 'Zone 4', showZFactor: true, showFaults: true } },
  { label: 'Zone 2 Highlighted', values: { selectedZone: 'Zone 2', showZFactor: true, showFaults: false } },
  { label: 'Fault Lines', values: { selectedZone: 'All', showZFactor: false, showFaults: true } },
]

export const seismicZoneMapConfig: ParametricSceneConfig = {
  id: 'seismic-zone-map',
  title: 'Seismic Zone Map (Philippines)',
  description: 'Philippine map showing Zone 2 (Z=0.20) and Zone 4 (Z=0.40) seismic regions with major fault lines per NSCP 2015 §208.',
  subject: 'nscp',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 6, 5], fov: 55 },
}
