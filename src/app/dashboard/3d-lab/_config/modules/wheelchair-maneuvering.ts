// src/app/dashboard/3d-lab/_config/modules/wheelchair-maneuvering.ts
// Wheelchair Maneuvering — BP 344 (2024 IRR)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ParametricSceneConfig,
  ParameterDef,
  GeometryInstruction,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function num(v: number | string | boolean): number {
  return typeof v === 'number' ? v : Number(v)
}

function mm(v: number | string | boolean): number {
  return num(v) / 1000
}

function str(v: number | string | boolean): string {
  return String(v)
}

// ─── BP 344 IRR 2024 Requirements ──────────────────────────────────────────
// Minimum corridor widths and turning circle requirements

const CORRIDOR_TYPES: Record<string, { minWidth: number; label: string }> = {
  'main-corridor': { minWidth: 1500, label: 'Main Corridor' },
  'secondary-corridor': { minWidth: 1200, label: 'Secondary Corridor' },
  'doorway': { minWidth: 900, label: 'Doorway Passage' },
}

const TURNING_CIRCLE_DIAMETER = 1500 // 1500mm (1.5m) per BP 344 2024 IRR

// ─── Parameters ─────────────────────────────────────────────────────────────

const parameters: ParameterDef[] = [
  {
    key: 'corridorWidth',
    label: 'Corridor Width',
    type: 'slider',
    min: 600,
    max: 2500,
    step: 10,
    default: 1500,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'corridorLength',
    label: 'Corridor Length',
    type: 'slider',
    min: 3000,
    max: 15000,
    step: 100,
    default: 8000,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'corridorType',
    label: 'Corridor Type',
    type: 'dropdown',
    default: 'main-corridor',
    options: Object.entries(CORRIDOR_TYPES).map(([value, c]) => ({
      value,
      label: c.label,
    })),
    group: 'Code Requirements',
  },
  {
    key: 'doorWidth',
    label: 'Door Clear Width',
    type: 'slider',
    min: 600,
    max: 1200,
    step: 10,
    default: 900,
    unit: 'mm',
    group: 'Dimensions',
  },
  {
    key: 'showTurningCircle',
    label: 'Show Turning Circle',
    type: 'toggle',
    default: true,
    group: 'Display',
  },
  {
    key: 'showWheelchair',
    label: 'Show Wheelchair Envelope',
    type: 'toggle',
    default: true,
    group: 'Display',
  },
]

// ─── Geometry Builder ───────────────────────────────────────────────────────

