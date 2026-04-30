// src/features/3d-lab/config/modules/room-size-minimums.ts
// Room Size Minimums — PD 1096 Rule VIII §801
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'
import { PD_1096 } from '@/features/3d-lab/config/constants'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }
function mm(v: number | string | boolean): number { return num(v) / 1000 }
function str(v: number | string | boolean): string { return String(v) }

const ROOM_MINS: Record<string, { area: number; dim: number; label: string; color: string }> = {
  'habitable':  { area: PD_1096.ROOM_MIN_AREA.habitable, // 6.0 sqm
                  dim: PD_1096.ROOM_MIN_DIMENSION.habitable, // 2.0 m
                  label: 'Habitable Room', color: '#3b82f6' },
  'kitchen':    { area: PD_1096.ROOM_MIN_AREA.kitchen, // 3.0 sqm
                  dim: PD_1096.ROOM_MIN_DIMENSION.kitchen, // 1.5 m
                  label: 'Kitchen', color: '#f97316' },
  'bathroom':   { area: PD_1096.ROOM_MIN_AREA.bathroom, // 1.2 sqm
                  dim: PD_1096.ROOM_MIN_DIMENSION.bathroom, // 0.9 m
                  label: 'Bathroom/Toilet', color: '#0891b2' },
  'laundry':    { area: PD_1096.ROOM_MIN_AREA.laundry, // 1.5 sqm
                  dim: PD_1096.ROOM_MIN_DIMENSION.laundry, // 0.9 m
                  label: 'Laundry Room', color: '#2D9F6F' },
}

const parameters: ParameterDef[] = [
  { key: 'roomType', label: 'Room Type', type: 'dropdown', default: 'habitable',
    options: Object.entries(ROOM_MINS).map(([k, v]) => ({ value: k, label: v.label })),
    group: 'Room' },
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 500, max: 6000, step: 50, default: 3000, unit: 'mm', group: 'Dimensions' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 500, max: 6000, step: 50, default: 4000, unit: 'mm', group: 'Dimensions' },
  { key: 'ceilingHeight', label: 'Ceiling Height', type: 'slider', min: 1800, max: 4000, step: 50, default: 2700, unit: 'mm', group: 'Dimensions' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const rType = str(params.roomType)
  const rW = mm(params.roomWidth)
  const rD = mm(params.roomDepth)
  const cH = mm(params.ceilingHeight)
  const spec = ROOM_MINS[rType] ?? ROOM_MINS['habitable']
  const area = rW * rD
  const minDim = Math.min(rW, rD)
  const areaOk = area >= spec.area
  const dimOk = minDim >= spec.dim
  const wallT = 0.15
  const wallColor = '#d4d4d8'
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.075, 0], args: [rW + wallT * 2, 0.15, rD + wallT * 2], color: '#a1a1aa' })
  // Ceiling
  inst.push({ id: 'ceiling', type: 'box', position: [0, cH + 0.075, 0], args: [rW + wallT * 2, 0.15, rD + wallT * 2], color: wallColor, opacity: 0.2, transparent: true })
  // Walls
  inst.push({ id: 'wall-back', type: 'box', position: [0, cH / 2, -(rD / 2 + wallT / 2)], args: [rW + wallT * 2, cH, wallT], color: wallColor })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: wallColor })
  inst.push({ id: 'wall-right', type: 'box', position: [(rW / 2 + wallT / 2), cH / 2, 0], args: [wallT, cH, rD], color: wallColor, opacity: 0.2, transparent: true })
  inst.push({ id: 'wall-front', type: 'box', position: [0, cH / 2, rD / 2 + wallT / 2], args: [rW + wallT * 2, cH, wallT], color: wallColor, opacity: 0.1, transparent: true })

  // Min area indicator on floor
  const minSide = Math.sqrt(spec.area)
  inst.push({ id: 'min-area-floor', type: 'box', position: [-(rW / 2) + minSide / 2, 0.005, -(rD / 2) + minSide / 2], args: [minSide, 0.01, minSide], color: areaOk ? '#2D9F6F' : '#D64545', opacity: 0.35, transparent: true, label: `Min ${spec.area}m²` })

  // Min dimension line
  inst.push({ id: 'min-dim-line', type: 'box', position: [0, 0.01, -(rD / 2)], args: [spec.dim, 0.01, 0.01], color: dimOk ? '#2D9F6F' : '#D64545', label: `Min ${spec.dim}m` })

  // Room color accent (based on type)
  inst.push({ id: 'room-accent', type: 'box', position: [0, 0.01, 0], args: [rW, 0.005, rD], color: spec.color, opacity: 0.1, transparent: true })

  // Area display bar
  const areaH = Math.min(area / 10, cH * 0.8)
  inst.push({ id: 'area-bar', type: 'box', position: [rW / 2 + 0.6, areaH / 2, 0], args: [0.3, areaH, 0.3], color: areaOk ? '#2D9F6F' : '#D64545', label: `${area.toFixed(1)}m²` })
  const minBarH = Math.min(spec.area / 10, cH * 0.8)
  inst.push({ id: 'min-bar', type: 'box', position: [rW / 2 + 1.0, minBarH / 2, 0], args: [0.15, minBarH, 0.15], color: '#71717a', opacity: 0.6, transparent: true })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'min-area', field: 'roomWidth',
    check: (p) => {
      const spec = ROOM_MINS[str(p.roomType)] ?? ROOM_MINS['habitable']
      return mm(p.roomWidth) * mm(p.roomDepth) < spec.area
    },
    message: 'Room area below minimum for selected room type',
    codeCitation: 'PD 1096 IRR Rule VIII §801', severity: 'error',
    position: () => [3, 2, 0],
  },
  {
    id: 'min-dimension', field: 'roomWidth',
    check: (p) => {
      const spec = ROOM_MINS[str(p.roomType)] ?? ROOM_MINS['habitable']
      return Math.min(mm(p.roomWidth), mm(p.roomDepth)) < spec.dim
    },
    message: 'Minimum room dimension not met for selected room type',
    codeCitation: 'PD 1096 IRR Rule VIII §801', severity: 'error',
    position: () => [0, 2, 3],
  },
]

