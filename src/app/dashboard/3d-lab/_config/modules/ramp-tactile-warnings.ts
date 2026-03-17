// src/app/dashboard/3d-lab/_config/modules/ramp-tactile-warnings.ts
// Ramp Tactile Warning Blocks — BP 344 2024 IRR §6.1
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'rampGradient', label: 'Ramp Gradient (1:X)', type: 'slider', min: 10, max: 30, step: 0.5, default: 20, decimals: 1, group: 'Ramp' },
  { key: 'rampWidth', label: 'Ramp Width', type: 'slider', min: 900, max: 3000, step: 100, default: 1500, unit: 'mm', group: 'Ramp' },
  { key: 'rampLength', label: 'Ramp Length', type: 'slider', min: 2000, max: 10000, step: 200, default: 4000, unit: 'mm', group: 'Ramp' },
  { key: 'tactileDepth', label: 'Tactile Strip Depth', type: 'slider', min: 300, max: 900, step: 50, default: 600, unit: 'mm', group: 'Tactile' },
  { key: 'landingDepth', label: 'Landing Depth', type: 'slider', min: 1200, max: 2400, step: 100, default: 1800, unit: 'mm', group: 'Ramp' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const grad = num(params.rampGradient)
  const rW = mm(params.rampWidth)
  const rL = mm(params.rampLength)
  const tactD = mm(params.tactileDepth)
  const landD = mm(params.landingDepth)
  const angle = Math.atan(1 / grad)
  const riseH = rL / grad
  const gradViolated = grad < 20
  const tactViolated = tactD < 0.6
  const landViolated = landD < 1.8
  const rampLen = Math.sqrt(rL * rL + riseH * riseH)
  const rampColor = gradViolated ? '#fca5a5' : '#d4d4d8'
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.05, 0], args: [rW + 1, 0.1, rL + landD * 2 + 2], color: '#52525b' })

  // Bottom landing
  inst.push({ id: 'landing-bot', type: 'box', position: [0, 0.02, rL / 2 + landD / 2], args: [rW + 0.2, 0.04, landD], color: '#a1a1aa' })
  // Tactile at bottom of ramp
  const botTactZ = rL / 2 + tactD / 2
  inst.push({ id: 'tactile-bot', type: 'box', position: [0, 0.04, botTactZ], args: [rW, 0.04, tactD], color: tactViolated ? '#fca5a5' : '#D4951A', label: `${(tactD * 1000).toFixed(0)}mm` })
  // Tactile dots on bottom strip
  const dotCols = Math.round(rW / 0.05)
  for (let d = 0; d < Math.min(dotCols, 15); d++) {
    const dx = -(rW / 2) + (d + 0.5) * (rW / Math.min(dotCols, 15))
    inst.push({ id: `dot-bot-${d}`, type: 'sphere', position: [dx, 0.07, botTactZ], args: [0.012, 6, 6], color: '#D4951A' })
  }

  // Ramp surface
  inst.push({ id: 'ramp', type: 'box', position: [0, riseH / 2, 0], rotation: [angle, 0, 0], args: [rW, 0.12, rampLen], color: rampColor })

  // Top landing
  inst.push({ id: 'landing-top', type: 'box', position: [0, riseH + 0.02, -(rL / 2 + landD / 2)], args: [rW + 0.2, 0.04, landD], color: '#a1a1aa' })
  // Tactile at top of ramp
  const topTactZ = -(rL / 2 + tactD / 2)
  inst.push({ id: 'tactile-top', type: 'box', position: [0, riseH + 0.04, topTactZ], args: [rW, 0.04, tactD], color: tactViolated ? '#fca5a5' : '#D4951A', label: `${(tactD * 1000).toFixed(0)}mm` })
  for (let d = 0; d < Math.min(12, 10); d++) {
    const dx = -(rW / 2) + (d + 0.5) * (rW / 10)
    inst.push({ id: `dot-top-${d}`, type: 'sphere', position: [dx, riseH + 0.07, topTactZ], args: [0.012, 6, 6], color: '#D4951A' })
  }

  // Handrails
  inst.push({ id: 'hr-left', type: 'cylinder', position: [-(rW / 2 + 0.05), riseH / 2 + 0.9, 0], rotation: [0, 0, -angle], args: [0.019, 0.019, rampLen + 0.3, 8], color: '#52525b' })
  inst.push({ id: 'hr-right', type: 'cylinder', position: [(rW / 2 + 0.05), riseH / 2 + 0.9, 0], rotation: [0, 0, -angle], args: [0.019, 0.019, rampLen + 0.3, 8], color: '#52525b' })

  // Landing depth indicator
  inst.push({ id: 'land-dim', type: 'box', position: [rW / 2 + 0.4, 0.04, rL / 2 + landD / 2], args: [0.2, 0.01, landD], color: landViolated ? '#D64545' : '#3b82f6', label: `${(landD * 1000).toFixed(0)}mm` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'ramp-gradient', field: 'rampGradient',
    check: (p) => num(p.rampGradient) < 20,
    message: 'Accessibility ramp gradient steeper than 1:20 default; 1:15 only for special cases',
    codeCitation: 'BP 344 2024 IRR §6.1', severity: 'error',
    position: () => [2, 2, 0],
  },
  {
    id: 'tactile-depth', field: 'tactileDepth',
    check: (p) => mm(p.tactileDepth) < 0.6,
    message: 'Tactile warning strip must be at least 600mm deep at top and bottom of ramp',
    codeCitation: 'BP 344 2024 IRR §6.4', severity: 'error',
    position: () => [0, 0.5, 3],
  },
  {
    id: 'landing-depth', field: 'landingDepth',
    check: (p) => mm(p.landingDepth) < 1.8,
    message: 'Ramp landing must be at least 1800mm long for wheelchair turning',
    codeCitation: 'BP 344 2024 IRR §6.1', severity: 'error',
    position: () => [2, 0.5, -4],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-tactile', label: '600mm Tactile Strip', description: 'Tactile warning blocks (truncated domes) must be placed 600mm deep at head and foot of every ramp', codeCitation: 'BP 344 2024 IRR §6.4', position: (p) => [mm(p.rampWidth) / 2 + 0.6, 0.5, mm(p.rampLength) / 2 + mm(p.landingDepth) / 2] },
  { id: 'ann-gradient', label: '1:20 Gradient', description: 'Standard accessibility ramp gradient is 1:20; 1:15 only permitted where 1:20 is impracticable', codeCitation: 'BP 344 2024 IRR §6.1', position: () => [-2.5, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Standard 1:20', values: { rampGradient: 20, rampWidth: 1500, rampLength: 4000, tactileDepth: 600, landingDepth: 1800 } },
  { label: 'Special 1:15', values: { rampGradient: 15, rampWidth: 1500, rampLength: 3000, tactileDepth: 600, landingDepth: 1800 } },
  { label: 'Wide Ramp', values: { rampGradient: 20, rampWidth: 2400, rampLength: 5000, tactileDepth: 600, landingDepth: 2000 } },
  { label: 'Violation Demo', values: { rampGradient: 12, rampWidth: 1200, rampLength: 3000, tactileDepth: 400, landingDepth: 1200 } },
]

export const rampTactileWarningsConfig: ParametricSceneConfig = {
  id: 'ramp-tactile-warnings',
  title: 'Ramp Tactile Warnings',
  description: 'Accessibility ramp with tactile warning blocks (600mm depth) at head and foot, 1:20 gradient, and 1800mm landings per BP 344 2024 IRR.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 4, 7], fov: 50 },
}
