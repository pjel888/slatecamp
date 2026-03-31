// src/app/dashboard/3d-lab/_config/modules/lighting-layout.ts
// Lighting Layout — PEC (Philippine Electrical Code)
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

// PEC Illumination Requirements (lux):
// Offices / Workstations: 300–500 lux
// Conference rooms: 300–500 lux
// Corridors: 100–200 lux
// Restrooms: 150–200 lux
// Lobbies: 200–300 lux
// Emergency lighting: min 10.8 lux at floor level

const ROOMS: RoomDef[] = [
  { id: 'open-office', label: 'Open Office (300–500 lux)', bounds: [0, 0, 18, 10], color: '#fef9c3', opacity: 0.5 },
  { id: 'conference', label: 'Conference Room (300–500 lux)', bounds: [0, 11, 10, 7], color: '#fef9c3', opacity: 0.45 },
  { id: 'lobby', label: 'Lobby (200–300 lux)', bounds: [11, 11, 7, 7], color: '#fef3c7', opacity: 0.45 },
  { id: 'corridor', label: 'Corridor (100–200 lux)', bounds: [0, 18, 18, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'restroom', label: 'Restroom (150–200 lux)', bounds: [0, 21, 7, 5], color: '#dbeafe', opacity: 0.45 },
  { id: 'storage', label: 'Storage (50–100 lux)', bounds: [8, 21, 10, 5], color: '#e4e4e7', opacity: 0.4 },
]

const PATHS: PathDef[] = [
  {
    id: 'circuit-1',
    label: 'Lighting Circuit 1 — Office',
    points: [[2, 0], [2, 10], [9, 10], [16, 10], [16, 0]],
    color: '#D4951A',
    width: 2,
  },
  {
    id: 'circuit-2',
    label: 'Lighting Circuit 2 — Rooms',
    points: [[2, 11], [2, 26], [17, 26]],
    color: '#10b981',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Office luminaires (2×4 troffer / LED panel)
  { id: 'lum-1', label: 'LED Panel (400 lux)', type: 'custom', position: [3, 2.5], color: '#fbbf24', description: '2×4 LED troffer, 400 lux at desk', codeCitation: 'PEC' },
  { id: 'lum-2', label: 'LED Panel (400 lux)', type: 'custom', position: [9, 2.5], color: '#fbbf24', codeCitation: 'PEC' },
  { id: 'lum-3', label: 'LED Panel (400 lux)', type: 'custom', position: [15, 2.5], color: '#fbbf24', codeCitation: 'PEC' },
  { id: 'lum-4', label: 'LED Panel (400 lux)', type: 'custom', position: [3, 7.5], color: '#fbbf24', codeCitation: 'PEC' },
  { id: 'lum-5', label: 'LED Panel (400 lux)', type: 'custom', position: [9, 7.5], color: '#fbbf24', codeCitation: 'PEC' },
  { id: 'lum-6', label: 'LED Panel (400 lux)', type: 'custom', position: [15, 7.5], color: '#fbbf24', codeCitation: 'PEC' },
  // Conference
  { id: 'lum-7', label: 'LED Panel — Conference', type: 'custom', position: [5, 14.5], color: '#fbbf24', codeCitation: 'PEC' },
  // Lobby
  { id: 'lum-8', label: 'Downlight — Lobby', type: 'custom', position: [14.5, 14.5], color: '#fbbf24', codeCitation: 'PEC' },
  // Corridor emergency + normal
  { id: 'lum-9', label: 'Corridor Light', type: 'custom', position: [4.5, 19.5], color: '#fbbf24', codeCitation: 'PEC' },
  { id: 'em-light-1', label: 'Emergency Light', type: 'custom', position: [13.5, 19.5], color: '#D64545', description: 'Min 10.8 lux, 90-min battery', codeCitation: 'PEC / RA 9514' },
  // Exit
  { id: 'exit-1', label: 'EXIT', type: 'exit', position: [9, 21], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'officeIlluminance',
    label: 'Office Illuminance Level',
    type: 'slider',
    min: 100,
    max: 750,
    step: 25,
    default: 400,
    unit: 'lux',
    group: 'Illuminance',
  },
  {
    key: 'corridorIlluminance',
    label: 'Corridor Illuminance',
    type: 'slider',
    min: 50,
    max: 300,
    step: 10,
    default: 150,
    unit: 'lux',
    group: 'Illuminance',
  },
  {
    key: 'emergencyLighting',
    label: 'Emergency Lighting Installed',
    type: 'toggle',
    default: true,
    group: 'Systems',
  },
  {
    key: 'lightingType',
    label: 'Fixture Type',
    type: 'dropdown',
    default: 'led-panel',
    options: [
      { value: 'led-panel', label: 'LED Recessed Panel' },
      { value: 'fluorescent', label: 'Fluorescent Troffer' },
      { value: 'downlight', label: 'LED Downlight' },
    ],
    group: 'Fixtures',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'office-under-illuminated',
    field: 'officeIlluminance',
    severity: 'error',
    check: (p) => Number(p.officeIlluminance) < 300,
    message: 'Office illuminance below 300 lux minimum per PEC',
    codeCitation: 'PEC Rule 9.50.4',
    position: () => [9, 1, 5],
  },
  {
    id: 'corridor-under-illuminated',
    field: 'corridorIlluminance',
    severity: 'warning',
    check: (p) => Number(p.corridorIlluminance) < 100,
    message: 'Corridor illuminance below 100 lux recommended minimum',
    codeCitation: 'PEC Rule 9.50.4',
    position: () => [9, 1, 19.5],
  },
  {
    id: 'no-emergency-lighting',
    field: 'emergencyLighting',
    severity: 'error',
    check: (p) => !p.emergencyLighting,
    message: 'Emergency lighting required along all egress paths (min 10.8 lux)',
    codeCitation: 'PEC / RA 9514 IRR Rule 10',
    position: () => [9, 1, 20],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-task-light',
    label: 'Task Illuminance',
    description: 'Work surfaces require 300–500 lux; measured at desk height (0.8m from floor)',
    codeCitation: 'PEC Rule 9.50.4',
    position: () => [9, 1.5, 5],
  },
  {
    id: 'ann-emergency',
    label: 'Emergency Lighting',
    description: 'Min 10.8 lux along egress paths; powered by 90-min battery backup',
    codeCitation: 'RA 9514 / PEC',
    position: () => [9, 1.5, 19.5],
  },
  {
    id: 'ann-uniformity',
    label: 'Uniformity Ratio',
    description: 'Min uniformity ratio 1:3 (min:avg) to avoid excessive contrast in open offices',
    codeCitation: 'PEC',
    position: () => [9, 1.5, 1],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard Office', values: { officeIlluminance: 400, corridorIlluminance: 150, emergencyLighting: true, lightingType: 'led-panel' } },
  { label: 'High-Efficiency LED', values: { officeIlluminance: 500, corridorIlluminance: 200, emergencyLighting: true, lightingType: 'led-panel' } },
  { label: 'Old Fluorescent', values: { officeIlluminance: 300, corridorIlluminance: 100, emergencyLighting: false, lightingType: 'fluorescent' } },
  { label: 'Violation Demo', values: { officeIlluminance: 200, corridorIlluminance: 75, emergencyLighting: false, lightingType: 'downlight' } },
]

export const lightingLayoutConfig: FloorPlanConfig = {
  id: 'lighting-layout',
  title: 'Lighting Layout',
  description: 'Room layout with luminaire placement, lux levels by space type, and emergency lighting per PEC (Philippine Electrical Code) requirements.',
  subject: 'pec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [18, 26],
  camera: { position: [0, 24, 8], fov: 42 },
  scale: 1,
}
