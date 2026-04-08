// src/features/3d-lab/config/modules/03-fire-code/egress-simulation.ts
// Egress Simulation — RA 9514 IRR Rule 10 / PD 1096 Rule X
// Animated step-by-step evacuation sequence showing occupant movement
// from alarm to full building evacuation through exit pathways.

import type {
  AnimatedSequenceConfig,
  SequenceStep,
  GeometryInstruction,
  AnnotationDef,
} from '@/features/3d-lab/types/templates'
import { RA_9514 } from '@/features/3d-lab/config/constants'

// ─── Constants ───────────────────────────────────────────────────────────────

const FLOOR_W = 4.0
const FLOOR_D = 3.0
const WALL_H = 0.3
const WALL_T = 0.04
const DOOR_W = 0.12 // 900mm scaled
const PERSON_R = 0.03
const PERSON_H = 0.18

// Colors
const WALL_COLOR = '#78716c'
const FLOOR_COLOR = '#e7e5e4'
const EXIT_COLOR = '#2D9F6F'
const EXIT_SIGN_COLOR = '#dc2626'
const CORRIDOR_COLOR = '#fef3c7'
const PERSON_NORMAL = '#3b82f6'
const PERSON_MOVING = '#f97316'
const PERSON_EXITED = '#2D9F6F'
const ALARM_COLOR = '#dc2626'

// ─── Shared Geometry (building shell) ────────────────────────────────────────

const buildingShell: GeometryInstruction[] = [
  // Floor
  { id: 'floor', type: 'box', position: [0, 0, 0], args: [FLOOR_W, 0.02, FLOOR_D], color: FLOOR_COLOR },
  // Walls
  { id: 'wall-n', type: 'box', position: [0, WALL_H / 2, -FLOOR_D / 2], args: [FLOOR_W, WALL_H, WALL_T], color: WALL_COLOR },
  { id: 'wall-s-l', type: 'box', position: [-FLOOR_W / 4 - DOOR_W, WALL_H / 2, FLOOR_D / 2], args: [FLOOR_W / 2 - DOOR_W, WALL_H, WALL_T], color: WALL_COLOR },
  { id: 'wall-s-r', type: 'box', position: [FLOOR_W / 4 + DOOR_W, WALL_H / 2, FLOOR_D / 2], args: [FLOOR_W / 2 - DOOR_W, WALL_H, WALL_T], color: WALL_COLOR },
  { id: 'wall-e', type: 'box', position: [FLOOR_W / 2, WALL_H / 2, 0], args: [WALL_T, WALL_H, FLOOR_D], color: WALL_COLOR },
  { id: 'wall-w-top', type: 'box', position: [-FLOOR_W / 2, WALL_H / 2, -FLOOR_D / 4 - DOOR_W], args: [WALL_T, WALL_H, FLOOR_D / 2 - DOOR_W], color: WALL_COLOR },
  { id: 'wall-w-bot', type: 'box', position: [-FLOOR_W / 2, WALL_H / 2, FLOOR_D / 4 + DOOR_W], args: [WALL_T, WALL_H, FLOOR_D / 2 - DOOR_W], color: WALL_COLOR },
  // Exit doors (south main + west secondary)
  { id: 'exit-s', type: 'box', position: [0, 0.01, FLOOR_D / 2], args: [DOOR_W * 2, 0.02, 0.06], color: EXIT_COLOR, label: 'Main Exit' },
  { id: 'exit-w', type: 'box', position: [-FLOOR_W / 2, 0.01, 0], args: [0.06, 0.02, DOOR_W * 2], color: EXIT_COLOR, label: 'Secondary Exit' },
  // Exit signs
  { id: 'sign-s', type: 'box', position: [0, WALL_H + 0.03, FLOOR_D / 2 - 0.05], args: [0.15, 0.06, 0.01], color: EXIT_SIGN_COLOR },
  { id: 'sign-w', type: 'box', position: [-FLOOR_W / 2 + 0.05, WALL_H + 0.03, 0], args: [0.01, 0.06, 0.15], color: EXIT_SIGN_COLOR },
  // Corridor path (highlighted)
  { id: 'corridor', type: 'box', position: [0, 0.005, 0.4], args: [FLOOR_W - 0.4, 0.005, 0.5], color: CORRIDOR_COLOR, opacity: 0.5, transparent: true },
]

// ─── Person helpers ──────────────────────────────────────────────────────────

