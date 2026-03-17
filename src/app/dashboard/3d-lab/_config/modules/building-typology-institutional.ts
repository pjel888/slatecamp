// src/app/dashboard/3d-lab/_config/modules/building-typology-institutional.ts
// Building Typology — Institutional (School/Clinic)
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'institutionType', label: 'Institution Type', type: 'dropdown', default: 'school', options: [{ value: 'school', label: 'Elementary School' }, { value: 'clinic', label: 'Clinic/Health Center' }, { value: 'hospital', label: 'Hospital' }, { value: 'library', label: 'Library' }], group: 'Type' },
  { key: 'capacity', label: 'Capacity', type: 'slider', min: 50, max: 500, step: 25, default: 200, unit: 'persons', group: 'Program' },
  { key: 'numFloors', label: 'Floors', type: 'slider', min: 1, max: 4, step: 1, default: 2, group: 'Building' },
  { key: 'showProgram', label: 'Show Space Program', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const iType = str(params.institutionType)
  const capacity = num(params.capacity)
  const floors = num(params.numFloors)
  const showProg = Boolean(params.showProgram)
  const stH = 0.7
  const scale = 0.12
  const inst: GeometryInstruction[] = []

  // Space programs by type
  const programs: Record<string, Array<{ label: string; size: number; color: string }>> = {
    school: [
      { label: 'Classroom', size: 56 * scale, color: '#3b82f6' },
      { label: 'Classroom', size: 56 * scale, color: '#3b82f6' },
      { label: 'Classroom', size: 56 * scale, color: '#3b82f6' },
      { label: 'Admin', size: 24 * scale, color: '#6366f1' },
      { label: 'Toilet', size: 12 * scale, color: '#0891b2' },
      { label: 'Corridor', size: 20 * scale, color: '#a1a1aa' },
    ],
    clinic: [
      { label: 'Waiting', size: 30 * scale, color: '#2D9F6F' },
      { label: 'Consultation', size: 20 * scale, color: '#3b82f6' },
      { label: 'Exam Room', size: 16 * scale, color: '#6366f1' },
      { label: 'Lab', size: 14 * scale, color: '#f97316' },
      { label: 'Pharmacy', size: 12 * scale, color: '#0891b2' },
      { label: 'Utility', size: 8 * scale, color: '#52525b' },
    ],
    hospital: [
      { label: 'OPD', size: 80 * scale, color: '#2D9F6F' },
      { label: 'Ward', size: 100 * scale, color: '#3b82f6' },
      { label: 'OR/ICU', size: 60 * scale, color: '#D64545' },
      { label: 'Nursing', size: 30 * scale, color: '#6366f1' },
      { label: 'Utility', size: 30 * scale, color: '#52525b' },
    ],
    library: [
      { label: 'Reading', size: 80 * scale, color: '#D4951A' },
      { label: 'Stacks', size: 60 * scale, color: '#D4951A' },
      { label: 'Reference', size: 30 * scale, color: '#92400e' },
      { label: 'Admin', size: 20 * scale, color: '#6366f1' },
      { label: 'Toilet', size: 10 * scale, color: '#0891b2' },
    ],
  }

  const program = programs[iType] ?? programs['school']
  const totalW = program.reduce((a, p) => a + p.size, 0) + 0.2

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.06, 0], args: [totalW + 1, 0.12, 3.5 * scale + 1], color: '#52525b' })
  // Site
  inst.push({ id: 'site', type: 'box', position: [0, -0.03, 0], args: [totalW + 0.8, 0.04, 3.5 * scale + 0.8], color: '#4d7c0f', opacity: 0.3, transparent: true })

  // Floors
  for (let f = 0; f < floors; f++) {
    const fy = f * stH
    if (showProg && f === 0) {
      let xPos = -totalW / 2
      program.forEach((space, i) => {
        inst.push({ id: `space-${i}`, type: 'box', position: [xPos + space.size / 2, fy + stH / 2, 0], args: [space.size - 0.01, stH - 0.02, 3.5 * scale - 0.05], color: space.color, opacity: 0.75, transparent: true, label: space.label })
        xPos += space.size
      })
    } else {
      inst.push({ id: `floor-${f}`, type: 'box', position: [0, fy + stH / 2, 0], args: [totalW, stH - 0.02, 3.5 * scale], color: '#d4d4d8', opacity: 0.7, transparent: true })
    }
    inst.push({ id: `slab-${f}`, type: 'box', position: [0, fy, 0], args: [totalW + 0.05, 0.03, 3.5 * scale + 0.05], color: '#71717a' })
    // Windows
    const winCount = Math.round(totalW / 1.5)
    for (let w = 0; w < winCount; w++) {
      const wx = -(totalW / 2) + (w + 0.5) * (totalW / winCount)
      inst.push({ id: `win-${f}-${w}`, type: 'box', position: [wx, fy + stH * 0.6, 3.5 * scale / 2], args: [0.6, stH * 0.4, 0.02], color: '#93c5fd', opacity: 0.5, transparent: true })
    }
  }

  // Roof
  inst.push({ id: 'roof', type: 'box', position: [0, floors * stH + 0.03, 0], args: [totalW + 0.1, 0.06, 3.5 * scale + 0.1], color: '#52525b' })

  // Flag pole / identifier
  inst.push({ id: 'flag-pole', type: 'cylinder', position: [-(totalW / 2) - 0.3, floors * stH / 2, 0], args: [0.02, 0.02, floors * stH, 6], color: '#52525b' })
  inst.push({ id: 'flag', type: 'box', position: [-(totalW / 2) - 0.15, floors * stH - 0.05, 0], args: [0.2, 0.12, 0.02], color: '#D64545' })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-school', label: 'Classroom: 56 sqm / 40 Students', description: 'DepEd standard classroom = 56 sqm for 40 students; minimum 1.4 sqm per student', position: () => [-4, 2, 0] },
  { id: 'ann-hospital', label: 'DOH Bed Ratio Standards', description: 'Hospital planning: 1 bed per 1000 population (DOH); minimum 28 sqm per bed for ward', position: () => [4, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Elementary School', values: { institutionType: 'school', capacity: 250, numFloors: 2, showProgram: true } },
  { label: 'Health Center', values: { institutionType: 'clinic', capacity: 100, numFloors: 1, showProgram: true } },
  { label: 'District Hospital', values: { institutionType: 'hospital', capacity: 200, numFloors: 4, showProgram: true } },
  { label: 'Public Library', values: { institutionType: 'library', capacity: 150, numFloors: 2, showProgram: true } },
]

export const buildingTypologyInstitutionalConfig: ParametricSceneConfig = {
  id: 'building-typology-institutional',
  title: 'Building Typology — Institutional',
  description: 'Institutional building blocks showing space programs for school classrooms, clinic rooms, hospital wards, and library spaces.',
  subject: 'planning',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 4, 5], fov: 55 },
}
