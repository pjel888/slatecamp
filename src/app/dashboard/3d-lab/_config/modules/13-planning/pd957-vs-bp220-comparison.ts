// src/app/dashboard/3d-lab/_config/modules/pd957-vs-bp220-comparison.ts
// PD 957 vs BP 220 Subdivision Comparison — Environmental Planning
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

// Side-by-side comparison of PD 957 (Open Market) vs BP 220 (Socialized Housing)
// Left half: PD 957 subdivision | Right half: BP 220 subdivision

const ROOMS: RoomDef[] = [
  // PD 957 side (left)
  { id: 'pd957-label', label: 'PD 957 — Open Market Subdivision', bounds: [0, 0, 28, 2], color: '#bfdbfe', opacity: 0.7 },
  { id: 'pd957-block-a', label: 'PD 957 Block A (120 sqm lots)', bounds: [0, 3, 12, 15], color: '#fef9c3', opacity: 0.5 },
  { id: 'pd957-block-b', label: 'PD 957 Block B (120 sqm lots)', bounds: [16, 3, 12, 15], color: '#fef9c3', opacity: 0.5 },
  { id: 'pd957-major-road', label: 'PD 957 Major Road (10m ROW)', bounds: [0, 32, 28, 10], color: '#d1d5db', opacity: 0.45, zone: 'corridor' },
  { id: 'pd957-minor-road', label: 'PD 957 Minor Road (8m ROW)', bounds: [12, 3, 4, 29], color: '#e5e7eb', opacity: 0.4, zone: 'corridor' },
  { id: 'pd957-park', label: 'PD 957 Park (30% open space)', bounds: [0, 18, 28, 14], color: '#bbf7d0', opacity: 0.45 },

  // BP 220 side (right)
  { id: 'bp220-label', label: 'BP 220 — Socialized Housing', bounds: [31, 0, 27, 2], color: '#d1fae5', opacity: 0.7 },
  { id: 'bp220-block-a', label: 'BP 220 Block A (36–64 sqm lots)', bounds: [31, 3, 11, 15], color: '#d1fae5', opacity: 0.5 },
  { id: 'bp220-block-b', label: 'BP 220 Block B (36–64 sqm lots)', bounds: [46, 3, 12, 15], color: '#d1fae5', opacity: 0.5 },
  { id: 'bp220-major-road', label: 'BP 220 Major Road (8m ROW)', bounds: [31, 32, 27, 8], color: '#e5e7eb', opacity: 0.45, zone: 'corridor' },
  { id: 'bp220-minor-road', label: 'BP 220 Minor Road (6.5m ROW)', bounds: [41, 3, 5, 29], color: '#f3f4f6', opacity: 0.4, zone: 'corridor' },
  { id: 'bp220-open', label: 'BP 220 Open Space (10% only)', bounds: [31, 18, 27, 14], color: '#ecfdf5', opacity: 0.4 },

  // Divider
  { id: 'divider', label: 'Comparison Divider', bounds: [29, 0, 2, 42], color: '#71717a', opacity: 0.6 },
]

const PATHS: PathDef[] = [
  {
    id: 'pd957-major',
    label: 'PD 957 Major Road (10m)',
    points: [[0, 37], [28, 37]],
    color: '#374151',
    width: 5,
  },
  {
    id: 'bp220-major',
    label: 'BP 220 Major Road (8m)',
    points: [[31, 36], [58, 36]],
    color: '#6b7280',
    width: 4,
  },
  {
    id: 'pd957-minor',
    label: 'PD 957 Minor Road (8m)',
    points: [[14, 3], [14, 32]],
    color: '#6b7280',
    width: 4,
  },
  {
    id: 'bp220-minor',
    label: 'BP 220 Minor Road (6.5m)',
    points: [[43.5, 3], [43.5, 32]],
    color: '#9ca3af',
    width: 3,
  },
]

