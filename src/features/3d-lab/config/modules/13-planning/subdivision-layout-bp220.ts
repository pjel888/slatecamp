// src/features/3d-lab/config/modules/subdivision-layout-bp220.ts
// Subdivision Layout (BP 220 Socialized Housing) — Environmental Planning
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

// BP 220 (Socialized Housing) Standards:
// Major road ROW: min 8m
// Minor road ROW: min 6.5m
// Alley: min 2.0m
// Lot area: min 64 sqm (economic); min 36 sqm (socialized)
// Open space: min 10% of gross area (less than PD 957)
// Lot frontage: min 4m (socialized); min 6m (economic)
// Units may be row houses or low-rise apartments

const ROOMS: RoomDef[] = [
  { id: 'block-a', label: 'Block A — Socialized Lots', bounds: [0, 0, 16, 14], color: '#d1fae5', opacity: 0.45 },
  { id: 'block-b', label: 'Block B — Socialized Lots', bounds: [17, 0, 16, 14], color: '#d1fae5', opacity: 0.45 },
  { id: 'block-c', label: 'Block C — Socialized Lots', bounds: [0, 15, 16, 14], color: '#d1fae5', opacity: 0.45 },
  { id: 'block-d', label: 'Block D — Socialized Lots', bounds: [17, 15, 16, 14], color: '#d1fae5', opacity: 0.45 },
  // Major road (8m ROW)
  { id: 'major-road', label: 'Major Road (8m ROW)', bounds: [0, 29, 33, 8], color: '#d1d5db', opacity: 0.5, zone: 'corridor' },
  // Minor road (6.5m ROW)
  { id: 'minor-road', label: 'Minor Road (6.5m ROW)', bounds: [16, 0, 1, 29], color: '#e5e7eb', opacity: 0.45, zone: 'corridor' },
  // Open space (10% min)
  { id: 'open-space', label: 'Open Space / Playground', bounds: [34, 0, 8, 16], color: '#bbf7d0', opacity: 0.55 },
  { id: 'community-fac', label: 'Community Center', bounds: [34, 17, 8, 12], color: '#dbeafe', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'major-centerline',
    label: 'Major Road Centerline (8m ROW)',
    points: [[0, 33], [42, 33]],
    color: '#374151',
    width: 4,
  },
  {
    id: 'minor-centerline',
    label: 'Minor Road Centerline (6.5m ROW)',
    points: [[16.5, 0], [16.5, 29]],
    color: '#6b7280',
    width: 3,
  },
  {
    id: 'alley',
    label: 'Alley (2m min)',
    points: [[0, 7], [16, 7]],
    color: '#9ca3af',
    width: 1.5,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'main-entry',
    label: 'Subdivision Entry Gate',
    type: 'door',
    position: [16.5, 37],
    size: [6.5, 0.5],
    color: '#374151',
    description: 'Entry gate — 6.5m wide for BP 220 road standard',
    codeCitation: 'BP 220 Sec. 4',
  },
  {
    id: 'daycare',
    label: 'Day Care Center',
    type: 'custom',
    position: [38, 22],
    color: '#6366f1',
    description: 'Community facility required for ≥150 socialized units',
    codeCitation: 'BP 220 Sec. 6',
  },
  {
    id: 'playground',
    label: 'Playground / Open Space',
    type: 'custom',
    position: [38, 8],
    color: '#2D9F6F',
    description: 'Min 10% open space; playground per 50 units',
    codeCitation: 'BP 220 Sec. 7',
  },
  {
    id: 'hydrant',
    label: 'Fire Hydrant',
    type: 'custom',
    position: [8, 33],
    color: '#D64545',
    description: 'Fire hydrant along major road',
    codeCitation: 'RA 9514',
  },
  {
    id: 'exit-sec',
    label: 'Secondary Exit',
    type: 'exit',
    position: [33, 33],
    color: '#2D9F6F',
    codeCitation: 'PD 957 / BP 220',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'housingType',
    label: 'Housing Type',
    type: 'dropdown',
    default: 'socialized',
    options: [
      { value: 'socialized', label: 'Socialized (min 36 sqm lot)' },
      { value: 'economic', label: 'Economic (min 64 sqm lot)' },
    ],
    group: 'Housing',
  },
  {
    key: 'minLotArea',
    label: 'Minimum Lot Area',
    type: 'slider',
    min: 36,
    max: 100,
    step: 4,
    default: 36,
    unit: 'sqm',
    group: 'Lot Standards',
  },
  {
    key: 'majorRoadWidth',
    label: 'Major Road ROW',
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
    min: 5,
    max: 30,
    step: 1,
    default: 10,
    unit: '%',
    group: 'Open Space',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'lot-too-small-socialized',
    field: 'minLotArea',
    severity: 'error',
    check: (p) => p.housingType === 'socialized' && Number(p.minLotArea) < 36,
    message: 'BP 220 socialized housing: minimum lot area is 36 sqm',
    codeCitation: 'BP 220 Sec. 3',
    position: () => [8, 1, 7],
  },
  {
    id: 'lot-too-small-economic',
    field: 'minLotArea',
    severity: 'error',
    check: (p) => p.housingType === 'economic' && Number(p.minLotArea) < 64,
    message: 'BP 220 economic housing: minimum lot area is 64 sqm',
    codeCitation: 'BP 220 Sec. 3',
    position: () => [8, 1, 7],
  },
  {
    id: 'major-road-too-narrow',
    field: 'majorRoadWidth',
    severity: 'error',
    check: (p) => Number(p.majorRoadWidth) < 8,
    message: 'Major road ROW must be ≥ 8m per BP 220',
    codeCitation: 'BP 220 Sec. 4',
    position: () => [16.5, 1, 33],
  },
  {
    id: 'open-space-low',
    field: 'openSpacePercent',
    severity: 'warning',
    check: (p) => Number(p.openSpacePercent) < 10,
    message: 'Open space below 10% minimum of gross area required by BP 220',
    codeCitation: 'BP 220 Sec. 7',
    position: () => [38, 1, 8],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-bp220-lot',
    label: 'BP 220 Lot Standards',
    description: 'Socialized: min 36 sqm, min 4m frontage. Economic: min 64 sqm, min 6m frontage.',
    codeCitation: 'BP 220 Sec. 3',
    position: () => [8, 1.5, 7],
  },
  {
    id: 'ann-roads',
    label: 'Road ROW (BP 220 vs PD 957)',
    description: 'BP 220: major 8m, minor 6.5m (smaller than PD 957 10m/8m — reduced for affordability)',
    codeCitation: 'BP 220 Sec. 4',
    position: () => [16.5, 1.5, 20],
  },
  {
    id: 'ann-open-space',
    label: 'Open Space (BP 220 vs PD 957)',
    description: 'BP 220 requires only 10% open space vs PD 957\'s 30% — reflects affordability priority',
    codeCitation: 'BP 220 Sec. 7',
    position: () => [38, 1.5, 8],
  },
]

const PRESETS: Preset[] = [
  { label: 'BP 220 Socialized (Min)', values: { housingType: 'socialized', minLotArea: 36, majorRoadWidth: 8, openSpacePercent: 10 } },
  { label: 'BP 220 Economic', values: { housingType: 'economic', minLotArea: 64, majorRoadWidth: 8, openSpacePercent: 12 } },
  { label: 'Enhanced Socialized', values: { housingType: 'socialized', minLotArea: 50, majorRoadWidth: 8, openSpacePercent: 15 } },
  { label: 'Violation Demo', values: { housingType: 'socialized', minLotArea: 24, majorRoadWidth: 6, openSpacePercent: 5 } },
]

export const subdivisionLayoutBp220Config: FloorPlanConfig = {
  id: 'subdivision-layout-bp220',
  title: 'Subdivision Layout — BP 220 (Socialized Housing)',
  description: 'Socialized housing subdivision layout per BP 220 with reduced lot standards (min 36 sqm), 8m major roads, and 10% minimum open space.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [42, 37],
  camera: { position: [0, 40, 16], fov: 48 },
  scale: 1,
}

