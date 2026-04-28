// src/app/dashboard/3d-lab/_config/modules/fixture-unit-values.ts
// Fixture Unit Values — NPCP (DFU)
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function _num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const FIXTURES: Array<{ id: string; label: string; dfu: number; trapSize: number; color: string }> = [
  { id: 'wc', label: 'Water Closet', dfu: 4, trapSize: 76, color: '#3b82f6' },
  { id: 'lav', label: 'Lavatory', dfu: 1, trapSize: 32, color: '#0891b2' },
  { id: 'kitchen', label: 'Kitchen Sink', dfu: 2, trapSize: 38, color: '#2D9F6F' },
  { id: 'shower', label: 'Shower/Bath', dfu: 2, trapSize: 38, color: '#6366f1' },
  { id: 'laundry', label: 'Laundry Sink', dfu: 2, trapSize: 38, color: '#f97316' },
  { id: 'urinal', label: 'Urinal', dfu: 4, trapSize: 51, color: '#7c3aed' },
  { id: 'floor-drain', label: 'Floor Drain', dfu: 1, trapSize: 51, color: '#52525b' },
]

const parameters: ParameterDef[] = [
  { key: 'selectedFixture', label: 'Highlight Fixture', type: 'dropdown', default: 'wc',
    options: FIXTURES.map(f => ({ value: f.id, label: f.label })),
    group: 'Fixture' },
  { key: 'showDFU', label: 'Show DFU Bars', type: 'toggle', default: true, group: 'Display' },
  { key: 'showTrap', label: 'Show Trap Size', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const sel = String(params.selectedFixture)
  const showDFU = Boolean(params.showDFU)
  const showTrap = Boolean(params.showTrap)
  const maxDFU = 4
  const spacing = 1.2
  const inst: GeometryInstruction[] = []

  // Base
  inst.push({ id: 'base', type: 'box', position: [0, -0.1, 0], args: [FIXTURES.length * spacing + 0.5, 0.2, 2.5], color: '#3f3f46' })

  FIXTURES.forEach((fix, i) => {
    const xPos = -(FIXTURES.length / 2 - 0.5) * spacing + i * spacing
    const isSel = fix.id === sel
    const opacity = isSel ? 1 : 0.5

    // Fixture body
    if (fix.id === 'wc') {
      inst.push({ id: `fixture-${fix.id}`, type: 'box', position: [xPos, 0.4, 0], args: [0.5, 0.8, 0.6], color: fix.color, opacity, transparent: !isSel })
      inst.push({ id: `fixture-tank-${fix.id}`, type: 'box', position: [xPos, 0.75, -0.25], args: [0.35, 0.4, 0.2], color: fix.color, opacity: opacity * 0.9, transparent: true })
    } else if (fix.id === 'lav') {
      inst.push({ id: `fixture-${fix.id}`, type: 'cylinder', position: [xPos, 0.35, 0], args: [0.22, 0.16, 0.15, 16], color: fix.color, opacity, transparent: !isSel })
      inst.push({ id: `fixture-ped-${fix.id}`, type: 'cylinder', position: [xPos, 0.15, 0], args: [0.06, 0.06, 0.3, 8], color: fix.color, opacity, transparent: !isSel })
    } else if (fix.id === 'shower') {
      inst.push({ id: `fixture-${fix.id}`, type: 'box', position: [xPos, 0.02, 0], args: [0.55, 0.04, 0.55], color: fix.color, opacity, transparent: !isSel })
      inst.push({ id: `shower-head-${fix.id}`, type: 'sphere', position: [xPos, 0.8, 0], args: [0.06, 8, 8], color: fix.color, opacity, transparent: !isSel })
    } else {
      const h = fix.id === 'laundry' ? 0.5 : fix.id === 'kitchen' ? 0.35 : 0.3
      inst.push({ id: `fixture-${fix.id}`, type: 'box', position: [xPos, h / 2, 0], args: [0.5, h, 0.5], color: fix.color, opacity, transparent: !isSel })
    }

    // DFU bar
    if (showDFU) {
      const dfuH = (fix.dfu / maxDFU) * 1.5
      inst.push({ id: `dfu-bar-${fix.id}`, type: 'box', position: [xPos, 1.0 + dfuH / 2, 0], args: [0.25, dfuH, 0.25], color: fix.color, opacity: isSel ? 1 : 0.6, transparent: !isSel, label: `${fix.dfu} DFU` })
    }

    // Trap pipe
    if (showTrap) {
      const trapScale = fix.trapSize / 100
      inst.push({ id: `trap-${fix.id}`, type: 'cylinder', position: [xPos, -0.15, 0], args: [trapScale * 0.05, trapScale * 0.05, 0.3, 8], color: '#a1a1aa', label: `${fix.trapSize}mm` })
      // Trap bend
      inst.push({ id: `trap-horiz-${fix.id}`, type: 'cylinder', position: [xPos, -0.3, 0.15], rotation: [Math.PI / 2, 0, 0], args: [trapScale * 0.05, trapScale * 0.05, 0.25, 8], color: '#71717a' })
    }
  })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-wc', label: 'WC: 4 DFU, 76mm trap', description: 'Water closet drain fixture units = 4; requires 76mm minimum trap and drain pipe', codeCitation: 'NPCP Table 7-1', position: () => [-4, 2.5, 0] },
  { id: 'ann-lav', label: 'Lavatory: 1 DFU, 32mm', description: 'Lavatory = 1 DFU; 32mm minimum trap; smallest fixture unit value', codeCitation: 'NPCP Table 7-1', position: () => [4, 2.5, 0] },
]

const presets: Preset[] = [
  { label: 'WC Highlighted', values: { selectedFixture: 'wc', showDFU: true, showTrap: true } },
  { label: 'Kitchen Sink', values: { selectedFixture: 'kitchen', showDFU: true, showTrap: true } },
  { label: 'All DFU View', values: { selectedFixture: 'lav', showDFU: true, showTrap: false } },
  { label: 'Trap Sizes', values: { selectedFixture: 'urinal', showDFU: false, showTrap: true } },
]

export const fixtureUnitValuesConfig: ParametricSceneConfig = {
  id: 'fixture-unit-values',
  title: 'Fixture Unit Values',
  description: 'Plumbing fixture display with Drain Fixture Unit (DFU) values and trap sizes per NPCP: WC=4 DFU/76mm, Lavatory=1 DFU/32mm.',
  subject: 'npcp',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 4, 5], fov: 55 },
}