const FIXTURES: FixtureDef[] = [
  // PD 957 annotations
  {
    id: 'pd957-lot-tag',
    label: 'Min 120 sqm lot',
    type: 'custom',
    position: [6, 10.5],
    color: '#D4951A',
    description: 'PD 957: 120 sqm min lot, 8m frontage',
    codeCitation: 'PD 957 Sec. 5',
  },
  {
    id: 'pd957-road-tag',
    label: '10m Major ROW',
    type: 'custom',
    position: [14, 37],
    color: '#374151',
    description: 'PD 957: 10m major / 8m minor road ROW',
    codeCitation: 'PD 957 Sec. 8',
  },
  // BP 220 annotations
  {
    id: 'bp220-lot-tag',
    label: 'Min 36 sqm lot',
    type: 'custom',
    position: [36.5, 10.5],
    color: '#2D9F6F',
    description: 'BP 220: 36 sqm min (socialized), 64 sqm (economic)',
    codeCitation: 'BP 220 Sec. 3',
  },
  {
    id: 'bp220-road-tag',
    label: '8m Major ROW',
    type: 'custom',
    position: [44.5, 36],
    color: '#6b7280',
    description: 'BP 220: 8m major / 6.5m minor road ROW',
    codeCitation: 'BP 220 Sec. 4',
  },
  {
    id: 'exit-main',
    label: 'EXIT',
    type: 'exit',
    position: [29, 42],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'highlightDiff',
    label: 'Highlight Differences',
    type: 'toggle',
    default: true,
    group: 'Display',
  },
  {
    key: 'viewMode',
    label: 'Comparison Focus',
    type: 'dropdown',
    default: 'lot-size',
    options: [
      { value: 'lot-size', label: 'Lot Size Comparison' },
      { value: 'road-width', label: 'Road Width Comparison' },
      { value: 'open-space', label: 'Open Space Comparison' },
    ],
    group: 'Display',
  },
  {
    key: 'targetBeneficiary',
    label: 'Target Market',
    type: 'dropdown',
    default: 'socialized',
    options: [
      { value: 'open-market', label: 'Open Market (PD 957)' },
      { value: 'economic', label: 'Economic (BP 220 Economic)' },
      { value: 'socialized', label: 'Socialized (BP 220 Socialized)' },
    ],
    group: 'Housing',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'wrong-standard',
    field: 'targetBeneficiary',
    severity: 'info',
    check: (p) => p.targetBeneficiary === 'open-market' && p.viewMode === 'lot-size',
    message: 'Open market projects must comply with PD 957 — not BP 220',
    codeCitation: 'PD 957 / BP 220',
    position: () => [14, 1, 10],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-pd957',
    label: 'PD 957 (Open Market)',
    description: 'Lot: min 120 sqm | Major ROW: 10m | Minor ROW: 8m | Open Space: 30% | Lot Frontage: 8m',
    codeCitation: 'PD 957',
    position: () => [14, 1.5, 10],
  },
  {
    id: 'ann-bp220',
    label: 'BP 220 (Socialized)',
    description: 'Lot: min 36 sqm (social) / 64 sqm (econ) | Major ROW: 8m | Minor ROW: 6.5m | Open Space: 10%',
    codeCitation: 'BP 220',
    position: () => [44.5, 1.5, 10],
  },
  {
    id: 'ann-key-diff',
    label: 'Key Differences',
    description: 'BP 220 reduces lot areas, road widths, and open space to achieve affordability for low-income beneficiaries',
    codeCitation: 'PD 957 / BP 220',
    position: () => [29, 1.5, 22],
  },
]

const PRESETS: Preset[] = [
  { label: 'Side-by-Side (Default)', values: { highlightDiff: true, viewMode: 'lot-size', targetBeneficiary: 'socialized' } },
  { label: 'Road Width Focus', values: { highlightDiff: true, viewMode: 'road-width', targetBeneficiary: 'socialized' } },
  { label: 'Open Space Focus', values: { highlightDiff: true, viewMode: 'open-space', targetBeneficiary: 'socialized' } },
  { label: 'Open Market Study', values: { highlightDiff: false, viewMode: 'lot-size', targetBeneficiary: 'open-market' } },
]

export const pd957VsBp220ComparisonConfig: FloorPlanConfig = {
  id: 'pd957-vs-bp220-comparison',
  title: 'PD 957 vs BP 220 Comparison',
  description: 'Side-by-side subdivision comparison: PD 957 open market (120 sqm lots, 10m roads, 30% open space) vs BP 220 socialized (36 sqm lots, 8m roads, 10% open space).',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [58, 42],
  camera: { position: [0, 54, 22], fov: 52 },
  scale: 1,
}
