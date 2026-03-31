// src/app/dashboard/3d-lab/_config/modules/machine-room-layout.ts
// Machine Room Layout — PMEC (Philippine Mechanical Engineering Code)
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
} from '../../../_types/templates'

// PMEC Machine Room requirements:
// AHU/chiller clearance: min 1.0m sides, 1.2m front (service access)
// Pump clearance: min 0.6m all around
// Cooling tower: locate per noise and drift considerations
// Boiler room: 1.5m front clearance, fire-rated room, ventilation
// Room height: min 2.4m clear; 3.0m for large equipment
// Walkway: min 0.9m wide between equipment

const ROOMS: RoomDef[] = [
  { id: 'main-mech', label: 'Main Mechanical Room', bounds: [0, 0, 22, 18], color: '#fef9c3', opacity: 0.45 },
  { id: 'pump-room', label: 'Pump Room', bounds: [23, 0, 9, 10], color: '#dbeafe', opacity: 0.45 },
  { id: 'electrical-room', label: 'Electrical / MCC Room', bounds: [23, 11, 9, 7], color: '#ede9fe', opacity: 0.45 },
  { id: 'access-corridor', label: 'Service Access Corridor', bounds: [0, 19, 32, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'storage', label: 'Parts / Consumables Storage', bounds: [0, 22, 10, 6], color: '#e4e4e7', opacity: 0.35 },
  { id: 'workshop', label: 'Maintenance Workshop', bounds: [11, 22, 21, 6], color: '#fef3c7', opacity: 0.4 },
]

const PATHS: PathDef[] = [
  {
    id: 'main-walkway',
    label: 'Main Service Walkway (min 0.9m)',
    points: [[11, 0], [11, 18]],
    color: '#6b7280',
    width: 3,
  },
  {
    id: 'chilled-water',
    label: 'Chilled Water Supply/Return',
    points: [[5.5, 9], [11, 9], [22, 9], [23, 9]],
    color: '#1B3FC4',
    width: 2,
  },
  {
    id: 'condenser-water',
    label: 'Condenser Water Circuit',
    points: [[5.5, 12], [22, 12]],
    color: '#D64545',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Chillers
  {
    id: 'chiller-1',
    label: 'Centrifugal Chiller 1',
    type: 'custom',
    position: [5.5, 9],
    size: [5, 4],
    color: '#60a5fa',
    description: 'Chiller — 1.2m front clearance, 1.0m sides/rear',
    codeCitation: 'PMEC',
  },
  {
    id: 'chiller-2',
    label: 'Centrifugal Chiller 2',
    type: 'custom',
    position: [16.5, 9],
    size: [5, 4],
    color: '#60a5fa',
    description: 'Standby chiller',
    codeCitation: 'PMEC',
  },
  // AHU
  {
    id: 'ahu-1',
    label: 'Air Handling Unit (AHU)',
    type: 'custom',
    position: [5.5, 3],
    size: [4, 3],
    color: '#D4951A',
    description: 'AHU with filter, coil, fan section',
    codeCitation: 'PMEC',
  },
  // Pumps
  {
    id: 'chwp-1',
    label: 'Chilled Water Pump (Primary)',
    type: 'custom',
    position: [26, 3],
    size: [2, 2],
    color: '#1B3FC4',
    description: 'CHWP — 0.6m clearance all around',
    codeCitation: 'PMEC',
  },
  {
    id: 'chwp-2',
    label: 'Chilled Water Pump (Standby)',
    type: 'custom',
    position: [29, 3],
    size: [2, 2],
    color: '#1B3FC4',
    codeCitation: 'PMEC',
  },
  {
    id: 'cdwp',
    label: 'Condenser Water Pump',
    type: 'custom',
    position: [26, 7],
    size: [2, 2],
    color: '#D64545',
    codeCitation: 'PMEC',
  },
  // Expansion tank
  {
    id: 'expansion-tank',
    label: 'Expansion Tank',
    type: 'custom',
    position: [16.5, 2],
    color: '#6b7280',
    codeCitation: 'PMEC',
  },
  // Fire extinguishers
  { id: 'ext-1', label: 'CO₂ Extinguisher', type: 'extinguisher', position: [0.5, 9], color: '#D64545', codeCitation: 'RA 9514' },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [11, 22], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'chillerType',
    label: 'Chiller Type',
    type: 'dropdown',
    default: 'centrifugal',
    options: [
      { value: 'centrifugal', label: 'Centrifugal Chiller' },
      { value: 'screw', label: 'Screw Chiller' },
      { value: 'scroll', label: 'Scroll Chiller' },
      { value: 'absorption', label: 'Absorption Chiller' },
    ],
    group: 'Equipment',
  },
  {
    key: 'frontClearance',
    label: 'Equipment Front Clearance',
    type: 'slider',
    min: 0.6,
    max: 2.0,
    step: 0.1,
    default: 1.2,
    unit: 'm',
    group: 'Clearances',
  },
  {
    key: 'sideClearance',
    label: 'Equipment Side Clearance',
    type: 'slider',
    min: 0.5,
    max: 2.0,
    step: 0.1,
    default: 1.0,
    unit: 'm',
    group: 'Clearances',
  },
  {
    key: 'walkwayWidth',
    label: 'Service Walkway Width',
    type: 'slider',
    min: 0.6,
    max: 2.0,
    step: 0.1,
    default: 0.9,
    unit: 'm',
    group: 'Clearances',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'front-clearance-low',
    field: 'frontClearance',
    severity: 'error',
    check: (p) => Number(p.frontClearance) < 1.2,
    message: 'Front service clearance must be ≥ 1.2m for chiller/AHU equipment',
    codeCitation: 'PMEC',
    position: () => [5.5, 1, 5.5],
  },
  {
    id: 'side-clearance-low',
    field: 'sideClearance',
    severity: 'warning',
    check: (p) => Number(p.sideClearance) < 1.0,
    message: 'Side clearance below 1.0m recommended for chiller maintenance',
    codeCitation: 'PMEC',
    position: () => [5.5, 1, 9],
  },
  {
    id: 'walkway-too-narrow',
    field: 'walkwayWidth',
    severity: 'error',
    check: (p) => Number(p.walkwayWidth) < 0.9,
    message: 'Service walkway must be ≥ 0.9m clear width between equipment',
    codeCitation: 'PMEC',
    position: () => [11, 1, 9],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-clearances',
    label: 'Equipment Clearance Zones',
    description: 'All major equipment requires 1.2m front, 1.0m sides/rear for safe operation and maintenance access',
    codeCitation: 'PMEC',
    position: () => [5.5, 1.5, 7],
  },
  {
    id: 'ann-walkway',
    label: 'Service Walkway',
    description: 'Minimum 0.9m clear passage between equipment; 1.5m recommended for equipment removal routes',
    codeCitation: 'PMEC',
    position: () => [11, 1.5, 9],
  },
  {
    id: 'ann-pipe-routes',
    label: 'Piping Routes',
    description: 'Chilled water supply/return (blue) and condenser water (red) run overhead with expansion joints',
    codeCitation: 'PMEC',
    position: () => [16, 1.5, 9],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard Chiller Plant', values: { chillerType: 'centrifugal', frontClearance: 1.2, sideClearance: 1.0, walkwayWidth: 0.9 } },
  { label: 'Large Installation', values: { chillerType: 'centrifugal', frontClearance: 1.5, sideClearance: 1.2, walkwayWidth: 1.5 } },
  { label: 'Screw Chiller (Compact)', values: { chillerType: 'screw', frontClearance: 1.0, sideClearance: 0.8, walkwayWidth: 0.9 } },
  { label: 'Violation Demo', values: { chillerType: 'centrifugal', frontClearance: 0.8, sideClearance: 0.5, walkwayWidth: 0.6 } },
]

export const machineRoomLayoutConfig: FloorPlanConfig = {
  id: 'machine-room-layout',
  title: 'Machine Room Layout',
  description: 'Mechanical room plan with chiller, AHU, and pump placement, clearance requirements, service walkways, and piping routes per PMEC.',
  subject: 'pmec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [32, 28],
  camera: { position: [0, 28, 10], fov: 46 },
  scale: 1,
}
