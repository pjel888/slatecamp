// src/app/dashboard/3d-lab/_config/modules/hvac-duct-layout.ts
// HVAC Duct Layout — PMEC (Philippine Mechanical Engineering Code)
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

// PMEC HVAC key requirements:
// Supply air ducts: positive pressure, insulated
// Return air ducts: negative pressure, connected to AHU
// AHU clearance: min 1.0m on sides, 1.2m front
// Duct velocity: supply max 7.6 m/s, return max 6.1 m/s
// Machine room: min 10% of total floor area served

const ROOMS: RoomDef[] = [
  { id: 'office-1', label: 'Office Zone A', bounds: [0, 0, 14, 10], color: '#bfdbfe', opacity: 0.45 },
  { id: 'office-2', label: 'Office Zone B', bounds: [15, 0, 14, 10], color: '#bfdbfe', opacity: 0.45 },
  { id: 'conference', label: 'Conference Room', bounds: [0, 11, 12, 8], color: '#c7d2fe', opacity: 0.5 },
  { id: 'reception', label: 'Reception', bounds: [13, 11, 16, 8], color: '#d1fae5', opacity: 0.45 },
  { id: 'corridor', label: 'Corridor', bounds: [0, 19, 29, 3], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'ahu-room', label: 'AHU / Machine Room', bounds: [0, 22, 9, 6], color: '#fef3c7', opacity: 0.55 },
  { id: 'electrical', label: 'Electrical Room', bounds: [10, 22, 8, 6], color: '#fee2e2', opacity: 0.45 },
  { id: 'toilet', label: 'Toilets', bounds: [19, 22, 10, 6], color: '#dbeafe', opacity: 0.45 },
]

