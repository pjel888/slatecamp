// src/app/dashboard/3d-lab/_config/modules/beam-stress-diagram.ts
// Beam Stress Diagram — NSCP Chapter 4
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'beamSpan', label: 'Beam Span', type: 'slider', min: 3000, max: 12000, step: 500, default: 6000, unit: 'mm', group: 'Geometry' },
  { key: 'beamWidth', label: 'Beam Width', type: 'slider', min: 200, max: 600, step: 25, default: 300, unit: 'mm', group: 'Geometry' },
  { key: 'beamDepth', label: 'Beam Depth', type: 'slider', min: 300, max: 1200, step: 25, default: 600, unit: 'mm', group: 'Geometry' },
  { key: 'loadType', label: 'Load Type', type: 'dropdown', default: 'UDL', options: [{ value: 'UDL', label: 'Uniform Distributed Load' }, { value: 'Point', label: 'Point Load at Midspan' }], group: 'Loading' },
  { key: 'loadMagnitude', label: 'Load (kN/m or kN)', type: 'slider', min: 5, max: 100, step: 5, default: 30, unit: 'kN', group: 'Loading' },
  { key: 'showStressBlock', label: 'Show Stress Block', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const span = mm(params.beamSpan)
  const bW = mm(params.beamWidth)
  const bD = mm(params.beamDepth)
  const load = num(params.loadMagnitude)
  const loadType = String(params.loadType)
  const showStress = Boolean(params.showStressBlock)
  const inst: GeometryInstruction[] = []

  // Supports
  inst.push({ id: 'support-left', type: 'cone', position: [-span / 2, -bD / 2 - 0.3, 0], args: [0.3, 0.5, 8], color: '#52525b' })
  inst.push({ id: 'support-right', type: 'cone', position: [span / 2, -bD / 2 - 0.3, 0], args: [0.3, 0.5, 8], color: '#52525b' })
  // Support base plates
  inst.push({ id: 'base-left', type: 'box', position: [-span / 2, -bD / 2 - 0.6, 0], args: [0.5, 0.1, 0.4], color: '#3f3f46' })
  inst.push({ id: 'base-right', type: 'box', position: [span / 2, -bD / 2 - 0.6, 0], args: [0.5, 0.1, 0.4], color: '#3f3f46' })

  // Beam body
  inst.push({ id: 'beam', type: 'box', position: [0, 0, 0], args: [span, bD, bW], color: '#a1a1aa' })

  // Rebar (bottom tension zone - 3 bars)
  const coverY = -(bD / 2) + 0.05
  const barSpacing = bW / 4
  for (let i = -1; i <= 1; i++) {
    inst.push({ id: `rebar-bot-${i}`, type: 'cylinder', position: [0, coverY, i * barSpacing], rotation: [0, 0, Math.PI / 2], args: [0.016, 0.016, span - 0.1, 8], color: '#D64545' })
  }
  // Top rebar (2 bars)
  const topY = bD / 2 - 0.05
  for (let i = -1; i <= 1; i += 2) {
    inst.push({ id: `rebar-top-${i}`, type: 'cylinder', position: [0, topY, i * barSpacing], rotation: [0, 0, Math.PI / 2], args: [0.012, 0.012, span - 0.1, 8], color: '#D64545' })
  }

  // Load arrows
  if (loadType === 'UDL') {
    const arrowCount = Math.min(8, Math.floor(span / 0.5))
    const arrowH = 0.2 + (load / 100) * 0.6
    for (let i = 0; i < arrowCount; i++) {
      const ax = -span / 2 + (span / (arrowCount - 1)) * i
      inst.push({ id: `load-${i}`, type: 'cone', position: [ax, bD / 2 + arrowH, 0], rotation: [Math.PI, 0, 0], args: [0.08, arrowH, 6], color: '#f97316', opacity: 0.9, transparent: true })
    }
  } else {
    inst.push({ id: 'point-load', type: 'cone', position: [0, bD / 2 + 0.5, 0], rotation: [Math.PI, 0, 0], args: [0.15, 0.5, 8], color: '#D64545' })
  }

  // Stress block cross-section at midspan
  if (showStress) {
    const compH = bD * 0.35
    inst.push({ id: 'stress-comp', type: 'box', position: [span * 0.35, bD / 2 - compH / 2, bW * 0.6], args: [0.05, compH, bW * 0.9], color: '#D64545', opacity: 0.5, transparent: true, label: 'Compression' })
    inst.push({ id: 'stress-tension', type: 'box', position: [span * 0.35, -(bD / 2 - 0.1), bW * 0.6], args: [0.05, bD * 0.2, bW * 0.9], color: '#3b82f6', opacity: 0.5, transparent: true, label: 'Tension' })
    inst.push({ id: 'neutral-axis', type: 'box', position: [0, bD * 0.15, 0], args: [span, 0.01, bW + 0.1], color: '#2D9F6F', opacity: 0.6, transparent: true, label: 'NA' })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'depth-span-ratio', field: 'beamDepth',
    check: (p) => num(p.beamDepth) < num(p.beamSpan) / 16,
    message: 'Beam depth may be inadequate — check L/16 rule of thumb for serviceability',
    codeCitation: 'NSCP 2015 §406.3', severity: 'warning',
    position: () => [0, 1.5, 0],
  },
  {
    id: 'width-depth-ratio', field: 'beamWidth',
    check: (p) => mm(p.beamWidth) < mm(p.beamDepth) * 0.25,
    message: 'Beam width-to-depth ratio less than 1:4; lateral stability concern',
    codeCitation: 'NSCP 2015 §406.3', severity: 'warning',
    position: () => [2, 0, 0.5],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-neutral-axis', label: 'Neutral Axis', description: 'The neutral axis divides the compression zone (top) from tension zone (bottom) in bending', codeCitation: 'NSCP 2015 §406', position: (p) => [-(mm(p.beamSpan) / 2) - 0.5, mm(p.beamDepth) * 0.15, 0] },
  { id: 'ann-rebar', label: 'Tension Reinforcement', description: 'Bottom rebar resists tensile stresses; cover of 40mm required for beams', codeCitation: 'NSCP 2015 §407.7', position: (p) => [mm(p.beamSpan) / 2 + 0.5, -(mm(p.beamDepth) / 2) + 0.1, 0] },
]

const presets: Preset[] = [
  { label: 'Typical Floor Beam', values: { beamSpan: 6000, beamWidth: 300, beamDepth: 600, loadType: 'UDL', loadMagnitude: 30, showStressBlock: true } },
  { label: 'Long Span Beam', values: { beamSpan: 10000, beamWidth: 400, beamDepth: 800, loadType: 'UDL', loadMagnitude: 50, showStressBlock: true } },
  { label: 'Transfer Beam', values: { beamSpan: 7000, beamWidth: 500, beamDepth: 1000, loadType: 'Point', loadMagnitude: 80, showStressBlock: true } },
  { label: 'Shallow Beam', values: { beamSpan: 4000, beamWidth: 250, beamDepth: 350, loadType: 'UDL', loadMagnitude: 20, showStressBlock: false } },
]

export const beamStressDiagramConfig: ParametricSceneConfig = {
  id: 'beam-stress-diagram',
  title: 'Beam Stress Diagram',
  description: 'RC beam cross-section with load arrows showing bending stress distribution, neutral axis, and rebar placement per NSCP 2015.',
  subject: 'nscp',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 2, 5], fov: 50 },
}
