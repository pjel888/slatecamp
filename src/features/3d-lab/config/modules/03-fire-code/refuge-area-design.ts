// src/app/dashboard/3d-lab/_config/modules/refuge-area-design.ts
// Refuge Area Design — RA 9514 (Fire Code of the Philippines) / BP 344
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
} from '@/features/3d-lab/types/templates'

// RA 9514 / BP 344 Refuge Area requirements:
// Location: adjacent to fire-rated stairwell exit
// Capacity: min 0.28 sqm per non-ambulatory occupant
// Fire rating: min 1-hour rated construction
// Size: min 1.5m × 2.0m clear area
// Two-way communication: required at each refuge area
// Signage: visible from elevator lobbies and corridors

const ROOMS: RoomDef[] = [
  { id: 'office', label: 'Office Floor', bounds: [0, 0, 25, 15], color: '#bfdbfe', opacity: 0.4 },
  { id: 'elevator-lobby', label: 'Elevator Lobby', bounds: [10, 16, 8, 5], color: '#e0e7ff', opacity: 0.55 },
  { id: 'corridor', label: 'Egress Corridor', bounds: [0, 16, 25, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'refuge-a', label: 'Refuge Area A (Fire-Rated)', bounds: [0, 19, 4, 5], color: '#fef3c7', opacity: 0.7, zone: 'refuge' },
  { id: 'stair-a', label: 'Stairwell A (Fire-Rated)', bounds: [0, 24, 5, 5], color: '#fef9c3', opacity: 0.6 },
  { id: 'refuge-b', label: 'Refuge Area B (Fire-Rated)', bounds: [21, 19, 4, 5], color: '#fef3c7', opacity: 0.7, zone: 'refuge' },
  { id: 'stair-b', label: 'Stairwell B (Fire-Rated)', bounds: [20, 24, 5, 5], color: '#fef9c3', opacity: 0.6 },
]

const PATHS: PathDef[] = [
  {
    id: 'path-to-refuge-a',
    label: 'Accessible Route → Refuge A',
    points: [[12.5, 7.5], [2, 7.5], [2, 17.5], [2, 21.5]],
    color: '#1B3FC4',
    width: 3,
    animated: true,
  },
  {
    id: 'path-to-refuge-b',
    label: 'Accessible Route → Refuge B',
    points: [[12.5, 7.5], [23, 7.5], [23, 17.5], [23, 21.5]],
    color: '#1B3FC4',
    width: 3,
    animated: true,
  },
  {
    id: 'evac-stair-a',
    label: 'Ambulatory Evacuation — Stair A',
    points: [[2.5, 19], [2.5, 29]],
    color: '#2D9F6F',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Refuge areas
  {
    id: 'refuge-sign-a',
    label: 'Refuge Area Sign A',
    type: 'custom',
    position: [2, 21.5],
    color: '#1B3FC4',
    description: 'Min 1.5m × 2.0m clear area; 0.28 sqm/non-ambulatory occupant',
    codeCitation: 'RA 9514 / BP 344',
  },
  {
    id: 'intercom-a',
    label: 'Two-Way Intercom A',
    type: 'custom',
    position: [0.5, 22.5],
    color: '#2D9F6F',
    description: 'Two-way communication to fire command center',
    codeCitation: 'RA 9514',
  },
  {
    id: 'refuge-sign-b',
    label: 'Refuge Area Sign B',
    type: 'custom',
    position: [23, 21.5],
    color: '#1B3FC4',
    codeCitation: 'RA 9514 / BP 344',
  },
  {
    id: 'intercom-b',
    label: 'Two-Way Intercom B',
    type: 'custom',
    position: [24.5, 22.5],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
  // Accessible ramp to corridor
  {
    id: 'ramp',
    label: 'Accessible Ramp',
    type: 'custom',
    position: [12.5, 16],
    color: '#2D9F6F',
    description: 'Max slope 1:12 for wheelchair access to refuge areas',
    codeCitation: 'BP 344',
  },
  // Stairwell exits
  { id: 'exit-a', label: 'EXIT A (Ambulatory)', type: 'exit', position: [2.5, 29], color: '#2D9F6F', codeCitation: 'RA 9514' },
  { id: 'exit-b', label: 'EXIT B (Ambulatory)', type: 'exit', position: [22.5, 29], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'pwdOccupants',
    label: 'Non-Ambulatory Occupants',
    type: 'slider',
    min: 1,
    max: 20,
    step: 1,
    default: 4,
    group: 'Occupancy',
  },
  {
    key: 'refugeAreaSqm',
    label: 'Refuge Area Size',
    type: 'slider',
    min: 2,
    max: 15,
    step: 0.5,
    default: 6,
    unit: 'sqm',
    group: 'Dimensions',
  },
  {
    key: 'fireRating',
    label: 'Construction Fire Rating',
    type: 'dropdown',
    default: '1hr',
    options: [
      { value: '1hr', label: '1-Hour Fire-Rated' },
      { value: '2hr', label: '2-Hour Fire-Rated' },
    ],
    group: 'Construction',
  },
  {
    key: 'intercomInstalled',
    label: 'Two-Way Communication',
    type: 'toggle',
    default: true,
    group: 'Systems',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'area-too-small',
    field: 'refugeAreaSqm',
    severity: 'error',
    check: (p) => {
      const required = Number(p.pwdOccupants) * 0.28
      const minBase = 3 // 1.5m × 2.0m
      return Number(p.refugeAreaSqm) < Math.max(required, minBase)
    },
    message: 'Refuge area too small (min 0.28 sqm per non-ambulatory occupant, absolute min 3 sqm)',
    codeCitation: 'RA 9514 / BP 344',
    position: () => [2, 1, 21.5],
  },
  {
    id: 'no-intercom',
    field: 'intercomInstalled',
    severity: 'error',
    check: (p) => !p.intercomInstalled,
    message: 'Two-way communication system required in each refuge area',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [0.5, 1, 22.5],
  },
  {
    id: 'fire-rating-low',
    field: 'fireRating',
    severity: 'warning',
    check: (p) => p.fireRating === '1hr',
    message: 'Consider 2-hour rating for high-rise buildings; consult BFP for project-specific requirements',
    codeCitation: 'RA 9514',
    position: () => [2, 1, 24],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-refuge-def',
    label: 'Refuge Area Definition',
    description: 'A protected area adjacent to a fire-rated stairwell where non-ambulatory occupants wait for assisted evacuation',
    codeCitation: 'RA 9514 / BP 344',
    position: () => [2, 1.5, 21],
  },
  {
    id: 'ann-capacity',
    label: 'Capacity Calculation',
    description: 'Min 0.28 sqm per non-ambulatory occupant; min absolute size 1.5m × 2.0m clear',
    codeCitation: 'RA 9514',
    position: () => [12.5, 1.5, 21],
  },
  {
    id: 'ann-communication',
    label: 'Two-Way Communication',
    description: 'Intercom or phone system connecting refuge area to fire command center; tested annually',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [0.5, 1.5, 23],
  },
]

const PRESETS: Preset[] = [
  { label: 'Small Office (4 PWD)', values: { pwdOccupants: 4, refugeAreaSqm: 3, fireRating: '1hr', intercomInstalled: true } },
  { label: 'Mid-Rise (10 PWD)', values: { pwdOccupants: 10, refugeAreaSqm: 6, fireRating: '2hr', intercomInstalled: true } },
  { label: 'Hospital Ward (20 PWD)', values: { pwdOccupants: 20, refugeAreaSqm: 12, fireRating: '2hr', intercomInstalled: true } },
  { label: 'Violation Demo', values: { pwdOccupants: 10, refugeAreaSqm: 1.5, fireRating: '1hr', intercomInstalled: false } },
]

export const refugeAreaDesignConfig: FloorPlanConfig = {
  id: 'refuge-area-design',
  title: 'Refuge Area Design',
  description: 'Floor plan showing fire-rated refuge areas near stairwells for non-ambulatory occupants (PWD), with sizing, two-way communication, and BP 344 compliance.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [25, 29],
  camera: { position: [0, 28, 10], fov: 42 },
  scale: 1,
}

