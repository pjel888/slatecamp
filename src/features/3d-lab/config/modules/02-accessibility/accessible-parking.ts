// src/app/dashboard/3d-lab/_config/modules/accessible-parking.ts
// Accessible Parking — BP 344 (Accessibility Law)
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

// BP 344 Accessible Parking:
// Stall dimensions: 4000mm wide × 5000mm deep (international symbol)
// Access aisle: min 1500mm wide (shared between stalls)
// Location: closest available to accessible building entrance
// Signage: ground and vertical signs required

const ROOMS: RoomDef[] = [
  { id: 'accessible-row', label: 'Accessible Parking Stalls', bounds: [0, 0, 20, 5], color: '#bfdbfe', opacity: 0.55 },
  { id: 'access-aisle', label: 'Shared Access Aisle', bounds: [0, 5, 20, 1.5], color: '#ddd6fe', opacity: 0.6 },
  { id: 'standard-row', label: 'Standard Parking Row', bounds: [0, 6.5, 20, 5], color: '#d4d4d8', opacity: 0.4 },
  { id: 'drive-aisle', label: 'Drive Aisle', bounds: [0, 11.5, 20, 6], color: '#e4e4e7', opacity: 0.3, zone: 'corridor' },
  { id: 'building-entry', label: 'Building Entry Zone', bounds: [7, 17.5, 6, 2.5], color: '#d1fae5', opacity: 0.6 },
]

const PATHS: PathDef[] = [
  {
    id: 'accessible-route',
    label: 'Accessible Route to Entry',
    points: [[2, 5], [2, 17.5], [10, 17.5], [10, 20]],
    color: '#1B3FC4',
    width: 3,
    animated: true,
  },
  {
    id: 'vehicle-circulation',
    label: 'Vehicle Circulation',
    points: [[0, 14.5], [20, 14.5]],
    color: '#6b7280',
    width: 4,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'acc-stall-1',
    label: 'Accessible Stall 1 (4.0m × 5.0m)',
    type: 'custom',
    position: [2, 2.5],
    size: [4, 5],
    color: '#3b82f6',
    description: 'BP 344: min 4000mm × 5000mm with ISA',
    codeCitation: 'BP 344 Sec. 4.2',
  },
  {
    id: 'acc-stall-2',
    label: 'Accessible Stall 2 (4.0m × 5.0m)',
    type: 'custom',
    position: [6, 2.5],
    size: [4, 5],
    color: '#3b82f6',
    description: 'BP 344: min 4000mm × 5000mm with ISA',
    codeCitation: 'BP 344 Sec. 4.2',
  },
  {
    id: 'acc-stall-3',
    label: 'Accessible Stall 3 (4.0m × 5.0m)',
    type: 'custom',
    position: [10, 2.5],
    size: [4, 5],
    color: '#3b82f6',
    description: 'BP 344: min 4000mm × 5000mm with ISA',
    codeCitation: 'BP 344 Sec. 4.2',
  },
  {
    id: 'accessible-ramp',
    label: 'Curb Ramp',
    type: 'custom',
    position: [2, 17.5],
    color: '#2D9F6F',
    description: 'Max slope 1:12 with tactile warning strips',
    codeCitation: 'BP 344 Sec. 3.1',
  },
  {
    id: 'building-door',
    label: 'Accessible Entry Door',
    type: 'door',
    position: [10, 20],
    size: [1.2, 0.2],
    color: '#2D9F6F',
    description: 'Min 900mm clear door width',
    codeCitation: 'BP 344 Sec. 5.1',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'totalStalls',
    label: 'Total Parking Stalls',
    type: 'slider',
    min: 10,
    max: 200,
    step: 5,
    default: 50,
    group: 'Parking Count',
  },
  {
    key: 'accessibleStalls',
    label: 'Accessible Stalls Provided',
    type: 'slider',
    min: 1,
    max: 10,
    step: 1,
    default: 3,
    group: 'Parking Count',
  },
  {
    key: 'stallWidth',
    label: 'Accessible Stall Width',
    type: 'slider',
    min: 3.5,
    max: 5,
    step: 0.1,
    default: 4.0,
    unit: 'm',
    group: 'Dimensions',
  },
  {
    key: 'aisleWidth',
    label: 'Access Aisle Width',
    type: 'slider',
    min: 1.0,
    max: 2.5,
    step: 0.1,
    default: 1.5,
    unit: 'm',
    group: 'Dimensions',
  },
]

