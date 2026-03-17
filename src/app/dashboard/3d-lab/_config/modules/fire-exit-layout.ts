// src/app/dashboard/3d-lab/_config/modules/fire-exit-layout.ts
// Fire Exit Layout — RA 9514 (Fire Code of the Philippines)
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

// RA 9514 travel distances:
// Business/Assembly unsprinklered: 46m | sprinklered: 61m
// Mercantile unsprinklered: 30m | sprinklered: 46m

const ROOMS: RoomDef[] = [
  { id: 'office-a', label: 'Office A', bounds: [0, 0, 12, 10], color: '#bfdbfe', opacity: 0.5 },
  { id: 'office-b', label: 'Office B', bounds: [13, 0, 12, 10], color: '#bfdbfe', opacity: 0.5 },
  { id: 'conference', label: 'Conference Room', bounds: [0, 11, 10, 8], color: '#c7d2fe', opacity: 0.5 },
  { id: 'lobby', label: 'Lobby / Reception', bounds: [11, 11, 14, 8], color: '#d1fae5', opacity: 0.5 },
  { id: 'corridor', label: 'Main Corridor', bounds: [0, 19, 25, 4], color: '#d4d4d8', opacity: 0.4, zone: 'corridor' },
  { id: 'stairwell-a', label: 'Stair A', bounds: [0, 23, 5, 5], color: '#fef3c7', opacity: 0.6 },
  { id: 'stairwell-b', label: 'Stair B', bounds: [20, 23, 5, 5], color: '#fef3c7', opacity: 0.6 },
]

const PATHS: PathDef[] = [
  {
    id: 'path-office-a-to-exit',
    label: 'Office A → Exit A (Travel Distance)',
    points: [[6, 5], [6, 21], [2.5, 21], [2.5, 25.5]],
    color: '#2D9F6F',
    width: 3,
    animated: true,
  },
  {
    id: 'path-office-b-to-exit',
    label: 'Office B → Exit B (Travel Distance)',
    points: [[19, 5], [19, 21], [22.5, 21], [22.5, 25.5]],
    color: '#3B6B9C',
    width: 3,
    animated: true,
  },
  {
    id: 'path-conference-to-exit',
    label: 'Conference → Exit A',
    points: [[5, 15], [5, 21], [2.5, 21], [2.5, 25.5]],
    color: '#9333ea',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'exit-a',
    label: 'EXIT A — Stair A',
    type: 'exit',
    position: [2.5, 28],
    color: '#2D9F6F',
    description: 'Primary fire exit — SW stairwell',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'exit-b',
    label: 'EXIT B — Stair B',
    type: 'exit',
    position: [22.5, 28],
    color: '#2D9F6F',
    description: 'Secondary fire exit — SE stairwell',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'extinguisher-1',
    label: 'Fire Extinguisher',
    type: 'extinguisher',
    position: [12.5, 21],
    color: '#D64545',
    codeCitation: 'RA 9514',
  },
  {
    id: 'stair-a',
    label: 'Stairwell A',
    type: 'stair',
    position: [2.5, 25.5],
    color: '#D4951A',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'stair-b',
    label: 'Stairwell B',
    type: 'stair',
    position: [22.5, 25.5],
    color: '#D4951A',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'sprinklered',
    label: 'Sprinkler System Installed',
    type: 'toggle',
    default: false,
    group: 'System',
  },
  {
    key: 'occupancyType',
    label: 'Occupancy Type',
    type: 'dropdown',
    default: 'business',
    options: [
      { value: 'business', label: 'Business / Office' },
      { value: 'assembly', label: 'Assembly' },
      { value: 'mercantile', label: 'Mercantile' },
      { value: 'educational', label: 'Educational' },
    ],
    group: 'Occupancy',
  },
  {
    key: 'corridorWidth',
    label: 'Corridor Width',
    type: 'slider',
    min: 1.1,
    max: 3,
    step: 0.1,
    default: 1.8,
    unit: 'm',
    group: 'Egress',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'travel-distance-exceeded',
    field: 'sprinklered',
    severity: 'error',
    check: (p) => {
      const limit = p.sprinklered ? 61 : 46
      return p.occupancyType === 'mercantile' ? limit > (p.sprinklered ? 46 : 30) : false
    },
    message: 'Mercantile travel distance exceeds 30m unsprinklered (46m sprinklered)',
    codeCitation: 'RA 9514 IRR Rule 10 §1016',
    position: () => [12.5, 1, 21],
  },
  {
    id: 'corridor-too-narrow',
    field: 'corridorWidth',
    severity: 'error',
    check: (p) => Number(p.corridorWidth) < 1.1,
    message: 'Corridor width must be ≥ 1.1m (exit access)',
    codeCitation: 'RA 9514 IRR Rule 10 §1018',
    position: () => [12.5, 1, 19],
  },
  {
    id: 'dead-end-warning',
    field: 'corridorWidth',
    severity: 'warning',
    check: (p) => Number(p.corridorWidth) < 1.4,
    message: 'Corridor width < 1.4m may be inadequate for high-occupancy floors',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [12.5, 1, 20],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-travel-dist',
    label: 'Travel Distance Measurement',
    description: 'Max 46m unsprinklered (61m sprinklered) for business occupancy per RA 9514',
    codeCitation: 'RA 9514 IRR Rule 10 §1016',
    position: () => [6, 1.5, 10],
  },
  {
    id: 'ann-exit-sep',
    label: 'Exit Separation',
    description: 'Exits must be separated by ≥ ½ diagonal of the floor served',
    codeCitation: 'RA 9514 IRR Rule 10 §1005',
    position: () => [12.5, 1.5, 26],
  },
  {
    id: 'ann-stair-width',
    label: 'Stairwell Width',
    description: 'Minimum 1.1m clear width; 1.5m recommended for high-occupancy',
    codeCitation: 'RA 9514 IRR Rule 10 §1009',
    position: () => [2.5, 1.5, 23],
  },
]

const PRESETS: Preset[] = [
  { label: 'Office Unsprinklered', values: { sprinklered: false, occupancyType: 'business', corridorWidth: 1.8 } },
  { label: 'Office Sprinklered', values: { sprinklered: true, occupancyType: 'business', corridorWidth: 1.5 } },
  { label: 'Retail Floor', values: { sprinklered: false, occupancyType: 'mercantile', corridorWidth: 2.0 } },
  { label: 'Assembly Hall', values: { sprinklered: true, occupancyType: 'assembly', corridorWidth: 2.5 } },
]

export const fireExitLayoutConfig: FloorPlanConfig = {
  id: 'fire-exit-layout',
  title: 'Fire Exit Layout',
  description: 'Multi-room floor plan showing egress paths, travel distances, and exit compliance per RA 9514 Fire Code of the Philippines.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [25, 28],
  camera: { position: [0, 28, 10], fov: 42 },
  scale: 1,
}