function geometry(
  params: Record<string, number | boolean | string>
): GeometryInstruction[] {
  const cW = mm(params.corridorWidth)
  const cL = mm(params.corridorLength)
  const dW = mm(params.doorWidth)
  const corType = str(params.corridorType)
  const showTurn = Boolean(params.showTurningCircle)
  const showChair = Boolean(params.showWheelchair)

  const minW = mm(CORRIDOR_TYPES[corType]?.minWidth ?? 1500)
  const turnDiameter = mm(TURNING_CIRCLE_DIAMETER)
  const widthViolated = cW < minW
  const turnViolated = cW < turnDiameter

  const wallH = 2.7
  const wallThick = 0.15
  const floorColor = '#e5e7eb'
  const wallColor = '#d4d4d8'

  const instructions: GeometryInstruction[] = []

  // 1. Floor
  instructions.push({
    id: 'floor',
    type: 'box',
    position: [0, -0.005, 0],
    args: [cW + wallThick * 2, 0.01, cL + wallThick * 2],
    color: floorColor,
  })

  // 2. Walls (left and right)
  instructions.push({
    id: 'wall-left',
    type: 'box',
    position: [-(cW / 2 + wallThick / 2), wallH / 2, 0],
    args: [wallThick, wallH, cL],
    color: wallColor,
  })
  instructions.push({
    id: 'wall-right',
    type: 'box',
    position: [(cW / 2 + wallThick / 2), wallH / 2, 0],
    args: [wallThick, wallH, cL],
    color: wallColor,
    opacity: 0.2,
    transparent: true,
  })

  // 3. End walls with door opening
  // Back wall (solid)
  instructions.push({
    id: 'wall-back',
    type: 'box',
    position: [0, wallH / 2, -(cL / 2 + wallThick / 2)],
    args: [cW + wallThick * 2, wallH, wallThick],
    color: wallColor,
  })
  // Front wall — left of door
  const doorClearance = dW / 2
  if (cW / 2 - doorClearance > 0.01) {
    instructions.push({
      id: 'wall-front-left',
      type: 'box',
      position: [-(cW / 2 - (cW / 2 - doorClearance) / 2 + doorClearance), wallH / 2, (cL / 2 + wallThick / 2)],
      args: [cW / 2 - doorClearance, wallH, wallThick],
      color: wallColor,
    })
  }
  // Front wall — right of door
  if (cW / 2 - doorClearance > 0.01) {
    instructions.push({
      id: 'wall-front-right',
      type: 'box',
      position: [(cW / 2 - (cW / 2 - doorClearance) / 2 + doorClearance), wallH / 2, (cL / 2 + wallThick / 2)],
      args: [cW / 2 - doorClearance, wallH, wallThick],
      color: wallColor,
      opacity: 0.3,
      transparent: true,
    })
  }

  // 4. Corridor width indicator (floor line)
  instructions.push({
    id: 'width-indicator',
    type: 'box',
    position: [0, 0.005, cL / 4],
    args: [cW, 0.005, 0.005],
    color: widthViolated ? '#D64545' : '#2D9F6F',
  })

  // 5. Minimum width reference lines
  instructions.push({
    id: 'min-width-left',
    type: 'box',
    position: [-(minW / 2), 0.003, 0],
    args: [0.005, 0.006, cL],
    color: '#f97316',
    opacity: 0.6,
    transparent: true,
  })
  instructions.push({
    id: 'min-width-right',
    type: 'box',
    position: [(minW / 2), 0.003, 0],
    args: [0.005, 0.006, cL],
    color: '#f97316',
    opacity: 0.6,
    transparent: true,
  })

  // 6. Turning circle (on floor, center of corridor)
  if (showTurn) {
    const turnRadius = turnDiameter / 2
    instructions.push({
      id: 'turning-circle',
      type: 'cylinder',
      position: [0, 0.006, 0],
      args: [turnRadius, turnRadius, 0.005, 32],
      color: turnViolated ? '#fecaca' : '#bbf7d0',
      opacity: 0.5,
      transparent: true,
    })
    // Circle outline
    instructions.push({
      id: 'turning-circle-outline',
      type: 'ring',
      position: [0, 0.008, 0],
      rotation: [-Math.PI / 2, 0, 0],
      args: [turnRadius - 0.01, turnRadius],
      color: turnViolated ? '#D64545' : '#2D9F6F',
    })
  }

  // 7. Wheelchair envelope (top view, ~650mm x 1200mm)
  if (showChair) {
    // Seat
    instructions.push({
      id: 'wheelchair-seat',
      type: 'box',
      position: [0, 0.45, 0],
      args: [0.65, 0.05, 0.5],
      color: '#6366f1',
      opacity: 0.6,
      transparent: true,
    })
    // Wheels (two cylinders)
    for (const side of [-1, 1] as const) {
      instructions.push({
        id: `wheelchair-wheel-${side === -1 ? 'l' : 'r'}`,
        type: 'cylinder',
        position: [side * 0.3, 0.3, -0.05],
        rotation: [0, 0, Math.PI / 2],
        args: [0.3, 0.3, 0.03, 16],
        color: '#374151',
        opacity: 0.5,
        transparent: true,
      })
    }
    // Footrest
    instructions.push({
      id: 'wheelchair-footrest',
      type: 'box',
      position: [0, 0.2, 0.35],
      args: [0.45, 0.03, 0.2],
      color: '#6366f1',
      opacity: 0.5,
      transparent: true,
    })
    // Occupant (cylinder for torso)
    instructions.push({
      id: 'wheelchair-occupant',
      type: 'cylinder',
      position: [0, 0.75, -0.05],
      args: [0.2, 0.15, 0.55, 8],
      color: '#818cf8',
      opacity: 0.4,
      transparent: true,
    })
  }

  // 8. Door frame markers
  const doorFrameH = 2.1
  for (const side of [-1, 1] as const) {
    instructions.push({
      id: `door-frame-${side === -1 ? 'l' : 'r'}`,
      type: 'box',
      position: [side * dW / 2, doorFrameH / 2, cL / 2],
      args: [0.05, doorFrameH, 0.05],
      color: dW < 0.9 ? '#D64545' : '#374151',
    })
  }

  return instructions
}

