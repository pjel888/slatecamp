// src/app/dashboard/3d-lab/_config/modules/concrete-mix-proportions.ts
// Concrete Mix Proportions — Building Materials / NSCP
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const MIX_DATA: Record<string, { cement: number; sand: number; gravel: number; psi: number; label: string }> = {
  'AA': { cement: 1, sand: 1.5, gravel: 3, psi: 4000, label: 'Class AA (1:1½:3)' },
  'A':  { cement: 1, sand: 2,   gravel: 4, psi: 3500, label: 'Class A (1:2:4)' },
  'B':  { cement: 1, sand: 2.5, gravel: 5, psi: 3000, label: 'Class B (1:2½:5)' },
  'C':  { cement: 1, sand: 3,   gravel: 6, psi: 2500, label: 'Class C (1:3:6)' },
  'D':  { cement: 1, sand: 3.5, gravel: 7, psi: 2000, label: 'Class D (1:3½:7)' },
}

const parameters: ParameterDef[] = [
  { key: 'mixClass', label: 'Concrete Mix Class', type: 'dropdown', default: 'A',
    options: Object.entries(MIX_DATA).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Mix Design' },
  { key: 'batchVolume', label: 'Batch Volume', type: 'slider', min: 0.1, max: 2.0, step: 0.1, default: 1.0, unit: 'm³', group: 'Batch' },
  { key: 'wcRatio', label: 'Water-Cement Ratio', type: 'slider', min: 0.4, max: 0.7, step: 0.01, default: 0.5, decimals: 2, group: 'Mix Design' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const cls = str(params.mixClass)
  const vol = num(params.batchVolume)
  const wc = num(params.wcRatio)
  const mix = MIX_DATA[cls] ?? MIX_DATA['A']
  const total = mix.cement + mix.sand + mix.gravel
  const scale = vol * 0.8
  const inst: GeometryInstruction[] = []

  // Base platform
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [6, 0.2, 2], color: '#52525b' })

  // Ingredient bars (side by side)
  const barW = 0.6
  const spacing = 1.0
  const maxH = 3.0

  const cementH = (mix.cement / total) * maxH * scale
  inst.push({ id: 'cement-bar', type: 'box', position: [-spacing * 1.5, cementH / 2, 0], args: [barW, cementH, barW], color: '#d4d4d8', label: `Cement: ${mix.cement}` })
  inst.push({ id: 'cement-label', type: 'sphere', position: [-spacing * 1.5, cementH + 0.2, 0], args: [0.12, 8, 8], color: '#71717a' })

  const sandH = (mix.sand / total) * maxH * scale
  inst.push({ id: 'sand-bar', type: 'box', position: [-spacing * 0.5, sandH / 2, 0], args: [barW, sandH, barW], color: '#D4951A', label: `Sand: ${mix.sand}` })
  inst.push({ id: 'sand-label', type: 'sphere', position: [-spacing * 0.5, sandH + 0.2, 0], args: [0.12, 8, 8], color: '#D4951A' })

  const gravelH = (mix.gravel / total) * maxH * scale
  inst.push({ id: 'gravel-bar', type: 'box', position: [spacing * 0.5, gravelH / 2, 0], args: [barW, gravelH, barW], color: '#a8a29e', label: `Gravel: ${mix.gravel}` })
  inst.push({ id: 'gravel-label', type: 'sphere', position: [spacing * 0.5, gravelH + 0.2, 0], args: [0.12, 8, 8], color: '#78716c' })

  const waterH = wc * (mix.cement / total) * maxH * scale * 0.6
  inst.push({ id: 'water-bar', type: 'cylinder', position: [spacing * 1.5, waterH / 2, 0], args: [barW * 0.4, barW * 0.4, waterH, 12], color: '#3b82f6', opacity: 0.7, transparent: true, label: `w/c: ${wc.toFixed(2)}` })

  // Mixed concrete result block
  const resultH = 1.2 * scale
  inst.push({ id: 'result-block', type: 'box', position: [spacing * 3.0, resultH / 2, 0], args: [1.0, resultH, 1.0], color: '#71717a' })
  inst.push({ id: 'result-top', type: 'box', position: [spacing * 3.0, resultH + 0.05, 0], args: [1.1, 0.1, 1.1], color: '#52525b' })

  // Strength indicator
  const strengthNorm = (mix.psi - 2000) / 2000
  inst.push({ id: 'strength-bar', type: 'box', position: [spacing * 3.5, strengthNorm * 1.5, 0], args: [0.1, strengthNorm * 3 * scale, 0.3], color: strengthNorm > 0.6 ? '#2D9F6F' : strengthNorm > 0.3 ? '#f97316' : '#D64545', label: `${mix.psi} psi` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'wc-ratio-high', field: 'wcRatio',
    check: (p) => num(p.wcRatio) > 0.60,
    message: 'Water-cement ratio above 0.60 reduces durability significantly',
    codeCitation: 'NSCP 2015 §404.2', severity: 'warning',
    position: () => [1.5, 3, 0],
  },
  {
    id: 'structural-class', field: 'mixClass',
    check: (p) => str(p.mixClass) === 'D',
    message: 'Class D mix (2000 psi) is not for structural use — non-structural fill only',
    codeCitation: 'NSCP 2015 §404.1', severity: 'warning',
    position: () => [3, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-class-a', label: 'Class A (3500 psi)', description: 'Class A concrete (1:2:4) is used for all structural members subject to direct loads', codeCitation: 'NSCP 2015 §404.1', position: () => [-2.5, 3.2, 0] },
  { id: 'ann-wc', label: 'Water-Cement Ratio', description: 'Lower w/c ratio increases strength and durability; typical structural range 0.40–0.55', codeCitation: 'NSCP 2015 §404.2', position: () => [1.5, 2, 0.8] },
]

const presets: Preset[] = [
  { label: 'Class AA (Structural+)', values: { mixClass: 'AA', batchVolume: 1.0, wcRatio: 0.45 } },
  { label: 'Class A (Standard)', values: { mixClass: 'A', batchVolume: 1.0, wcRatio: 0.50 } },
  { label: 'Class B (Footings)', values: { mixClass: 'B', batchVolume: 1.5, wcRatio: 0.55 } },
  { label: 'Class C (Non-structural)', values: { mixClass: 'C', batchVolume: 2.0, wcRatio: 0.60 } },
]

export const concreteMixProportionsConfig: ParametricSceneConfig = {
  id: 'concrete-mix-proportions',
  title: 'Concrete Mix Proportions',
  description: 'Ingredient ratio visualizer for concrete Classes AA, A, B, C, D showing proportions by volume, water-cement ratio, and compressive strength.',
  subject: 'materials',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 3, 6], fov: 50 },
}