const annotations: AnnotationDef[] = [
  { id: 'ann-habitable', label: 'Habitable: 6 m², 2m min', description: 'Habitable rooms must have minimum 6.00 sqm floor area and no dimension less than 2.00m', codeCitation: 'PD 1096 IRR Rule VIII §801', position: (p) => [-(mm(p.roomWidth) / 2) - 0.8, 1.5, 0] },
  { id: 'ann-kitchen', label: 'Kitchen: 3 m², 1.5m min', description: 'Kitchen minimum 3.00 sqm with no dimension less than 1.50m', codeCitation: 'PD 1096 IRR Rule VIII §801', position: (p) => [mm(p.roomWidth) / 2 + 0.8, 1.5, 0] },
]

const presets: Preset[] = [
  { label: 'Min Habitable Room', values: { roomType: 'habitable', roomWidth: 2000, roomDepth: 3000, ceilingHeight: 2700 } },
  { label: 'Standard Bedroom', values: { roomType: 'habitable', roomWidth: 3000, roomDepth: 4000, ceilingHeight: 2700 } },
  { label: 'Min Kitchen', values: { roomType: 'kitchen', roomWidth: 1500, roomDepth: 2000, ceilingHeight: 2700 } },
  { label: 'Min Bathroom', values: { roomType: 'bathroom', roomWidth: 900, roomDepth: 1350, ceilingHeight: 2400 } },
]

export const roomSizeMinimumsConfig: ParametricSceneConfig = {
  id: 'room-size-minimums',
  title: 'Room Size Minimums',
  description: 'Room plan showing minimum sizes per PD 1096: habitable 6 sqm (2m min dim), kitchen 3 sqm (1.5m), bathroom 1.2 sqm (0.9m).',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [5, 4, 6], fov: 50 },
}

