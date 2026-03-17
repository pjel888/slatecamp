// src/app/dashboard/3d-lab/_config/modules/subdivision-layout-pd957.ts
// Subdivision Layout (PD 957 Open Market) — Environmental Planning
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

// PD 957 (Open Market Subdivision) Standards:
// Major road ROW: min 10m
// Minor road ROW: min 8m
// Alley: min 3m
// Lot area: min 120 sqm (open market)
// Open space: min 30% of gross area (parks, playgrounds, roads)
// Parks: min 3.5 sqm per lot
// Community facilities: school, chapel, commercial area

const ROOMS: RoomDef[] = [
  // Block lots (representative)
  { id: 'block-a', label: 'Block A — Residential Lots', bounds: [0, 0, 20, 18], color: '#fef9c3', opacity: 0.45 },
  { id: 'block-b', label: 'Block B — Residential Lots', bounds: [21, 0, 20, 18], color: '#fef9c3', opacity: 0.45 },
  { id: 'block-c', label: 'Block C — Residential Lots', bounds: [0, 19, 20, 18], color: '#fef9c3', opacity: 0.45 },
  { id: 'block-d', label: 'Block D — Residential Lots', bounds: [21, 19, 20, 18], color: '#fef9c3', opacity: 0.45 },
  // Major road (10m ROW)
  { id: 'major-road', label: 'Major Road (10m ROW)', bounds: [0, 38, 41, 10], color: '#d1d5db', opacity: 0.5, zone: 'corridor' },
  // Minor road (8m ROW) — vertical
  { id: 'minor-road-v', label: 'Minor Road (8m ROW)', bounds: [20, 0, 1, 38], color: '#e5e7eb', opacity: 0.45, zone: 'corridor' },
  // Open space / park
  { id: 'park', label: 'Neighborhood Park', bounds: [42, 0, 12, 20], color: '#bbf7d0', opacity: 0.55 },
  { id: 'community', label: 'Community Facilities', bounds: [42, 21, 12, 17], color: '#dbeafe', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'major-road-line',
    label: 'Major Road Centerline (10m ROW)',
    points: [[0, 43], [54, 43]],
    color: '#374151',
    width: 5,
  },
  {
    id: 'minor-road-line',
    label: 'Minor Road Centerline (8m ROW)',
    points: [[20.5, 0], [20.5, 38]],
    color: '#6b7280',
    width: 4,
  },
  {
    id: 'alley',
    label: 'Alley (3m min)',
    points: [[0, 9], [20, 9]],
    color: '#9ca3af',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'entrance-gate',
    label: 'Subdivision Main Gate',
    type: 'door',
    position: [20.5, 48],
    size: [8, 0.5],
    color: '#374151',
    description: 'Main entrance — min 10m wide for two-lane access',
    codeCitation: 'PD 957 / BP 220',
  },
  {
    id: 'chapel',
    label: 'Chapel (Community Facility)',
    type: 'custom',
    position: [48, 32],
    color: '#6366f1',
    description: 'PD 957 requires community facilities (chapel, school, playground)',
    codeCitation: 'PD 957 Sec. 22',
  },
  {
    id: 'playground',
    label: 'Playground',
    type: 'custom',
    position: [48, 10],
    color: '#16a34a',
    description: 'Min 3.5 sqm of recreational space per lot',
    codeCitation: 'PD 957 Sec. 18',
  },
  {
    id: 'fire-hydrant',
    label: 'Fire Hydrant',
    type: 'custom',
    position: [10, 43],
    color: '#dc2626',
    description: 'Fire hydrant: max 110m apart along roads',
    codeCitation: 'RA 9514',
  },
  {
    id: 'exit-subdivision',
    label: 'Secondary Exit',
    type: 'exit',
    position: [41, 43],
    color: '#16a34a',
    description: 'Secondary access for emergency egress',
    codeCitation: 'PD 957',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'minLotArea',
    label: 'Minimum Lot Area',
    type: 'slider',
    min: 60,
    max: 300,
    step: 10,
    default: 120,
    unit: 'sqm',
    group: 'Lot Standards',
  },
  {
    key: 'majorRoadWidth',
    label: 'Major Road ROW',
    type: 'slider',
    min: 8,
    max: 20,
    step: 1,
    default: 10,
    unit: 'm',
    group: 'Roads',
  },
  {
    key: 'minorRoadWidth',
    label: 'Minor Road ROW',
    type: 'slider',
    min: 6,
    max: 12,
    step: 0.5,
    default: 8,
    unit: 'm',
    group: 'Roads',
  },
  {
    key: 'openSpacePercent',
    label: 'Open Space Provided (%)',
    type: 'slider',
    min: 10,
    max: 50,
    step: 1,
    default: 30,
    unit: '%',
    group: 'Open Space',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'lot-too-small',
    field: 'minLotArea',
    severity: 'error',
    check: (p) => Number(p.minLotArea) < 120,
    message: 'PD 957 open market: minimum lot area is 120 sqm',
    codeCitation: 'PD 957 Sec. 5',
    position: () => [10, 1, 9],
  },
  {
    id: 'major-road-too-narrow',
    field: 'majorRoadWidth',
    severity: 'error',
    check: (p) => Number(p.majorRoadWidth) < 10,
    message: 'Major road ROW must be ≥ 10m per PD 957',
    codeCitation: 'PD 957 Sec. 8',
    position: () => [20.5, 1, 43],
  },
  {
    id: 'minor-road-too-narrow',
    field: 'minorRoadWidth',
    severity: 'error',
    check: (p) => Number(p.minorRoadWidth) < 8,
    message: 'Minor road ROW must be ≥ 8m per PD 957',
    codeCitation: 'PD 957 Sec. 8',
    position: () => [20.5, 1, 20],
  },
  {
    id: 'open-space-low',
    field: 'openSpacePercent',
    severity: 'warning',
    check: (p) => Number(p.openSpacePercent) < 30,
    message: 'Open space below 30% minimum of gross area required by PD 957',
    codeCitation: 'PD 957 Sec. 18',
    position: () => [48, 1, 10],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-pd957-lot',
    label: 'PD 957 Lot Standards',
    description: 'Open market: min 120 sqm lot area; min 8m frontage. Economic: min 100 sqm. Socialized: BP 220 applies.',
    codeCitation: 'PD 957 Sec. 5',
    position: () => [10, 1.5, 9],
  },
  {
    id: 'ann-open-space',
    label: 'Open Space Requirements',
    description: 'Min 30% of gross area as open space (includes roads, parks, community facilities)',
    codeCitation: 'PD 957 Sec. 18',
    position: () => [48, 1.5, 10],
  },
  {
    id: 'ann-comm-facilities',
    label: 'Community Facility Requirements',
    description: 'PD 957 requires: chapel (if ≥100 lots), school site, commercial area, playground',
    codeCitation: 'PD 957 Sec. 22',
    position: () => [48, 1.5, 29],
  },
]

const PRESETS: Preset[] = [
  { label: 'PD 957 Minimum Compliant', values: { minLotArea: 120, majorRoadWidth: 10, minorRoadWidth: 8, openSpacePercent: 30 } },
  { label: 'Premium Subdivision', values: { minLotArea: 200, majorRoadWidth: 12, minorRoadWidth: 10, openSpacePercent: 40 } },
  { label: 'Economic Housing', values: { minLotArea: 100, majorRoadWidth: 10, minorRoadWidth: 8, openSpacePercent: 30 } },
  { label: 'Violation Demo', values: { minLotArea: 80, majorRoadWidth: 8, minorRoadWidth: 6, openSpacePercent: 15 } },
]

export const subdivisionLayoutPd957Config: FloorPlanConfig = {
  id: 'subdivision-layout-pd957',
  title: 'Subdivision Layout — PD 957 (Open Market)',
  description: 'Open market subdivision layout per PD 957 with lot dimensions, road ROWs (10m major / 8m minor), open space, and community facilities.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [54, 48],
  camera: { position: [0, 52, 20], fov: 50 },
  scale: 1,
}
