// src/app/dashboard/3d-lab/_config/modules/water-code-easements.ts
// Water Code Easements — Philippine Water Code (PD 1067) / Environmental Planning
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

// Philippine Water Code (PD 1067) Easement Requirements:
// Urban waterways / rivers: 3m easement from bank
// Agricultural areas: 20m easement from bank
// Forest areas: 40m easement from bank
// Lakes / reservoirs: 40m from ordinary high-water mark (natural lake)
// Swamp / marshland: determined by DENR
// Drainage easements also required

const ROOMS: RoomDef[] = [
  // Waterway / river
  { id: 'river', label: 'River / Waterway', bounds: [14, 0, 6, 40], color: '#93c5fd', opacity: 0.65 },
  // Easement zones
  { id: 'easement-left', label: 'Water Code Easement (3m urban)', bounds: [11, 0, 3, 40], color: '#dbeafe', opacity: 0.55, zone: 'setback' },
  { id: 'easement-right', label: 'Water Code Easement (3m urban)', bounds: [20, 0, 3, 40], color: '#dbeafe', opacity: 0.55, zone: 'setback' },
  // Buildable areas
  { id: 'lot-left', label: 'Buildable Area (Left)', bounds: [0, 3, 11, 34], color: '#bbf7d0', opacity: 0.45 },
  { id: 'lot-right', label: 'Buildable Area (Right)', bounds: [23, 3, 13, 34], color: '#bbf7d0', opacity: 0.45 },
  // Development
  { id: 'building-a', label: 'Building A (Compliant)', bounds: [2, 8, 8, 10], color: '#bfdbfe', opacity: 0.65 },
  { id: 'road', label: 'Road', bounds: [0, 38, 36, 3], color: '#d1d5db', opacity: 0.5, zone: 'corridor' },
]

const PATHS: PathDef[] = [
  {
    id: 'river-centerline',
    label: 'River Centerline',
    points: [[17, 0], [17, 40]],
    color: '#3B6B9C',
    width: 4,
  },
  {
    id: 'easement-left-line',
    label: 'Easement Boundary (Left)',
    points: [[11, 0], [11, 40]],
    color: '#D4951A',
    width: 2,
  },
  {
    id: 'easement-right-line',
    label: 'Easement Boundary (Right)',
    points: [[23, 0], [23, 40]],
    color: '#D4951A',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'easement-marker-l',
    label: 'Easement Marker (Left Bank)',
    type: 'custom',
    position: [11, 20],
    color: '#D4951A',
    description: '3m easement from edge of bank — no permanent structures',
    codeCitation: 'PD 1067 Art. 51',
  },
  {
    id: 'easement-marker-r',
    label: 'Easement Marker (Right Bank)',
    type: 'custom',
    position: [23, 20],
    color: '#D4951A',
    description: '3m easement from edge of bank — urban waterway',
    codeCitation: 'PD 1067 Art. 51',
  },
  {
    id: 'building-violation',
    label: 'Building (INSIDE Easement — Violation)',
    type: 'custom',
    position: [12.5, 15],
    color: '#D64545',
    description: 'Structure within 3m easement — prohibited by PD 1067',
    codeCitation: 'PD 1067 Art. 51',
  },
  {
    id: 'drainage-inlet',
    label: 'Drainage Inlet',
    type: 'custom',
    position: [17, 40],
    color: '#6b7280',
    description: 'Storm drainage connects to waterway at river edge',
    codeCitation: 'PD 1067',
  },
  {
    id: 'exit-road',
    label: 'Road Access',
    type: 'exit',
    position: [18, 41],
    color: '#2D9F6F',
    codeCitation: 'PD 1096',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'landUseType',
    label: 'Land Use Context',
    type: 'dropdown',
    default: 'urban',
    options: [
      { value: 'urban', label: 'Urban (3m easement)' },
      { value: 'agricultural', label: 'Agricultural (20m easement)' },
      { value: 'forest', label: 'Forest (40m easement)' },
    ],
    group: 'Context',
  },
  {
    key: 'easementWidth',
    label: 'Easement Width Provided',
    type: 'slider',
    min: 0,
    max: 50,
    step: 0.5,
    default: 3,
    unit: 'm',
    group: 'Easement',
  },
  {
    key: 'structureInEasement',
    label: 'Structure within Easement',
    type: 'toggle',
    default: false,
    group: 'Compliance',
  },
]

const EASEMENT_REQS: Record<string, number> = {
  urban: 3,
  agricultural: 20,
  forest: 40,
}

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'easement-insufficient',
    field: 'easementWidth',
    severity: 'error',
    check: (p) => {
      const required = EASEMENT_REQS[String(p.landUseType)] ?? 3
      return Number(p.easementWidth) < required
    },
    message: 'Easement width below minimum required by Philippine Water Code (PD 1067)',
    codeCitation: 'PD 1067 Art. 51',
    position: () => [11, 1, 20],
  },
  {
    id: 'structure-in-easement',
    field: 'structureInEasement',
    severity: 'error',
    check: (p) => !!p.structureInEasement,
    message: 'No permanent structures permitted within water code easement area',
    codeCitation: 'PD 1067 Art. 51',
    position: () => [12.5, 1, 15],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-easement-def',
    label: 'Water Code Easement',
    description: 'PD 1067 Art. 51: easement reserved for public use along banks of rivers, streams, and waterways',
    codeCitation: 'PD 1067 Art. 51',
    position: () => [11, 1.5, 10],
  },
  {
    id: 'ann-urban-3m',
    label: 'Urban 3m Rule',
    description: 'Urban waterways: 3m from edge of bank. No permanent structures, fences, or fill within easement.',
    codeCitation: 'PD 1067 Art. 51',
    position: () => [11, 1.5, 20],
  },
  {
    id: 'ann-agri',
    label: 'Agricultural 20m Rule',
    description: 'Agricultural lands: 20m easement from bank. Forest lands: 40m from bank.',
    codeCitation: 'PD 1067 Art. 51',
    position: () => [5, 1.5, 20],
  },
]

const PRESETS: Preset[] = [
  { label: 'Urban (3m — Compliant)', values: { landUseType: 'urban', easementWidth: 3, structureInEasement: false } },
  { label: 'Agricultural (20m)', values: { landUseType: 'agricultural', easementWidth: 20, structureInEasement: false } },
  { label: 'Forest (40m)', values: { landUseType: 'forest', easementWidth: 40, structureInEasement: false } },
  { label: 'Violation Demo', values: { landUseType: 'urban', easementWidth: 1.5, structureInEasement: true } },
]

export const waterCodeEasementsConfig: FloorPlanConfig = {
  id: 'water-code-easements',
  title: 'Water Code Easements',
  description: 'Site plan with waterway easement zones per PD 1067 (Philippine Water Code): 3m urban, 20m agricultural, 40m forest, with violation detection.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [36, 41],
  camera: { position: [0, 40, 16], fov: 48 },
  scale: 1,
}
