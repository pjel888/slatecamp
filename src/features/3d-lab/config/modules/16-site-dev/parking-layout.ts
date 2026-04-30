// src/features/3d-lab/config/modules/parking-layout.ts
// Parking Layout — PD 1096 (National Building Code)
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

// PD 1096 minimum stall dimensions (meters)
// Standard: 2.5m × 5.0m, Compact: 2.2m × 4.5m, Bus/Truck: 3.6m × 12.0m

const ROOMS: RoomDef[] = [
  { id: 'aisle-main', label: 'Main Drive Aisle', bounds: [0, 10, 30, 6], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'row-north', label: 'North Parking Row', bounds: [0, 0, 30, 10], color: '#bfdbfe', opacity: 0.45 },
  { id: 'row-south', label: 'South Parking Row', bounds: [0, 16, 30, 10], color: '#bbf7d0', opacity: 0.45 },
  { id: 'entry-zone', label: 'Entry / Exit Zone', bounds: [27, 7, 3, 12], color: '#fef9c3', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'circulation-main',
    label: 'Main Circulation Path',
    points: [[28, 13], [2, 13]],
    color: '#6b7280',
    width: 4,
    animated: true,
  },
  {
    id: 'pedestrian-path',
    label: 'Pedestrian Walkway',
    points: [[1, 0], [1, 26]],
    color: '#1B3FC4',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'entry-gate',
    label: 'Entry Gate',
    type: 'door',
    position: [28.5, 10],
    rotation: 90,
    size: [0.3, 3],
    color: '#D4951A',
    description: 'Vehicle entry — min 3m clear width',
    codeCitation: 'PD 1096 Sec. 806',
  },
  {
    id: 'exit-gate',
    label: 'Exit Gate',
    type: 'exit',
    position: [28.5, 16],
    rotation: 90,
    size: [0.3, 3],
    color: '#2D9F6F',
    description: 'Vehicle exit — separate lane required',
    codeCitation: 'PD 1096 Sec. 806',
  },
  {
    id: 'extinguisher-1',
    label: 'Fire Extinguisher',
    type: 'extinguisher',
    position: [0.5, 13],
    color: '#D64545',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'stallType',
    label: 'Stall Type',
    type: 'dropdown',
    default: 'standard',
    options: [
      { value: 'standard', label: 'Standard (2.5m × 5.0m)' },
      { value: 'compact', label: 'Compact (2.2m × 4.5m)' },
      { value: 'bus', label: 'Bus / Truck (3.6m × 12.0m)' },
    ],
    group: 'Stall Dimensions',
  },
  {
    key: 'aisleWidth',
    label: 'Aisle Width',
    type: 'slider',
    min: 5,
    max: 8,
    step: 0.5,
    default: 6,
    unit: 'm',
    group: 'Aisle',
  },
  {
    key: 'stallCount',
    label: 'Stall Count',
    type: 'slider',
    min: 4,
    max: 20,
    step: 1,
    default: 10,
    group: 'Layout',
  },
  {
    key: 'angle',
    label: 'Parking Angle',
    type: 'dropdown',
    default: '90',
    options: [
      { value: '90', label: '90° (Perpendicular)' },
      { value: '60', label: '60° (Angled)' },
      { value: '45', label: '45° (Angled)' },
      { value: '0', label: 'Parallel' },
    ],
    group: 'Layout',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'aisle-too-narrow',
    field: 'aisleWidth',
    severity: 'error',
    check: (p) => Number(p.aisleWidth) < 6 && p.angle === '90',
    message: 'Aisle width must be ≥ 6.0m for 90° perpendicular parking',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [15, 1, 13],
  },
  {
    id: 'aisle-60-narrow',
    field: 'aisleWidth',
    severity: 'warning',
    check: (p) => Number(p.aisleWidth) < 5.5 && p.angle === '60',
    message: 'Aisle width should be ≥ 5.5m for 60° angled parking',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [15, 1, 13],
  },
  {
    id: 'too-many-compact',
    field: 'stallType',
    severity: 'info',
    check: (p) => p.stallType === 'compact',
    message: 'Compact stalls limited to 30% of total; remainder must be standard',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [15, 1, 5],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-stall-dim',
    label: 'Standard Stall Dimensions',
    description: 'PD 1096 minimum: 2.5m wide × 5.0m deep for standard passenger vehicles',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [7, 1.5, 5],
  },
  {
    id: 'ann-aisle',
    label: 'Drive Aisle Requirements',
    description: 'Two-way aisle: min 6.0m for 90° stalls. One-way: min 3.5m.',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [15, 1.5, 13],
  },
  {
    id: 'ann-turning',
    label: 'Turning Radius',
    description: 'Minimum 6.0m turning radius at end of aisle bays',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [27, 1.5, 13],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard 90°', values: { stallType: 'standard', aisleWidth: 6, stallCount: 10, angle: '90' } },
  { label: 'Compact 60°', values: { stallType: 'compact', aisleWidth: 5.5, stallCount: 14, angle: '60' } },
  { label: 'Parallel Street', values: { stallType: 'standard', aisleWidth: 3.5, stallCount: 8, angle: '0' } },
  { label: 'Bus Terminal', values: { stallType: 'bus', aisleWidth: 7, stallCount: 4, angle: '90' } },
]

export const parkingLayoutConfig: FloorPlanConfig = {
  id: 'parking-layout',
  title: 'Parking Layout',
  description: 'Parking floor plan with vehicle stall types, drive aisle widths, and circulation paths per PD 1096 National Building Code requirements.',
  subject: 'pd-1096',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [30, 26],
  camera: { position: [0, 26, 10], fov: 42 },
  scale: 1,
}