const PATHS: PathDef[] = [
  {
    id: 'supply-main',
    label: 'Main Supply Duct',
    points: [[4.5, 22], [4.5, 19], [4.5, 0]],
    color: '#3B6B9C',
    width: 4,
  },
  {
    id: 'supply-branch-1',
    label: 'Supply Branch — Zone A',
    points: [[4.5, 5], [0, 5], [14, 5]],
    color: '#60a5fa',
    width: 2.5,
  },
  {
    id: 'supply-branch-2',
    label: 'Supply Branch — Zone B',
    points: [[4.5, 8], [15, 8], [29, 8]],
    color: '#60a5fa',
    width: 2.5,
  },
  {
    id: 'return-main',
    label: 'Main Return Duct',
    points: [[24, 0], [24, 22]],
    color: '#D4951A',
    width: 3,
  },
  {
    id: 'exhaust-toilet',
    label: 'Exhaust — Toilets',
    points: [[24, 22], [24, 28]],
    color: '#9ca3af',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'ahu',
    label: 'Air Handling Unit (AHU)',
    type: 'custom',
    position: [4.5, 25],
    size: [3, 2],
    color: '#D4951A',
    description: 'AHU with filter, coil, fan; min 1.0m clearance on sides',
    codeCitation: 'PMEC',
  },
  {
    id: 'supply-diff-1',
    label: 'Supply Diffuser',
    type: 'custom',
    position: [3, 5],
    color: '#3b82f6',
    description: 'Supply air diffuser — 4-way ceiling type',
    codeCitation: 'PMEC',
  },
  {
    id: 'supply-diff-2',
    label: 'Supply Diffuser',
    type: 'custom',
    position: [11, 5],
    color: '#3b82f6',
    codeCitation: 'PMEC',
  },
  {
    id: 'supply-diff-3',
    label: 'Supply Diffuser',
    type: 'custom',
    position: [19, 8],
    color: '#3b82f6',
    codeCitation: 'PMEC',
  },
  {
    id: 'return-grille-1',
    label: 'Return Air Grille',
    type: 'custom',
    position: [24, 5],
    color: '#D4951A',
    description: 'Return air grille — sized for low velocity',
    codeCitation: 'PMEC',
  },
  {
    id: 'exit-main',
    label: 'EXIT',
    type: 'exit',
    position: [14.5, 22],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'systemType',
    label: 'HVAC System Type',
    type: 'dropdown',
    default: 'central-ahu',
    options: [
      { value: 'central-ahu', label: 'Central AHU' },
      { value: 'fan-coil', label: 'Fan Coil Units' },
      { value: 'split-type', label: 'Split-Type Units' },
      { value: 'vav', label: 'Variable Air Volume (VAV)' },
    ],
    group: 'System',
  },
  {
    key: 'supplyVelocity',
    label: 'Supply Duct Velocity',
    type: 'slider',
    min: 2,
    max: 10,
    step: 0.1,
    default: 6.0,
    unit: 'm/s',
    group: 'Duct Design',
  },
  {
    key: 'returnVelocity',
    label: 'Return Duct Velocity',
    type: 'slider',
    min: 2,
    max: 8,
    step: 0.1,
    default: 5.0,
    unit: 'm/s',
    group: 'Duct Design',
  },
  {
    key: 'ahuClearance',
    label: 'AHU Side Clearance',
    type: 'slider',
    min: 0.5,
    max: 2,
    step: 0.1,
    default: 1.0,
    unit: 'm',
    group: 'Equipment',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'supply-velocity-high',
    field: 'supplyVelocity',
    severity: 'error',
    check: (p) => Number(p.supplyVelocity) > 7.6,
    message: 'Supply duct velocity exceeds 7.6 m/s maximum (PMEC / ASHRAE)',
    codeCitation: 'PMEC',
    position: () => [4.5, 1, 5],
  },
  {
    id: 'return-velocity-high',
    field: 'returnVelocity',
    severity: 'error',
    check: (p) => Number(p.returnVelocity) > 6.1,
    message: 'Return duct velocity exceeds 6.1 m/s maximum',
    codeCitation: 'PMEC',
    position: () => [24, 1, 5],
  },
  {
    id: 'ahu-clearance-low',
    field: 'ahuClearance',
    severity: 'warning',
    check: (p) => Number(p.ahuClearance) < 1.0,
    message: 'AHU clearance below 1.0m minimum for maintenance access',
    codeCitation: 'PMEC',
    position: () => [4.5, 1, 25],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-ahu',
    label: 'AHU Location',
    description: 'Central AHU should be in dedicated mechanical room; clearances per PMEC',
    codeCitation: 'PMEC',
    position: () => [4.5, 1.5, 24],
  },
  {
    id: 'ann-supply-return',
    label: 'Supply vs Return Duct',
    description: 'Supply ducts (blue) deliver conditioned air; return ducts (amber) recirculate to AHU',
    codeCitation: 'PMEC',
    position: () => [14.5, 1.5, 5],
  },
  {
    id: 'ann-toilet-exhaust',
    label: 'Toilet Exhaust',
    description: 'Toilets must be exhausted directly to outside; no recirculation to occupied spaces',
    codeCitation: 'PMEC',
    position: () => [24, 1.5, 25],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard Office AHU', values: { systemType: 'central-ahu', supplyVelocity: 6.0, returnVelocity: 5.0, ahuClearance: 1.0 } },
  { label: 'High-Velocity System', values: { systemType: 'vav', supplyVelocity: 7.5, returnVelocity: 6.0, ahuClearance: 1.2 } },
  { label: 'Low-Velocity (Quiet)', values: { systemType: 'fan-coil', supplyVelocity: 4.0, returnVelocity: 3.5, ahuClearance: 1.0 } },
  { label: 'Violation Demo', values: { systemType: 'central-ahu', supplyVelocity: 9.0, returnVelocity: 7.0, ahuClearance: 0.6 } },
]

export const hvacDuctLayoutConfig: FloorPlanConfig = {
  id: 'hvac-duct-layout',
  title: 'HVAC Duct Layout',
  description: 'Floor plan with supply and return duct routing, AHU placement, and duct velocity compliance per PMEC (Philippine Mechanical Engineering Code).',
  subject: 'pmec',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [29, 28],
  camera: { position: [0, 28, 10], fov: 44 },
  scale: 1,
}
