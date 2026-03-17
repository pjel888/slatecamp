// src/app/dashboard/3d-lab/_config/modules/fault-line-setback.ts
// Fault Line Setback — Environmental Planning / PHIVOLCS
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

// PHIVOLCS Fault Line Setback Rules:
// Active fault (PHIVOLCS-identified): min 5m setback from fault trace
// Critical facilities (hospitals, schools, emergency services): stricter setbacks
// No permanent habitable structures within 5m of active fault
// Geologic investigation required within 10m of fault trace
// Non-critical structures: 5m min; critical: consult PHIVOLCS

const ROOMS: RoomDef[] = [
  // Active fault zone
  { id: 'fault-zone', label: 'Active Fault Zone (No Build)', bounds: [14, 0, 4, 40], color: '#fca5a5', opacity: 0.55, zone: 'fault' },
  // 5m setback zones on both sides
  { id: 'setback-left', label: '5m Setback Zone (Left)', bounds: [9, 0, 5, 40], color: '#fef3c7', opacity: 0.5, zone: 'setback' },
  { id: 'setback-right', label: '5m Setback Zone (Right)', bounds: [18, 0, 5, 40], color: '#fef3c7', opacity: 0.5, zone: 'setback' },
  // Investigation zone (10m)
  { id: 'investigation-left', label: 'Geo-Investigation Zone (10m left)', bounds: [4, 0, 5, 40], color: '#fef9c3', opacity: 0.35 },
  { id: 'investigation-right', label: 'Geo-Investigation Zone (10m right)', bounds: [23, 0, 5, 40], color: '#fef9c3', opacity: 0.35 },
  // Buildable areas
  { id: 'buildable-left', label: 'Buildable Area (Left of fault)', bounds: [0, 0, 4, 40], color: '#bbf7d0', opacity: 0.45 },
  { id: 'buildable-right', label: 'Buildable Area (Right of fault)', bounds: [28, 0, 10, 40], color: '#bbf7d0', opacity: 0.45 },
  // Proposed buildings
  { id: 'building-a', label: 'Building A (Compliant — 6m from fault)', bounds: [2, 10, 4, 8], color: '#bfdbfe', opacity: 0.7 },
  { id: 'building-b', label: 'Building B (Compliant — 6m from fault)', bounds: [32, 10, 5, 8], color: '#bfdbfe', opacity: 0.7 },
  // Road
  { id: 'road', label: 'Service Road', bounds: [0, 38, 38, 3], color: '#d4d4d8', opacity: 0.45, zone: 'corridor' },
]

