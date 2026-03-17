// src/app/dashboard/3d-lab/_config/modules/horizontal-exit-design.ts
// Horizontal Exit Design — RA 9514 (Fire Code of the Philippines)
// ─────────────────────────────────────────────────────────────────────────────

import type {
  FloorPlanConfig,
  RoomDef,
  PathDef,
  FixtureDef,
  ParameterDef,
  ViolationRule,
  AnnotationDef,
  Preset,
} from '../../_types/templates'

// RA 9514 Horizontal Exit requirements:
// Fire wall: min 2-hour rating, continuous from foundation to roof
// Opening: self-closing fire-rated door (swing in direction of egress travel)
// Refuge capacity: receiving side must hold 100% of the evacuating side (0.28 sqm/person)
// Travel to vertical exit from receiving side: max 46m (61m sprinklered)
// May substitute for one vertical exit in multi-story buildings

const ROOMS: RoomDef[] = [
  // Zone A (fire side)
  { id: 'zone-a-office', label: 'Zone A — Office (Fire Side)', bounds: [0, 0, 18, 14], color: '#fee2e2', opacity: 0.5 },
  { id: 'zone-a-corridor', label: 'Zone A — Egress Corridor', bounds: [0, 14, 18, 4], color: '#fca5a5', opacity: 0.35, zone: 'corridor' },
  // Fire wall
  { id: 'fire-wall', label: 'Fire Wall (2-Hour Rated)', bounds: [18, 0, 1.5, 29], color: '#71717a', opacity: 0.9 },
  // Zone B (refuge side)
  { id: 'zone-b-refuge', label: 'Zone B — Refuge / Safe Side', bounds: [19.5, 0, 18, 14], color: '#bbf7d0', opacity: 0.5 },
  { id: 'zone-b-corridor', label: 'Zone B — Egress Corridor', bounds: [19.5, 14, 18, 4], color: '#86efac', opacity: 0.35, zone: 'corridor' },
  // Shared stairwells
  { id: 'stair-b', label: 'Stairwell B (Zone B)', bounds: [30, 18, 5, 5], color: '#fef9c3', opacity: 0.6 },
  { id: 'stair-a', label: 'Stairwell A (Zone A)', bounds: [2, 23, 5, 5], color: '#fef9c3', opacity: 0.6 },
]

