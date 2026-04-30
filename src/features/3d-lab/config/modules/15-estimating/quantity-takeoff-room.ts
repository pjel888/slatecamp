// src/features/3d-lab/config/modules/quantity-takeoff-room.ts
// Quantity Takeoff — Room Material Estimation
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }

const parameters: ParameterDef[] = [
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 2000, max: 10000, step: 100, default: 5000, unit: 'mm', group: 'Dimensions' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 2000, max: 10000, step: 100, default: 6000, unit: 'mm', group: 'Dimensions' },
  { key: 'wallHeight', label: 'Wall Height', type: 'slider', min: 2400, max: 4000, step: 100, default: 2700, unit: 'mm', group: 'Dimensions' },
  { key: 'wallType', label: 'Wall Material', type: 'dropdown', default: 'CHB', options: [{ value: 'CHB', label: 'CHB 150mm' }, { value: 'RC', label: 'RC 150mm' }, { value: 'Brick', label: 'Brick 100mm' }], group: 'Materials' },
  { key: 'showLegend', label: 'Show Legend', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const rW = mm(params.roomWidth)
  const rD = mm(params.roomDepth)
  const wH = mm(params.wallHeight)
  const wallType = String(params.wallType)
  const wT = wallType === 'Brick' ? 0.10 : 0.15
  const wallColor = wallType === 'RC' ? '#a1a1aa' : wallType === 'Brick' ? '#b45309' : '#d4d4d8'
  const inst: GeometryInstruction[] = []

  // Floor slab
  inst.push({ id: 'floor-slab', type: 'box', position: [0, -0.1, 0], args: [rW + wT * 2, 0.2, rD + wT * 2], color: '#71717a', label: `Floor: ${(rW * rD).toFixed(1)} m²` })
  // Walls
  inst.push({ id: 'wall-back', type: 'box', position: [0, wH / 2, -(rD / 2 + wT / 2)], args: [rW + wT * 2, wH, wT], color: wallColor })
  inst.push({ id: 'wall-front', type: 'box', position: [0, wH / 2, rD / 2 + wT / 2], args: [rW + wT * 2, wH, wT], color: wallColor, opacity: 0.3, transparent: true })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wT / 2), wH / 2, 0], args: [wT, wH, rD], color: wallColor })
  inst.push({ id: 'wall-right', type: 'box', position: [(rW / 2 + wT / 2), wH / 2, 0], args: [wT, wH, rD], color: wallColor, opacity: 0.3, transparent: true })
  // Ceiling slab
  inst.push({ id: 'ceiling-slab', type: 'box', position: [0, wH + 0.1, 0], args: [rW + wT * 2, 0.2, rD + wT * 2], color: '#71717a', opacity: 0.3, transparent: true })

  // CHB pattern overlay on wall
  if (wallType === 'CHB') {
    const cols = Math.round(rW / 0.4)
    const rows = Math.round(wH / 0.2)
    for (let r = 0; r < Math.min(rows, 5); r++) {
      for (let c = 0; c < Math.min(cols, 8); c++) {
        const offset = (r % 2) * 0.2
        inst.push({ id: `chb-${r}-${c}`, type: 'box', position: [-(rW / 2) + offset + c * 0.4 + 0.2, r * 0.2 + 0.1, -(rD / 2 + wT / 2 + 0.001)], args: [0.38, 0.18, 0.01], color: '#e2d5c3', opacity: 0.6, transparent: true })
      }
    }
  }

  // Material legend bars
  if (Boolean(params.showLegend)) {
    const wallArea = 2 * (rW + rD) * wH
    const legendH = wallArea / 20
    inst.push({ id: 'legend-wall', type: 'box', position: [rW / 2 + 1.2, Math.min(legendH / 2, 2), 0], args: [0.4, Math.min(legendH, 4), 0.4], color: wallColor, label: `Wall: ${wallArea.toFixed(0)} m²` })
    inst.push({ id: 'legend-floor', type: 'box', position: [rW / 2 + 1.8, 0.2, 0], args: [0.4, 0.4, 0.4], color: '#71717a', label: `Floor: ${(rW * rD).toFixed(0)} m²` })
  }

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-floor', label: 'Floor Area', description: 'Floor area = Width × Depth (finished floor area, not including wall thickness)', position: (_p) => [0, -(0.3), 0] },
  { id: 'ann-wall', label: 'Wall Area', description: 'Gross wall area = Perimeter × Height; deduct openings for net area in takeoff', position: (p) => [-(mm(p.roomWidth) / 2) - 0.8, mm(p.wallHeight) / 2, 0] },
]

const presets: Preset[] = [
  { label: 'Standard Bedroom', values: { roomWidth: 3500, roomDepth: 4000, wallHeight: 2700, wallType: 'CHB', showLegend: true } },
  { label: 'Living Room (RC)', values: { roomWidth: 5000, roomDepth: 6000, wallHeight: 2700, wallType: 'RC', showLegend: true } },
  { label: 'Large Hall', values: { roomWidth: 8000, roomDepth: 10000, wallHeight: 3600, wallType: 'CHB', showLegend: true } },
  { label: 'Brick Room', values: { roomWidth: 4000, roomDepth: 5000, wallHeight: 2700, wallType: 'Brick', showLegend: true } },
]

export const quantityTakeoffRoomConfig: ParametricSceneConfig = {
  id: 'quantity-takeoff-room',
  title: 'Quantity Takeoff — Room',
  description: 'Room model calculating floor area, wall area, and material quantities (concrete, CHB, rebar, paint) for cost estimation.',
  subject: 'estimating',
  parameters, geometry, annotations, presets,
  camera: { position: [6, 4, 7], fov: 50 },
}