function requiredAccessibleStalls(total: number): number {
  if (total <= 25) return 1
  if (total <= 50) return 2
  if (total <= 75) return 3
  if (total <= 100) return 4
  return Math.ceil(total * 0.04)
}

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'insufficient-accessible',
    field: 'accessibleStalls',
    severity: 'error',
    check: (p) => Number(p.accessibleStalls) < requiredAccessibleStalls(Number(p.totalStalls)),
    message: 'Insufficient accessible stalls for total parking count (BP 344 Table)',
    codeCitation: 'BP 344 Sec. 4.2',
    position: () => [10, 1, 2.5],
  },
  {
    id: 'stall-too-narrow',
    field: 'stallWidth',
    severity: 'error',
    check: (p) => Number(p.stallWidth) < 4.0,
    message: 'Accessible stall width must be ≥ 4000mm (4.0m)',
    codeCitation: 'BP 344 Sec. 4.2',
    position: () => [6, 1, 2.5],
  },
  {
    id: 'aisle-too-narrow',
    field: 'aisleWidth',
    severity: 'error',
    check: (p) => Number(p.aisleWidth) < 1.5,
    message: 'Access aisle width must be ≥ 1500mm (1.5m) per BP 344',
    codeCitation: 'BP 344 Sec. 4.2',
    position: () => [10, 1, 5.75],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-stall-dims',
    label: 'Accessible Stall Dimensions',
    description: 'BP 344 requires 4000mm wide × 5000mm deep with International Symbol of Access (ISA) painted on surface',
    codeCitation: 'BP 344 Sec. 4.2',
    position: () => [6, 1.5, 2.5],
  },
  {
    id: 'ann-location',
    label: 'Proximity Requirement',
    description: 'Accessible stalls must be located on the shortest accessible route to the accessible building entrance',
    codeCitation: 'BP 344 Sec. 4.2',
    position: () => [10, 1.5, 10],
  },
  {
    id: 'ann-signage',
    label: 'Required Signage',
    description: 'Vertical sign (min 1500mm high) and surface-painted ISA required; "Van Accessible" for wider stalls',
    codeCitation: 'BP 344',
    position: () => [2, 1.5, 0.5],
  },
]

const PRESETS: Preset[] = [
  { label: '50 Stalls (Min Compliant)', values: { totalStalls: 50, accessibleStalls: 2, stallWidth: 4.0, aisleWidth: 1.5 } },
  { label: '100 Stalls (Standard)', values: { totalStalls: 100, accessibleStalls: 4, stallWidth: 4.0, aisleWidth: 1.5 } },
  { label: 'Van Accessible (Extra Wide)', values: { totalStalls: 50, accessibleStalls: 3, stallWidth: 4.5, aisleWidth: 2.0 } },
  { label: 'Violation Demo', values: { totalStalls: 100, accessibleStalls: 2, stallWidth: 3.5, aisleWidth: 1.2 } },
]

export const accessibleParkingConfig: FloorPlanConfig = {
  id: 'accessible-parking',
  title: 'Accessible Parking Design',
  description: 'Parking lot layout with accessible stalls (4000mm × 5000mm), access aisles, and accessible route to building per BP 344.',
  subject: 'bp-344',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [20, 20],
  camera: { position: [0, 22, 8], fov: 40 },
  scale: 1,
}

