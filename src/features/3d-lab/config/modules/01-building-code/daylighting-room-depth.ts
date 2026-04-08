// src/features/3d-lab/config/modules/01-building-code/daylighting-room-depth.ts
// Daylighting Room Depth — PD 1096 Rule VIII §803 (2.5× rule)
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, ViolationRule, AnnotationDef, Preset } from '@/features/3d-lab/types/templates'
import { PD_1096 } from '@/features/3d-lab/config/constants'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  { key: 'windowHeadHeight', label: 'Window Head Height', type: 'slider', min: 2.1, max: 3.6, step: 0.1, default: 2.4, unit: 'm', decimals: 1, group: 'Window' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 3.0, max: 12.0, step: 0.25, default: 6.0, unit: 'm', decimals: 2, group: 'Room' },
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 3.0, max: 8.0, step: 0.25, default: 4.5, unit: 'm', decimals: 2, group: 'Room' },
  { key: 'windowWidth', label: 'Window Width', type: 'slider', min: 0.9, max: 3.0, step: 0.1, default: 1.8, unit: 'm', decimals: 1, group: 'Window' },
  { key: 'ceilingHeight', label: 'Ceiling Height', type: 'slider', min: 2.7, max: 4.5, step: 0.1, default: 3.0, unit: 'm', decimals: 1, group: 'Room' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const winHead = num(params.windowHeadHeight)
  const rDepth = num(params.roomDepth)
  const rWidth = num(params.roomWidth)
  const winWidth = num(params.windowWidth)
  const ceilH = num(params.ceilingHeight)

  const maxAllowedDepth = PD_1096.LIGHT_VENT.maxRoomDepthToWindowHeadRatio * winHead // 2.5
  const floorArea = rWidth * rDepth
  const winArea = winWidth * winHead
  const winRatio = winArea / floorArea

  const depthViolated = rDepth > maxAllowedDepth
  const winAreaViolated = winRatio < PD_1096.LIGHT_VENT.minWindowToFloorRatio // 0.10

  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Floor
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [rWidth + wallT * 2, 0.1, rDepth + wallT * 2], color: '#a1a1aa' })

  // Walls (back, left, right visible; front transparent)
  inst.push({ id: 'wall-back', type: 'box', position: [0, ceilH / 2, -(rDepth / 2 + wallT / 2)], args: [rWidth + wallT * 2, ceilH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rWidth / 2 + wallT / 2), ceilH / 2, 0], args: [wallT, ceilH, rDepth], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(rWidth / 2 + wallT / 2), ceilH / 2, 0], args: [wallT, ceilH, rDepth], color: '#d4d4d8', opacity: 0.3, transparent: true })
  // Front wall with window opening represented as frame
  inst.push({ id: 'wall-front-l', type: 'box', position: [-(rWidth / 2 + winWidth / 2) / 2, ceilH / 2, rDepth / 2 + wallT / 2], args: [(rWidth - winWidth) / 2, ceilH, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })
  inst.push({ id: 'wall-front-r', type: 'box', position: [(rWidth / 2 + winWidth / 2) / 2, ceilH / 2, rDepth / 2 + wallT / 2], args: [(rWidth - winWidth) / 2, ceilH, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })
  inst.push({ id: 'wall-front-top', type: 'box', position: [0, (winHead + ceilH) / 2, rDepth / 2 + wallT / 2], args: [winWidth, ceilH - winHead, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })
  // Window sill below
  inst.push({ id: 'wall-front-sill', type: 'box', position: [0, 0.45, rDepth / 2 + wallT / 2], args: [winWidth, 0.9, wallT], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Ceiling
  inst.push({ id: 'ceiling', type: 'box', position: [0, ceilH + 0.05, 0], args: [rWidth + wallT * 2, 0.1, rDepth + wallT * 2], color: '#d4d4d8', opacity: 0.15, transparent: true })

  // Window glass
  inst.push({ id: 'window', type: 'box', position: [0, (0.9 + winHead) / 2, rDepth / 2], args: [winWidth, winHead - 0.9, 0.04], color: '#bfdbfe', opacity: 0.55, transparent: true, label: `Window: ${winArea.toFixed(1)}m²` })

  // Daylit zone (green) — 2.5× window head depth
  const daylitDepth = Math.min(maxAllowedDepth, rDepth)
  inst.push({ id: 'daylit-zone', type: 'box', position: [0, 0.02, rDepth / 2 - daylitDepth / 2], args: [rWidth, 0.04, daylitDepth], color: '#2D9F6F', opacity: 0.25, transparent: true, label: `Daylit: ${maxAllowedDepth.toFixed(1)}m` })

  // Dark zone beyond 2.5× (red) if room exceeds limit
  if (depthViolated) {
    const darkDepth = rDepth - maxAllowedDepth
    inst.push({ id: 'dark-zone', type: 'box', position: [0, 0.02, rDepth / 2 - maxAllowedDepth - darkDepth / 2], args: [rWidth, 0.04, darkDepth], color: '#D64545', opacity: 0.3, transparent: true, label: `Dark zone: ${darkDepth.toFixed(1)}m` })
  }

  // Light rays (3 diagonal lines from window into room)
  const rayColors = ['#fef08a', '#fde68a', '#fcd34d']
  for (let i = 0; i < 3; i++) {
    const rayLen = Math.min(maxAllowedDepth * 0.9, rDepth * 0.85)
    const rayY = winHead - 0.1 - i * 0.15
    inst.push({ id: `ray-${i}`, type: 'box', position: [0, rayY - rayLen * 0.12, rDepth / 2 - rayLen / 2], rotation: [0.24, 0, 0], args: [winWidth * 0.1, 0.02, rayLen], color: rayColors[i], opacity: 0.5, transparent: true })
  }

  // Max depth marker
  inst.push({ id: 'max-depth-line', type: 'box', position: [0, 0.08, rDepth / 2 - maxAllowedDepth], args: [rWidth, 0.06, 0.05], color: depthViolated ? '#D64545' : '#2D9F6F', label: `Max ${maxAllowedDepth.toFixed(1)}m` })

  // Window area ratio bar
  const ratioBarH = winRatio * 20
  inst.push({ id: 'ratio-bar', type: 'box', position: [rWidth / 2 + 0.6, ratioBarH / 2, 0], args: [0.25, ratioBarH, 0.25], color: winAreaViolated ? '#D64545' : '#2D9F6F', label: `Win: ${(winRatio * 100).toFixed(1)}%` })
  inst.push({ id: 'ratio-min-line', type: 'box', position: [rWidth / 2 + 0.6, 2.0, 0], args: [0.5, 0.03, 0.5], color: '#f97316', label: 'Min 10%' })

  return inst
}

const violations: ViolationRule[] = [
  {
    id: 'depth-exceeds-2-5x', field: 'roomDepth',
    check: (p) => num(p.roomDepth) > PD_1096.LIGHT_VENT.maxRoomDepthToWindowHeadRatio * num(p.windowHeadHeight), // 2.5
    message: 'Room depth exceeds 2.5× the window head height — far zone will not receive adequate natural daylighting',
    codeCitation: 'PD 1096 Rule VIII §803.1 — habitable rooms shall have natural light penetrating to 2.5× window head height from the window wall', severity: 'error',
    position: (p) => [0, 2, -(num(p.roomDepth) / 2) + 0.5],
  },
  {
    id: 'window-area-below-10pct', field: 'windowWidth',
    check: (p) => {
      const floorArea = num(p.roomWidth) * num(p.roomDepth)
      const winArea = num(p.windowWidth) * num(p.windowHeadHeight)
      return winArea / floorArea < PD_1096.LIGHT_VENT.minWindowToFloorRatio // 0.10
    },
    message: 'Window area is below 10% of floor area — minimum light opening requirement not met for habitable rooms',
    codeCitation: 'PD 1096 Rule VIII §803.2 — window opening area shall not be less than 10% of floor area', severity: 'error',
    position: () => [3, 2, 0],
  },
]

const annotations: AnnotationDef[] = [
  {
    id: 'ann-2-5x-rule', label: '2.5× Daylight Rule',
    description: 'PD 1096 Rule VIII §803 states habitable rooms should not exceed 2.5× the window head height in depth for adequate natural lighting. Rooms deeper than this require supplemental artificial lighting or additional skylights.',
    codeCitation: 'PD 1096 Rule VIII §803.1',
    position: (p) => [-(num(p.roomWidth) / 2) - 1.0, 1.5, 0],
  },
  {
    id: 'ann-window-area', label: 'Min Window Area 10%',
    description: 'The gross floor area of a habitable room divided by the total window opening area must not exceed 10:1. Windows must open directly to the outdoors or an approved light well.',
    codeCitation: 'PD 1096 Rule VIII §803.2',
    position: (p) => [num(p.roomWidth) / 2 + 1.2, 2, 0],
  },
]

const presets: Preset[] = [
  { label: 'Compliant Bedroom', values: { windowHeadHeight: 2.4, roomDepth: 5.0, roomWidth: 3.5, windowWidth: 1.8, ceilingHeight: 2.7 } },
  { label: 'Depth Violation', values: { windowHeadHeight: 2.4, roomDepth: 8.0, roomWidth: 4.0, windowWidth: 1.5, ceilingHeight: 2.7 } },
  { label: 'High Window Head', values: { windowHeadHeight: 3.2, roomDepth: 7.5, roomWidth: 5.0, windowWidth: 2.4, ceilingHeight: 3.6 } },
  { label: 'Window Area Violation', values: { windowHeadHeight: 2.4, roomDepth: 4.5, roomWidth: 6.0, windowWidth: 0.9, ceilingHeight: 2.7 } },
]

export const daylightingRoomDepthConfig: ParametricSceneConfig = {
  id: 'daylighting-room-depth',
  title: 'Daylighting Room Depth',
  description: 'Room cross-section showing the 2.5× window head height daylighting rule per PD 1096 Rule VIII §803, with daylit zone (green), dark zone (red), light rays, and window area to floor area ratio check.',
  subject: 'pd-1096',
  parameters, geometry, violations, annotations, presets,
  camera: { position: [6, 4, 7], fov: 50 },
}
