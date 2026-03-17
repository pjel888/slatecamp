// src/app/dashboard/3d-lab/_config/modules/fire-zone-classification.ts
// Fire Zone Classification — RA 9514 (Fire Code of the Philippines)
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

// RA 9514 Fire Zones:
// Zone 1 — Low hazard (residential, offices)
// Zone 2 — Moderate hazard (commercial, light industry)
// Zone 3 — High hazard (heavy industry, warehouses with flammable materials)

const ROOMS: RoomDef[] = [
  { id: 'zone1-office', label: 'Zone 1 — Offices (Low Hazard)', bounds: [0, 0, 14, 12], color: '#bbf7d0', opacity: 0.5, zone: 'zone1' },
  { id: 'zone1-lobby', label: 'Zone 1 — Lobby (Low Hazard)', bounds: [0, 12, 14, 6], color: '#bbf7d0', opacity: 0.4, zone: 'zone1' },
  { id: 'zone2-retail', label: 'Zone 2 — Retail (Moderate Hazard)', bounds: [15, 0, 14, 10], color: '#fef9c3', opacity: 0.55, zone: 'zone2' },
  { id: 'zone2-storage', label: 'Zone 2 — General Storage', bounds: [15, 10, 14, 8], color: '#fef9c3', opacity: 0.5, zone: 'zone2' },
  { id: 'zone3-workshop', label: 'Zone 3 — Workshop (High Hazard)', bounds: [0, 19, 29, 8], color: '#fee2e2', opacity: 0.55, zone: 'zone3' },
  { id: 'fire-wall', label: 'Fire Wall / Separation', bounds: [14, 0, 1, 18], color: '#71717a', opacity: 0.8 },
  { id: 'corridor', label: 'Egress Corridor', bounds: [0, 18, 29, 1], color: '#d4d4d8', opacity: 0.4, zone: 'corridor' },
]

const PATHS: PathDef[] = [
  {
    id: 'path-zone1-exit',
    label: 'Zone 1 → Exit A',
    points: [[7, 6], [7, 18.5], [1, 18.5], [1, 27.5]],
    color: '#2D9F6F',
    width: 3,
    animated: true,
  },
  {
    id: 'path-zone3-exit',
    label: 'Zone 3 → Exit B',
    points: [[14.5, 23], [28, 23], [28, 27.5]],
    color: '#D64545',
    width: 3,
    animated: true,
  },
  {
    id: 'path-zone2-exit',
    label: 'Zone 2 → Exit A',
    points: [[22, 9], [22, 18.5], [14.5, 18.5], [1, 18.5], [1, 27.5]],
    color: '#D4951A',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'exit-a',
    label: 'EXIT A',
    type: 'exit',
    position: [1, 28],
    color: '#2D9F6F',
    description: 'Primary exit serving Zones 1 & 2',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'exit-b',
    label: 'EXIT B (Zone 3 Dedicated)',
    type: 'exit',
    position: [28, 28],
    color: '#D64545',
    description: 'Dedicated exit for high-hazard Zone 3',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'extinguisher-zone3',
    label: 'Class ABC Extinguisher (Zone 3)',
    type: 'extinguisher',
    position: [14.5, 23],
    color: '#D64545',
    codeCitation: 'RA 9514',
  },
  {
    id: 'fire-door',
    label: 'Fire-Rated Door',
    type: 'door',
    position: [14.5, 10],
    rotation: 0,
    size: [1, 0.2],
    color: '#78716c',
    description: '1.5-hour fire-rated door in fire wall',
    codeCitation: 'RA 9514',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'zone3Sprinklered',
    label: 'Zone 3 Sprinkler System',
    type: 'toggle',
    default: false,
    group: 'Systems',
  },
  {
    key: 'firewallRating',
    label: 'Fire Wall Rating',
    type: 'dropdown',
    default: '2hr',
    options: [
      { value: '1hr', label: '1-Hour Rating' },
      { value: '2hr', label: '2-Hour Rating' },
      { value: '3hr', label: '3-Hour Rating' },
      { value: '4hr', label: '4-Hour Rating' },
    ],
    group: 'Construction',
  },
  {
    key: 'zone3Use',
    label: 'Zone 3 Use Type',
    type: 'dropdown',
    default: 'workshop',
    options: [
      { value: 'workshop', label: 'Workshop / Fabrication' },
      { value: 'flammable-storage', label: 'Flammable Liquid Storage' },
      { value: 'paint-shop', label: 'Paint Shop' },
    ],
    group: 'Occupancy',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'zone3-no-sprinkler',
    field: 'zone3Sprinklered',
    severity: 'error',
    check: (p) => !p.zone3Sprinklered && p.zone3Use === 'flammable-storage',
    message: 'Flammable liquid storage (Zone 3) requires mandatory sprinkler system',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [14.5, 1, 22],
  },
  {
    id: 'firewall-rating-low',
    field: 'firewallRating',
    severity: 'warning',
    check: (p) => p.firewallRating === '1hr' && p.zone3Use !== 'workshop',
    message: '1-hour fire wall insufficient for high-hazard Zone 3 occupancy',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [14.5, 1, 10],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-zone-boundary',
    label: 'Fire Zone Boundary',
    description: 'Fire walls separate occupancies of different hazard classifications; must be continuous from foundation to roof',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [14.5, 1.5, 9],
  },
  {
    id: 'ann-zone3-req',
    label: 'Zone 3 Requirements',
    description: 'High-hazard occupancies require additional suppression, detection, and dedicated egress',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [14.5, 1.5, 22],
  },
  {
    id: 'ann-fire-door',
    label: 'Fire Door Rating',
    description: 'Openings in fire walls require fire-rated doors; rating must be ≥ ¾ of wall rating',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [14.5, 1.5, 14],
  },
]

const PRESETS: Preset[] = [
  { label: 'Mixed Office + Retail', values: { zone3Sprinklered: false, firewallRating: '2hr', zone3Use: 'workshop' } },
  { label: 'Paint Shop (High Risk)', values: { zone3Sprinklered: true, firewallRating: '3hr', zone3Use: 'paint-shop' } },
  { label: 'Flammable Storage', values: { zone3Sprinklered: true, firewallRating: '4hr', zone3Use: 'flammable-storage' } },
  { label: 'Violation Demo', values: { zone3Sprinklered: false, firewallRating: '1hr', zone3Use: 'flammable-storage' } },
]

export const fireZoneClassificationConfig: FloorPlanConfig = {
  id: 'fire-zone-classification',
  title: 'Fire Zone Classification',
  description: 'Building floor plan showing fire zone boundaries (Zone 1/2/3), fire walls, and zone-specific egress requirements per RA 9514.',
  subject: 'ra-9514',
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