const PATHS: PathDef[] = [
  {
    id: 'path-zone-a-to-wall',
    label: 'Zone A: Egress to Horizontal Exit',
    points: [[9, 7], [9, 16], [18, 16]],
    color: '#D64545',
    width: 3,
    animated: true,
  },
  {
    id: 'path-zone-b-to-stair',
    label: 'Zone B: Continue to Stairwell B',
    points: [[19.5, 16], [32.5, 16], [32.5, 20]],
    color: '#2D9F6F',
    width: 3,
    animated: true,
  },
  {
    id: 'path-zone-a-stair',
    label: 'Zone A: Direct Stair Egress',
    points: [[9, 16], [4.5, 16], [4.5, 25.5]],
    color: '#1B3FC4',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Horizontal exit door (in fire wall)
  {
    id: 'horiz-door',
    label: 'Horizontal Exit Door (Fire-Rated)',
    type: 'door',
    position: [18.75, 16],
    rotation: 0,
    size: [1.5, 0.25],
    color: '#D64545',
    description: 'Self-closing, latching fire door; swings toward egress travel direction',
    codeCitation: 'RA 9514 IRR Rule 10 §1022',
  },
  // Zone A signage
  {
    id: 'sign-horiz-exit',
    label: 'HORIZONTAL EXIT Sign',
    type: 'custom',
    position: [16, 16],
    color: '#2D9F6F',
    description: 'Directional sign indicating horizontal exit location',
    codeCitation: 'RA 9514',
  },
  // Zone B stair exit
  {
    id: 'stair-exit-b',
    label: 'Stairwell Exit B',
    type: 'stair',
    position: [32.5, 23],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
  {
    id: 'exit-b',
    label: 'EXIT B',
    type: 'exit',
    position: [32.5, 28],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
  {
    id: 'stair-exit-a',
    label: 'Stairwell Exit A',
    type: 'stair',
    position: [4.5, 25.5],
    color: '#1B3FC4',
    codeCitation: 'RA 9514',
  },
  {
    id: 'exit-a',
    label: 'EXIT A',
    type: 'exit',
    position: [4.5, 28],
    color: '#1B3FC4',
    codeCitation: 'RA 9514',
  },
  {
    id: 'extinguisher-1',
    label: 'Fire Extinguisher',
    type: 'extinguisher',
    position: [19.5, 16],
    color: '#D64545',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'firewallRating',
    label: 'Fire Wall Rating',
    type: 'dropdown',
    default: '2hr',
    options: [
      { value: '1hr', label: '1-Hour Fire-Rated' },
      { value: '2hr', label: '2-Hour Fire-Rated' },
      { value: '3hr', label: '3-Hour Fire-Rated' },
    ],
    group: 'Construction',
  },
  {
    key: 'zoneAOccupants',
    label: 'Zone A Occupants',
    type: 'slider',
    min: 10,
    max: 500,
    step: 10,
    default: 100,
    group: 'Occupancy',
  },
  {
    key: 'zoneBRefugeArea',
    label: 'Zone B Refuge Capacity (sqm)',
    type: 'slider',
    min: 10,
    max: 200,
    step: 5,
    default: 40,
    unit: 'sqm',
    group: 'Occupancy',
  },
  {
    key: 'sprinklered',
    label: 'Sprinkler System',
    type: 'toggle',
    default: false,
    group: 'Systems',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'firewall-insufficient',
    field: 'firewallRating',
    severity: 'error',
    check: (p) => p.firewallRating === '1hr',
    message: 'Horizontal exit fire wall must have minimum 2-hour fire rating',
    codeCitation: 'RA 9514 IRR Rule 10 §1022',
    position: () => [18.75, 1, 14],
  },
  {
    id: 'refuge-area-insufficient',
    field: 'zoneBRefugeArea',
    severity: 'error',
    check: (p) => {
      const required = Number(p.zoneAOccupants) * 0.28
      return Number(p.zoneBRefugeArea) < required
    },
    message: 'Zone B refuge area insufficient (must hold 100% of Zone A at 0.28 sqm/person)',
    codeCitation: 'RA 9514 IRR Rule 10 §1022',
    position: () => [28.5, 1, 7],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-horizontal-exit',
    label: 'Horizontal Exit Concept',
    description: 'Allows occupants to move from a fire zone through a rated fire wall to a safe refuge zone on the same floor',
    codeCitation: 'RA 9514 IRR Rule 10 §1022',
    position: () => [18.75, 1.5, 10],
  },
  {
    id: 'ann-refuge-capacity',
    label: 'Refuge Capacity Rule',
    description: 'Zone B must hold all Zone A occupants; min 0.28 sqm clear floor per person in refuge area',
    codeCitation: 'RA 9514',
    position: () => [28.5, 1.5, 7],
  },
  {
    id: 'ann-door-swing',
    label: 'Door Swing Direction',
    description: 'Fire door in horizontal exit swings in the direction of egress travel (from fire side to safe side)',
    codeCitation: 'RA 9514 IRR Rule 10 §1022',
    position: () => [18.75, 1.5, 16],
  },
]

const PRESETS: Preset[] = [
  { label: '100 Occupants (Compliant)', values: { firewallRating: '2hr', zoneAOccupants: 100, zoneBRefugeArea: 40, sprinklered: false } },
  { label: '200 Occupants + Sprinkler', values: { firewallRating: '2hr', zoneAOccupants: 200, zoneBRefugeArea: 80, sprinklered: true } },
  { label: '3-Hour Wall (High-Rise)', values: { firewallRating: '3hr', zoneAOccupants: 150, zoneBRefugeArea: 60, sprinklered: true } },
  { label: 'Violation Demo', values: { firewallRating: '1hr', zoneAOccupants: 200, zoneBRefugeArea: 20, sprinklered: false } },
]

export const horizontalExitDesignConfig: FloorPlanConfig = {
  id: 'horizontal-exit-design',
  title: 'Horizontal Exit Design',
  description: 'Floor plan divided by a rated fire wall with horizontal exit door, showing Zone A (fire side), Zone B (refuge), and egress paths per RA 9514.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [37.5, 29],
  camera: { position: [0, 30, 12], fov: 46 },
  scale: 1,
}