const PATHS: PathDef[] = [
  {
    id: 'fault-trace',
    label: 'Active Fault Trace',
    points: [[16, 0], [16, 40]],
    color: '#D64545',
    width: 3,
    animated: true,
  },
  {
    id: 'setback-left-line',
    label: 'Left 5m Setback Boundary',
    points: [[9, 0], [9, 40]],
    color: '#D4951A',
    width: 2,
  },
  {
    id: 'setback-right-line',
    label: 'Right 5m Setback Boundary',
    points: [[23, 0], [23, 40]],
    color: '#D4951A',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'fault-marker-1',
    label: 'Fault Trace Marker',
    type: 'custom',
    position: [16, 5],
    color: '#D64545',
    description: 'PHIVOLCS-identified active fault — continuous surface rupture hazard',
    codeCitation: 'PHIVOLCS / NSCP',
  },
  {
    id: 'fault-marker-2',
    label: 'Fault Trace Marker',
    type: 'custom',
    position: [16, 20],
    color: '#D64545',
    codeCitation: 'PHIVOLCS',
  },
  {
    id: 'setback-post-left',
    label: 'Setback Boundary Post (Left)',
    type: 'custom',
    position: [9, 20],
    color: '#D4951A',
    description: 'Min 5m from fault trace — no habitable structures beyond this point toward fault',
    codeCitation: 'PHIVOLCS',
  },
  {
    id: 'setback-post-right',
    label: 'Setback Boundary Post (Right)',
    type: 'custom',
    position: [23, 20],
    color: '#D4951A',
    codeCitation: 'PHIVOLCS',
  },
  {
    id: 'violation-building',
    label: 'Building (INSIDE Setback — Violation)',
    type: 'custom',
    position: [11.5, 25],
    color: '#D64545',
    description: 'Habitable structure within 5m fault setback — prohibited',
    codeCitation: 'PHIVOLCS',
  },
  {
    id: 'geologic-survey',
    label: 'Geologic Investigation Area',
    type: 'custom',
    position: [6.5, 10],
    color: '#7c3aed',
    description: 'Within 10m of fault: detailed geologic investigation required before any construction',
    codeCitation: 'PHIVOLCS / NSCP',
  },
  {
    id: 'exit-road',
    label: 'Road Access',
    type: 'exit',
    position: [19, 41],
    color: '#2D9F6F',
    codeCitation: 'PD 1096',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'setbackProvided',
    label: 'Setback Provided from Fault',
    type: 'slider',
    min: 0,
    max: 30,
    step: 0.5,
    default: 5,
    unit: 'm',
    group: 'Setback',
  },
  {
    key: 'faultActivity',
    label: 'Fault Activity Status',
    type: 'dropdown',
    default: 'active',
    options: [
      { value: 'active', label: 'Active (PHIVOLCS-identified)' },
      { value: 'potentially-active', label: 'Potentially Active' },
      { value: 'inactive', label: 'Inactive / Historical' },
    ],
    group: 'Geology',
  },
  {
    key: 'buildingType',
    label: 'Building Use Type',
    type: 'dropdown',
    default: 'residential',
    options: [
      { value: 'residential', label: 'Residential' },
      { value: 'critical', label: 'Critical Facility (Hospital/School)' },
      { value: 'industrial', label: 'Industrial' },
    ],
    group: 'Development',
  },
  {
    key: 'geoInvestigation',
    label: 'Geologic Investigation Done',
    type: 'toggle',
    default: false,
    group: 'Compliance',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'setback-insufficient',
    field: 'setbackProvided',
    severity: 'error',
    check: (p) => p.faultActivity === 'active' && Number(p.setbackProvided) < 5,
    message: 'Setback from active fault must be ≥ 5m per PHIVOLCS guidelines',
    codeCitation: 'PHIVOLCS',
    position: () => [11.5, 1, 20],
  },
  {
    id: 'critical-setback-low',
    field: 'setbackProvided',
    severity: 'warning',
    check: (p) => p.buildingType === 'critical' && Number(p.setbackProvided) < 10,
    message: 'Critical facilities should maintain greater setback; consult PHIVOLCS for site-specific assessment',
    codeCitation: 'PHIVOLCS / NSCP',
    position: () => [11.5, 1, 15],
  },
  {
    id: 'no-geo-investigation',
    field: 'geoInvestigation',
    severity: 'warning',
    check: (p) => !p.geoInvestigation && Number(p.setbackProvided) < 10,
    message: 'Geologic investigation required for sites within 10m of identified fault trace',
    codeCitation: 'PHIVOLCS / NSCP',
    position: () => [6.5, 1, 10],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-fault-def',
    label: 'Active Fault Classification',
    description: 'PHIVOLCS defines active faults as those that have moved in the last 10,000 years (Holocene); shown on PHIVOLCS fault maps',
    codeCitation: 'PHIVOLCS',
    position: () => [16, 1.5, 10],
  },
  {
    id: 'ann-5m-rule',
    label: '5m Minimum Setback',
    description: 'No permanent habitable structures within 5m of active fault trace; applies to both sides of fault',
    codeCitation: 'PHIVOLCS',
    position: () => [11, 1.5, 20],
  },
  {
    id: 'ann-geo-inv',
    label: 'Geologic Investigation Zone',
    description: 'Within 10m of fault: geologic investigation (trench study, borehole) required before building permit is granted',
    codeCitation: 'PHIVOLCS / NSCP',
    position: () => [6.5, 1.5, 20],
  },
]

const PRESETS: Preset[] = [
  { label: 'Active Fault (5m setback)', values: { setbackProvided: 5, faultActivity: 'active', buildingType: 'residential', geoInvestigation: true } },
  { label: 'Critical Facility (10m+)', values: { setbackProvided: 12, faultActivity: 'active', buildingType: 'critical', geoInvestigation: true } },
  { label: 'Potentially Active (5m)', values: { setbackProvided: 5, faultActivity: 'potentially-active', buildingType: 'residential', geoInvestigation: false } },
  { label: 'Violation Demo', values: { setbackProvided: 2, faultActivity: 'active', buildingType: 'critical', geoInvestigation: false } },
]

export const faultLineSetbackConfig: FloorPlanConfig = {
  id: 'fault-line-setback',
  title: 'Fault Line Setback',
  description: 'Site plan with PHIVOLCS-identified active fault trace, 5m minimum setback zones, geologic investigation area, and habitable structure prohibition.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [38, 41],
  camera: { position: [0, 40, 16], fov: 48 },
  scale: 1,
}
