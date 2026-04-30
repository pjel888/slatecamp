// src/features/3d-lab/config/modules/accessible-stair-handrails.ts
// Accessible Stair Handrails — BP 344 2024 IRR §6.3
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'lowerRailHeight', label: 'Lower Rail Height', type: 'slider', min: 600, max: 800, step: 10, default: 700, unit: 'mm', group: 'Handrails' },
  { key: 'upperRailHeight', label: 'Upper Rail Height', type: 'slider', min: 800, max: 1000, step: 10, default: 900, unit: 'mm', group: 'Handrails' },
  { key: 'railDiameter', label: 'Rail Diameter', type: 'slider', min: 25, max: 50, step: 5, default: 35, unit: 'mm', group: 'Handrails' },
  { key: 'extensionLength', label: 'Horizontal Extension', type: 'slider', min: 200, max: 500, step: 50, default: 300, unit: 'mm', group: 'Handrails' },
  { key: 'numSteps', label: 'Number of Steps', type: 'slider', min: 4, max: 14, step: 1, default: 10, group: 'Stair' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const loH = mm(params.lowerRailHeight)
  const upH = mm(params.upperRailHeight)
  const diam = mm(params.railDiameter)
  const ext = mm(params.extensionLength)
  const nSteps = num(params.numSteps)
  const rH = 0.175
  const tD = 0.280
  const stairW = 1.5
  const angle = Math.atan(rH / tD)
  const rLen = Math.sqrt((nSteps * tD) ** 2 + (nSteps * rH) ** 2)
  const loViolated = loH < 0.7
  const upViolated = upH < 0.865 || upH > 0.9
  const dViolated = diam < 0.03 || diam > 0.04
  const extViolated = ext < 0.3
  const loColor = loViolated ? '#D64545' : '#3b82f6'
  const upColor = upViolated ? '#D64545' : '#2D9F6F'
  const inst: GeometryInstruction[] = []

  // Steps
  for (let s = 0; s < nSteps; s++) {
    inst.push({ id: `tread-${s}`, type: 'box', position: [s * tD + tD / 2, s * rH + rH / 2, 0], args: [tD, rH, stairW], color: '#a1a1aa' })
    inst.push({ id: `nosing-${s}`, type: 'box', position: [s * tD + tD / 2, s * rH + rH, 0], args: [tD + 0.01, 0.02, stairW + 0.04], color: '#71717a' })
  }

  // Landing
  inst.push({ id: 'landing', type: 'box', position: [nSteps * tD + 0.75, nSteps * rH - 0.1, 0], args: [1.5, 0.2, stairW + 0.2], color: '#a1a1aa' })
  // Wall
  inst.push({ id: 'wall', type: 'box', position: [-0.075, nSteps * rH / 2, -stairW / 2 - 0.075], args: [nSteps * tD + 2, nSteps * rH + 0.5, 0.15], color: '#d4d4d8' })

  // Upper handrail (865–900mm - PD1096/BP344 accessible)
  const upY = nSteps * rH / 2 + upH * Math.cos(angle)
  inst.push({ id: 'upper-rail-slope', type: 'cylinder', position: [nSteps * tD / 2, upY, -stairW / 2 - 0.04 - diam / 2], rotation: [0, 0, -angle], args: [diam / 2, diam / 2, rLen, 8], color: upColor })
  // Extension at top
  inst.push({ id: 'upper-ext-top', type: 'cylinder', position: [nSteps * tD + ext / 2, nSteps * rH + upH, -stairW / 2 - 0.04 - diam / 2], args: [diam / 2, diam / 2, ext, 8], color: upColor })
  // Extension at bottom
  inst.push({ id: 'upper-ext-bot', type: 'cylinder', position: [-(ext / 2), upH, -stairW / 2 - 0.04 - diam / 2], args: [diam / 2, diam / 2, ext, 8], color: upColor })

  // Lower handrail (700mm - BP344 accessible)
  const loY = nSteps * rH / 2 + loH * Math.cos(angle)
  inst.push({ id: 'lower-rail-slope', type: 'cylinder', position: [nSteps * tD / 2, loY, -stairW / 2 - 0.04 - diam / 2], rotation: [0, 0, -angle], args: [diam / 2, diam / 2, rLen, 8], color: loColor })

  // Free side handrails (mirrored)
  inst.push({ id: 'upper-free', type: 'cylinder', position: [nSteps * tD / 2, upY, stairW / 2 + 0.04 + diam / 2], rotation: [0, 0, -angle], args: [diam / 2, diam / 2, rLen, 8], color: upColor })
  inst.push({ id: 'lower-free', type: 'cylinder', position: [nSteps * tD / 2, loY, stairW / 2 + 0.04 + diam / 2], rotation: [0, 0, -angle], args: [diam / 2, diam / 2, rLen, 8], color: loColor })

  // Dimension lines
  inst.push({ id: 'dim-upper', type: 'box', position: [tD, upH, -stairW / 2 - 0.3], args: [0.02, upH, 0.02], color: upColor, label: `${(upH * 1000).toFixed(0)}mm` })
  inst.push({ id: 'dim-lower', type: 'box', position: [tD * 2, loH, -stairW / 2 - 0.3], args: [0.02, loH, 0.02], color: loColor, label: `${(loH * 1000).toFixed(0)}mm` })

  // Diameter indicator
  inst.push({ id: 'diam-ring', type: 'ring', position: [tD * 3, nSteps * rH / 2, -stairW / 2 - 0.1], rotation: [0, Math.PI / 2, 0], args: [diam / 2, diam / 2 + 0.01, 12, 1, 0, Math.PI * 2], color: dViolated ? '#D64545' : '#3b82f6', label: `⌀${(diam * 1000).toFixed(0)}mm` })

  // Extension indicator
  inst.push({ id: 'ext-dim', type: 'box', position: [nSteps * tD + ext / 2, nSteps * rH + upH + 0.1, -stairW / 2 - 0.1], args: [ext, 0.02, 0.02], color: extViolated ? '#D64545' : '#3b82f6', label: `${(ext * 1000).toFixed(0)}mm ext` })

  return inst
}

