// src/features/3d-lab/config/modules/zoning-setback-overlay.ts
// Zoning Setback Overlay — PD 1096 (National Building Code)
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

// PD 1096 Setback Requirements (meters):
// R-1 (Low-Density Residential): Front 4.5m, Side 2.0m, Rear 2.0m
// R-2 (Medium-Density Residential): Front 5.0m, Side 2.0m, Rear 2.0m
// R-3 (High-Density Residential): Front 5.0m, Side 3.0m, Rear 3.0m
// Commercial: Front 5.0m, Side 0m (party wall), Rear 3.0m

const ROOMS: RoomDef[] = [
  // Property lot boundary
  { id: 'lot', label: 'Property Lot', bounds: [0, 0, 24, 20], color: '#d1fae5', opacity: 0.2 },
  // Setback zones (color-coded overlays)
  { id: 'front-setback', label: 'Front Setback Zone', bounds: [0, 0, 24, 5], color: '#fee2e2', opacity: 0.45, zone: 'setback' },
  { id: 'rear-setback', label: 'Rear Setback Zone', bounds: [0, 17, 24, 3], color: '#fee2e2', opacity: 0.45, zone: 'setback' },
  { id: 'side-setback-left', label: 'Left Side Setback', bounds: [0, 5, 2, 12], color: '#fef3c7', opacity: 0.5, zone: 'setback' },
  { id: 'side-setback-right', label: 'Right Side Setback', bounds: [22, 5, 2, 12], color: '#fef3c7', opacity: 0.5, zone: 'setback' },
  // Buildable envelope
  { id: 'buildable-area', label: 'Buildable Area', bounds: [2, 5, 20, 12], color: '#bbf7d0', opacity: 0.5 },
  // Proposed building footprint
  { id: 'building', label: 'Proposed Building', bounds: [5, 7, 14, 8], color: '#bfdbfe', opacity: 0.7 },
]

const PATHS: PathDef[] = [
  {
    id: 'front-street',
    label: 'Front Street / Road ROW',
    points: [[-2, 0], [26, 0]],
    color: '#374151',
    width: 4,
  },
  {
    id: 'property-line',
    label: 'Property Boundary',
    points: [[0, 0], [24, 0], [24, 20], [0, 20], [0, 0]],
    color: '#D4951A',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'front-entrance',
    label: 'Main Entrance',
    type: 'door',
    position: [12, 7],
    size: [1.5, 0.2],
    color: '#2D9F6F',
    description: 'Main building entrance facing front setback',
    codeCitation: 'PD 1096',
  },
  {
    id: 'gate',
    label: 'Property Gate',
    type: 'door',
    position: [12, 0],
    size: [3, 0.2],
    color: '#6b7280',
    description: 'Property gate at street boundary',
    codeCitation: 'PD 1096',
  },
  {
    id: 'exit-rear',
    label: 'Rear Exit',
    type: 'exit',
    position: [12, 15],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'zoningType',
    label: 'Zoning Classification',
    type: 'dropdown',
    default: 'R-2',
    options: [
      { value: 'R-1', label: 'R-1 Low-Density Residential' },
      { value: 'R-2', label: 'R-2 Medium-Density Residential' },
      { value: 'R-3', label: 'R-3 High-Density Residential' },
      { value: 'C-1', label: 'C-1 Commercial' },
    ],
    group: 'Zoning',
  },
  {
    key: 'frontSetback',
    label: 'Front Setback Provided',
    type: 'slider',
    min: 0,
    max: 10,
    step: 0.5,
    default: 5,
    unit: 'm',
    group: 'Setbacks',
  },
  {
    key: 'sideSetback',
    label: 'Side Setback Provided',
    type: 'slider',
    min: 0,
    max: 6,
    step: 0.5,
    default: 2,
    unit: 'm',
    group: 'Setbacks',
  },
  {
    key: 'rearSetback',
    label: 'Rear Setback Provided',
    type: 'slider',
    min: 0,
    max: 6,
    step: 0.5,
    default: 2,
    unit: 'm',
    group: 'Setbacks',
  },
]

const SETBACK_REQS: Record<string, { front: number; side: number; rear: number }> = {
  'R-1': { front: 4.5, side: 2.0, rear: 2.0 },
  'R-2': { front: 5.0, side: 2.0, rear: 2.0 },
  'R-3': { front: 5.0, side: 3.0, rear: 3.0 },
  'C-1': { front: 5.0, side: 0, rear: 3.0 },
}

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'front-setback-violation',
    field: 'frontSetback',
    severity: 'error',
    check: (p) => {
      const req = SETBACK_REQS[String(p.zoningType)] ?? SETBACK_REQS['R-2']
      return Number(p.frontSetback) < req.front
    },
    message: 'Front setback below minimum for selected zoning classification',
    codeCitation: 'PD 1096 Sec. 708',
    position: () => [12, 1, 2.5],
  },
  {
    id: 'side-setback-violation',
    field: 'sideSetback',
    severity: 'error',
    check: (p) => {
      const req = SETBACK_REQS[String(p.zoningType)] ?? SETBACK_REQS['R-2']
      return Number(p.sideSetback) < req.side
    },
    message: 'Side setback below minimum for selected zoning classification',
    codeCitation: 'PD 1096 Sec. 708',
    position: () => [1, 1, 11],
  },
  {
    id: 'rear-setback-violation',
    field: 'rearSetback',
    severity: 'error',
    check: (p) => {
      const req = SETBACK_REQS[String(p.zoningType)] ?? SETBACK_REQS['R-2']
      return Number(p.rearSetback) < req.rear
    },
    message: 'Rear setback below minimum for selected zoning classification',
    codeCitation: 'PD 1096 Sec. 708',
    position: () => [12, 1, 18.5],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-setback-def',
    label: 'Setback Definition',
    description: 'Distance measured from property line to nearest exterior wall face of the building',
    codeCitation: 'PD 1096 Sec. 708',
    position: () => [12, 1.5, 2],
  },
  {
    id: 'ann-buildable',
    label: 'Buildable Envelope',
    description: 'Green zone: area within which construction is permitted after setbacks are applied',
    codeCitation: 'PD 1096',
    position: () => [12, 1.5, 11],
  },
  {
    id: 'ann-r3-side',
    label: 'R-3 Side Setback',
    description: 'R-3 zones require 3m side setbacks (vs 2m for R-1/R-2); relevant for higher density',
    codeCitation: 'PD 1096 Sec. 708',
    position: () => [1, 1.5, 11],
  },
]

const PRESETS: Preset[] = [
  { label: 'R-1 Compliant', values: { zoningType: 'R-1', frontSetback: 4.5, sideSetback: 2.0, rearSetback: 2.0 } },
  { label: 'R-2 Compliant', values: { zoningType: 'R-2', frontSetback: 5.0, sideSetback: 2.0, rearSetback: 2.0 } },
  { label: 'R-3 Compliant', values: { zoningType: 'R-3', frontSetback: 5.0, sideSetback: 3.0, rearSetback: 3.0 } },
  { label: 'Violation Demo (R-3)', values: { zoningType: 'R-3', frontSetback: 3.0, sideSetback: 1.5, rearSetback: 1.5 } },
]

export const zoningSetbackOverlayConfig: FloorPlanConfig = {
  id: 'zoning-setback-overlay',
  title: 'Zoning Setback Overlay',
  description: 'Lot plan with R-1/R-2/R-3 setback zones visualized, showing buildable envelope and violation detection per PD 1096.',
  subject: 'pd-1096',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [24, 20],
  camera: { position: [0, 24, 8], fov: 42 },
  scale: 1,
}

