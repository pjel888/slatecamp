// src/features/3d-lab/config/modules/ramp-gradient-building.ts
// Building Ramp Gradient — RA 9514 Fire Code
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  { key: 'gradient', label: 'Ramp Gradient (1:X)', type: 'slider', min: 4, max: 20, step: 0.5, default: 10, decimals: 1, group: 'Ramp' },
  { key: 'rampWidth', label: 'Ramp Width', type: 'slider', min: 2000, max: 8000, step: 200, default: 4000, unit: 'mm', group: 'Ramp' },
  { key: 'rampLength', label: 'Ramp Length', type: 'slider', min: 3000, max: 20000, step: 500, default: 10000, unit: 'mm', group: 'Ramp' },
  { key: 'showVehicle', label: 'Show Vehicle', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const grad = num(params.gradient)
  const rW = num(params.rampWidth) / 1000
  const rL = num(params.rampLength) / 1000
  const showVeh = Boolean(params.showVehicle)
  const riseH = rL / grad
  const angle = Math.atan(1 / grad)
  const fireMaxGrad = 10
  const violated = grad < fireMaxGrad
  const rampColor = violated ? '#fca5a5' : '#a1a1aa'
  const inst: GeometryInstruction[] = []

  // Ground level
  inst.push({ id: 'ground', type: 'box', position: [0, -0.1, 0], args: [rW + 3, 0.2, rL + 6], color: '#52525b' })

  // Ramp surface
  inst.push({ id: 'ramp', type: 'box', position: [0, riseH / 2, 0], rotation: [angle, 0, 0], args: [rW, 0.15, Math.sqrt(rL * rL + riseH * riseH)], color: rampColor })

  // Ramp guardrails
  inst.push({ id: 'rail-left', type: 'box', position: [-rW / 2 - 0.075, riseH / 2 + 0.5, 0], rotation: [angle, 0, 0], args: [0.15, 0.05, Math.sqrt(rL * rL + riseH * riseH)], color: '#71717a' })
  inst.push({ id: 'rail-right', type: 'box', position: [rW / 2 + 0.075, riseH / 2 + 0.5, 0], rotation: [angle, 0, 0], args: [0.15, 0.05, Math.sqrt(rL * rL + riseH * riseH)], color: '#71717a' })

  // Upper landing
  inst.push({ id: 'landing-top', type: 'box', position: [0, riseH + 0.075, -(rL / 2 + 1.5)], args: [rW + 0.3, 0.15, 3.0], color: '#71717a' })
  // Lower landing
  inst.push({ id: 'landing-bot', type: 'box', position: [0, 0.075, rL / 2 + 1.5], args: [rW + 0.3, 0.15, 3.0], color: '#71717a' })

  // Gradient reference triangle
  inst.push({ id: 'rise-arrow', type: 'box', position: [-(rW / 2 + 0.5), riseH / 2, rL / 4], args: [0.03, riseH, 0.03], color: '#3b82f6' })
  inst.push({ id: 'run-arrow', type: 'box', position: [-(rW / 2 + 0.5), 0.02, 0], args: [0.03, 0.03, rL / 2], color: '#f97316' })
  inst.push({ id: 'rise-label', type: 'cone', position: [-(rW / 2 + 0.5), riseH + 0.15, rL / 4], args: [0.06, 0.15, 6], color: '#3b82f6' })

  // Max gradient indicator (1:10)
  const maxRise = rL / fireMaxGrad
  inst.push({ id: 'max-grad-plane', type: 'box', position: [0, maxRise, -(rL / 10)], args: [rW + 0.5, 0.02, rL * 0.02], color: violated ? '#D64545' : '#2D9F6F', opacity: 0.6, transparent: true, label: '1:10 max' })

  // Vehicle (simplified)
  if (showVeh) {
    const vY = riseH / 4
    const vZ = rL / 4
    inst.push({ id: 'vehicle-body', type: 'box', position: [0, vY + 0.75, vZ], rotation: [angle, 0, 0], args: [1.9, 1.5, 4.5], color: '#3b82f6', opacity: 0.7, transparent: true })
    inst.push({ id: 'vehicle-roof', type: 'box', position: [0, vY + 1.6, vZ], rotation: [angle, 0, 0], args: [1.7, 0.6, 2.5], color: '#1B3FC4', opacity: 0.7, transparent: true })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'max-gradient', field: 'gradient',
    check: (p) => num(p.gradient) < 10,
    message: 'Building ramp gradient steeper than 1:10 maximum per RA 9514',
    codeCitation: 'RA 9514 IRR Rule 10 §10.2.9', severity: 'error',
    position: () => [3, 3, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-max', label: 'Max Gradient 1:10', description: 'Building ramps for vehicles shall not exceed a gradient of 1:10 (1m rise per 10m run) per fire code', codeCitation: 'RA 9514 IRR Rule 10 §10.2.9', position: () => [3, 3, 0] },
  { id: 'ann-bp344', label: 'Accessibility Ramp: 1:20', description: 'BP 344 accessibility ramps are more restrictive: 1:20 default, 1:15 for special cases', codeCitation: 'BP 344 2024 IRR §6.1', position: () => [-3, 2, 0] },
]

const presets: Preset[] = [
  { label: 'Compliant (1:10)', values: { gradient: 10, rampWidth: 4000, rampLength: 10000, showVehicle: true } },
  { label: 'Gentle (1:15)', values: { gradient: 15, rampWidth: 4000, rampLength: 15000, showVehicle: true } },
  { label: 'BP 344 (1:20)', values: { gradient: 20, rampWidth: 3000, rampLength: 12000, showVehicle: false } },
  { label: 'Violation (1:6)', values: { gradient: 6, rampWidth: 4000, rampLength: 8000, showVehicle: true } },
]

export const rampGradientBuildingConfig: ParametricSceneConfig = {
  id: 'ramp-gradient-building',
  title: 'Ramp Gradient — Building',
  description: 'Building ramp with max 1:10 gradient per RA 9514 Fire Code; compares with BP 344 accessibility requirements of 1:20.',
  subject: 'ra-9514',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 4, 7], fov: 50 },
}