const violations: ViolationRule[] = [
  { id: 'lower-rail', field: 'lowerRailHeight', check: (p) => num(p.lowerRailHeight) < 700, message: 'Lower handrail below 700mm — BP 344 requires dual rails at 700mm and 900mm', codeCitation: 'BP 344 2024 IRR §6.3', severity: 'error', position: () => [0, 2, -1.5] },
  { id: 'upper-rail', field: 'upperRailHeight', check: (p) => num(p.upperRailHeight) < 865 || num(p.upperRailHeight) > 900, message: 'Upper handrail outside 865–900mm accessible range', codeCitation: 'BP 344 2024 IRR §6.3', severity: 'error', position: () => [0, 3, -1.5] },
  { id: 'extension', field: 'extensionLength', check: (p) => num(p.extensionLength) < 300, message: 'Horizontal extension below 300mm minimum at top and bottom of ramp/stair', codeCitation: 'BP 344 2024 IRR §6.3', severity: 'error', position: () => [4, 3.5, 0] },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-dual', label: 'Dual Handrails Required', description: 'Accessible stairs require dual handrails: lower at 700mm and upper at 865–900mm above nosing', codeCitation: 'BP 344 2024 IRR §6.3', position: () => [-1, 3, -1.5] },
  { id: 'ann-ext', label: '300mm Extension', description: 'Handrails must extend horizontally 300mm beyond top and bottom nosing to aid approach and departure', codeCitation: 'BP 344 2024 IRR §6.3', position: (p) => [num(p.numSteps) * 0.28 + 0.5, num(p.numSteps) * 0.175 + 1, 0] },
]

const presets: Preset[] = [
  { label: 'BP 344 Compliant', values: { lowerRailHeight: 700, upperRailHeight: 865, railDiameter: 35, extensionLength: 300, numSteps: 10 } },
  { label: 'Wide Extension', values: { lowerRailHeight: 700, upperRailHeight: 900, railDiameter: 38, extensionLength: 450, numSteps: 8 } },
  { label: 'PD 1096 Only', values: { lowerRailHeight: 800, upperRailHeight: 865, railDiameter: 35, extensionLength: 300, numSteps: 12 } },
  { label: 'Violation Demo', values: { lowerRailHeight: 600, upperRailHeight: 950, railDiameter: 25, extensionLength: 200, numSteps: 10 } },
]

export const accessibleStairHandrailsConfig: ParametricSceneConfig = {
  id: 'accessible-stair-handrails',
  title: 'Accessible Stair Handrails',
  description: 'Stair section with dual handrails (700mm lower, 865–900mm upper), 300mm extensions, 30–40mm diameter per BP 344 2024 IRR §6.3.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [4, 4, 4], fov: 50 },
}

