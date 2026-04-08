// src/features/3d-lab/config/modules/01-building-code/saleable-area-ratio.ts
// Saleable Area Ratio — PD 1096 Rule VIII
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  { key: 'grossFloorArea', label: 'Gross Floor Area', type: 'slider', min: 100, max: 5000, step: 10, default: 1000, unit: 'm²', group: 'Floor Plate' },
  { key: 'corridorPercent', label: 'Corridor / Circulation (%)', type: 'slider', min: 10, max: 30, step: 1, default: 18, unit: '%', group: 'Deductions' },
  { key: 'lobbyPercent', label: 'Lobby / Common Area (%)', type: 'slider', min: 5, max: 15, step: 1, default: 8, unit: '%', group: 'Deductions' },
  { key: 'mechanicalPercent', label: 'Mechanical / Utility (%)', type: 'slider', min: 3, max: 10, step: 1, default: 5, unit: '%', group: 'Deductions' },
  { key: 'wallThicknessPercent', label: 'Wall / Structure (%)', type: 'slider', min: 3, max: 8, step: 1, default: 5, unit: '%', group: 'Deductions' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const gfa = num(params.grossFloorArea)
  const corrPct = num(params.corridorPercent) / 100
  const lobbyPct = num(params.lobbyPercent) / 100
  const mechPct = num(params.mechanicalPercent) / 100
  const wallPct = num(params.wallThicknessPercent) / 100

  const totalDeductPct = corrPct + lobbyPct + mechPct + wallPct
  const saleablePct = Math.max(0, 1 - totalDeductPct)
  const saleableArea = gfa * saleablePct
  const corrArea = gfa * corrPct
  const lobbyArea = gfa * lobbyPct
  const mechArea = gfa * mechPct
  const wallArea = gfa * wallPct

  const violated = saleablePct < 0.60

  // Scale so GFA fits in ~4 unit width
  const scale = Math.sqrt(4 / gfa)
  const gfaW = Math.sqrt(gfa * 1.0) * scale
  const gfaD = Math.sqrt(gfa * 1.0) * scale

  // Stack each deduction as a band across the plate width
  // Heights proportional to their area fraction, total plate depth = gfaD
  const saleableD = gfaD * saleablePct
  const corrD = gfaD * corrPct
  const lobbyD = gfaD * lobbyPct
  const mechD = gfaD * mechPct
  const wallD = gfaD * wallPct

  const plateH = 0.12
  const inst: GeometryInstruction[] = []

  let zCursor = -gfaD / 2

  // Saleable area (green)
  inst.push({ id: 'saleable', type: 'box',
    position: [0, plateH / 2, zCursor + saleableD / 2],
    args: [gfaW, plateH, saleableD],
    color: violated ? '#fca5a5' : '#2D9F6F', opacity: 0.85, transparent: true,
    label: `Saleable ${(saleablePct * 100).toFixed(1)}% — ${saleableArea.toFixed(0)} m²` })
  zCursor += saleableD

  // Corridor (blue-gray)
  inst.push({ id: 'corridor', type: 'box',
    position: [0, plateH / 2, zCursor + corrD / 2],
    args: [gfaW, plateH, corrD],
    color: '#6366f1', opacity: 0.75, transparent: true,
    label: `Corridors ${(corrPct * 100).toFixed(0)}% — ${corrArea.toFixed(0)} m²` })
  zCursor += corrD

  // Lobby (amber)
  inst.push({ id: 'lobby', type: 'box',
    position: [0, plateH / 2, zCursor + lobbyD / 2],
    args: [gfaW, plateH, lobbyD],
    color: '#f59e0b', opacity: 0.75, transparent: true,
    label: `Lobby ${(lobbyPct * 100).toFixed(0)}% — ${lobbyArea.toFixed(0)} m²` })
  zCursor += lobbyD

  // Mechanical (red-orange)
  inst.push({ id: 'mechanical', type: 'box',
    position: [0, plateH / 2, zCursor + mechD / 2],
    args: [gfaW, plateH, mechD],
    color: '#f97316', opacity: 0.75, transparent: true,
    label: `Mechanical ${(mechPct * 100).toFixed(0)}% — ${mechArea.toFixed(0)} m²` })
  zCursor += mechD

  // Wall thickness (gray)
  inst.push({ id: 'walls', type: 'box',
    position: [0, plateH / 2, zCursor + wallD / 2],
    args: [gfaW, plateH, wallD],
    color: '#71717a', opacity: 0.75, transparent: true,
    label: `Walls ${(wallPct * 100).toFixed(0)}% — ${wallArea.toFixed(0)} m²` })

  // Gross floor area outline
  inst.push({ id: 'gfa-outline', type: 'box',
    position: [0, 0.005, 0],
    args: [gfaW + 0.04, 0.01, gfaD + 0.04],
    color: '#1B3FC4', opacity: 0.3, transparent: true,
    label: `GFA: ${gfa} m²` })

  // 60% threshold line
  const threshold60D = gfaD * 0.6
  inst.push({ id: 'threshold-60', type: 'box',
    position: [0, plateH + 0.02, -gfaD / 2 + threshold60D],
    args: [gfaW + 0.1, 0.02, 0.02],
    color: violated ? '#D64545' : '#2D9F6F',
    label: '60% threshold' })

  // Stacked floors (ghost above for context)
  for (let f = 1; f <= 3; f++) {
    inst.push({ id: `floor-${f}`, type: 'box',
      position: [0, plateH * f + 0.05 * f, 0],
      args: [gfaW, plateH, gfaD],
      color: violated ? '#fca5a5' : '#bfdbfe', opacity: 0.2, transparent: true })
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'saleable-below-60', field: 'grossFloorArea',
    check: (p) => {
      const total = (num(p.corridorPercent) + num(p.lobbyPercent) + num(p.mechanicalPercent) + num(p.wallThicknessPercent)) / 100
      return (1 - total) < 0.60
    },
    message: 'Net/saleable area ratio below 60% — floor plate efficiency is below typical regulatory threshold',
    codeCitation: 'PD 1096 Rule VIII §801 — floor area definitions; HLURB guidelines recommend minimum 60% efficiency for residential/commercial',
    severity: 'warning',
    position: () => [2.5, 0.5, 0],
  },
  {
    id: 'over-deducted', field: 'corridorPercent',
    check: (p) => (num(p.corridorPercent) + num(p.lobbyPercent) + num(p.mechanicalPercent) + num(p.wallThicknessPercent)) > 50,
    message: 'Total deductions exceed 50% of gross floor area — review floor plate design for efficiency',
    codeCitation: 'PD 1096 Rule VIII §801 — gross vs net floor area computation',
    severity: 'warning',
    position: () => [2.5, 0.8, 0],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-gfa', label: 'Gross Floor Area', description: 'Gross floor area (GFA) includes all enclosed spaces measured from the exterior face of walls, per PD 1096 Rule VIII §801', codeCitation: 'PD 1096 Rule VIII §801', position: (p) => [Math.sqrt(num(p.grossFloorArea)) * Math.sqrt(4 / num(p.grossFloorArea)) / 2 + 0.5, 0.3, 0] },
  { id: 'ann-saleable', label: 'Net Saleable Area', description: 'Net saleable/usable area excludes common areas, corridors, lobbies, mechanical rooms, and structural walls; ratio to GFA is the efficiency metric', codeCitation: 'PD 1096 Rule VIII §801; HLURB Condominium Act IRR', position: () => [-2.0, 0.3, 0] },
  { id: 'ann-threshold', label: '60% Efficiency Threshold', description: 'A floor plate delivering less than 60% saleable area is considered inefficient; below 55% may require redesign under HLURB condominium guidelines', codeCitation: 'HLURB Subdivision and Condominium Buyers Protective Decree IRR', position: () => [0, 0.5, 0] },
]

const presets: Preset[] = [
  { label: 'Efficient Office Floor', values: { grossFloorArea: 1200, corridorPercent: 15, lobbyPercent: 6, mechanicalPercent: 4, wallThicknessPercent: 4 } },
  { label: 'Typical Residential Tower', values: { grossFloorArea: 800, corridorPercent: 20, lobbyPercent: 8, mechanicalPercent: 5, wallThicknessPercent: 5 } },
  { label: 'Inefficient Layout — Violation', values: { grossFloorArea: 1000, corridorPercent: 28, lobbyPercent: 12, mechanicalPercent: 8, wallThicknessPercent: 7 } },
  { label: 'Small Floor Plate', values: { grossFloorArea: 300, corridorPercent: 18, lobbyPercent: 7, mechanicalPercent: 5, wallThicknessPercent: 5 } },
]

export const saleableAreaRatioConfig: ParametricSceneConfig = {
  id: 'saleable-area-ratio',
  title: 'Saleable Area Ratio',
  description: 'Color-coded floor plate showing gross vs net/saleable area deductions (corridors, lobbies, mechanical, walls) with efficiency percentage per PD 1096 Rule VIII §801.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [3.5, 4.0, 3.5], fov: 55 },
}
