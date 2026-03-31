// src/app/dashboard/3d-lab/_config/modules/near-source-factors.ts
// Near-Source Factors — NSCP Chapter 2 §208
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  { key: 'distance', label: 'Distance from Fault', type: 'slider', min: 1, max: 20, step: 0.5, default: 5, unit: 'km', decimals: 1, group: 'Site' },
  { key: 'faultType', label: 'Fault Type', type: 'dropdown', default: 'A', options: [{ value: 'A', label: 'Type A (Active, M>7)' }, { value: 'B', label: 'Type B (Active, M<7)' }], group: 'Fault' },
  { key: 'showRings', label: 'Show Distance Rings', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const dist = num(params.distance)
  const faultType = String(params.faultType)
  const showRings = Boolean(params.showRings)
  // Na: acceleration factor (short period)
  // Nv: velocity factor (long period)
  let Na = 1.0, Nv = 1.0
  if (faultType === 'A') {
    if (dist <= 2) { Na = 1.5; Nv = 2.0 }
    else if (dist <= 5) { Na = 1.2; Nv = 1.6 }
    else if (dist <= 10) { Na = 1.0; Nv = 1.2 }
    else { Na = 1.0; Nv = 1.0 }
  } else {
    if (dist <= 2) { Na = 1.3; Nv = 1.6 }
    else if (dist <= 5) { Na = 1.0; Nv = 1.2 }
    else { Na = 1.0; Nv = 1.0 }
  }
  const scale = 0.25
  const inst: GeometryInstruction[] = []

  // Ground plane
  inst.push({ id: 'ground', type: 'box', position: [0, -0.05, 0], args: [10, 0.1, 10], color: '#52525b' })

  // Fault line
  inst.push({ id: 'fault', type: 'box', position: [0, 0, 0], args: [0.15, 0.2, 10], color: '#D64545', label: `Type ${faultType} Fault` })
  inst.push({ id: 'fault-label', type: 'sphere', position: [0, 0.5, 0], args: [0.15, 8, 8], color: '#D64545' })

  // Site location
  const siteX = dist * scale
  inst.push({ id: 'site', type: 'box', position: [siteX, 0.5, 0], args: [0.3, 1.0, 0.3], color: '#3b82f6', label: 'Site' })
  inst.push({ id: 'site-top', type: 'sphere', position: [siteX, 1.1, 0], args: [0.15, 8, 8], color: '#3b82f6' })

  // Distance arrow
  inst.push({ id: 'dist-line', type: 'box', position: [siteX / 2, 0.02, 0], args: [siteX, 0.02, 0.02], color: '#f97316', label: `${dist.toFixed(1)} km` })
  inst.push({ id: 'dist-arrow', type: 'cone', position: [siteX, 0.02, 0], rotation: [0, -Math.PI / 2, 0], args: [0.06, 0.15, 6], color: '#f97316' })

  // Distance rings
  if (showRings) {
    const ringDistances = [2, 5, 10, 15]
    const ringColors = ['#D64545', '#f97316', '#eab308', '#2D9F6F']
    ringDistances.forEach((r, i) => {
      const rs = r * scale
      if (rs < 4.5) {
        inst.push({ id: `ring-${r}`, type: 'ring', position: [0, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], args: [rs - 0.03, rs, 32, 1, 0, Math.PI], color: ringColors[i], opacity: 0.4, transparent: true, label: `${r}km` })
      }
    })
  }

  // Na/Nv indicator bars
  inst.push({ id: 'na-bar', type: 'box', position: [siteX + 0.5, Na * 0.5, 0], args: [0.2, Na, 0.2], color: '#f97316', label: `Na=${Na.toFixed(1)}` })
  inst.push({ id: 'nv-bar', type: 'box', position: [siteX + 0.9, Nv * 0.5, 0], args: [0.2, Nv, 0.2], color: '#D64545', label: `Nv=${Nv.toFixed(1)}` })
  // Reference line at 1.0
  inst.push({ id: 'ref-line', type: 'box', position: [siteX + 0.7, 1.0, 0], args: [0.7, 0.01, 0.3], color: '#2D9F6F', label: 'N=1.0' })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-na', label: 'Na — Acceleration Factor', description: 'Near-source factor Na amplifies short-period spectral acceleration; increases up to 1.5 for Type A fault within 2km', codeCitation: 'NSCP 2015 Table 208-4', position: () => [3.5, 2.5, 0] },
  { id: 'ann-nv', label: 'Nv — Velocity Factor', description: 'Near-source factor Nv amplifies long-period spectral velocity; increases up to 2.0 for Type A fault within 2km', codeCitation: 'NSCP 2015 Table 208-5', position: () => [3.5, 1.5, 0] },
]

const presets: Preset[] = [
  { label: 'Very Near (2km, Type A)', values: { distance: 2, faultType: 'A', showRings: true } },
  { label: 'Near (5km, Type A)', values: { distance: 5, faultType: 'A', showRings: true } },
  { label: 'Far (12km, Type B)', values: { distance: 12, faultType: 'B', showRings: true } },
  { label: 'No Factor (>15km)', values: { distance: 16, faultType: 'B', showRings: false } },
]

export const nearSourceFactorsConfig: ParametricSceneConfig = {
  id: 'near-source-factors',
  title: 'Near-Source Factors (Na/Nv)',
  description: 'Map-like view showing Na/Nv near-source factors with distance rings from active faults per NSCP 2015 Tables 208-4 and 208-5.',
  subject: 'nscp',
  parameters, geometry, annotations, presets,
  camera: { position: [4, 5, 5], fov: 55 },
}