const makePerson = (id: string, x: number, z: number, color: string): GeometryInstruction => ({
  id, type: 'sphere', position: [x, PERSON_H / 2 + 0.02, z], args: [PERSON_R], color,
})

// ─── Step Definitions ────────────────────────────────────────────────────────

// Positions for 12 occupants in the floor (normal layout)
const occupantPositions: [number, number][] = [
  [-1.2, -0.8], [-0.6, -0.8], [0, -0.8], [0.6, -0.8], [1.2, -0.8],
  [-1.2, -0.2], [-0.6, -0.2], [0.6, -0.2], [1.2, -0.2],
  [-0.6, 0.4], [0, 0.4], [0.6, 0.4],
]

const step1Normal: SequenceStep = {
  id: 'normal',
  label: 'Normal Occupancy',
  description: 'Building at normal occupancy. 12 occupants distributed across the floor area. Two exits available: main exit (south) and secondary exit (west).',
  duration: 3,
  codeCitation: 'RA 9514 IRR Rule 10 — Means of Egress',
  geometry: [
    ...buildingShell,
    ...occupantPositions.map(([x, z], i) => makePerson(`person-${i}`, x, z, PERSON_NORMAL)),
  ],
}

const step2Alarm: SequenceStep = {
  id: 'alarm',
  label: 'Fire Alarm Activated',
  description: 'Fire alarm sounds. Occupants begin to recognize the emergency. Response time typically 30-60 seconds before movement begins.',
  duration: 3,
  codeCitation: 'RA 9514 IRR Rule 10 §1004 — Evacuation Time',
  geometry: [
    ...buildingShell,
    // Alarm indicators
    { id: 'alarm-1', type: 'sphere', position: [1.5, WALL_H + 0.1, -1.2], args: [0.05], color: ALARM_COLOR },
    { id: 'alarm-2', type: 'sphere', position: [-1.5, WALL_H + 0.1, -1.2], args: [0.05], color: ALARM_COLOR },
    // Occupants still in place but highlighted
    ...occupantPositions.map(([x, z], i) => makePerson(`person-${i}`, x, z, PERSON_MOVING)),
  ],
}

// Movement toward exits — split between main and secondary
const step3Movement: SequenceStep = {
  id: 'movement',
  label: 'Evacuation Movement',
  description: `Occupants move toward nearest exit. Travel distance must not exceed ${RA_9514.TRAVEL_DISTANCE.noSprinkler.business}m (unsprinklered) per RA 9514. Occupants split between two exits to reduce congestion.`,
  duration: 4,
  codeCitation: `RA 9514 IRR Rule 10 — Max travel ${RA_9514.TRAVEL_DISTANCE.noSprinkler.business}m`,
  geometry: [
    ...buildingShell,
    // Travel path arrows
    { id: 'path-main', type: 'box', position: [0, 0.015, 0.8], args: [0.08, 0.01, 0.8], color: EXIT_COLOR, opacity: 0.6, transparent: true },
    { id: 'path-sec', type: 'box', position: [-1.2, 0.015, 0], args: [0.8, 0.01, 0.08], color: EXIT_COLOR, opacity: 0.6, transparent: true },
    // People moving to south exit (8 occupants)
    makePerson('person-0', -0.3, 0.9, PERSON_MOVING),
    makePerson('person-1', 0, 0.9, PERSON_MOVING),
    makePerson('person-2', 0.3, 0.9, PERSON_MOVING),
    makePerson('person-3', -0.15, 0.7, PERSON_MOVING),
    makePerson('person-4', 0.15, 0.7, PERSON_MOVING),
    makePerson('person-5', 0, 0.5, PERSON_MOVING),
    makePerson('person-6', 0.3, 0.5, PERSON_MOVING),
    makePerson('person-7', -0.3, 0.5, PERSON_MOVING),
    // People moving to west exit (4 occupants)
    makePerson('person-8', -1.5, -0.15, PERSON_MOVING),
    makePerson('person-9', -1.5, 0.15, PERSON_MOVING),
    makePerson('person-10', -1.3, 0, PERSON_MOVING),
    makePerson('person-11', -1.1, 0, PERSON_MOVING),
  ],
}

