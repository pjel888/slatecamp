// src/app/dashboard/3d-lab/_config/modules/septic-tank-design.ts
// Septic Tank Design — NPCP
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const BR_VOLUMES: Record<number, number> = { 1: 2.84, 2: 2.84, 3: 3.79, 4: 4.74, 5: 5.68 }

const parameters: ParameterDef[] = [
  { key: 'bedrooms', label: 'Number of Bedrooms', type: 'slider', min: 1, max: 5, step: 1, default: 3, group: 'Building' },
  { key: 'tankLength', label: 'Tank Length', type: 'slider', min: 1000, max: 4000, step: 100, default: 2000, unit: 'mm', group: 'Tank Dimensions' },
  { key: 'tankWidth', label: 'Tank Width', type: 'slider', min: 800, max: 2000, step: 100, default: 1200, unit: 'mm', group: 'Tank Dimensions' },
  { key: 'tankDepth', label: 'Tank Depth', type: 'slider', min: 800, max: 2000, step: 100, default: 1500, unit: 'mm', group: 'Tank Dimensions' },
  { key: 'showSection', label: 'Show Cross Section', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const br = Math.round(num(params.bedrooms))
  const tL = num(params.tankLength) / 1000
  const tW = num(params.tankWidth) / 1000
  const tD = num(params.tankDepth) / 1000
  const showSec = Boolean(params.showSection)
  const reqVol = BR_VOLUMES[Math.min(br, 5)] ?? 3.79
  const actualVol = tL * tW * tD
  const violated = actualVol < reqVol
  const wallT = 0.1
  const inst: GeometryInstruction[] = []

  // Ground
  inst.push({ id: 'ground', type: 'box', position: [0, tD / 2 + 0.1, 0], args: [tL + 2, 0.2, tW + 2], color: '#92400e' })

  // Tank exterior
  inst.push({ id: 'tank-bottom', type: 'box', position: [0, -wallT / 2, 0], args: [tL, wallT, tW], color: '#71717a' })
  inst.push({ id: 'tank-left', type: 'box', position: [-(tL / 2 + wallT / 2), tD / 2, 0], args: [wallT, tD + wallT, tW + wallT * 2], color: '#71717a' })
  inst.push({ id: 'tank-right', type: 'box', position: [(tL / 2 + wallT / 2), tD / 2, 0], args: [wallT, tD + wallT, tW + wallT * 2], color: '#71717a' })
  inst.push({ id: 'tank-back', type: 'box', position: [0, tD / 2, -(tW / 2 + wallT / 2)], args: [tL + wallT * 2, tD + wallT, wallT], color: '#71717a' })
  inst.push({ id: 'tank-front', type: 'box', position: [0, tD / 2, tW / 2 + wallT / 2], args: [tL + wallT * 2, tD + wallT, wallT], color: '#71717a', opacity: showSec ? 0.2 : 0.8, transparent: showSec })

  // Liquid levels
  const sludgeH = tD * 0.25
  const scumH = tD * 0.1
  const liquidH = tD - sludgeH - scumH
  inst.push({ id: 'sludge', type: 'box', position: [0, sludgeH / 2, 0], args: [tL - wallT, sludgeH, tW - wallT], color: '#78350f', opacity: 0.9, transparent: true, label: 'Sludge' })
  inst.push({ id: 'liquid', type: 'box', position: [0, sludgeH + liquidH / 2, 0], args: [tL - wallT, liquidH, tW - wallT], color: '#1535A8', opacity: 0.35, transparent: true, label: 'Effluent' })
  inst.push({ id: 'scum', type: 'box', position: [0, sludgeH + liquidH + scumH / 2, 0], args: [tL - wallT, scumH, tW - wallT], color: '#4d7c0f', opacity: 0.6, transparent: true, label: 'Scum' })

  // Baffle / divider
  inst.push({ id: 'baffle', type: 'box', position: [-tL / 6, tD / 2 - 0.05, 0], args: [wallT, tD * 0.8, tW - wallT], color: '#a1a1aa' })

  // Inlet/outlet pipes
  inst.push({ id: 'inlet-pipe', type: 'cylinder', position: [tL / 2 + 0.3, tD * 0.75, 0], rotation: [0, 0, Math.PI / 2], args: [0.05, 0.05, 0.5, 8], color: '#D64545', label: 'Inlet' })
  inst.push({ id: 'outlet-pipe', type: 'cylinder', position: [-(tL / 2 + 0.3), tD * 0.65, 0], rotation: [0, 0, Math.PI / 2], args: [0.04, 0.04, 0.5, 8], color: '#2D9F6F', label: 'Outlet' })

  // Volume indicator
  const volScale = actualVol / reqVol
  inst.push({ id: 'vol-bar', type: 'box', position: [tL / 2 + 0.8, volScale * tD / 2, 0], args: [0.2, volScale * tD, 0.2], color: violated ? '#D64545' : '#2D9F6F', label: `${actualVol.toFixed(2)} m³` })
  inst.push({ id: 'req-line', type: 'box', position: [tL / 2 + 0.8, reqVol / actualVol * volScale * tD, 0], args: [0.3, 0.02, 0.1], color: '#f97316', label: `Min: ${reqVol} m³` })

  // Cover slab
  inst.push({ id: 'cover', type: 'box', position: [0, tD + wallT / 2, 0], args: [tL + wallT * 2, wallT, tW + wallT * 2], color: '#52525b', opacity: showSec ? 0.4 : 0.9, transparent: true })
  // Manhole
  inst.push({ id: 'manhole', type: 'cylinder', position: [0, tD + wallT + 0.05, 0], args: [0.25, 0.25, 0.1, 12], color: '#3f3f46' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'tank-volume', field: 'tankLength',
    check: (p) => {
      const br = Math.round(num(p.bedrooms))
      const reqVol = BR_VOLUMES[Math.min(br, 5)] ?? 3.79
      const actual = (num(p.tankLength) / 1000) * (num(p.tankWidth) / 1000) * (num(p.tankDepth) / 1000)
      return actual < reqVol
    },
    message: 'Septic tank volume insufficient for bedroom count',
    codeCitation: 'NPCP Table 11-2', severity: 'error',
    position: () => [2, 1.5, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-vol', label: '1–2 BR: 2.84 m³', description: 'Septic tank minimum volumes: 1–2 bedrooms = 2.84 m³, 3 bedrooms = 3.79 m³, 4 bedrooms = 4.74 m³', codeCitation: 'NPCP Table 11-2', position: () => [2, 2, 0] },
  { id: 'ann-baffle', label: 'Internal Baffle', description: 'Septic tanks require internal baffle to prevent scum from reaching outlet', codeCitation: 'NPCP §1102', position: () => [-1.5, 2, 0] },
]

const presets: Preset[] = [
  { label: '1–2 BR Min', values: { bedrooms: 2, tankLength: 2000, tankWidth: 1200, tankDepth: 1200, showSection: true } },
  { label: '3 BR Min', values: { bedrooms: 3, tankLength: 2500, tankWidth: 1300, tankDepth: 1200, showSection: true } },
  { label: '4–5 BR', values: { bedrooms: 5, tankLength: 3000, tankWidth: 1500, tankDepth: 1200, showSection: true } },
  { label: 'Violation Demo', values: { bedrooms: 4, tankLength: 1500, tankWidth: 900, tankDepth: 900, showSection: true } },
]

export const septicTankDesignConfig: ParametricSceneConfig = {
  id: 'septic-tank-design',
  title: 'Septic Tank Design',
  description: 'Parametric septic tank with bedroom-count slider showing required volumes: 1–2 BR=2.84 m³, 3 BR=3.79 m³ per NPCP Table 11-2.',
  subject: 'npcp',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [3, 3, 4], fov: 55 },
}
