// src/app/dashboard/3d-lab/_config/modules/sprinkler-layout.ts
// Sprinkler Layout — RA 9514 (Fire Code of the Philippines)
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

// RA 9514 Sprinkler spacing:
// Light hazard: max 21 sqm/head, max 4.6m spacing
// Ordinary hazard: max 12 sqm/head, max 3.7m spacing
// Extra hazard: max 9.3 sqm/head, max 3.1m spacing

const ROOMS: RoomDef[] = [
  { id: 'office', label: 'Open Office', bounds: [0, 0, 20, 12], color: '#bfdbfe', opacity: 0.45 },
  { id: 'meeting-1', label: 'Meeting Room 1', bounds: [0, 13, 9, 7], color: '#c7d2fe', opacity: 0.5 },
  { id: 'meeting-2', label: 'Meeting Room 2', bounds: [10, 13, 10, 7], color: '#c7d2fe', opacity: 0.5 },
  { id: 'corridor', label: 'Corridor', bounds: [0, 20, 20, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'storage', label: 'Storage Room', bounds: [0, 23, 8, 5], color: '#fef9c3', opacity: 0.5 },
  { id: 'server', label: 'Server / Electrical Room', bounds: [9, 23, 11, 5], color: '#fee2e2', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'main-supply',
    label: 'Main Sprinkler Supply Line',
    points: [[10, 0], [10, 28]],
    color: '#1B3FC4',
    width: 3,
  },
  {
    id: 'branch-office',
    label: 'Branch Line — Office',
    points: [[0, 3], [20, 3], [20, 6], [0, 6], [0, 9], [20, 9]],
    color: '#60a5fa',
    width: 2,
  },
  {
    id: 'branch-rooms',
    label: 'Branch Line — Meeting Rooms',
    points: [[0, 15.5], [9, 15.5], [10, 16.5], [20, 16.5]],
    color: '#60a5fa',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Office sprinklers (light hazard, ~4.5m grid)
  { id: 'sp-1', label: 'Sprinkler', type: 'sprinkler', position: [3, 3], color: '#1B3FC4', description: 'Coverage: 21 sqm', codeCitation: 'RA 9514' },
  { id: 'sp-2', label: 'Sprinkler', type: 'sprinkler', position: [8, 3], color: '#1B3FC4', description: 'Coverage: 21 sqm', codeCitation: 'RA 9514' },
  { id: 'sp-3', label: 'Sprinkler', type: 'sprinkler', position: [13, 3], color: '#1B3FC4', description: 'Coverage: 21 sqm', codeCitation: 'RA 9514' },
  { id: 'sp-4', label: 'Sprinkler', type: 'sprinkler', position: [18, 3], color: '#1B3FC4', description: 'Coverage: 21 sqm', codeCitation: 'RA 9514' },
  { id: 'sp-5', label: 'Sprinkler', type: 'sprinkler', position: [3, 7], color: '#1B3FC4', codeCitation: 'RA 9514' },
  { id: 'sp-6', label: 'Sprinkler', type: 'sprinkler', position: [8, 7], color: '#1B3FC4', codeCitation: 'RA 9514' },
  { id: 'sp-7', label: 'Sprinkler', type: 'sprinkler', position: [13, 7], color: '#1B3FC4', codeCitation: 'RA 9514' },
  { id: 'sp-8', label: 'Sprinkler', type: 'sprinkler', position: [18, 7], color: '#1B3FC4', codeCitation: 'RA 9514' },
  { id: 'sp-9', label: 'Sprinkler', type: 'sprinkler', position: [3, 11], color: '#1B3FC4', codeCitation: 'RA 9514' },
  { id: 'sp-10', label: 'Sprinkler', type: 'sprinkler', position: [13, 11], color: '#1B3FC4', codeCitation: 'RA 9514' },
  // Meeting room sprinklers
  { id: 'sp-11', label: 'Sprinkler', type: 'sprinkler', position: [4.5, 16.5], color: '#1B3FC4', codeCitation: 'RA 9514' },
  { id: 'sp-12', label: 'Sprinkler', type: 'sprinkler', position: [15, 16.5], color: '#1B3FC4', codeCitation: 'RA 9514' },
  // Storage (ordinary hazard)
  { id: 'sp-13', label: 'Sprinkler (Ordinary)', type: 'sprinkler', position: [4, 25.5], color: '#D64545', description: 'Coverage: 12 sqm', codeCitation: 'RA 9514' },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [10, 23], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'hazardClass',
    label: 'Hazard Classification',
    type: 'dropdown',
    default: 'light',
    options: [
      { value: 'light', label: 'Light Hazard (≤21 sqm/head)' },
      { value: 'ordinary', label: 'Ordinary Hazard (≤12 sqm/head)' },
      { value: 'extra', label: 'Extra Hazard (≤9.3 sqm/head)' },
    ],
    group: 'Hazard',
  },
  {
    key: 'headSpacing',
    label: 'Head-to-Head Spacing',
    type: 'slider',
    min: 2,
    max: 5,
    step: 0.1,
    default: 4.5,
    unit: 'm',
    group: 'Layout',
  },
  {
    key: 'coveragePerHead',
    label: 'Coverage per Head',
    type: 'slider',
    min: 5,
    max: 22,
    step: 0.5,
    default: 20,
    unit: 'sqm',
    group: 'Layout',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'spacing-exceeded-light',
    field: 'headSpacing',
    severity: 'error',
    check: (p) => p.hazardClass === 'light' && Number(p.headSpacing) > 4.6,
    message: 'Head spacing exceeds 4.6m maximum for light hazard occupancy',
    codeCitation: 'RA 9514 / NFPA 13',
    position: () => [10, 1, 6],
  },
  {
    id: 'spacing-exceeded-ordinary',
    field: 'headSpacing',
    severity: 'error',
    check: (p) => p.hazardClass === 'ordinary' && Number(p.headSpacing) > 3.7,
    message: 'Head spacing exceeds 3.7m maximum for ordinary hazard occupancy',
    codeCitation: 'RA 9514 / NFPA 13',
    position: () => [10, 1, 6],
  },
  {
    id: 'coverage-exceeded',
    field: 'coveragePerHead',
    severity: 'error',
    check: (p) => p.hazardClass === 'ordinary' && Number(p.coveragePerHead) > 12,
    message: 'Coverage area per head exceeds 12 sqm for ordinary hazard',
    codeCitation: 'RA 9514 / NFPA 13',
    position: () => [10, 1, 25],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-coverage',
    label: 'Sprinkler Coverage Circle',
    description: 'Each head covers the indicated area; circles should overlap slightly to eliminate cold spots',
    codeCitation: 'RA 9514 / NFPA 13',
    position: () => [10, 1.5, 6],
  },
  {
    id: 'ann-hazard',
    label: 'Hazard Classification',
    description: 'Light hazard: offices, schools. Ordinary: retail, dining. Extra: warehouses, paint shops.',
    codeCitation: 'RA 9514',
    position: () => [10, 1.5, 25],
  },
  {
    id: 'ann-main-valve',
    label: 'Main Control Valve',
    description: 'System riser with main control valve, test connection, and flow switch at ground floor',
    codeCitation: 'RA 9514',
    position: () => [10, 1.5, 1],
  },
]

const PRESETS: Preset[] = [
  { label: 'Office (Light Hazard)', values: { hazardClass: 'light', headSpacing: 4.5, coveragePerHead: 20 } },
  { label: 'Retail (Ordinary Hazard)', values: { hazardClass: 'ordinary', headSpacing: 3.7, coveragePerHead: 12 } },
  { label: 'Workshop (Extra Hazard)', values: { hazardClass: 'extra', headSpacing: 3.1, coveragePerHead: 9 } },
  { label: 'Violation Demo', values: { hazardClass: 'ordinary', headSpacing: 5.0, coveragePerHead: 18 } },
]

export const sprinklerLayoutConfig: FloorPlanConfig = {
  id: 'sprinkler-layout',
  title: 'Sprinkler Layout',
  description: 'Floor plan with automatic sprinkler head placement, coverage areas, and spacing compliance per RA 9514 and NFPA 13.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [20, 28],
  camera: { position: [0, 26, 8], fov: 42 },
  scale: 1,
}

