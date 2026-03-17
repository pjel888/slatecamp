// src/app/dashboard/3d-lab/_config/modules/outlet-spacing-room.ts
// Outlet Spacing — PEC (Philippine Electrical Code)
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

// PEC Outlet Spacing:
// No point along the floor line shall be more than 1.8m from an outlet
// (measured horizontally) — implies outlets spaced max 3.6m apart
// Countertop: no point > 600mm from outlet; island outlets required
// GFCI required: kitchen, bath, garage, outdoor, laundry

const ROOMS: RoomDef[] = [
  { id: 'living', label: 'Living Room', bounds: [0, 0, 14, 10], color: '#bfdbfe', opacity: 0.45 },
  { id: 'dining', label: 'Dining Room', bounds: [15, 0, 10, 10], color: '#d1fae5', opacity: 0.45 },
  { id: 'kitchen', label: 'Kitchen', bounds: [0, 11, 10, 8], color: '#fef9c3', opacity: 0.5 },
  { id: 'bedroom', label: 'Bedroom', bounds: [11, 11, 14, 8], color: '#c7d2fe', opacity: 0.45 },
  { id: 'corridor', label: 'Hallway', bounds: [0, 19, 25, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'bathroom', label: 'Bathroom (GFCI)', bounds: [0, 22, 7, 5], color: '#dbeafe', opacity: 0.5 },
  { id: 'utility', label: 'Utility / Laundry (GFCI)', bounds: [8, 22, 17, 5], color: '#ede9fe', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'wall-circuit-1',
    label: 'Wall Circuit — Living / Dining',
    points: [[0, 5], [14, 5], [14, 0], [14, 10], [25, 10]],
    color: '#f59e0b',
    width: 2,
  },
  {
    id: 'wall-circuit-2',
    label: 'Wall Circuit — Kitchen / Bed',
    points: [[0, 15], [25, 15]],
    color: '#10b981',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  // Living room outlets (3.6m max apart)
  { id: 'out-l1', label: 'Outlet (Living)', type: 'custom', position: [1.8, 5], color: '#f59e0b', description: '3.6m max from adjacent outlet', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-l2', label: 'Outlet (Living)', type: 'custom', position: [5.4, 5], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-l3', label: 'Outlet (Living)', type: 'custom', position: [9.0, 5], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-l4', label: 'Outlet (Living)', type: 'custom', position: [12.6, 5], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  // Dining
  { id: 'out-d1', label: 'Outlet (Dining)', type: 'custom', position: [16.8, 5], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-d2', label: 'Outlet (Dining)', type: 'custom', position: [20.4, 5], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-d3', label: 'Outlet (Dining)', type: 'custom', position: [24.2, 5], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  // Kitchen GFCI (countertop: ≤600mm from outlet)
  { id: 'out-k1', label: 'GFCI Outlet (Kitchen Counter)', type: 'custom', position: [1.8, 13], color: '#dc2626', description: 'GFCI required; max 600mm on countertop', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'out-k2', label: 'GFCI Outlet (Kitchen Counter)', type: 'custom', position: [5.4, 13], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
  { id: 'out-k3', label: 'GFCI Outlet (Kitchen Counter)', type: 'custom', position: [9.0, 13], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
  // Bedroom
  { id: 'out-b1', label: 'Outlet (Bedroom)', type: 'custom', position: [13, 15], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-b2', label: 'Outlet (Bedroom)', type: 'custom', position: [18, 15], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  { id: 'out-b3', label: 'Outlet (Bedroom)', type: 'custom', position: [23, 15], color: '#f59e0b', codeCitation: 'PEC Rule 3.15.2' },
  // Bathroom GFCI
  { id: 'out-bat', label: 'GFCI Outlet (Bathroom)', type: 'custom', position: [3.5, 24.5], color: '#dc2626', description: 'GFCI required within 1.8m of water source', codeCitation: 'PEC Rule 3.15.3' },
  // Laundry GFCI
  { id: 'out-lau', label: 'GFCI Outlet (Laundry)', type: 'custom', position: [14, 24.5], color: '#dc2626', codeCitation: 'PEC Rule 3.15.3' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'outletSpacing',
    label: 'Outlet-to-Outlet Spacing',
    type: 'slider',
    min: 1,
    max: 5,
    step: 0.1,
    default: 3.6,
    unit: 'm',
    group: 'Spacing',
  },
  {
    key: 'gfciInstalled',
    label: 'GFCI in Required Zones',
    type: 'toggle',
    default: true,
    group: 'Protection',
  },
  {
    key: 'countertopSpacing',
    label: 'Countertop Outlet Spacing',
    type: 'slider',
    min: 0.3,
    max: 1.5,
    step: 0.1,
    default: 0.6,
    unit: 'm',
    group: 'Kitchen',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'outlet-spacing-exceeded',
    field: 'outletSpacing',
    severity: 'error',
    check: (p) => Number(p.outletSpacing) > 3.6,
    message: 'Outlet spacing exceeds 3.6m — any floor point is more than 1.8m from an outlet',
    codeCitation: 'PEC Rule 3.15.2',
    position: () => [7, 1, 5],
  },
  {
    id: 'gfci-missing',
    field: 'gfciInstalled',
    severity: 'error',
    check: (p) => !p.gfciInstalled,
    message: 'GFCI protection missing in required zones (kitchen, bath, laundry)',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [3.5, 1, 13],
  },
  {
    id: 'counter-spacing-exceeded',
    field: 'countertopSpacing',
    severity: 'error',
    check: (p) => Number(p.countertopSpacing) > 0.6,
    message: 'Countertop outlet spacing exceeds 600mm — countertop points must be within 600mm of outlet',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [5, 1, 13],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-18m-rule',
    label: '1.8m Floor Line Rule',
    description: 'No point along the floor line (along a wall) shall be more than 1.8m from an outlet, measured horizontally',
    codeCitation: 'PEC Rule 3.15.2',
    position: () => [7, 1.5, 5],
  },
  {
    id: 'ann-gfci',
    label: 'GFCI Required Zones',
    description: 'Ground Fault Circuit Interrupter required within 1.8m of all water sources: kitchen, bath, laundry, outdoor, garage',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [5, 1.5, 24],
  },
  {
    id: 'ann-counter',
    label: 'Countertop Outlets',
    description: 'Kitchen countertop: outlets spaced so no point is more than 600mm (0.6m) from an outlet',
    codeCitation: 'PEC Rule 3.15.3',
    position: () => [5, 1.5, 13],
  },
]

const PRESETS: Preset[] = [
  { label: 'PEC Compliant Home', values: { outletSpacing: 3.6, gfciInstalled: true, countertopSpacing: 0.6 } },
  { label: 'Dense Layout (Modern)', values: { outletSpacing: 2.4, gfciInstalled: true, countertopSpacing: 0.5 } },
  { label: 'Old Construction', values: { outletSpacing: 4.5, gfciInstalled: false, countertopSpacing: 1.2 } },
  { label: 'Violation Demo', values: { outletSpacing: 5.0, gfciInstalled: false, countertopSpacing: 1.5 } },
]

export const outletSpacingRoomConfig: FloorPlanConfig = {
  id: 'outlet-spacing-room',
  title: 'Outlet Spacing (Room Plan)',
  description: 'Room plan showing outlet placement with 1.8m floor-line coverage rings, GFCI zones, and countertop outlet spacing per PEC.',
  subject: 'pec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [25, 27],
  camera: { position: [0, 26, 10], fov: 44 },
  scale: 1,
}
