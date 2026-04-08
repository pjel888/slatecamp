// src/features/3d-lab/config/modules/02-accessibility/reach-range-sphere.ts
// Reach Range Sphere — BP 344 2024 IRR §5.4
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const parameters: ParameterDef[] = [
  { key: 'reachType', label: 'Reach Type', type: 'dropdown', default: 'forward',
    options: [{ value: 'forward', label: 'Forward Reach' }, { value: 'side', label: 'Side Reach' }],
    group: 'Reach' },
  { key: 'mountHeight', label: 'Control Mount Height', type: 'slider', min: 300, max: 1800, step: 10, default: 900, unit: 'mm', group: 'Control' },
  { key: 'shelfDepth', label: 'Shelf / Obstruction Depth', type: 'slider', min: 0, max: 600, step: 10, default: 0, unit: 'mm', group: 'Control' },
  { key: 'isSeated', label: 'Wheelchair User (Seated)', type: 'toggle', default: true, group: 'User' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const reachType = str(params.reachType)
  const mountH = num(params.mountHeight)
  const shelfD = num(params.shelfDepth)
  const seated = params.isSeated === true || params.isSeated === 'true'
  const scale = 0.004 // 1mm → 0.004 scene units

  // Key reference heights in mm
  const eyeH = seated ? 1155 : 1680
  const shoulderH = seated ? 1320 : 1500
  const maxForward = seated ? 1200 : 1220
  const minForward = seated ? 400 : 380
  const maxSide = seated ? 1370 : 1370
  const minSide = seated ? 230 : 230

  const maxReach = reachType === 'forward' ? maxForward : maxSide
  const minReach = reachType === 'forward' ? minForward : minSide

  const mountHs = mountH * scale
  const maxReachHs = maxReach * scale
  const minReachHs = minReach * scale
  const shelfDs = shelfD * scale
  const eyeHs = eyeH * scale
  const shoulderHs = shoulderH * scale

  const aboveMax = mountH > maxReach
  const belowMin = mountH < minReach

  const inst: GeometryInstruction[] = []

  // Floor plane
  inst.push({ id: 'floor', type: 'box', position: [0, 0, 0], args: [3, 0.02, 3], color: '#e4e4e7', opacity: 0.6, transparent: true })

  // Human torso silhouette (simplified as boxes)
  const torsoBase = seated ? 0.48 : 0
  inst.push({ id: 'torso', type: 'box', position: [0, torsoBase + 0.35, 0], args: [0.28, 0.7, 0.18], color: '#94a3b8', opacity: 0.7, transparent: true })
  inst.push({ id: 'head', type: 'cylinder', position: [0, eyeHs + 0.06, 0], args: [0.1, 0.1, 0.22, 12], color: '#94a3b8', opacity: 0.7, transparent: true })

  // Wheelchair seat (if seated)
  if (seated) {
    inst.push({ id: 'wc-seat', type: 'box', position: [0, 0.26, 0], args: [0.5, 0.06, 0.5], color: '#71717a', opacity: 0.9, transparent: true })
    inst.push({ id: 'wc-wheel-l', type: 'cylinder', position: [-0.32, 0.14, 0], rotation: [Math.PI / 2, 0, 0], args: [0.14, 0.14, 0.05, 16], color: '#52525b' })
    inst.push({ id: 'wc-wheel-r', type: 'cylinder', position: [0.32, 0.14, 0], rotation: [Math.PI / 2, 0, 0], args: [0.14, 0.14, 0.05, 16], color: '#52525b' })
  }

  // Reach envelope sphere (max reach)
  inst.push({ id: 'reach-max', type: 'sphere', position: [reachType === 'side' ? 0.65 : 0, shoulderHs, reachType === 'forward' ? -0.55 : 0],
    args: [0.08, 12, 12], color: aboveMax ? '#D64545' : '#2D9F6F', opacity: 0.5, transparent: true,
    label: `Max: ${maxReach}mm` })
  // Reach envelope sphere (min reach)
  inst.push({ id: 'reach-min', type: 'sphere', position: [reachType === 'side' ? 0.35 : 0, minReachHs, reachType === 'forward' ? -0.25 : 0],
    args: [0.08, 12, 12], color: belowMin ? '#D64545' : '#f97316', opacity: 0.5, transparent: true,
    label: `Min: ${minReach}mm` })

  // Reach zone band (transparent box between min and max)
  const zoneH = (maxReach - minReach) * scale
  const zoneMid = ((maxReach + minReach) / 2) * scale
  inst.push({ id: 'reach-zone', type: 'box',
    position: [reachType === 'side' ? 0.6 : 0, zoneMid, 0],
    args: [reachType === 'side' ? 0.25 : 0.25, zoneH, 0.02],
    color: '#2D9F6F', opacity: 0.12, transparent: true })

  // Shelf / obstruction
  if (shelfD > 0) {
    inst.push({ id: 'shelf', type: 'box', position: [0, mountHs - 0.04, -shelfDs / 2],
      args: [0.8, 0.04, shelfDs], color: '#a78bfa', opacity: 0.7, transparent: true, label: `Shelf ${shelfD}mm` })
  }

  // Control / switch indicator
  inst.push({ id: 'control', type: 'box', position: [reachType === 'side' ? 0.72 : -0.42, mountHs, 0],
    args: [0.07, 0.07, 0.04], color: aboveMax || belowMin ? '#D64545' : '#1B3FC4',
    label: `${mountH}mm` })

  // Max reach height line
  inst.push({ id: 'line-max', type: 'box', position: [0, maxReachHs, 0], args: [2.8, 0.01, 0.01], color: '#2D9F6F', opacity: 0.6, transparent: true })
  // Min reach height line
  inst.push({ id: 'line-min', type: 'box', position: [0, minReachHs, 0], args: [2.8, 0.01, 0.01], color: '#f97316', opacity: 0.6, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'above-max-reach', field: 'mountHeight',
    check: (p) => {
      const seated = p.isSeated === true || p.isSeated === 'true'
      const reachType = str(p.reachType)
      const max = seated ? (reachType === 'forward' ? 1200 : 1370) : (reachType === 'forward' ? 1220 : 1370)
      return num(p.mountHeight) > max
    },
    message: 'Control mounted above maximum reach range for wheelchair user',
    codeCitation: 'BP 344 2024 IRR §5.4 — forward reach max 1200mm, side reach max 1370mm (seated)',
    severity: 'error',
    position: () => [1.5, 1.5, 0],
  },
  {
    id: 'below-min-reach', field: 'mountHeight',
    check: (p) => {
      const seated = p.isSeated === true || p.isSeated === 'true'
      const reachType = str(p.reachType)
      const min = seated ? (reachType === 'forward' ? 400 : 230) : (reachType === 'forward' ? 380 : 230)
      return num(p.mountHeight) < min
    },
    message: 'Control mounted below minimum reach range — inaccessible from wheelchair',
    codeCitation: 'BP 344 2024 IRR §5.4 — forward reach min 400mm seated',
    severity: 'error',
    position: () => [1.5, 0.3, 0],
  },
  {
    id: 'deep-shelf-obstruction', field: 'shelfDepth',
    check: (p) => num(p.shelfDepth) > 250 && num(p.mountHeight) > 1150,
    message: 'Shelf depth exceeds 250mm with control above 1150mm — obstructed forward reach',
    codeCitation: 'BP 344 2024 IRR §5.4 — obstructed reach reduces max to 1150mm when shelf > 250mm',
    severity: 'warning',
    position: () => [0, 1.4, -0.5],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-reach-zone', label: 'Accessible Reach Zone', description: 'Shaded band shows the accessible reach zone between minimum (400mm) and maximum (1200mm) heights for a seated wheelchair user per BP 344 2024 IRR §5.4', codeCitation: 'BP 344 2024 IRR §5.4', position: (p) => [str(p.reachType) === 'side' ? 1.2 : 0.8, num(p.isSeated === true || p.isSeated === 'true' ? 0.8 : 1.0), 0] },
  { id: 'ann-eye-level', label: 'Eye Level Reference', description: 'Eye level for a seated wheelchair user is approximately 1155mm, informing signage and display heights', codeCitation: 'BP 344 2024 IRR §5.3', position: () => [-1.2, 1.16, 0] },
  { id: 'ann-shelf', label: 'Shelf Obstruction', description: 'Obstructions reduce the effective reach range — shelf depth over 250mm with control above 1150mm creates a non-compliant obstructed reach condition', codeCitation: 'BP 344 2024 IRR §5.4', position: () => [0.6, 1.2, -0.4], visibleWhen: (p) => num(p.shelfDepth) > 0 },
]

const presets: Preset[] = [
  { label: 'Compliant Counter (Seated)', values: { reachType: 'forward', mountHeight: 900, shelfDepth: 0, isSeated: true } },
  { label: 'Too High — Violation', values: { reachType: 'forward', mountHeight: 1400, shelfDepth: 0, isSeated: true } },
  { label: 'Side Reach Compliant', values: { reachType: 'side', mountHeight: 1100, shelfDepth: 0, isSeated: true } },
  { label: 'Obstructed Forward Reach', values: { reachType: 'forward', mountHeight: 1200, shelfDepth: 300, isSeated: true } },
  { label: 'Standing User', values: { reachType: 'forward', mountHeight: 1100, shelfDepth: 0, isSeated: false } },
]

export const reachRangeSphereConfig: ParametricSceneConfig = {
  id: 'reach-range-sphere',
  title: 'Reach Range Sphere',
  description: 'Interactive reach envelope showing wheelchair user forward and side reach limits per BP 344 2024 IRR §5.4, with control mounting height compliance check.',
  subject: 'bp-344',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [2.5, 2.0, 2.5], fov: 50 },
  showHumanScale: false,
}