const step4Queuing: SequenceStep = {
  id: 'queuing',
  label: 'Exit Queuing',
  description: 'Occupants queue at exits. Door width determines flow rate — minimum 710mm clear width per exit per RA 9514. Wider doors reduce evacuation time.',
  duration: 3,
  codeCitation: 'RA 9514 IRR Rule 10 §1005 — Exit Width',
  geometry: [
    ...buildingShell,
    // Queue at south exit
    makePerson('person-0', -0.05, 1.2, PERSON_MOVING),
    makePerson('person-1', 0.05, 1.2, PERSON_MOVING),
    makePerson('person-2', -0.05, 1.05, PERSON_MOVING),
    makePerson('person-3', 0.05, 1.05, PERSON_MOVING),
    makePerson('person-4', 0, 0.9, PERSON_MOVING),
    makePerson('person-5', -0.1, 0.75, PERSON_MOVING),
    makePerson('person-6', 0.1, 0.75, PERSON_MOVING),
    makePerson('person-7', 0, 0.6, PERSON_MOVING),
    // Queue at west exit
    makePerson('person-8', -1.7, -0.05, PERSON_MOVING),
    makePerson('person-9', -1.7, 0.05, PERSON_MOVING),
    makePerson('person-10', -1.55, 0, PERSON_MOVING),
    makePerson('person-11', -1.4, 0, PERSON_MOVING),
    // Door width indicators
    { id: 'door-s-width', type: 'box', position: [0, WALL_H + 0.05, FLOOR_D / 2], args: [DOOR_W * 2, 0.02, 0.02], color: '#f59e0b', label: '900mm' },
    { id: 'door-w-width', type: 'box', position: [-FLOOR_W / 2, WALL_H + 0.05, 0], args: [0.02, 0.02, DOOR_W * 2], color: '#f59e0b', label: '900mm' },
  ],
}

const step5Evacuated: SequenceStep = {
  id: 'evacuated',
  label: 'Building Evacuated',
  description: 'All occupants have exited the building. Total evacuation time depends on: occupant load, travel distance, exit width, and number of exits. Two exits serving 12 occupants = compliant per RA 9514.',
  duration: 3,
  codeCitation: 'RA 9514 IRR Rule 10 §1005.1 — Min 2 exits when OL > 10',
  geometry: [
    ...buildingShell,
    // All people outside
    makePerson('person-0', -0.3, 2.0, PERSON_EXITED),
    makePerson('person-1', 0, 2.0, PERSON_EXITED),
    makePerson('person-2', 0.3, 2.0, PERSON_EXITED),
    makePerson('person-3', -0.15, 2.2, PERSON_EXITED),
    makePerson('person-4', 0.15, 2.2, PERSON_EXITED),
    makePerson('person-5', 0, 2.4, PERSON_EXITED),
    makePerson('person-6', 0.3, 2.4, PERSON_EXITED),
    makePerson('person-7', -0.3, 2.4, PERSON_EXITED),
    makePerson('person-8', -2.5, -0.2, PERSON_EXITED),
    makePerson('person-9', -2.5, 0.2, PERSON_EXITED),
    makePerson('person-10', -2.7, 0, PERSON_EXITED),
    makePerson('person-11', -2.3, 0, PERSON_EXITED),
    // Compliance checkmark
    { id: 'check', type: 'box', position: [0, 0.5, 0], args: [0.3, 0.3, 0.01], color: EXIT_COLOR, opacity: 0.3, transparent: true, label: 'COMPLIANT' },
  ],
}

// ─── Annotations ─────────────────────────────────────────────────────────────

const annotations: AnnotationDef[] = [
  {
    id: 'exit-count',
    label: '2 exits required (OL > 10)',
    description: 'RA 9514 requires minimum 2 exits when occupant load exceeds 10 persons',
    position: () => [0, 0.5, 1.8],
    codeCitation: 'RA 9514 IRR Rule 10 §1005.1',
  },
  {
    id: 'travel-distance',
    label: `Max travel: ${RA_9514.TRAVEL_DISTANCE.noSprinkler.business}m (no sprinkler)`,
    description: `Maximum travel distance to nearest exit is ${RA_9514.TRAVEL_DISTANCE.noSprinkler.business}m for unsprinklered business occupancy`,
    position: () => [1, 0.3, 0],
    codeCitation: 'RA 9514 IRR Rule 10',
  },
]

// ─── Config Export ───────────────────────────────────────────────────────────

export const egressSimulationConfig: AnimatedSequenceConfig = {
  id: 'egress-simulation',
  title: 'Egress Simulation',
  description: 'Step-by-step building evacuation sequence showing occupant movement from alarm to full exit per RA 9514 means of egress requirements.',
  subject: 'ra-9514',
  steps: [step1Normal, step2Alarm, step3Movement, step4Queuing, step5Evacuated],
  annotations,
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [0, 5, 4], fov: 45 },
  scale: 1,
}
