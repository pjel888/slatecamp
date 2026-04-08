// src/features/3d-lab/config/modules/13-planning/erosion-control-fence.ts
// Erosion Control Fence — DENR DAO 2021-30 / DPWH DO 56 s.2005
// Parametric visualization of silt fence and sediment control placement
// around a construction site per Philippine environmental compliance.

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

// Philippine Erosion Control References:
// DENR DAO 2021-30: Environmental Impact Assessment (EIA) system
// DPWH DO 56 s.2005: Environmental compliance for infrastructure projects
// RA 9275 (Clean Water Act): Prohibits discharge of sediment to waterways
// PD 1586 (EIS System): Requires Environmental Compliance Certificate (ECC)

const parameters: ParameterDef[] = [
  { key: 'siteWidth', label: 'Site Width', type: 'slider', min: 15, max: 80, step: 1, default: 40, unit: 'm', group: 'Site' },
  { key: 'siteDepth', label: 'Site Depth', type: 'slider', min: 15, max: 80, step: 1, default: 30, unit: 'm', group: 'Site' },
  { key: 'slopePercent', label: 'Ground Slope', type: 'slider', min: 0, max: 15, step: 0.5, default: 3, unit: '%', decimals: 1, group: 'Terrain' },
  { key: 'slopeDir', label: 'Slope Direction', type: 'dropdown', default: 'south',
    options: [
      { value: 'north', label: 'North (downhill)' },
      { value: 'south', label: 'South (downhill)' },
      { value: 'east', label: 'East (downhill)' },
      { value: 'west', label: 'West (downhill)' },
    ],
    group: 'Terrain' },
  { key: 'disturbedArea', label: 'Disturbed Area', type: 'slider', min: 20, max: 100, step: 5, default: 60, unit: '%', group: 'Earthwork' },
  { key: 'hasWaterway', label: 'Adjacent Waterway?', type: 'toggle', default: false, group: 'Environment' },
  { key: 'fenceSpacing', label: 'Silt Fence Spacing', type: 'slider', min: 10, max: 30, step: 1, default: 15, unit: 'm', group: 'Controls' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const sW = num(params.siteWidth)
  const sD = num(params.siteDepth)
  const slopeP = num(params.slopePercent)
  const slopeDir = String(params.slopeDir)
  const disturbed = num(params.disturbedArea) / 100
  const hasWater = params.hasWaterway === true
  const spacing = num(params.fenceSpacing)

  const scale = 0.1
  const sWs = sW * scale
  const sDs = sD * scale

  const inst: GeometryInstruction[] = []

  // Ground plane — tilted to show slope
  const slopeAngle = Math.atan(slopeP / 100)
  inst.push({
    id: 'ground',
    type: 'box',
    position: [0, -0.02, 0],
    args: [sWs + 1, 0.02, sDs + 1],
    color: '#a3a38b',
    opacity: 0.25,
    transparent: true,
  })

  // Site boundary
  const bdrH = 0.06
  inst.push({ id: 'bdr-n', type: 'box', position: [0, bdrH / 2, -sDs / 2], args: [sWs, bdrH, 0.03], color: '#78716c' })
  inst.push({ id: 'bdr-s', type: 'box', position: [0, bdrH / 2, sDs / 2], args: [sWs, bdrH, 0.03], color: '#78716c' })
  inst.push({ id: 'bdr-e', type: 'box', position: [sWs / 2, bdrH / 2, 0], args: [0.03, bdrH, sDs], color: '#78716c' })
  inst.push({ id: 'bdr-w', type: 'box', position: [-sWs / 2, bdrH / 2, 0], args: [0.03, bdrH, sDs], color: '#78716c' })

  // Disturbed area (brown patch)
  const dFactor = Math.sqrt(disturbed)
  inst.push({
    id: 'disturbed',
    type: 'box',
    position: [0, 0.005, 0],
    args: [sWs * dFactor, 0.01, sDs * dFactor],
    color: '#92400e',
    opacity: 0.4,
    transparent: true,
    label: `Disturbed: ${(sW * sD * disturbed).toFixed(0)} m²`,
  })

  // Perimeter silt fence (blue posts around boundary)
  const fenceH = 0.12
  const fenceInset = 0.2
  const perimPosts = 20
  for (let i = 0; i < perimPosts; i++) {
    const t = i / perimPosts
    let x: number, z: number
    if (t < 0.25) { x = -sWs / 2 + fenceInset + (sWs - fenceInset * 2) * (t / 0.25); z = -sDs / 2 + fenceInset }
    else if (t < 0.5) { x = sWs / 2 - fenceInset; z = -sDs / 2 + fenceInset + (sDs - fenceInset * 2) * ((t - 0.25) / 0.25) }
    else if (t < 0.75) { x = sWs / 2 - fenceInset - (sWs - fenceInset * 2) * ((t - 0.5) / 0.25); z = sDs / 2 - fenceInset }
    else { x = -sWs / 2 + fenceInset; z = sDs / 2 - fenceInset - (sDs - fenceInset * 2) * ((t - 0.75) / 0.25) }
    inst.push({
      id: `perim-post-${i}`,
      type: 'box',
      position: [x, fenceH / 2, z],
      args: [0.02, fenceH, 0.02],
      color: '#1d4ed8',
    })
  }
  // Perimeter fence rails
  inst.push({ id: 'perim-rail-n', type: 'box', position: [0, fenceH * 0.7, -sDs / 2 + fenceInset], args: [sWs - fenceInset * 2, 0.015, 0.01], color: '#1d4ed8', label: 'Perimeter Silt Fence' })
  inst.push({ id: 'perim-rail-s', type: 'box', position: [0, fenceH * 0.7, sDs / 2 - fenceInset], args: [sWs - fenceInset * 2, 0.015, 0.01], color: '#1d4ed8' })
  inst.push({ id: 'perim-rail-e', type: 'box', position: [sWs / 2 - fenceInset, fenceH * 0.7, 0], args: [0.01, 0.015, sDs - fenceInset * 2], color: '#1d4ed8' })
  inst.push({ id: 'perim-rail-w', type: 'box', position: [-sWs / 2 + fenceInset, fenceH * 0.7, 0], args: [0.01, 0.015, sDs - fenceInset * 2], color: '#1d4ed8' })

  // Internal silt fences perpendicular to slope
  const isNS = slopeDir === 'north' || slopeDir === 'south'
  const dim = isNS ? sD : sW
  const dimS = isNS ? sDs : sWs
  const crossDimS = isNS ? sWs : sDs
  const count = Math.max(0, Math.floor(dim / spacing) - 1)

  for (let i = 1; i <= count; i++) {
    const pos = -dimS / 2 + fenceInset + (dimS - fenceInset * 2) * (i / (count + 1))
    if (isNS) {
      inst.push({ id: `ifence-${i}`, type: 'box', position: [0, fenceH * 0.5, pos], args: [crossDimS - fenceInset * 4, fenceH * 0.8, 0.015], color: '#2563eb', opacity: 0.7, transparent: true })
    } else {
      inst.push({ id: `ifence-${i}`, type: 'box', position: [pos, fenceH * 0.5, 0], args: [0.015, fenceH * 0.8, crossDimS - fenceInset * 4], color: '#2563eb', opacity: 0.7, transparent: true })
    }
  }

  // Sediment basin (downhill corner)
  const basinX = slopeDir === 'east' ? sWs / 2 - 0.5 : slopeDir === 'west' ? -sWs / 2 + 0.5 : sWs / 2 - 0.5
  const basinZ = slopeDir === 'south' ? sDs / 2 - 0.4 : slopeDir === 'north' ? -sDs / 2 + 0.4 : sDs / 2 - 0.4
  inst.push({ id: 'basin', type: 'box', position: [basinX, 0.03, basinZ], args: [0.5, 0.06, 0.4], color: '#7c3aed', opacity: 0.6, transparent: true, label: 'Sediment Basin' })

  // Wheel wash pad (at entrance, south center)
  inst.push({ id: 'wheel-wash', type: 'box', position: [0, 0.015, sDs / 2 - 0.15], args: [0.6, 0.03, 0.25], color: '#0ea5e9', opacity: 0.5, transparent: true, label: 'Wheel Wash' })

  // Soil stockpile
  inst.push({ id: 'stockpile', type: 'box', position: [-sWs / 2 + 0.6, 0.15, -sDs / 2 + 0.5], args: [0.7, 0.3, 0.5], color: '#a16207', opacity: 0.6, transparent: true, label: 'Soil Stockpile' })

  // Waterway (if present)
  if (hasWater) {
    inst.push({ id: 'waterway', type: 'box', position: [0, -0.01, sDs / 2 + 0.4], args: [sWs + 1, 0.015, 0.6], color: '#3b82f6', opacity: 0.5, transparent: true, label: 'Waterway' })
    // Reinforced fence at waterway edge
    inst.push({ id: 'water-fence', type: 'box', position: [0, fenceH * 0.6, sDs / 2 - 0.05], args: [sWs, fenceH * 1.0, 0.03], color: '#dc2626', label: 'Reinforced Silt Fence' })
  }

  // Slope direction arrow
  const arrowLen = 0.6
  const aX = slopeDir === 'east' ? arrowLen / 2 : slopeDir === 'west' ? -arrowLen / 2 : 0
  const aZ = slopeDir === 'south' ? arrowLen / 2 : slopeDir === 'north' ? -arrowLen / 2 : 0
  inst.push({ id: 'slope-arrow', type: 'box', position: [aX, 0.04, aZ], args: [slopeDir === 'east' || slopeDir === 'west' ? arrowLen : 0.04, 0.02, slopeDir === 'north' || slopeDir === 'south' ? arrowLen : 0.04], color: '#f97316', label: `Slope ${slopeP}% ↓` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'fence-spacing-exceeded',
    field: 'fenceSpacing',
    check: (p) => num(p.fenceSpacing) > 20 && num(p.slopePercent) > 5,
    message: 'Silt fence spacing exceeds 20m on slopes >5%. Reduce spacing to prevent sediment runoff.',
    codeCitation: 'DPWH DO 56 s.2005 — Erosion Control',
    severity: 'error',
    position: () => [0, 0.5, 0],
  },
  {
    id: 'no-waterway-protection',
    field: 'hasWaterway',
    check: (p) => p.hasWaterway === true && num(p.fenceSpacing) > 10,
    message: 'Adjacent waterway requires enhanced silt fence spacing ≤10m per RA 9275 (Clean Water Act).',
    codeCitation: 'RA 9275 §27 — Prohibited Acts',
    severity: 'error',
    position: () => [0, 0.5, 0],
  },
  {
    id: 'large-disturbed-no-ecc',
    field: 'disturbedArea',
    check: (p) => {
      const area = num(p.siteWidth) * num(p.siteDepth) * num(p.disturbedArea) / 100
      return area > 10000
    },
    message: 'Disturbed area exceeds 1 hectare — Environmental Compliance Certificate (ECC) required per PD 1586.',
    codeCitation: 'PD 1586 — EIS System',
    severity: 'warning',
    position: () => [0, 0.5, 0],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'slope-note',
    label: 'Silt fences must be perpendicular to slope',
    description: 'Fences oriented perpendicular to slope direction intercept maximum sediment runoff',
    position: () => [0, 0.3, 0],
    codeCitation: 'DPWH DO 56',
    visibleWhen: (p) => num(p.slopePercent) > 0,
  },
]

const presets: Preset[] = [
  { label: 'Small Flat Site', values: { siteWidth: 20, siteDepth: 20, slopePercent: 1, disturbedArea: 50, hasWaterway: false, fenceSpacing: 20 } },
  { label: 'Sloped w/ Waterway', values: { siteWidth: 40, siteDepth: 30, slopePercent: 8, disturbedArea: 70, hasWaterway: true, fenceSpacing: 10 } },
  { label: 'Large Earthwork', values: { siteWidth: 60, siteDepth: 50, slopePercent: 5, disturbedArea: 85, hasWaterway: false, fenceSpacing: 15 } },
]

export const erosionControlFenceConfig: ParametricSceneConfig = {
  id: 'erosion-control-fence',
  title: 'Erosion Control Fence',
  description: 'Silt fence and sediment control layout for construction sites per DPWH DO 56 and RA 9275. Adjust slope, site size, and waterway proximity to see required erosion control measures.',
  subject: 'environmental-planning',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: { position: [4, 5, 4], fov: 45 },
  showHumanScale: false,
  scale: 1,
}
