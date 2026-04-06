// src/app/dashboard/3d-lab/_config/modules/concrete-aggregate-visualizer.ts
// Concrete Aggregate Visualizer — Building Materials
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'cementParts', label: 'Cement Parts', type: 'slider', min: 1, max: 1, step: 1, default: 1, group: 'Mix Ratio' },
  { key: 'sandParts', label: 'Sand Parts', type: 'slider', min: 1, max: 4, step: 0.5, default: 2, decimals: 1, group: 'Mix Ratio' },
  { key: 'gravelParts', label: 'Gravel Parts', type: 'slider', min: 2, max: 8, step: 0.5, default: 4, decimals: 1, group: 'Mix Ratio' },
  { key: 'wcRatio', label: 'Water/Cement Ratio', type: 'slider', min: 0.35, max: 0.70, step: 0.01, default: 0.50, decimals: 2, group: 'Water' },
  { key: 'aggregateSize', label: 'Max Aggregate Size', type: 'dropdown', default: '20', options: [{ value: '10', label: '10mm' }, { value: '20', label: '20mm' }, { value: '40', label: '40mm' }], group: 'Aggregate' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const c = 1
  const s = num(params.sandParts)
  const g = num(params.gravelParts)
  const wc = num(params.wcRatio)
  const aggSize = num(str(params.aggregateSize)) / 1000
  const total = c + s + g
  const boxSize = 1.0

  // Proportional volumes (bars)
  const cH = (c / total) * 3.0
  const sH = (s / total) * 3.0
  const gH = (g / total) * 3.0
  const wH = wc * cH * 0.8
  const inst: GeometryInstruction[] = []

  // Base
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [7, 0.2, 1.5], color: '#3f3f46' })

  // Ingredient bars
  inst.push({ id: 'cement-bar', type: 'box', position: [-2.5, cH / 2, 0], args: [0.7, cH, 0.7], color: '#d4d4d8', label: `Cement: ${c}` })
  inst.push({ id: 'sand-bar', type: 'box', position: [-0.8, sH / 2, 0], args: [0.7, sH, 0.7], color: '#D4951A', label: `Sand: ${s}` })
  inst.push({ id: 'gravel-bar', type: 'box', position: [0.9, gH / 2, 0], args: [0.7, gH, 0.7], color: '#78716c', label: `Gravel: ${g}` })
  inst.push({ id: 'water-bar', type: 'cylinder', position: [2.5, wH / 2, 0], args: [0.3, 0.3, wH, 12], color: '#3b82f6', opacity: 0.7, transparent: true, label: `W/C: ${wc.toFixed(2)}` })

  // Mixed result block (aggregate visualization)
  const mixX = 4.2
  inst.push({ id: 'mix-block', type: 'box', position: [mixX, boxSize / 2, 0], args: [boxSize, boxSize, boxSize * 0.8], color: '#71717a' })
  // Random aggregate pieces in block
  const aggRadius = aggSize * 3
  const positions: [number, number, number][] = [
    [mixX - 0.2, 0.3, 0.1], [mixX + 0.15, 0.5, -0.1], [mixX, 0.7, 0.05],
    [mixX - 0.3, 0.6, 0], [mixX + 0.2, 0.2, 0.15], [mixX - 0.1, 0.85, -0.1],
  ]
  positions.forEach((pos, i) => {
    inst.push({ id: `agg-${i}`, type: 'sphere', position: pos, args: [aggRadius, 6, 6], color: '#a8a29e' })
  })
  // Sand fill
  inst.push({ id: 'sand-fill', type: 'box', position: [mixX, boxSize / 2, 0], args: [boxSize - 0.02, boxSize - 0.02, boxSize * 0.78], color: '#fef3c7', opacity: 0.2, transparent: true })

  // Strength indicator
  // Approximate: higher cement ratio + lower w/c = higher strength
  const strengthNorm = (1 / total) * (1 / wc) * 2
  const strengthH = Math.min(strengthNorm, 1.5)
  inst.push({ id: 'strength', type: 'box', position: [mixX + 0.8, strengthH / 2, 0], args: [0.2, strengthH, 0.3], color: strengthH > 1.0 ? '#2D9F6F' : strengthH > 0.6 ? '#f97316' : '#D64545', label: `≈${(strengthNorm * 1750 + 1500).toFixed(0)} psi` })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-class-a', label: '1:2:4 Class A = 3500 psi', description: 'Class A concrete (1:2:4 mix ratio) achieves approximately 3500 psi (24 MPa) compressive strength', codeCitation: 'NSCP 2015 §404.1', position: () => [-2.5, 3.5, 0] },
  { id: 'ann-wc', label: 'W/C Ratio Effect', description: 'Lower water-cement ratio increases strength but reduces workability; typical structural range 0.40–0.55', codeCitation: 'NSCP 2015 §404.2', position: () => [2.5, 2.5, 0] },
]

const presets: Preset[] = [
  { label: 'Class AA (1:1.5:3)', values: { cementParts: 1, sandParts: 1.5, gravelParts: 3, wcRatio: 0.45, aggregateSize: '20' } },
  { label: 'Class A (1:2:4)', values: { cementParts: 1, sandParts: 2, gravelParts: 4, wcRatio: 0.50, aggregateSize: '20' } },
  { label: 'Class B (1:2.5:5)', values: { cementParts: 1, sandParts: 2.5, gravelParts: 5, wcRatio: 0.55, aggregateSize: '40' } },
  { label: 'High Strength', values: { cementParts: 1, sandParts: 1.5, gravelParts: 2.5, wcRatio: 0.38, aggregateSize: '10' } },
]

export const concreteAggregateVisualizerConfig: ParametricSceneConfig = {
  id: 'concrete-aggregate-visualizer',
  title: 'Concrete Aggregate Visualizer',
  description: 'Concrete mix proportions showing cement:sand:gravel ratios, water-cement ratio, aggregate sizes, and approximate compressive strength.',
  subject: 'materials',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 3, 5], fov: 55 },
}

