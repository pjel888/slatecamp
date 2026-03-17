// src/app/dashboard/3d-lab/_config/modules/emergency-power-system.ts
// Emergency Power System — PEC (Philippine Electrical Code)
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

// PEC Emergency Power requirements:
// Generator room: fire-rated walls (2-hour), separate from main building if possible
// ATS (Automatic Transfer Switch): transfers within 10 seconds
// Fuel storage: separated, ventilated, fire-rated enclosure
// Critical loads: emergency lighting, fire alarm, elevators, medical (hospitals)
// Generator capacity: must cover critical loads for min 8 hours (hospitals: 72 hours)

const ROOMS: RoomDef[] = [
  { id: 'main-building', label: 'Main Building (Normal Power)', bounds: [0, 0, 22, 18], color: '#bfdbfe', opacity: 0.4 },
  { id: 'mechanical', label: 'Mechanical Room', bounds: [0, 19, 10, 9], color: '#fef9c3', opacity: 0.45 },
  { id: 'generator-room', label: 'Generator Room (2-Hr Rated)', bounds: [11, 19, 11, 9], color: '#fee2e2', opacity: 0.55 },
  { id: 'fuel-storage', label: 'Fuel Storage (Fire-Rated)', bounds: [23, 19, 8, 9], color: '#fca5a5', opacity: 0.5 },
  { id: 'main-switch', label: 'Main Electrical / Switchboard Room', bounds: [23, 0, 8, 9], color: '#ede9fe', opacity: 0.5 },
  { id: 'corridor', label: 'Service Corridor', bounds: [0, 28, 31, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
]

const PATHS: PathDef[] = [
  {
    id: 'normal-power',
    label: 'Normal Power Supply',
    points: [[27, 9], [27, 5], [22, 5]],
    color: '#1B3FC4',
    width: 3,
  },
  {
    id: 'emergency-power',
    label: 'Emergency Power Circuit',
    points: [[16.5, 19], [16.5, 15], [27, 15], [27, 9]],
    color: '#D64545',
    width: 3,
    animated: true,
  },
  {
    id: 'fuel-line',
    label: 'Fuel Supply Line',
    points: [[23, 23.5], [22, 23.5]],
    color: '#D4951A',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Generator
  {
    id: 'generator',
    label: 'Emergency Generator',
    type: 'custom',
    position: [16.5, 23.5],
    size: [4, 3],
    color: '#D64545',
    description: 'Diesel generator; min 1.0m clearance on all sides',
    codeCitation: 'PEC',
  },
  // ATS
  {
    id: 'ats',
    label: 'Automatic Transfer Switch (ATS)',
    type: 'custom',
    position: [27, 12],
    size: [1.5, 1],
    color: '#7c3aed',
    description: 'ATS transfers to generator within 10 seconds of utility failure',
    codeCitation: 'PEC / RA 9514',
  },
  // Main distribution board
  {
    id: 'mdb',
    label: 'Main Distribution Board',
    type: 'custom',
    position: [27, 4.5],
    color: '#1B3FC4',
    description: 'MDB with bus bar; feeds all normal + emergency panels',
    codeCitation: 'PEC',
  },
  // Fuel storage
  {
    id: 'fuel-tank',
    label: 'Fuel Tank (Day Tank)',
    type: 'custom',
    position: [27, 23.5],
    size: [3, 2],
    color: '#D4951A',
    description: 'Day tank: max 250L in generator room; main tank in separate rated enclosure',
    codeCitation: 'PEC / RA 9514',
  },
  // Emergency panel
  {
    id: 'em-panel',
    label: 'Emergency Panel (EPB)',
    type: 'custom',
    position: [5.5, 9],
    color: '#D64545',
    description: 'Emergency panel serving: lighting, fire alarm, emergency power',
    codeCitation: 'PEC',
  },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [11, 31], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'buildingType',
    label: 'Building Type',
    type: 'dropdown',
    default: 'commercial',
    options: [
      { value: 'commercial', label: 'Commercial / Office' },
      { value: 'hospital', label: 'Hospital / Healthcare' },
      { value: 'highrise', label: 'High-Rise Residential' },
      { value: 'industrial', label: 'Industrial' },
    ],
    group: 'Building',
  },
  {
    key: 'transferTime',
    label: 'ATS Transfer Time',
    type: 'slider',
    min: 5,
    max: 60,
    step: 5,
    default: 10,
    unit: 'sec',
    group: 'ATS',
  },
  {
    key: 'fuelCapacityHours',
    label: 'Fuel Capacity (Runtime)',
    type: 'slider',
    min: 4,
    max: 72,
    step: 4,
    default: 8,
    unit: 'hrs',
    group: 'Generator',
  },
  {
    key: 'genRoomFireRated',
    label: 'Generator Room Fire-Rated',
    type: 'toggle',
    default: true,
    group: 'Construction',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'transfer-too-slow',
    field: 'transferTime',
    severity: 'error',
    check: (p) => Number(p.transferTime) > 10,
    message: 'ATS must transfer to emergency power within 10 seconds per PEC',
    codeCitation: 'PEC',
    position: () => [27, 1, 12],
  },
  {
    id: 'runtime-insufficient-hospital',
    field: 'fuelCapacityHours',
    severity: 'error',
    check: (p) => p.buildingType === 'hospital' && Number(p.fuelCapacityHours) < 72,
    message: 'Hospitals require min 72-hour fuel capacity for emergency generator',
    codeCitation: 'PEC / DOH Guidelines',
    position: () => [16.5, 1, 23],
  },
  {
    id: 'runtime-insufficient',
    field: 'fuelCapacityHours',
    severity: 'warning',
    check: (p) => p.buildingType !== 'hospital' && Number(p.fuelCapacityHours) < 8,
    message: 'Recommended minimum 8-hour fuel capacity for commercial buildings',
    codeCitation: 'PEC',
    position: () => [27, 1, 23],
  },
  {
    id: 'room-not-rated',
    field: 'genRoomFireRated',
    severity: 'error',
    check: (p) => !p.genRoomFireRated,
    message: 'Generator room must have 2-hour fire-rated walls and fire-rated door',
    codeCitation: 'PEC / RA 9514',
    position: () => [16.5, 1, 19],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-ats',
    label: 'ATS Transfer Sequence',
    description: 'On utility failure: generator starts → ATS transfers within 10s → emergency circuits energized',
    codeCitation: 'PEC',
    position: () => [27, 1.5, 11],
  },
  {
    id: 'ann-gen-room',
    label: 'Generator Room Requirements',
    description: '2-hour fire-rated walls; ventilation; drip tray under generator; min 1m access clearance',
    codeCitation: 'PEC / RA 9514',
    position: () => [16.5, 1.5, 23],
  },
  {
    id: 'ann-critical-loads',
    label: 'Critical Load Categories',
    description: 'Emergency panel feeds: emergency lighting, fire alarm, elevator (partial), life safety systems',
    codeCitation: 'PEC',
    position: () => [5.5, 1.5, 9],
  },
]

const PRESETS: Preset[] = [
  { label: 'Commercial (8hr)', values: { buildingType: 'commercial', transferTime: 10, fuelCapacityHours: 8, genRoomFireRated: true } },
  { label: 'Hospital (72hr)', values: { buildingType: 'hospital', transferTime: 10, fuelCapacityHours: 72, genRoomFireRated: true } },
  { label: 'High-Rise (24hr)', values: { buildingType: 'highrise', transferTime: 10, fuelCapacityHours: 24, genRoomFireRated: true } },
  { label: 'Violation Demo', values: { buildingType: 'hospital', transferTime: 30, fuelCapacityHours: 4, genRoomFireRated: false } },
]

export const emergencyPowerSystemConfig: FloorPlanConfig = {
  id: 'emergency-power-system',
  title: 'Emergency Power System',
  description: 'Building plan showing generator room, ATS placement, fuel storage, and emergency power circuit distribution per PEC requirements.',
  subject: 'pec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [31, 31],
  camera: { position: [0, 30, 12], fov: 46 },
  scale: 1,
}
