// src/app/dashboard/3d-lab/_config/modules/structural-systems-comparison.ts
// Structural Systems Comparison — NSCP Chapter 2
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const SYSTEMS: Record<string, { R: number; color: string; label: string; desc: string }> = {
  'SMRF':     { R: 8.5, color: '#2D9F6F', label: 'Special MRF', desc: 'RC Special Moment-Resisting Frame' },
  'OMRF':     { R: 3.5, color: '#f97316', label: 'Ordinary MRF', desc: 'RC Ordinary Moment-Resisting Frame' },
  'SW':       { R: 5.5, color: '#3b82f6', label: 'Shear Wall', desc: 'RC Bearing Wall with Shear Walls' },
  'BW':       { R: 4.5, color: '#6366f1', label: 'Bearing Wall', desc: 'RC Bearing Wall System' },
  'EBF':      { R: 7.0, color: '#0891b2', label: 'Eccentric Brace', desc: 'Eccentrically Braced Steel Frame' },
  'CBF':      { R: 5.6, color: '#7c3aed', label: 'Concentr. Brace', desc: 'Concentrically Braced Steel Frame' },
}

const parameters: ParameterDef[] = [
  { key: 'systemA', label: 'System A', type: 'dropdown', default: 'SMRF',
    options: Object.entries(SYSTEMS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Comparison' },
  { key: 'systemB', label: 'System B', type: 'dropdown', default: 'OMRF',
    options: Object.entries(SYSTEMS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Comparison' },
  { key: 'numStoreys', label: 'Building Storeys', type: 'slider', min: 2, max: 10, step: 1, default: 5, group: 'Building' },
  { key: 'seismicZone', label: 'Seismic Zone', type: 'dropdown', default: 'Zone 4', options: [{ value: 'Zone 2', label: 'Zone 2 (Z=0.20)' }, { value: 'Zone 4', label: 'Zone 4 (Z=0.40)' }], group: 'Seismic' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const sysA = str(params.systemA)
  const sysB = str(params.systemB)
  const floors = num(params.numStoreys)
  const zone = str(params.seismicZone)
  const Z = zone === 'Zone 4' ? 0.40 : 0.20
  const dataA = SYSTEMS[sysA] ?? SYSTEMS['SMRF']
  const dataB = SYSTEMS[sysB] ?? SYSTEMS['OMRF']
  const stH = 0.5
  const bW = 1.2
  const sep = 2.5
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, -0.1, 0], args: [sep * 2 + 2, 0.2, bW + 1], color: '#52525b' })

  // Render both systems
  const systems = [{ data: dataA, xOff: -sep / 2, label: 'A' }, { data: dataB, xOff: sep / 2, label: 'B' }]
  systems.forEach(({ data, xOff, label }) => {
    // Base shear capacity relative bar
    const heightScale = data.R / 8.5
    const totalH = floors * stH
    for (let f = 0; f < floors; f++) {
      inst.push({ id: `frame-${label}-${f}`, type: 'box', position: [xOff, f * stH + stH / 2, 0], args: [bW * 0.95, stH - 0.02, bW * 0.6], color: data.color, opacity: 0.7, transparent: true })
      inst.push({ id: `slab-${label}-${f}`, type: 'box', position: [xOff, f * stH, 0], args: [bW, 0.04, bW * 0.65], color: '#71717a' })
    }
    // Columns
    for (let s = 0; s <= 1; s++) {
      const cz = s === 0 ? -(bW * 0.3) : (bW * 0.3)
      inst.push({ id: `col-${label}-l-${s}`, type: 'box', position: [xOff - bW / 2 + 0.06, totalH / 2, cz], args: [0.08, totalH, 0.08], color: data.color })
      inst.push({ id: `col-${label}-r-${s}`, type: 'box', position: [xOff + bW / 2 - 0.06, totalH / 2, cz], args: [0.08, totalH, 0.08], color: data.color })
    }
    // R-factor bar
    const rBarH = data.R * 0.15
    inst.push({ id: `r-bar-${label}`, type: 'box', position: [xOff, totalH + rBarH / 2, 0], args: [0.3, rBarH, 0.3], color: data.color, label: `R=${data.R}` })
    // Seismic force (inversely proportional to R)
    const forceScale = Z / data.R * 2
    inst.push({ id: `seismic-${label}`, type: 'cone', position: [xOff - bW / 2 - forceScale - 0.1, totalH * 0.7, 0], rotation: [0, Math.PI / 2, 0], args: [0.1, forceScale, 6], color: '#D64545', opacity: 0.7, transparent: true, label: `V∝${(Z / data.R).toFixed(3)}W` })
  })

  // Comparison line
  inst.push({ id: 'comp-line', type: 'box', position: [0, floors * stH + 0.1, 0], args: [sep, 0.02, 0.02], color: '#f97316', label: `Δ R=${(dataA.R - dataB.R).toFixed(1)}` })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-r', label: 'Response Modification Factor R', description: 'Higher R means the system can absorb more energy; SMRF (R=8.5) allows largest seismic force reduction', codeCitation: 'NSCP 2015 Table 208-11', position: () => [4, 3, 0] },
  { id: 'ann-base-shear', label: 'Base Shear V=CvIW/RT', description: 'Design base shear is inversely proportional to R; systems with higher R have lower design forces but require better detailing', codeCitation: 'NSCP 2015 §208.5.1', position: () => [-4, 3, 0] },
]

const presets: Preset[] = [
  { label: 'SMRF vs OMRF', values: { systemA: 'SMRF', systemB: 'OMRF', numStoreys: 5, seismicZone: 'Zone 4' } },
  { label: 'Shear Wall vs Bearing Wall', values: { systemA: 'SW', systemB: 'BW', numStoreys: 4, seismicZone: 'Zone 4' } },
  { label: 'Steel Braced Frames', values: { systemA: 'EBF', systemB: 'CBF', numStoreys: 6, seismicZone: 'Zone 2' } },
  { label: 'Best vs Min Detailing', values: { systemA: 'SMRF', systemB: 'BW', numStoreys: 8, seismicZone: 'Zone 4' } },
]

export const structuralSystemsComparisonConfig: ParametricSceneConfig = {
  id: 'structural-systems-comparison',
  title: 'Structural Systems Comparison',
  description: 'Side-by-side comparison of structural systems with R-factor visualization and base shear comparison per NSCP 2015 Table 208-11.',
  subject: 'nscp',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 4, 6], fov: 55 },
}
