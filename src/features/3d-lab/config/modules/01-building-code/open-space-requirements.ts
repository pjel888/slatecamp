// src/app/dashboard/3d-lab/_config/modules/open-space-requirements.ts
// Open Space Requirements — PD 1096 / TOSL by Zoning
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function str(v: number | string | boolean): string { return String(v) }

const ZONING_TOSL: Record<string, { maxTOS: number; minOpen: number; label: string }> = {
  'R-1': { maxTOS: 50, minOpen: 50, label: 'R-1 Residential' },
  'R-2': { maxTOS: 60, minOpen: 40, label: 'R-2 Res. Low-Rise' },
  'C-1': { maxTOS: 70, minOpen: 30, label: 'C-1 Commercial' },
  'C-2': { maxTOS: 85, minOpen: 15, label: 'C-2 Commercial' },
  'I-1': { maxTOS: 75, minOpen: 25, label: 'I-1 Light Industry' },
}

const parameters: ParameterDef[] = [
  { key: 'zoning', label: 'Zoning', type: 'dropdown', default: 'R-1',
    options: Object.entries(ZONING_TOSL).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Zoning' },
  { key: 'lotWidth', label: 'Lot Width', type: 'slider', min: 8, max: 50, step: 1, default: 15, unit: 'm', group: 'Lot' },
  { key: 'lotDepth', label: 'Lot Depth', type: 'slider', min: 8, max: 50, step: 1, default: 20, unit: 'm', group: 'Lot' },
  { key: 'buildingCoverage', label: 'Building Coverage (%)', type: 'slider', min: 10, max: 100, step: 1, default: 50, unit: '%', group: 'Building' },
  { key: 'frontSetback', label: 'Front Setback', type: 'slider', min: 0, max: 8, step: 0.5, default: 4.5, unit: 'm', decimals: 1, group: 'Setbacks' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const zone = str(params.zoning)
  const lW = num(params.lotWidth)
  const lD = num(params.lotDepth)
  const bCov = num(params.buildingCoverage) / 100
  const frontSB = num(params.frontSetback)
  const spec = ZONING_TOSL[zone] ?? ZONING_TOSL['R-1']
  const maxTOS = spec.maxTOS / 100
  const violated = bCov > maxTOS
  const frontViolated = zone === 'R-1' && frontSB < 4.5
  const scale = 0.2
  const lWs = lW * scale
  const lDs = lD * scale
  const bA = bCov * lW * lD
  const bWs = Math.sqrt(bA * (lW / lD)) * scale
  const bDs = Math.sqrt(bA * (lD / lW)) * scale
  const frontSBs = frontSB * scale
  const inst: GeometryInstruction[] = []

  // Lot boundary
  inst.push({ id: 'lot', type: 'box', position: [0, 0.01, 0], args: [lWs, 0.02, lDs], color: '#2D9F6F', opacity: 0.2, transparent: true, label: `Lot: ${(lW * lD).toFixed(0)} m²` })
  inst.push({ id: 'lot-frame-front', type: 'box', position: [0, 0.05, lDs / 2], args: [lWs, 0.06, 0.05], color: '#D64545', label: 'Street' })
  inst.push({ id: 'lot-frame-left', type: 'box', position: [-lWs / 2, 0.05, 0], args: [0.05, 0.06, lDs], color: '#71717a' })
  inst.push({ id: 'lot-frame-right', type: 'box', position: [lWs / 2, 0.05, 0], args: [0.05, 0.06, lDs], color: '#71717a' })
  inst.push({ id: 'lot-frame-back', type: 'box', position: [0, 0.05, -lDs / 2], args: [lWs, 0.06, 0.05], color: '#71717a' })

  // Building footprint
  const bz = lDs / 2 - frontSBs - bDs / 2
  const buildingH = 2.7 * scale * 3
  inst.push({ id: 'building', type: 'box', position: [0, buildingH / 2, -bz], args: [bWs, buildingH, bDs], color: violated ? '#fca5a5' : '#3b82f6', opacity: 0.8, transparent: true })
  inst.push({ id: 'building-top', type: 'box', position: [0, buildingH, -bz], args: [bWs, 0.05, bDs], color: violated ? '#D64545' : '#1535A8' })

  // Open space (lot minus building)
  inst.push({ id: 'open-space', type: 'box', position: [0, 0.005, 0], args: [lWs, 0.01, lDs], color: '#2D9F6F', opacity: 0.15, transparent: true })

  // Front setback band
  inst.push({ id: 'front-setback', type: 'box', position: [0, 0.02, lDs / 2 - frontSBs / 2], args: [lWs, 0.04, frontSBs], color: frontViolated ? '#D64545' : '#f97316', opacity: 0.4, transparent: true, label: `${frontSB}m` })

  // Max TOS indicator
  const maxCovW = Math.sqrt(maxTOS * lW * lD * (lW / lD)) * scale
  const maxCovD = Math.sqrt(maxTOS * lW * lD * (lD / lW)) * scale
  inst.push({ id: 'max-tos', type: 'box', position: [0, 0.03, -bz], args: [maxCovW, 0.02, maxCovD], color: '#f97316', opacity: 0.3, transparent: true, label: `Max ${spec.maxTOS}%` })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'tos-exceeded', field: 'buildingCoverage',
    check: (p) => {
      const spec = ZONING_TOSL[str(p.zoning)] ?? ZONING_TOSL['R-1']
      return num(p.buildingCoverage) > spec.maxTOS
    },
    message: 'Building coverage exceeds maximum total open space lot ratio for zoning',
    codeCitation: 'PD 1096 / HLURB Zoning Ordinance', severity: 'error',
    position: () => [2, 2, 0],
  },
  {
    id: 'front-setback', field: 'frontSetback',
    check: (p) => str(p.zoning) === 'R-1' && num(p.frontSetback) < 4.5,
    message: 'R-1 front setback minimum is 4.50m from property line',
    codeCitation: 'PD 1096 IRR Appendix / Local Zoning', severity: 'error',
    position: () => [0, 1, 4],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-tosl', label: 'TOSL by Zoning', description: 'Total Open Space within Lot (TOSL) is the minimum percentage of lot area that must remain unbuilt', codeCitation: 'PD 1096 IRR / HLURB', position: (p) => [num(p.lotWidth) * 0.2 / 2 + 0.8, 1, 0] },
  { id: 'ann-setback', label: 'Front Setback', description: 'R-1 requires 4.50m front setback, 2.00m side and rear setbacks', codeCitation: 'PD 1096 Appendix', position: (p) => [0, 0.5, num(p.lotDepth) * 0.2 / 2 + 0.5] },
]

const presets: Preset[] = [
  { label: 'R-1 Compliant', values: { zoning: 'R-1', lotWidth: 15, lotDepth: 20, buildingCoverage: 45, frontSetback: 4.5 } },
  { label: 'Commercial C-2', values: { zoning: 'C-2', lotWidth: 30, lotDepth: 40, buildingCoverage: 80, frontSetback: 2 } },
  { label: 'R-1 Violation', values: { zoning: 'R-1', lotWidth: 10, lotDepth: 20, buildingCoverage: 65, frontSetback: 3 } },
  { label: 'Industrial I-1', values: { zoning: 'I-1', lotWidth: 40, lotDepth: 50, buildingCoverage: 70, frontSetback: 5 } },
]

export const openSpaceRequirementsConfig: ParametricSceneConfig = {
  id: 'open-space-requirements',
  title: 'Open Space Requirements',
  description: 'Lot model showing TOSL 15–50% open space requirements by zoning classification and front setback rules per PD 1096.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 6, 5], fov: 55 },
}

