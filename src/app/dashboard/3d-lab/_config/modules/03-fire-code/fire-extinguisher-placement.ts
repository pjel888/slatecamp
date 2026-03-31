// src/app/dashboard/3d-lab/_config/modules/fire-extinguisher-placement.ts
// Fire Extinguisher Placement — RA 9514 (Fire Code of the Philippines)
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

// RA 9514 Fire Extinguisher requirements:
// Max travel distance: 23m (Class A), 15m (Class B/C higher hazard)
// Mounted: 1.0–1.5m from floor to top of extinguisher
// Inspection: annual; monthly visual check
// Class A: water/foam/dry chem — offices, paper, wood
// Class B: CO2/dry chem — flammable liquids
// Class C: CO2/dry chem — electrical

const ROOMS: RoomDef[] = [
  { id: 'office-main', label: 'Main Office Area', bounds: [0, 0, 22, 14], color: '#bfdbfe', opacity: 0.45 },
  { id: 'server-room', label: 'Server Room (Class C)', bounds: [23, 0, 9, 8], color: '#fee2e2', opacity: 0.5 },
  { id: 'kitchen', label: 'Pantry / Kitchen (Class B)', bounds: [23, 9, 9, 5], color: '#fef9c3', opacity: 0.5 },
  { id: 'lobby', label: 'Lobby', bounds: [0, 15, 12, 7], color: '#d1fae5', opacity: 0.45 },
  { id: 'corridor', label: 'Corridor', bounds: [13, 15, 19, 4], color: '#d4d4d8', opacity: 0.35, zone: 'corridor' },
  { id: 'storage', label: 'Storage (Moderate Hazard)', bounds: [13, 19, 19, 3], color: '#fef3c7', opacity: 0.45 },
]

const PATHS: PathDef[] = [
  {
    id: 'coverage-path-1',
    label: 'Extinguisher A: 23m Coverage Radius',
    points: [[5.5, 7], [5.5, 17], [11.5, 17]],
    color: '#D64545',
    width: 2,
    animated: false,
  },
  {
    id: 'coverage-path-2',
    label: 'Extinguisher B: 23m Coverage Radius',
    points: [[17, 7], [17, 17], [11.5, 17]],
    color: '#D64545',
    width: 2,
  },
  {
    id: 'egress-main',
    label: 'Main Egress Path',
    points: [[11, 0], [11, 22]],
    color: '#2D9F6F',
    width: 2,
    animated: true,
  },
]

