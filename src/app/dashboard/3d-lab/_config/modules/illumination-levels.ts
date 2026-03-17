// src/app/dashboard/3d-lab/_config/modules/illumination-levels.ts
// Illumination Levels — PEC (Philippine Electrical Code)
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

// PEC Illuminance Requirements (lux at task plane):
// Offices / Workstations: 300–500 lux
// Conference / Meeting: 300–500 lux
// Corridors / Stairways: 100–200 lux
// Restrooms: 150–200 lux
// Lobbies / Reception: 200–300 lux
// Libraries / Reading: 500 lux
// Drafting / Drawing: 750 lux
// Emergency egress: min 10.8 lux

const ROOMS: RoomDef[] = [
  { id: 'drafting', label: 'Drafting Studio (750 lux)', bounds: [0, 0, 14, 10], color: '#fef08a', opacity: 0.6 },
  { id: 'office', label: 'Open Office (400 lux)', bounds: [15, 0, 14, 10], color: '#fef9c3', opacity: 0.5 },
  { id: 'conference', label: 'Conference Room (400 lux)', bounds: [0, 11, 12, 8], color: '#fef9c3', opacity: 0.5 },
  { id: 'lobby', label: 'Lobby (250 lux)', bounds: [13, 11, 16, 8], color: '#fef3c7', opacity: 0.4 },
  { id: 'corridor', label: 'Corridor (150 lux)', bounds: [0, 19, 29, 3], color: '#e4e4e7', opacity: 0.45, zone: 'corridor' },
  { id: 'restroom', label: 'Restroom (175 lux)', bounds: [0, 22, 8, 5], color: '#dbeafe', opacity: 0.45 },
  { id: 'storage', label: 'Storage (75 lux)', bounds: [9, 22, 20, 5], color: '#d4d4d8', opacity: 0.35 },
]

