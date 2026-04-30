// src/features/3d-lab/config/modules/light-ventilation-openings.ts
// Light and Ventilation Openings — PD 1096 Rule VIII §803
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'
import { PD_1096 } from '@/features/3d-lab/config/constants'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 2000, max: 10000, step: 100, default: 5000, unit: 'mm', group: 'Room' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 2000, max: 10000, step: 100, default: 6000, unit: 'mm', group: 'Room' },
  { key: 'windowWidth', label: 'Window Width', type: 'slider', min: 300, max: 3000, step: 50, default: 1200, unit: 'mm', group: 'Openings' },
  { key: 'windowHeight', label: 'Window Height', type: 'slider', min: 300, max: 2000, step: 50, default: 1000, unit: 'mm', group: 'Openings' },
  { key: 'numWindows', label: 'Number of Windows', type: 'slider', min: 1, max: 6, step: 1, default: 2, group: 'Openings' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const rW = mm(params.roomWidth)
  const rD = mm(params.roomDepth)
  const wW = mm(params.windowWidth)
  const wH = mm(params.windowHeight)
  const nW = num(params.numWindows)
  const cH = 2.7
  const wallT = 0.15
  const floorA = rW * rD
  const openA = wW * wH * nW
  const ratio = openA / floorA
  const violated = openA < floorA * PD_1096.LIGHT_VENT.minWindowToFloorRatio || (wW * wH) < 1.0 // 0.10
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.08, 0], args: [rW, 0.15, rD], color: '#a1a1aa' })
  // Ceiling
  inst.push({ id: 'ceiling', type: 'box', position: [0, cH + 0.08, 0], args: [rW, 0.15, rD], color: '#d4d4d8', opacity: 0.4, transparent: true })
  // Back wall solid
  inst.push({ id: 'wall-back', type: 'box', position: [0, cH / 2, -(rD / 2 + wallT / 2)], args: [rW, cH, wallT], color: '#d4d4d8' })
  // Left wall
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: '#d4d4d8' })
  // Right wall (transparent)
  inst.push({ id: 'wall-right', type: 'box', position: [(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: '#d4d4d8', opacity: 0.2, transparent: true })

  // Windows on front wall
  const spacing = rW / (nW + 1)
  for (let i = 0; i < nW; i++) {
    const wx = -(rW / 2) + spacing * (i + 1)
    inst.push({
      id: `window-${i}`, type: 'box',
      position: [wx, 1.0 + wH / 2, rD / 2 + wallT / 2],
      args: [wW, wH, wallT + 0.01],
      color: violated ? '#fca5a5' : '#93c5fd',
      opacity: 0.6, transparent: true, label: `Win ${i + 1}`,
    })
  }
  // Front wall segments (around windows)
  inst.push({ id: 'wall-front-left', type: 'box', position: [-(rW / 2) + spacing / 2, cH / 2, rD / 2 + wallT / 2], args: [spacing * 0.4, cH, wallT], color: '#d4d4d8', opacity: 0.25, transparent: true })
  // Required opening area indicator
  const reqA = floorA * PD_1096.LIGHT_VENT.minWindowToFloorRatio // 0.10
  inst.push({ id: 'req-area-plane', type: 'box', position: [0, 0.01, 0], args: [Math.sqrt(reqA), 0.005, Math.sqrt(reqA)], color: ratio >= PD_1096.LIGHT_VENT.minWindowToFloorRatio ? '#2D9F6F' : '#D64545', opacity: 0.25, transparent: true, label: '10% min' }) // 0.10

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'window-area-ratio', field: 'windowWidth',
    check: (p) => {
      const floorA = mm(p.roomWidth) * mm(p.roomDepth)
      const openA = mm(p.windowWidth) * mm(p.windowHeight) * num(p.numWindows)
      return openA < floorA * PD_1096.LIGHT_VENT.minWindowToFloorRatio // 0.10
    },
    message: 'Total window area below 10% of floor area minimum',
    codeCitation: 'PD 1096 IRR Rule VIII §803', severity: 'error',
    position: () => [3, 2, 3],
  },
  {
    id: 'min-window-size', field: 'windowWidth',
    check: (p) => mm(p.windowWidth) * mm(p.windowHeight) < 1.0,
    message: 'Individual window opening must be not less than 1.00 sqm',
    codeCitation: 'PD 1096 IRR Rule VIII §803', severity: 'error',
    position: () => [0, 2.5, 3],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-ratio', label: '10% Floor Area Rule', description: 'Total window/opening area must be at least 10% of the room floor area for natural light and ventilation', codeCitation: 'PD 1096 IRR Rule VIII §803', position: (p) => [-(mm(p.roomWidth) / 2) - 0.5, 1.5, 0] },
  { id: 'ann-min-size', label: 'Min 1.00 sqm per Opening', description: 'No single required opening shall be less than 1.00 sqm', codeCitation: 'PD 1096 IRR Rule VIII §803', position: (p) => [0, 2.8, mm(p.roomDepth) / 2 + 0.5] },
]

const presets: Preset[] = [
  { label: 'Compliant Room', values: { roomWidth: 5000, roomDepth: 6000, windowWidth: 1800, windowHeight: 1200, numWindows: 2 } },
  { label: 'Minimum Windows', values: { roomWidth: 4000, roomDepth: 5000, windowWidth: 1000, windowHeight: 1000, numWindows: 2 } },
  { label: 'Large Living Room', values: { roomWidth: 7000, roomDepth: 8000, windowWidth: 2400, windowHeight: 1500, numWindows: 3 } },
  { label: 'Violation Demo', values: { roomWidth: 6000, roomDepth: 8000, windowWidth: 800, windowHeight: 600, numWindows: 1 } },
]

export const lightVentilationOpeningsConfig: ParametricSceneConfig = {
  id: 'light-ventilation-openings',
  title: 'Light & Ventilation Openings',
  description: 'Room model with adjustable window sizes demonstrating the 10% floor area rule for natural light and ventilation per PD 1096 Rule VIII §803.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 4, 7], fov: 45 },
}