const FIXTURES: FixtureDef[] = [
  // Class A extinguishers (offices)
  {
    id: 'ext-a1',
    label: 'Extinguisher A1 (Class A)',
    type: 'extinguisher',
    position: [5.5, 7],
    color: '#D64545',
    description: 'ABC Dry Chemical — max 23m travel distance',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'ext-a2',
    label: 'Extinguisher A2 (Class A)',
    type: 'extinguisher',
    position: [17, 7],
    color: '#D64545',
    description: 'ABC Dry Chemical',
    codeCitation: 'RA 9514',
  },
  {
    id: 'ext-lobby',
    label: 'Extinguisher — Lobby (Class A)',
    type: 'extinguisher',
    position: [5.5, 18.5],
    color: '#D64545',
    codeCitation: 'RA 9514',
  },
  // Class C extinguisher (server room)
  {
    id: 'ext-server',
    label: 'CO₂ Extinguisher — Server (Class C)',
    type: 'extinguisher',
    position: [24, 4],
    color: '#7c3aed',
    description: 'CO₂ — safe for live electrical equipment',
    codeCitation: 'RA 9514',
  },
  // Class B/C extinguisher (kitchen)
  {
    id: 'ext-kitchen',
    label: 'CO₂ Extinguisher — Kitchen (Class B)',
    type: 'extinguisher',
    position: [24, 11.5],
    color: '#7c3aed',
    description: 'CO₂ or Dry Chemical for flammable liquids',
    codeCitation: 'RA 9514',
  },
  { id: 'exit-main', label: 'EXIT', type: 'exit', position: [6, 22], color: '#2D9F6F', codeCitation: 'RA 9514' },
  { id: 'exit-side', label: 'EXIT', type: 'exit', position: [25, 22], color: '#2D9F6F', codeCitation: 'RA 9514' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'hazardClass',
    label: 'Occupancy Hazard',
    type: 'dropdown',
    default: 'light',
    options: [
      { value: 'light', label: 'Light Hazard (Offices)' },
      { value: 'ordinary', label: 'Ordinary Hazard (Retail)' },
      { value: 'extra', label: 'Extra Hazard (Industrial)' },
    ],
    group: 'Hazard',
  },
  {
    key: 'maxTravelDistance',
    label: 'Max Travel Distance Provided',
    type: 'slider',
    min: 5,
    max: 30,
    step: 0.5,
    default: 23,
    unit: 'm',
    group: 'Placement',
  },
  {
    key: 'extinguisherRating',
    label: 'Extinguisher Rating',
    type: 'dropdown',
    default: '2A10BC',
    options: [
      { value: '1A5BC', label: '1A:5B:C (Small)' },
      { value: '2A10BC', label: '2A:10B:C (Standard)' },
      { value: '4A60BC', label: '4A:60B:C (Large)' },
    ],
    group: 'Equipment',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'travel-distance-exceeded',
    field: 'maxTravelDistance',
    severity: 'error',
    check: (p) => Number(p.maxTravelDistance) > 23,
    message: 'Travel distance to extinguisher exceeds 23m maximum (Class A hazard)',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [11, 1, 11],
  },
  {
    id: 'extra-hazard-distance',
    field: 'maxTravelDistance',
    severity: 'error',
    check: (p) => p.hazardClass === 'extra' && Number(p.maxTravelDistance) > 15,
    message: 'Extra hazard: max travel distance is 15m for Class B/C extinguishers',
    codeCitation: 'RA 9514',
    position: () => [11, 1, 15],
  },
  {
    id: 'under-rated',
    field: 'extinguisherRating',
    severity: 'warning',
    check: (p) => p.hazardClass === 'extra' && p.extinguisherRating === '1A5BC',
    message: '1A:5B:C rating may be insufficient for extra hazard; use 4A:60B:C or larger',
    codeCitation: 'RA 9514',
    position: () => [5.5, 1, 7],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-travel-dist',
    label: '23m Travel Distance Rule',
    description: 'Any point in the building must be within 23m walking distance of a Class A extinguisher',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [11, 1.5, 7],
  },
  {
    id: 'ann-class-c',
    label: 'Electrical Area: CO₂ Only',
    description: 'Server rooms and electrical panels require CO₂ or dry chemical; never water-based',
    codeCitation: 'RA 9514',
    position: () => [27.5, 1.5, 4],
  },
  {
    id: 'ann-mounting',
    label: 'Mounting Height',
    description: 'Extinguishers mounted at 1.0–1.5m (top of handle); visible and accessible, never behind doors',
    codeCitation: 'RA 9514',
    position: () => [5.5, 1.5, 18.5],
  },
]

const PRESETS: Preset[] = [
  { label: 'Light Hazard Office', values: { hazardClass: 'light', maxTravelDistance: 23, extinguisherRating: '2A10BC' } },
  { label: 'Retail (Ordinary)', values: { hazardClass: 'ordinary', maxTravelDistance: 20, extinguisherRating: '2A10BC' } },
  { label: 'Workshop (Extra)', values: { hazardClass: 'extra', maxTravelDistance: 15, extinguisherRating: '4A60BC' } },
  { label: 'Violation Demo', values: { hazardClass: 'extra', maxTravelDistance: 25, extinguisherRating: '1A5BC' } },
]

export const fireExtinguisherPlacementConfig: FloorPlanConfig = {
  id: 'fire-extinguisher-placement',
  title: 'Fire Extinguisher Placement',
  description: 'Floor plan with extinguisher locations, 23m maximum travel distance coverage, and class-specific placement per RA 9514.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [32, 22],
  camera: { position: [0, 26, 8], fov: 44 },
  scale: 1,
}
