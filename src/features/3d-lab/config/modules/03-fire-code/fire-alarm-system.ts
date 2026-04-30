// src/features/3d-lab/config/modules/fire-alarm-system.ts
// Fire Alarm System — RA 9514 (Fire Code of the Philippines)
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

// RA 9514 Fire Alarm requirements:
// Manual pull stations: at each exit, max 61m apart
// Audio/visual devices: min 75 dB(A) at sleeping areas, 65 dB(A) occupied spaces
// Strobe candela: min 15cd for open areas
// FACP: at main entrance, visible from entry

const ROOMS: RoomDef[] = [
  { id: 'office-a', label: 'Office Wing A', bounds: [0, 0, 16, 10], color: '#bfdbfe', opacity: 0.45 },
  { id: 'office-b', label: 'Office Wing B', bounds: [17, 0, 16, 10], color: '#bfdbfe', opacity: 0.45 },
  { id: 'lobby', label: 'Main Lobby', bounds: [7, 11, 19, 6], color: '#d1fae5', opacity: 0.5 },
  { id: 'reception', label: 'Reception / FACP Wall', bounds: [0, 11, 6, 6], color: '#fef3c7', opacity: 0.5 },
  { id: 'corridor', label: 'Main Corridor', bounds: [0, 17, 33, 3.5], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'stairwell-a', label: 'Stair A', bounds: [0, 20.5, 5, 5], color: '#fef9c3', opacity: 0.55 },
  { id: 'stairwell-b', label: 'Stair B', bounds: [28, 20.5, 5, 5], color: '#fef9c3', opacity: 0.55 },
]

const PATHS: PathDef[] = [
  {
    id: 'alarm-loop',
    label: 'Alarm Circuit Loop',
    points: [[3, 17], [3, 0], [32, 0], [32, 17]],
    color: '#D64545',
    width: 2,
  },
  {
    id: 'facp-connection',
    label: 'FACP Signal Cable',
    points: [[3, 14], [3, 17.5], [16.5, 17.5]],
    color: '#7c3aed',
    width: 1.5,
  },
]

const FIXTURES: FixtureDef[] = [
  // FACP
  {
    id: 'facp',
    label: 'Fire Alarm Control Panel (FACP)',
    type: 'custom',
    position: [3, 14],
    color: '#D64545',
    description: 'FACP at main lobby / entry; visible from building entrance',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  // Manual pull stations (at exits)
  { id: 'pull-a', label: 'Pull Station — Exit A', type: 'custom', position: [2.5, 17], color: '#D64545', description: 'At every exit; max 61m between stations', codeCitation: 'RA 9514' },
  { id: 'pull-b', label: 'Pull Station — Exit B', type: 'custom', position: [30.5, 17], color: '#D64545', description: 'Pull station at secondary exit', codeCitation: 'RA 9514' },
  { id: 'pull-lobby', label: 'Pull Station — Lobby', type: 'custom', position: [16.5, 17], color: '#D64545', codeCitation: 'RA 9514' },
  // Horn/strobe devices
  { id: 'hs-1', label: 'Horn / Strobe', type: 'custom', position: [8, 5], color: '#D4951A', description: 'Audio/visual device; min 65 dB(A) in office', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'hs-2', label: 'Horn / Strobe', type: 'custom', position: [25, 5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'hs-3', label: 'Horn / Strobe', type: 'custom', position: [16.5, 14], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  { id: 'hs-4', label: 'Horn / Strobe — Corridor', type: 'custom', position: [16.5, 18.5], color: '#D4951A', codeCitation: 'RA 9514 / NFPA 72' },
  // Exits
  { id: 'exit-a', label: 'EXIT A', type: 'exit', position: [2.5, 25.5], color: '#2D9F6F', codeCitation: 'RA 9514' },
  { id: 'exit-b', label: 'EXIT B', type: 'exit', position: [30.5, 25.5], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'systemClass',
    label: 'Alarm System Class',
    type: 'dropdown',
    default: 'class-a',
    options: [
      { value: 'class-a', label: 'Class A (Supervised Loop)' },
      { value: 'class-b', label: 'Class B (Two-Wire)' },
    ],
    group: 'System',
  },
  {
    key: 'pullStationSpacing',
    label: 'Pull Station Spacing',
    type: 'slider',
    min: 10,
    max: 70,
    step: 1,
    default: 30,
    unit: 'm',
    group: 'Devices',
  },
  {
    key: 'audioLevel',
    label: 'Horn Output Level',
    type: 'slider',
    min: 55,
    max: 100,
    step: 1,
    default: 70,
    unit: 'dB(A)',
    group: 'Devices',
  },
  {
    key: 'batteryBackup',
    label: 'Battery Backup Duration',
    type: 'slider',
    min: 0,
    max: 96,
    step: 4,
    default: 24,
    unit: 'hrs',
    group: 'System',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'pull-spacing-exceeded',
    field: 'pullStationSpacing',
    severity: 'error',
    check: (p) => Number(p.pullStationSpacing) > 61,
    message: 'Pull station spacing exceeds 61m maximum per RA 9514',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [16.5, 1, 17],
  },
  {
    id: 'audio-too-low',
    field: 'audioLevel',
    severity: 'error',
    check: (p) => Number(p.audioLevel) < 65,
    message: 'Horn output below 65 dB(A) minimum for occupied spaces',
    codeCitation: 'RA 9514 / NFPA 72',
    position: () => [16.5, 1, 5],
  },
  {
    id: 'battery-low',
    field: 'batteryBackup',
    severity: 'warning',
    check: (p) => Number(p.batteryBackup) < 24,
    message: 'Battery backup below 24-hour minimum per NFPA 72',
    codeCitation: 'NFPA 72',
    position: () => [3, 1, 14],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-facp',
    label: 'FACP Location',
    description: 'FACP must be at or near main building entrance; accessible to responding fire brigade',
    codeCitation: 'RA 9514',
    position: () => [3, 1.5, 13],
  },
  {
    id: 'ann-pull-stations',
    label: 'Pull Station Placement',
    description: 'Manual pull stations at each exit door; max 1.5m height, max 61m apart along path of travel',
    codeCitation: 'RA 9514 / NFPA 72',
    position: () => [16.5, 1.5, 17.5],
  },
  {
    id: 'ann-horn-strobe',
    label: 'Horn / Strobe Placement',
    description: 'Audio/visual devices on every floor; strobe must be visible from any point in space',
    codeCitation: 'RA 9514 / NFPA 72',
    position: () => [16.5, 1.5, 5],
  },
]

const PRESETS: Preset[] = [
  { label: 'Class A Compliant', values: { systemClass: 'class-a', pullStationSpacing: 30, audioLevel: 70, batteryBackup: 24 } },
  { label: 'Class B Basic', values: { systemClass: 'class-b', pullStationSpacing: 45, audioLevel: 65, batteryBackup: 24 } },
  { label: 'High-Rise Premium', values: { systemClass: 'class-a', pullStationSpacing: 20, audioLevel: 80, batteryBackup: 48 } },
  { label: 'Violation Demo', values: { systemClass: 'class-b', pullStationSpacing: 65, audioLevel: 58, batteryBackup: 12 } },
]

export const fireAlarmSystemConfig: FloorPlanConfig = {
  id: 'fire-alarm-system',
  title: 'Fire Alarm System',
  description: 'Floor plan showing FACP location, manual pull stations, horn/strobe devices, and alarm circuit per RA 9514 Fire Code requirements.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [33, 26],
  camera: { position: [0, 28, 10], fov: 46 },
  scale: 1,
}

