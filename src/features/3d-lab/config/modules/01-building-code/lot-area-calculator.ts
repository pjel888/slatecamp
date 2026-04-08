// src/features/3d-lab/config/modules/01-building-code/lot-area-calculator.ts
// Lot Area Calculator — PD 1096 zoning requirements
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

// Max lot coverage (%) and FAR by zoning per PD 1096 / HLURB
const ZONING_CONTROLS: Record<string, { maxCoverage: number; maxFAR: number; minSetback: number; label: string }> = {
  'R-1': { maxCoverage: 50, maxFAR: 1.5, minSetback: 1.5, label: 'R-1 Residential' },
  'R-2': { maxCoverage: 60, maxFAR: 2.5, minSetback: 2.0, label: 'R-2 Res. Low-Rise' },
  'C-1': { maxCoverage: 70, maxFAR: 3.0, minSetback: 1.5, label: 'C-1 Commercial' },
  'C-2': { maxCoverage: 85, maxFAR: 5.0, minSetback: 1.0, label: 'C-2 Commercial' },
  'I-1': { maxCoverage: 75, maxFAR: 3.5, minSetback: 2.0, label: 'I-1 Light Industry' },
}

const parameters: ParameterDef[] = [
  { key: 'lotWidth', label: 'Lot Width', type: 'slider', min: 5, max: 50, step: 1, default: 15, unit: 'm', group: 'Lot' },
  { key: 'lotDepth', label: 'Lot Depth', type: 'slider', min: 5, max: 50, step: 1, default: 20, unit: 'm', group: 'Lot' },
  { key: 'zoningType', label: 'Zoning Type', type: 'dropdown', default: 'R-1',
    options: Object.entries(ZONING_CONTROLS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Zoning' },
  { key: 'buildingWidth', label: 'Building Width', type: 'slider', min: 3, max: 40, step: 1, default: 8, unit: 'm', group: 'Building' },
  { key: 'buildingDepth', label: 'Building Depth', type: 'slider', min: 3, max: 40, step: 1, default: 10, unit: 'm', group: 'Building' },
  { key: 'numStoreys', label: 'Number of Storeys', type: 'slider', min: 1, max: 10, step: 1, default: 2, group: 'Building' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const lW = num(params.lotWidth)
  const lD = num(params.lotDepth)
  const zone = str(params.zoningType)
  const bW = num(params.buildingWidth)
  const bD = num(params.buildingDepth)
  const storeys = num(params.numStoreys)

  const spec = ZONING_CONTROLS[zone] ?? ZONING_CONTROLS['R-1']
  const lotArea = lW * lD
  const bFootprint = bW * bD
  const coverage = (bFootprint / lotArea) * 100
  const gfa = bFootprint * storeys
  const far = gfa / lotArea

  const coverageViolated = coverage > spec.maxCoverage
  const farViolated = far > spec.maxFAR
  const exceedsLotW = bW > lW - spec.minSetback * 2
  const exceedsLotD = bD > lD - spec.minSetback * 2

  const buildingViolated = coverageViolated || exceedsLotW || exceedsLotD

  // Scale: normalise so lot fits in ~8 units
  const scale = 8 / Math.max(lW, lD)
  const lWs = lW * scale
  const lDs = lD * scale
  const bWs = Math.min(bW, lW) * scale
  const bDs = Math.min(bD, lD) * scale
  const storeyH = 3.0 * scale
  const bH = storeys * storeyH

  const inst: GeometryInstruction[] = []

  // Ground plane
  inst.push({ id: 'ground', type: 'box', position: [0, -0.02, 0], args: [lWs + 2, 0.04, lDs + 2], color: '#d1fae5', opacity: 0.3, transparent: true })

  // Lot boundary
  inst.push({ id: 'lot-fill', type: 'box', position: [0, 0.01, 0], args: [lWs, 0.02, lDs], color: '#2D9F6F', opacity: 0.15, transparent: true, label: `Lot: ${lotArea.toFixed(0)} m²` })
  inst.push({ id: 'lot-front', type: 'box', position: [0, 0.06, lDs / 2], args: [lWs, 0.08, 0.05], color: '#D64545' })
  inst.push({ id: 'lot-back', type: 'box', position: [0, 0.06, -lDs / 2], args: [lWs, 0.08, 0.05], color: '#71717a' })
  inst.push({ id: 'lot-left', type: 'box', position: [-lWs / 2, 0.06, 0], args: [0.05, 0.08, lDs], color: '#71717a' })
  inst.push({ id: 'lot-right', type: 'box', position: [lWs / 2, 0.06, 0], args: [0.05, 0.08, lDs], color: '#71717a' })

  // Setback zones
  const sb = spec.minSetback * scale
  inst.push({ id: 'setback-front', type: 'box', position: [0, 0.03, lDs / 2 - sb / 2], args: [lWs, 0.06, sb], color: '#f97316', opacity: 0.25, transparent: true, label: `Setback ${spec.minSetback}m` })
  inst.push({ id: 'setback-back', type: 'box', position: [0, 0.03, -lDs / 2 + sb / 2], args: [lWs, 0.06, sb], color: '#f97316', opacity: 0.25, transparent: true })
  inst.push({ id: 'setback-left', type: 'box', position: [-lWs / 2 + sb / 2, 0.03, 0], args: [sb, 0.06, lDs - sb * 2], color: '#f97316', opacity: 0.25, transparent: true })
  inst.push({ id: 'setback-right', type: 'box', position: [lWs / 2 - sb / 2, 0.03, 0], args: [sb, 0.06, lDs - sb * 2], color: '#f97316', opacity: 0.25, transparent: true })

  // Building footprint (centred on lot)
  const bZCentre = lDs / 2 - sb - bDs / 2
  inst.push({ id: 'building', type: 'box', position: [0, bH / 2, -bZCentre + lDs / 2 - sb - bDs / 2], args: [bWs, bH, bDs], color: buildingViolated ? '#fca5a5' : '#3b82f6', opacity: 0.8, transparent: true, label: `GFA: ${gfa.toFixed(0)} m²` })
  inst.push({ id: 'building-top', type: 'box', position: [0, bH, -bZCentre + lDs / 2 - sb - bDs / 2], args: [bWs, 0.06, bDs], color: buildingViolated ? '#D64545' : '#1535A8' })

  // Storey lines
  for (let i = 1; i < storeys; i++) {
    inst.push({ id: `storey-line-${i}`, type: 'box', position: [0, i * storeyH, -bZCentre + lDs / 2 - sb - bDs / 2], args: [bWs + 0.02, 0.04, bDs + 0.02], color: '#1e40af', opacity: 0.4, transparent: true })
  }

  // Open space indicator
  inst.push({ id: 'open-space', type: 'box', position: [0, 0.005, 0], args: [lWs, 0.01, lDs], color: '#2D9F6F', opacity: 0.1, transparent: true })

  // Max coverage footprint indicator
  const maxFootprint = lotArea * spec.maxCoverage / 100
  const maxSide = Math.sqrt(maxFootprint * (bW / bD)) * scale
  const maxSideD = Math.sqrt(maxFootprint * (bD / bW)) * scale
  inst.push({ id: 'max-coverage', type: 'box', position: [0, 0.04, 0], args: [maxSide, 0.02, maxSideD], color: '#f97316', opacity: 0.2, transparent: true, label: `Max ${spec.maxCoverage}% cov.` })

  // Coverage bar chart
  const covH = coverage / 10
  inst.push({ id: 'coverage-bar', type: 'box', position: [lWs / 2 + 0.7, covH / 2, 0], args: [0.3, covH, 0.3], color: coverageViolated ? '#D64545' : '#2D9F6F', label: `Cov: ${coverage.toFixed(1)}%` })
  inst.push({ id: 'coverage-max-line', type: 'box', position: [lWs / 2 + 0.7, spec.maxCoverage / 10, 0], args: [0.6, 0.04, 0.6], color: '#f97316', label: `Max ${spec.maxCoverage}%` })

  // FAR bar
  const farH = far * 1.5
  inst.push({ id: 'far-bar', type: 'box', position: [lWs / 2 + 1.3, farH / 2, 0], args: [0.25, farH, 0.25], color: farViolated ? '#D64545' : '#1B3FC4', label: `FAR: ${far.toFixed(2)}` })
  inst.push({ id: 'far-max-line', type: 'box', position: [lWs / 2 + 1.3, spec.maxFAR * 1.5, 0], args: [0.5, 0.04, 0.5], color: '#f97316', label: `Max ${spec.maxFAR}` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'lot-coverage-exceeded', field: 'buildingWidth',
    check: (p) => {
      const spec = ZONING_CONTROLS[str(p.zoningType)] ?? ZONING_CONTROLS['R-1']
      const lotArea = num(p.lotWidth) * num(p.lotDepth)
      const bFootprint = num(p.buildingWidth) * num(p.buildingDepth)
      return (bFootprint / lotArea) * 100 > spec.maxCoverage
    },
    message: 'Building footprint exceeds maximum lot coverage for the selected zoning classification',
    codeCitation: 'PD 1096 Rule VII §702 / HLURB Zoning Ordinance Table of Development Controls', severity: 'error',
    position: () => [3, 2, 0],
  },
  {
    id: 'building-exceeds-lot', field: 'buildingWidth',
    check: (p) => {
      const spec = ZONING_CONTROLS[str(p.zoningType)] ?? ZONING_CONTROLS['R-1']
      return num(p.buildingWidth) > num(p.lotWidth) - spec.minSetback * 2 ||
             num(p.buildingDepth) > num(p.lotDepth) - spec.minSetback * 2
    },
    message: 'Building dimension encroaches into required setback zone — building exceeds buildable area within the lot',
    codeCitation: 'PD 1096 Rule VII §707 / PD 1096 IRR Appendix — Minimum Setback Requirements', severity: 'error',
    position: () => [0, 2, 3],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-lot-coverage', label: 'Lot Coverage (%)',
    description: 'Lot coverage (also called Total Open Space within Lot, TOSL) is the ratio of building footprint to total lot area. PD 1096 Rule VII limits coverage by zoning to ensure open space, stormwater infiltration, and fire separation.',
    codeCitation: 'PD 1096 Rule VII §702 / HLURB Zoning Ordinance',
    position: (p) => [(num(p.lotWidth) * 8 / Math.max(num(p.lotWidth), num(p.lotDepth))) / 2 + 1.5, 1.5, 0],
  },
  {
    id: 'ann-far', label: 'Floor Area Ratio (FAR)',
    description: 'FAR is the ratio of total gross floor area to lot area. PD 1096 and local zoning ordinances cap FAR by classification to control urban density, infrastructure demand, and building massing.',
    codeCitation: 'PD 1096 Rule VII §708 / HLURB Zoning Ordinance',
    position: (p) => [-(num(p.lotWidth) * 8 / Math.max(num(p.lotWidth), num(p.lotDepth))) / 2 - 1.0, 2, 0],
  },
]

const presets: Preset[] = [
  { label: 'R-1 Compliant', values: { lotWidth: 15, lotDepth: 20, zoningType: 'R-1', buildingWidth: 7, buildingDepth: 9, numStoreys: 2 } },
  { label: 'R-1 Coverage Violation', values: { lotWidth: 10, lotDepth: 15, zoningType: 'R-1', buildingWidth: 8, buildingDepth: 10, numStoreys: 1 } },
  { label: 'C-2 Commercial High FAR', values: { lotWidth: 30, lotDepth: 40, zoningType: 'C-2', buildingWidth: 25, buildingDepth: 33, numStoreys: 6 } },
  { label: 'I-1 Industrial', values: { lotWidth: 40, lotDepth: 50, zoningType: 'I-1', buildingWidth: 28, buildingDepth: 35, numStoreys: 3 } },
]

export const lotAreaCalculatorConfig: ParametricSceneConfig = {
  id: 'lot-area-calculator',
  title: 'Lot Area Calculator',
  description: 'Interactive lot showing building footprint, setback zones, open space indicators, and FAR calculation per PD 1096 Rule VII zoning development controls and HLURB Table of Development Controls.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [7, 8, 7], fov: 50 },
}
