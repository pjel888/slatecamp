// src/app/dashboard/3d-lab/_config/modules/site-circulation-analysis.ts
// Site Circulation Analysis — Environmental Planning / Planning
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

const ROOMS: RoomDef[] = [
  { id: 'main-building', label: 'Main Building', bounds: [10, 8, 18, 12], color: '#bfdbfe', opacity: 0.6 },
  { id: 'parking-lot', label: 'Parking Area', bounds: [0, 8, 9, 12], color: '#d4d4d8', opacity: 0.45 },
  { id: 'landscape-front', label: 'Front Landscape / Setback', bounds: [0, 0, 38, 7], color: '#bbf7d0', opacity: 0.35 },
  { id: 'landscape-rear', label: 'Rear Landscape', bounds: [0, 21, 38, 7], color: '#bbf7d0', opacity: 0.35 },
  { id: 'service-area', label: 'Service / Loading Area', bounds: [29, 8, 9, 12], color: '#fef9c3', opacity: 0.45 },
  { id: 'drop-off', label: 'Drop-Off Zone', bounds: [10, 5, 8, 3], color: '#fef3c7', opacity: 0.5 },
]

const PATHS: PathDef[] = [
  {
    id: 'vehicle-entry',
    label: 'Vehicular Entry Route',
    points: [[0, 3.5], [5, 3.5], [5, 14], [9, 14]],
    color: '#6b7280',
    width: 4,
    animated: true,
  },
  {
    id: 'vehicle-exit',
    label: 'Vehicular Exit Route',
    points: [[9, 10], [2, 10], [2, 3.5], [0, 3.5]],
    color: '#374151',
    width: 3,
    animated: true,
  },
  {
    id: 'pedestrian-main',
    label: 'Main Pedestrian Path',
    points: [[14, 7], [14, 8]],
    color: '#1B3FC4',
    width: 3,
    animated: true,
  },
  {
    id: 'pedestrian-side',
    label: 'Side Pedestrian Path',
    points: [[10, 14], [0, 14]],
    color: '#60a5fa',
    width: 2,
  },
  {
    id: 'service-route',
    label: 'Service / Delivery Route',
    points: [[38, 3.5], [33, 3.5], [33, 8]],
    color: '#D4951A',
    width: 3,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'main-gate',
    label: 'Main Vehicular Gate',
    type: 'door',
    position: [0, 3.5],
    rotation: 90,
    size: [0.3, 6],
    color: '#6b7280',
    description: 'Min 3.5m clear width per lane; two lanes recommended',
    codeCitation: 'PD 1096 / RROW standard',
  },
  {
    id: 'pedestrian-gate',
    label: 'Pedestrian Gate',
    type: 'door',
    position: [7, 7],
    size: [0.2, 1.5],
    color: '#1B3FC4',
    description: 'Accessible pedestrian entry, min 1.2m clear',
    codeCitation: 'BP 344',
  },
  {
    id: 'service-gate',
    label: 'Service / Loading Gate',
    type: 'door',
    position: [38, 3.5],
    rotation: 90,
    size: [0.3, 4],
    color: '#D4951A',
    description: 'Separate service access from main vehicular entry',
    codeCitation: 'PD 1096',
  },
  {
    id: 'building-exit',
    label: 'Building Exit',
    type: 'exit',
    position: [19, 21],
    color: '#2D9F6F',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'siteType',
    label: 'Site Use Type',
    type: 'dropdown',
    default: 'office',
    options: [
      { value: 'office', label: 'Office / Commercial' },
      { value: 'school', label: 'School / Institutional' },
      { value: 'residential', label: 'Residential Subdivision' },
      { value: 'industrial', label: 'Industrial / Warehouse' },
    ],
    group: 'Site',
  },
  {
    key: 'vehicleGateWidth',
    label: 'Vehicular Gate Width',
    type: 'slider',
    min: 3,
    max: 10,
    step: 0.5,
    default: 6,
    unit: 'm',
    group: 'Circulation',
  },
  {
    key: 'separateServiceEntry',
    label: 'Separate Service Entry',
    type: 'toggle',
    default: true,
    group: 'Circulation',
  },
  {
    key: 'pedestrianSegregated',
    label: 'Pedestrian Path Segregated',
    type: 'toggle',
    default: true,
    group: 'Circulation',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'gate-too-narrow',
    field: 'vehicleGateWidth',
    severity: 'error',
    check: (p) => Number(p.vehicleGateWidth) < 6,
    message: 'Two-way vehicular gate must be ≥ 6.0m wide (2 × 3m lanes)',
    codeCitation: 'PD 1096 Sec. 806',
    position: () => [0, 1, 3.5],
  },
  {
    id: 'no-service-separation',
    field: 'separateServiceEntry',
    severity: 'warning',
    check: (p) => !p.separateServiceEntry && p.siteType === 'industrial',
    message: 'Industrial sites require separate service/delivery entry',
    codeCitation: 'PD 1096',
    position: () => [33, 1, 3.5],
  },
  {
    id: 'no-pedestrian-separation',
    field: 'pedestrianSegregated',
    severity: 'warning',
    check: (p) => !p.pedestrianSegregated,
    message: 'Pedestrian paths should be physically separated from vehicle lanes',
    codeCitation: 'BP 344 / PD 1096',
    position: () => [7, 1, 6],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-conflict-point',
    label: 'Vehicle-Pedestrian Conflict',
    description: 'Grade-level crossings between vehicle and pedestrian paths require clear sightlines and markings',
    codeCitation: 'BP 344 / PD 1096',
    position: () => [7, 1.5, 7],
  },
  {
    id: 'ann-turning-radius',
    label: 'Turning Radius at Entry',
    description: 'Minimum 6.0m turning radius for standard passenger vehicles at gate entry',
    codeCitation: 'PD 1096',
    position: () => [5, 1.5, 3.5],
  },
  {
    id: 'ann-drop-off',
    label: 'Drop-Off Zone',
    description: 'Dedicated drop-off prevents vehicles from blocking main circulation aisle',
    codeCitation: 'PD 1096 / BP 344',
    position: () => [14, 1.5, 5],
  },
]

const PRESETS: Preset[] = [
  { label: 'Office Complex', values: { siteType: 'office', vehicleGateWidth: 6, separateServiceEntry: true, pedestrianSegregated: true } },
  { label: 'School Campus', values: { siteType: 'school', vehicleGateWidth: 8, separateServiceEntry: false, pedestrianSegregated: true } },
  { label: 'Industrial', values: { siteType: 'industrial', vehicleGateWidth: 9, separateServiceEntry: true, pedestrianSegregated: true } },
  { label: 'Violation Demo', values: { siteType: 'industrial', vehicleGateWidth: 4, separateServiceEntry: false, pedestrianSegregated: false } },
]

export const siteCirculationAnalysisConfig: FloorPlanConfig = {
  id: 'site-circulation-analysis',
  title: 'Site Circulation Analysis',
  description: 'Site plan showing vehicular and pedestrian circulation patterns, conflict points, and access compliance for environmental planning review.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [38, 28],
  camera: { position: [0, 32, 12], fov: 46 },
  scale: 1,
}
