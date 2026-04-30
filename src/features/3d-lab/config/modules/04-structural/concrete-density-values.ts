// src/features/3d-lab/config/modules/concrete-density-values.ts
// Concrete Density Values — NSCP Chapter 2
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const MATERIALS: Record<string, { density: number; color: string; label: string }> = {
  'RC':          { density: 23.6, color: '#71717a', label: 'Reinforced Concrete (RC)' },
  'Plain':       { density: 23.0, color: '#a1a1aa', label: 'Plain Concrete' },
  'Lightweight': { density: 14.0, color: '#d4d4d8', label: 'Lightweight Concrete' },
  'Steel':       { density: 77.0, color: '#3b82f6', label: 'Structural Steel' },
  'Masonry':     { density: 19.2, color: '#b45309', label: 'Brick Masonry' },
  'Timber':      { density: 6.0,  color: '#92400e', label: 'Timber (Douglas Fir)' },
}

const parameters: ParameterDef[] = [
  { key: 'material', label: 'Material', type: 'dropdown', default: 'RC',
    options: Object.entries(MATERIALS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Material' },
  { key: 'cubeSize', label: 'Specimen Size', type: 'slider', min: 100, max: 600, step: 50, default: 300, unit: 'mm', group: 'Specimen' },
  { key: 'showComparison', label: 'Show All Materials', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const mat = str(params.material)
  const size = num(params.cubeSize) / 1000
  const showAll = Boolean(params.showComparison)
  const selected = MATERIALS[mat] ?? MATERIALS['RC']
  const maxDensity = 77.0
  const inst: GeometryInstruction[] = []

  // Base
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [showAll ? 8 : size + 1, 0.2, 2], color: '#3f3f46' })

  if (showAll) {
    // Show all materials as density bars
    const materials = Object.entries(MATERIALS)
    const spacing = 1.2
    materials.forEach(([key, data], i) => {
      const xPos = -(materials.length / 2 - 0.5) * spacing + i * spacing
      const barH = (data.density / maxDensity) * 3.0
      const isSelected = key === mat
      inst.push({ id: `bar-${key}`, type: 'box', position: [xPos, barH / 2, 0], args: [0.6, barH, 0.6], color: data.color, opacity: isSelected ? 1 : 0.65, transparent: !isSelected, label: `${data.density} kN/m³` })
      // Label sphere on top
      inst.push({ id: `label-${key}`, type: 'sphere', position: [xPos, barH + 0.12, 0], args: [0.08, 8, 8], color: data.color })
      // Weight per sqm slab (100mm)
      const wt = data.density * 0.1
      inst.push({ id: `wt-${key}`, type: 'box', position: [xPos, barH + 0.35, 0], args: [0.4, 0.01, 0.01], color: data.color, label: `${wt.toFixed(1)} kPa/100mm` })
    })
  } else {
    // Single specimen
    const weight = selected.density * size ** 3
    inst.push({ id: 'specimen', type: 'box', position: [0, size / 2, 0], args: [size, size, size], color: selected.color })
    inst.push({ id: 'specimen-top', type: 'box', position: [0, size + 0.02, 0], args: [size + 0.05, 0.04, size + 0.05], color: '#D4951A' })
    // Weight arrow
    inst.push({ id: 'weight-arrow', type: 'cone', position: [0, size + 0.5, 0], rotation: [Math.PI, 0, 0], args: [0.1, 0.4, 8], color: '#D64545', label: `${weight.toFixed(1)} kN` })
    // Density label
    inst.push({ id: 'density-bar', type: 'box', position: [size / 2 + 0.4, selected.density / maxDensity * 1.5, 0], args: [0.1, selected.density / maxDensity * 3, 0.1], color: selected.color, label: `${selected.density} kN/m³` })
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-rc', label: 'RC: 23.6 kN/m³', description: 'Reinforced concrete unit weight = 23.6 kN/m³; use for calculating dead load of all RC members', codeCitation: 'NSCP 2015 §204.3', position: () => [-1, 4, 0] },
  { id: 'ann-steel', label: 'Steel: 77.0 kN/m³', description: 'Structural steel unit weight = 77.0 kN/m³ — use for steel frames, plates, and connections', codeCitation: 'NSCP 2015 §204.3', position: () => [3, 4, 0] },
]

const presets: Preset[] = [
  { label: 'RC Comparison', values: { material: 'RC', cubeSize: 300, showComparison: true } },
  { label: 'Steel vs Concrete', values: { material: 'Steel', cubeSize: 300, showComparison: true } },
  { label: 'Lightweight Detail', values: { material: 'Lightweight', cubeSize: 400, showComparison: false } },
  { label: 'Masonry Block', values: { material: 'Masonry', cubeSize: 300, showComparison: false } },
]

export const concreteDensityValuesConfig: ParametricSceneConfig = {
  id: 'concrete-density-values',
  title: 'Concrete Density Values',
  description: 'Concrete and structural material specimen with density visualization: RC 23.6 kN/m³, Steel 77.0 kN/m³ per NSCP 2015.',
  subject: 'nscp',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 4, 6], fov: 55 },
}

