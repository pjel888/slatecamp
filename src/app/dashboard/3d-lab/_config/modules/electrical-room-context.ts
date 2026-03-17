// src/app/dashboard/3d-lab/_config/modules/electrical-room-context.ts
// Electrical Room Context — PEC
import type { ParametricSceneConfig, ParameterDef, GeometryInstruction, AnnotationDef, Preset } from '../../_types/templates'

function num(v: number | string | boolean): number { return typeof v === 'number' ? v : Number(v) }

const parameters: ParameterDef[] = [
  { key: 'roomWidth', label: 'Room Width', type: 'slider', min: 2000, max: 6000, step: 200, default: 3000, unit: 'mm', group: 'Room' },
  { key: 'roomDepth', label: 'Room Depth', type: 'slider', min: 2000, max: 6000, step: 200, default: 4000, unit: 'mm', group: 'Room' },
  { key: 'numPanels', label: 'Number of Panels', type: 'slider', min: 1, max: 4, step: 1, default: 2, group: 'Equipment' },
  { key: 'showConduits', label: 'Show Conduits', type: 'toggle', default: true, group: 'Display' },
  { key: 'showGrounding', label: 'Show Grounding', type: 'toggle', default: true, group: 'Display' },
]

function geometry(params: Record<string, number | boolean | string>): GeometryInstruction[] {
  const rW = num(params.roomWidth) / 1000
  const rD = num(params.roomDepth) / 1000
  const nPanels = num(params.numPanels)
  const showCond = Boolean(params.showConduits)
  const showGnd = Boolean(params.showGrounding)
  const wallH = 2.8
  const wallT = 0.15
  const inst: GeometryInstruction[] = []

  // Room
  inst.push({ id: 'floor', type: 'box', position: [0, -0.05, 0], args: [rW, 0.1, rD], color: '#a1a1aa' })
  inst.push({ id: 'wall-back', type: 'box', position: [0, wallH / 2, -(rD / 2 + wallT / 2)], args: [rW, wallH, wallT], color: '#d4d4d8' })
  inst.push({ id: 'wall-left', type: 'box', position: [-(rW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, rD], color: '#d4d4d8' })
  inst.push({ id: 'wall-right', type: 'box', position: [(rW / 2 + wallT / 2), wallH / 2, 0], args: [wallT, wallH, rD], color: '#d4d4d8', opacity: 0.2, transparent: true })
  inst.push({ id: 'wall-front', type: 'box', position: [0, wallH / 2, rD / 2 + wallT / 2], args: [rW, wallH, wallT], color: '#d4d4d8', opacity: 0.1, transparent: true })
  inst.push({ id: 'ceiling', type: 'box', position: [0, wallH + 0.075, 0], args: [rW, 0.15, rD], color: '#d4d4d8', opacity: 0.1, transparent: true })

  // Panel boards on back wall
  const panelSpacing = rW / (nPanels + 1)
  for (let p = 0; p < nPanels; p++) {
    const px = -(rW / 2) + panelSpacing * (p + 1)
    inst.push({ id: `panel-${p}`, type: 'box', position: [px, 1.4, -(rD / 2 + wallT / 2 - 0.08)], args: [0.5, 0.9, 0.15], color: '#52525b' })
    inst.push({ id: `panel-door-${p}`, type: 'box', position: [px + 0.05, 1.4, -(rD / 2 + wallT / 2 - 0.16)], args: [0.35, 0.8, 0.02], color: '#71717a' })
    // Breakers
    for (let b = 0; b < 8; b++) {
      inst.push({ id: `breaker-${p}-${b}`, type: 'box', position: [px - 0.1 + (b % 2) * 0.2, 1.0 + Math.floor(b / 2) * 0.17, -(rD / 2 + wallT / 2 - 0.17)], args: [0.15, 0.12, 0.02], color: b % 2 === 0 ? '#3b82f6' : '#6366f1' })
    }
    // Main breaker
    inst.push({ id: `main-breaker-${p}`, type: 'box', position: [px, 1.9, -(rD / 2 + wallT / 2 - 0.17)], args: [0.3, 0.12, 0.02], color: '#dc2626', label: 'Main' })
  }

  // Cable trays / conduits
  if (showCond) {
    // Main cable tray (ceiling level)
    inst.push({ id: 'cable-tray', type: 'box', position: [0, wallH - 0.2, 0], args: [rW - 0.3, 0.15, 0.3], color: '#71717a', label: 'Cable Tray' })
    // Drop conduits to panels
    for (let p = 0; p < nPanels; p++) {
      const px = -(rW / 2) + panelSpacing * (p + 1)
      inst.push({ id: `conduit-${p}`, type: 'cylinder', position: [px, wallH - 0.7, -(rD / 2 + wallT / 2 - 0.12)], args: [0.025, 0.025, wallH - 2.3, 8], color: '#a1a1aa' })
    }
    // Feeder conduit from outside
    inst.push({ id: 'feeder', type: 'cylinder', position: [-(rW / 2 + 0.1), wallH - 0.2, 0], rotation: [0, 0, Math.PI / 2], args: [0.04, 0.04, 0.4, 8], color: '#3b82f6', label: 'Feeder' })
  }

  // Grounding system
  if (showGnd) {
    // Ground bus bar
    inst.push({ id: 'ground-bar', type: 'box', position: [0, 0.15, -(rD / 2 - 0.3)], args: [rW * 0.5, 0.02, 0.04], color: '#16a34a', label: 'Ground Bus' })
    // Ground rod (below floor)
    inst.push({ id: 'ground-rod', type: 'cylinder', position: [0, -0.5, -(rD / 2 - 0.3)], args: [0.016, 0.016, 1.0, 8], color: '#16a34a' })
    // Ground wire to panels
    for (let p = 0; p < nPanels; p++) {
      const px = -(rW / 2) + panelSpacing * (p + 1)
      inst.push({ id: `gnd-wire-${p}`, type: 'cylinder', position: [px * 0.5, 0.18, -(rD / 2 - 0.15)], rotation: [0, 0, Math.PI / 4], args: [0.005, 0.005, 1.0, 6], color: '#16a34a', opacity: 0.7, transparent: true })
    }
  }

  // Clearance zone (front of panel, 900mm)
  inst.push({ id: 'clearance-zone', type: 'box', position: [0, 1.5, -(rD / 2 - 0.45)], args: [rW - 0.3, wallH * 0.8, 0.9], color: '#3b82f6', opacity: 0.08, transparent: true, label: '900mm work space' })

  return inst
}

const annotations: AnnotationDef[] = [
  { id: 'ann-clearance', label: '900mm Work Space', description: 'PEC requires minimum 900mm clear working space in front of electrical panels for safe operation and maintenance', codeCitation: 'PEC §1.10.2', position: () => [2, 1.5, 1] },
  { id: 'ann-grounding', label: 'System Grounding', description: 'All electrical systems must be grounded; ground rods minimum 2.4m depth; copper ground wire to all equipment', codeCitation: 'PEC §2.50', position: () => [0, 0.5, 2] },
]

const presets: Preset[] = [
  { label: 'Small Electrical Room', values: { roomWidth: 2500, roomDepth: 3000, numPanels: 1, showConduits: true, showGrounding: true } },
  { label: 'Main Distribution', values: { roomWidth: 4000, roomDepth: 5000, numPanels: 3, showConduits: true, showGrounding: true } },
  { label: 'Sub-Panel Room', values: { roomWidth: 3000, roomDepth: 4000, numPanels: 2, showConduits: true, showGrounding: false } },
  { label: 'Grounding Focus', values: { roomWidth: 3500, roomDepth: 4500, numPanels: 2, showConduits: false, showGrounding: true } },
]

export const electricalRoomContextConfig: ParametricSceneConfig = {
  id: 'electrical-room-context',
  title: 'Electrical Room Context',
  description: 'Electrical room with panel boards, cable trays, conduits, and grounding system per PEC with 900mm working clearance.',
  subject: 'pec',
  parameters, geometry, annotations, presets,
  camera: { position: [5, 3, 5], fov: 55 },
}
