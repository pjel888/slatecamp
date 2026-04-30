// src/features/3d-lab/config/modules/exit-width-calculator.ts
// Exit Width Calculator — RA 9514 Fire Code
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'occupantLoad', label: 'Occupant Load', type: 'slider', min: 10, max: 1000, step: 10, default: 200, unit: 'persons', group: 'Occupancy' },
  { key: 'exitWidth', label: 'Exit Door Width', type: 'slider', min: 600, max: 2400, step: 50, default: 1100, unit: 'mm', group: 'Exit' },
  { key: 'numExits', label: 'Number of Exits', type: 'slider', min: 1, max: 6, step: 1, default: 2, group: 'Exit' },
  { key: 'showFlow', label: 'Show Evacuation Flow', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const occ = num(params.occupantLoad)
  const eW = mm(params.exitWidth)
  const nExits = num(params.numExits)
  const showFlow = Boolean(params.showFlow)
  // 5.1mm per person capacity per exit unit; min 710mm per exit
  const minWidthPerExit = Math.max(occ * 0.0051 / nExits, 0.71)
  const _totalMinW = minWidthPerExit * nExits
  const violated = eW < minWidthPerExit || eW < 0.71
  const roomW = 12.0
  const roomD = 10.0
  const wallH = 3.0
  const wallT = 0.2
  const inst: GeometryInstruction[] = []

  // Room
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [roomW, 0.1, roomD], color: '#a1a1aa' })
  inst.push({ id: 'wall-back', type: 'box', position: [0, wallH / 2, -(roomD / 2 + wallT / 2)], args: [roomW, wallH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(roomW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, roomD], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(roomW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, roomD], color: '#d4d4d8' })

  // Exit doors on front wall
  const exitSpacing = roomW / (nExits + 1)
  for (let e = 0; e < nExits; e++) {
    const ex = -(roomW / 2) + exitSpacing * (e + 1)
    const exitColor = violated ? '#D64545' : '#2D9F6F'
    inst.push({ id: `exit-${e}`, type: 'box', position: [ex, 1.1, roomD / 2 + wallT / 2], args: [eW, 2.2, wallT + 0.05], color: exitColor, opacity: 0.7, transparent: true, label: `Exit ${e + 1}` })
    // Exit sign above
    inst.push({ id: `exit-sign-${e}`, type: 'box', position: [ex, 2.5, roomD / 2 + 0.1], args: [0.4, 0.15, 0.02], color: '#2D9F6F', label: 'EXIT' })
    // Min width indicator
    inst.push({ id: `min-width-${e}`, type: 'box', position: [ex, 0.02, roomD / 2 + 0.15], args: [minWidthPerExit, 0.01, 0.1], color: violated ? '#D64545' : '#3b82f6', label: `Min: ${(minWidthPerExit * 1000).toFixed(0)}mm` })

    // Evacuation flow
    if (showFlow) {
      for (let f = 0; f < 3; f++) {
        const fz = -roomD / 2 + (f + 1) * roomD / 4
        inst.push({ id: `flow-${e}-${f}`, type: 'cone', position: [ex + (f - 1) * 0.3, 0.3, fz], rotation: [-Math.PI / 2, 0, 0], args: [0.08, 0.2, 6], color: '#f97316', opacity: 0.7, transparent: true })
      }
    }
  }

  // Front wall segments
  inst.push({ id: 'wall-front-l', type: 'box', position: [-roomW / 2 + exitSpacing * 0.5, wallH / 2, roomD / 2 + wallT / 2], args: [exitSpacing * 0.5, wallH, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Crowd representation
  const personR = Math.ceil(Math.sqrt(occ / 50))
  for (let px = 0; px < personR; px++) {
    for (let pz = 0; pz < personR; pz++) {
      inst.push({ id: `person-${px}-${pz}`, type: 'cylinder', position: [(px - personR / 2) * 1.2, 0.85, (pz - personR / 2) * 1.2], args: [0.2, 0.2, 1.7, 6], color: '#6366f1', opacity: 0.4, transparent: true })
    }
  }

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'exit-width-min', field: 'exitWidth',
    check: (p) => mm(p.exitWidth) < 0.71,
    message: 'Exit door minimum width is 710mm per RA 9514',
    codeCitation: 'RA 9514 IRR Rule 10 §10.2.5.2', severity: 'error',
    position: () => [0, 3, 5],
  },
  {
    id: 'exit-capacity', field: 'occupantLoad',
    check: (p) => {
      const minW = Math.max(num(p.occupantLoad) * 0.0051 / num(p.numExits), 0.71)
      return mm(p.exitWidth) < minW
    },
    message: 'Exit width insufficient for occupant load: 5.1mm per person required',
    codeCitation: 'RA 9514 IRR Rule 10 §10.2.5', severity: 'error',
    position: () => [0, 3, 5],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-capacity', label: '5.1mm/Person Rule', description: 'Exit width capacity factor: 5.1mm per person for door exits; distribute evenly across all required exits', codeCitation: 'RA 9514 IRR Rule 10 §10.2.5', position: () => [5, 2.5, 0] },
  { id: 'ann-min', label: 'Min 710mm Per Exit', description: 'Each exit door must have a minimum clear width of 710mm regardless of occupant load', codeCitation: 'RA 9514 IRR Rule 10 §10.2.5.2', position: () => [-5, 2.5, 0] },
]

const presets: Preset[] = [
  { label: 'Small Assembly (100)', values: { occupantLoad: 100, exitWidth: 1100, numExits: 2, showFlow: true } },
  { label: 'Large Assembly (500)', values: { occupantLoad: 500, exitWidth: 1800, numExits: 3, showFlow: true } },
  { label: 'Classroom (40)', values: { occupantLoad: 40, exitWidth: 900, numExits: 1, showFlow: false } },
  { label: 'Violation Demo', values: { occupantLoad: 300, exitWidth: 900, numExits: 2, showFlow: true } },
]

export const exitWidthCalculatorConfig: ParametricSceneConfig = {
  id: 'exit-width-calculator',
  title: 'Exit Width Calculator',
  description: 'Exit doors with width calculations based on occupant load (5.1mm/person) and minimum 710mm per exit per RA 9514 Fire Code.',
  subject: 'ra-9514',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [8, 6, 9], fov: 55 },
}