// ─── Violation Rules ────────────────────────────────────────────────────────

const violations: ViolationRule[] = [
  {
    id: 'corridor-width',
    field: 'corridorWidth',
    check: (p) => {
      const corType = str(p.corridorType)
      const minW = CORRIDOR_TYPES[corType]?.minWidth ?? 1500
      return num(p.corridorWidth) < minW
    },
    message: 'Corridor width below minimum for corridor type',
    codeCitation: 'BP 344 IRR 2024',
    severity: 'error',
    position: (p) => [0, 0.5, mm(p.corridorLength) / 4],
  },
  {
    id: 'turning-circle',
    field: 'corridorWidth',
    check: (p) => num(p.corridorWidth) < TURNING_CIRCLE_DIAMETER,
    message: 'Corridor too narrow for 1500mm wheelchair turning circle',
    codeCitation: 'BP 344 IRR 2024 §4.2',
    severity: 'error',
    position: () => [0, 0.5, 0],
  },
  {
    id: 'door-width',
    field: 'doorWidth',
    check: (p) => num(p.doorWidth) < 900,
    message: 'Door clear width below 900mm minimum',
    codeCitation: 'BP 344 IRR 2024 §4.7',
    severity: 'error',
    position: (p) => [0, 1.0, mm(p.corridorLength) / 2],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'ann-corridor-width',
    label: 'Corridor Width',
    description: 'Clear width between walls for wheelchair passage',
    codeCitation: 'BP 344 IRR 2024',
    position: (p) => [0, 0.1, mm(p.corridorLength) / 4],
  },
  {
    id: 'ann-turning-circle',
    label: 'Turning Circle (1500mm)',
    description: 'Minimum 1500mm diameter turning space for wheelchair 180° turn',
    codeCitation: 'BP 344 IRR 2024 §4.2',
    position: () => [0, 0.1, 0],
    visibleWhen: (p) => Boolean(p.showTurningCircle),
  },
  {
    id: 'ann-door-clearance',
    label: 'Door Clear Width',
    description: 'Minimum 900mm clear opening for accessible doors',
    codeCitation: 'BP 344 IRR 2024 §4.7',
    position: (p) => [0, 1.5, mm(p.corridorLength) / 2],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const presets: Preset[] = [
  {
    label: 'Compliant Main',
    values: {
      corridorWidth: 1500,
      corridorLength: 8000,
      corridorType: 'main-corridor',
      doorWidth: 900,
      showTurningCircle: true,
      showWheelchair: true,
    },
  },
  {
    label: 'Secondary Corridor',
    values: {
      corridorWidth: 1200,
      corridorLength: 6000,
      corridorType: 'secondary-corridor',
      doorWidth: 900,
      showTurningCircle: true,
      showWheelchair: true,
    },
  },
  {
    label: 'Narrow Doorway',
    values: {
      corridorWidth: 1500,
      corridorLength: 3000,
      corridorType: 'doorway',
      doorWidth: 900,
      showTurningCircle: false,
      showWheelchair: true,
    },
  },
  {
    label: 'Violation Demo',
    values: {
      corridorWidth: 1000,
      corridorLength: 8000,
      corridorType: 'main-corridor',
      doorWidth: 750,
      showTurningCircle: true,
      showWheelchair: true,
    },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const wheelchairManeuveringConfig: ParametricSceneConfig = {
  id: 'wheelchair-maneuvering',
  title: 'Wheelchair Maneuvering',
  description:
    'Interactive corridor model showing wheelchair turning circle requirements, minimum corridor widths, and door clearances per BP 344 (Accessibility Law) 2024 IRR.',
  subject: 'bp-344',
  parameters,
  geometry,
  violations,
  annotations,
  presets,
  camera: {
    position: [3, 3, 5],
    fov: 45,
  },
}