const PATHS: PathDef[] = [
  {
    id: 'circuit-a',
    label: 'High-Lux Circuit (Drafting + Office)',
    points: [[7, 0], [7, 10], [22, 10], [22, 0]],
    color: '#D4951A',
    width: 2,
  },
  {
    id: 'circuit-b',
    label: 'Standard Circuit (Conference + Lobby)',
    points: [[6, 11], [6, 27], [28, 27]],
    color: '#10b981',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Drafting — high output (750 lux)
  { id: 'lum-d1', label: 'High-Output Troffer', type: 'custom', position: [3.5, 2.5], color: '#fbbf24', description: '750 lux — drafting/drawing standard', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-d2', label: 'High-Output Troffer', type: 'custom', position: [7, 2.5], color: '#fbbf24', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-d3', label: 'High-Output Troffer', type: 'custom', position: [10.5, 2.5], color: '#fbbf24', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-d4', label: 'High-Output Troffer', type: 'custom', position: [3.5, 7.5], color: '#fbbf24', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-d5', label: 'High-Output Troffer', type: 'custom', position: [10.5, 7.5], color: '#fbbf24', codeCitation: 'PEC Rule 9.50.4' },
  // Office — standard (400 lux)
  { id: 'lum-o1', label: 'LED Panel (400 lux)', type: 'custom', position: [18.5, 3.5], color: '#fde68a', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-o2', label: 'LED Panel (400 lux)', type: 'custom', position: [25.5, 3.5], color: '#fde68a', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-o3', label: 'LED Panel (400 lux)', type: 'custom', position: [18.5, 7.5], color: '#fde68a', codeCitation: 'PEC Rule 9.50.4' },
  { id: 'lum-o4', label: 'LED Panel (400 lux)', type: 'custom', position: [25.5, 7.5], color: '#fde68a', codeCitation: 'PEC Rule 9.50.4' },
  // Conference
  { id: 'lum-c1', label: 'LED Panel (Conference)', type: 'custom', position: [6, 15], color: '#fde68a', codeCitation: 'PEC' },
  // Lobby
  { id: 'lum-l1', label: 'Downlight (Lobby)', type: 'custom', position: [21, 15], color: '#fde68a', codeCitation: 'PEC' },
  // Corridor + emergency
  { id: 'lum-cor1', label: 'Corridor Strip Light', type: 'custom', position: [7, 20.5], color: '#e5e7eb', codeCitation: 'PEC' },
  { id: 'lum-em', label: 'Emergency Light', type: 'custom', position: [21, 20.5], color: '#D64545', description: 'Min 10.8 lux backup', codeCitation: 'RA 9514' },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [14.5, 19], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'draftingLux',
    label: 'Drafting Room Illuminance',
    type: 'slider',
    min: 300,
    max: 1000,
    step: 50,
    default: 750,
    unit: 'lux',
    group: 'Illuminance',
  },
  {
    key: 'officeLux',
    label: 'Office Illuminance',
    type: 'slider',
    min: 100,
    max: 750,
    step: 25,
    default: 400,
    unit: 'lux',
    group: 'Illuminance',
  },
  {
    key: 'corridorLux',
    label: 'Corridor Illuminance',
    type: 'slider',
    min: 30,
    max: 300,
    step: 10,
    default: 150,
    unit: 'lux',
    group: 'Illuminance',
  },
  {
    key: 'dimmingControl',
    label: 'Daylight Dimming Control',
    type: 'toggle',
    default: false,
    group: 'Controls',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'drafting-too-low',
    field: 'draftingLux',
    severity: 'error',
    check: (p) => Number(p.draftingLux) < 750,
    message: 'Drafting/drawing areas require min 750 lux per PEC',
    codeCitation: 'PEC Rule 9.50.4',
    position: () => [7, 1, 5],
  },
  {
    id: 'office-too-low',
    field: 'officeLux',
    severity: 'error',
    check: (p) => Number(p.officeLux) < 300,
    message: 'Office work areas require min 300 lux per PEC',
    codeCitation: 'PEC Rule 9.50.4',
    position: () => [22, 1, 5],
  },
  {
    id: 'corridor-too-low',
    field: 'corridorLux',
    severity: 'warning',
    check: (p) => Number(p.corridorLux) < 100,
    message: 'Corridor illuminance below 100 lux recommended minimum',
    codeCitation: 'PEC',
    position: () => [14.5, 1, 20.5],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-lux-scale',
    label: 'Lux Level Color Coding',
    description: 'Brighter yellow = higher lux requirement; rooms color-coded by design illuminance level',
    codeCitation: 'PEC Rule 9.50.4',
    position: () => [14.5, 1.5, 5],
  },
  {
    id: 'ann-task-plane',
    label: 'Task Plane Measurement',
    description: 'Illuminance measured at task plane: desk/counter height (0.8m) for work areas, floor for corridors',
    codeCitation: 'PEC',
    position: () => [7, 1.5, 2],
  },
  {
    id: 'ann-uniformity',
    label: 'Uniformity Requirement',
    description: 'Min uniformity ratio (Emin/Eavg) ≥ 0.33 to prevent visual discomfort from dark patches',
    codeCitation: 'PEC',
    position: () => [14.5, 1.5, 15],
  },
]

const PRESETS: Preset[] = [
  { label: 'Architecture Firm', values: { draftingLux: 750, officeLux: 500, corridorLux: 150, dimmingControl: true } },
  { label: 'Standard Office', values: { draftingLux: 750, officeLux: 400, corridorLux: 150, dimmingControl: false } },
  { label: 'Energy Saving Mode', values: { draftingLux: 500, officeLux: 300, corridorLux: 100, dimmingControl: true } },
  { label: 'Violation Demo', values: { draftingLux: 300, officeLux: 200, corridorLux: 50, dimmingControl: false } },
]

export const illuminationLevelsConfig: FloorPlanConfig = {
  id: 'illumination-levels',
  title: 'Illumination Levels by Room Type',
  description: 'Multi-room floor plan with lux level targets per space type (drafting 750, office 300–500, corridor 100–200) per PEC Rule 9.50.4.',
  subject: 'pec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [29, 27],
  camera: { position: [0, 28, 10], fov: 44 },
  scale: 1,
}
