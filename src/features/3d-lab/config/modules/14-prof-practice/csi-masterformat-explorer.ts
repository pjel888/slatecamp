// src/features/3d-lab/config/modules/csi-masterformat-explorer.ts
// CSI MasterFormat Explorer — Specifications
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function _num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const DIVISIONS: Array<{ div: number; label: string; color: string }> = [
  { div: 1, label: 'General Requirements', color: '#6366f1' },
  { div: 2, label: 'Existing Conditions', color: '#71717a' },
  { div: 3, label: 'Concrete', color: '#a1a1aa' },
  { div: 4, label: 'Masonry', color: '#b45309' },
  { div: 5, label: 'Metals', color: '#52525b' },
  { div: 6, label: 'Wood & Plastics', color: '#92400e' },
  { div: 7, label: 'Thermal & Moisture', color: '#2D9F6F' },
  { div: 8, label: 'Openings', color: '#3b82f6' },
  { div: 9, label: 'Finishes', color: '#ec4899' },
  { div: 10, label: 'Specialties', color: '#f97316' },
  { div: 11, label: 'Equipment', color: '#0891b2' },
  { div: 12, label: 'Furnishings', color: '#D4951A' },
  { div: 13, label: 'Special Construction', color: '#D64545' },
  { div: 14, label: 'Conveying Equipment', color: '#7c3aed' },
  { div: 21, label: 'Fire Suppression', color: '#D64545' },
  { div: 22, label: 'Plumbing', color: '#0ea5e9' },
  { div: 23, label: 'HVAC', color: '#2D9F6F' },
  { div: 26, label: 'Electrical', color: '#eab308' },
  { div: 27, label: 'Communications', color: '#6366f1' },
  { div: 28, label: 'Electronic Safety', color: '#f97316' },
  { div: 31, label: 'Earthwork', color: '#78350f' },
  { div: 32, label: 'Exterior Improvements', color: '#4d7c0f' },
  { div: 33, label: 'Utilities', color: '#1535A8' },
]

const parameters: ParameterDef[] = [
  { key: 'selectedGroup', label: 'Division Group', type: 'dropdown', default: 'All',
    options: [
      { value: 'All', label: 'All Divisions' },
      { value: 'Arch', label: 'Div 01–14 (Architectural)' },
      { value: 'MEP', label: 'Div 21–28 (MEP)' },
      { value: 'Site', label: 'Div 31–33 (Site)' },
    ], group: 'Filter' },
  { key: 'showDivNumbers', label: 'Show Division Numbers', type: 'toggle', default: true, group: 'Display' },
  { key: 'layout', label: 'Layout', type: 'dropdown', default: 'grid', options: [{ value: 'grid', label: 'Grid' }, { value: 'tower', label: 'Tower' }], group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const group = str(params.selectedGroup)
  const layout = str(params.layout)
  const inst: GeometryInstruction[] = []
  const filtered = DIVISIONS.filter(d => {
    if (group === 'Arch') return d.div <= 14
    if (group === 'MEP') return d.div >= 21 && d.div <= 29
    if (group === 'Site') return d.div >= 31
    return true
  })

  if (layout === 'grid') {
    const cols = 5
    filtered.forEach((d, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = (col - 2) * 1.4
      const z = (row - 2) * 1.4
      inst.push({ id: `div-${d.div}`, type: 'box', position: [x, 0.3, z], args: [1.1, 0.6, 1.1], color: d.color, opacity: 0.85, transparent: true, label: `Div ${d.div}` })
      inst.push({ id: `div-top-${d.div}`, type: 'box', position: [x, 0.65, z], args: [1.1, 0.1, 1.1], color: d.color })
    })
  } else {
    filtered.forEach((d, i) => {
      const h = 0.5
      const y = i * 0.65
      inst.push({ id: `div-${d.div}`, type: 'box', position: [0, y + h / 2, 0], args: [3.5, h - 0.05, 1.5], color: d.color, opacity: 0.85, transparent: true, label: `Div ${d.div} – ${d.label}` })
    })
  }

  // Base plate
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [8, 0.15, 8], color: '#27272a' })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-spec', label: 'CSI MasterFormat', description: 'The Construction Specifications Institute MasterFormat organizes construction work into numbered divisions for consistent project manuals', position: () => [4.5, 1, 0] },
  { id: 'ann-mep', label: 'MEP Divisions (21–28)', description: 'Mechanical, Electrical, and Plumbing work is covered in Divisions 21–28', position: () => [-4.5, 1, 0] },
]

const presets: Preset[] = [
  { label: 'All Divisions', values: { selectedGroup: 'All', showDivNumbers: true, layout: 'grid' } },
  { label: 'Architectural Only', values: { selectedGroup: 'Arch', showDivNumbers: true, layout: 'grid' } },
  { label: 'MEP Divisions', values: { selectedGroup: 'MEP', showDivNumbers: true, layout: 'tower' } },
  { label: 'Tower View', values: { selectedGroup: 'All', showDivNumbers: true, layout: 'tower' } },
]

export const csiMasterformatExplorerConfig: ParametricSceneConfig = {
  id: 'csi-masterformat-explorer',
  title: 'CSI MasterFormat Explorer',
  description: '3D organizational chart of CSI MasterFormat divisions used in Philippine construction specifications and project manuals.',
  subject: 'specs',
  parameters, geometry, annotations, presets,
  camera: { position: [6, 5, 6], fov: 55 },
}

