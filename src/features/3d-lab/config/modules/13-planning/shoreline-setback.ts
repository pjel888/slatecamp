// src/app/dashboard/3d-lab/_config/modules/shoreline-setback.ts
// Shoreline Setback — Environmental Planning / DENR / Water Code
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

// Philippine Shoreline Setback Rules:
// RA 8550 (Fisheries Code): 20m buffer from high-water mark for fish sanctuary
// PD 1067 (Water Code): coastal easement from high-water mark
// DENR DAO: 20m mandatory setback from mean high water line
// NIPAS (National Integrated Protected Areas System): stricter rules in protected areas
// Local ordinances may impose additional setbacks

const ROOMS: RoomDef[] = [
  // Seawater / coastal area
  { id: 'sea', label: 'Sea / Coastal Waters', bounds: [0, 0, 36, 8], color: '#93c5fd', opacity: 0.65 },
  // High-water mark line
  { id: 'intertidal', label: 'Intertidal Zone', bounds: [0, 8, 36, 2], color: '#60a5fa', opacity: 0.45 },
  // 20m setback zone
  { id: 'setback-zone', label: '20m Setback Zone (No Build)', bounds: [0, 10, 36, 20], color: '#fef3c7', opacity: 0.5, zone: 'setback' },
  // Buildable area
  { id: 'buildable', label: 'Buildable Area (Beyond 20m)', bounds: [0, 30, 36, 16], color: '#bbf7d0', opacity: 0.45 },
  // Beach access path
  { id: 'beach-access', label: 'Public Beach Access Path', bounds: [16, 8, 4, 22], color: '#d1fae5', opacity: 0.4, zone: 'corridor' },
  // Proposed development
  { id: 'resort-building', label: 'Resort Building (Compliant)', bounds: [4, 32, 10, 8], color: '#bfdbfe', opacity: 0.65 },
  { id: 'road', label: 'Coastal Road', bounds: [0, 45, 36, 3], color: '#d1d5db', opacity: 0.5, zone: 'corridor' },
]

const PATHS: PathDef[] = [
  {
    id: 'high-water-mark',
    label: 'Mean High-Water Mark',
    points: [[0, 10], [36, 10]],
    color: '#1B3FC4',
    width: 3,
  },
  {
    id: 'setback-boundary',
    label: '20m Setback Boundary (Build Line)',
    points: [[0, 30], [36, 30]],
    color: '#D64545',
    width: 3,
  },
  {
    id: 'public-access',
    label: 'Public Shoreline Access',
    points: [[18, 8], [18, 30]],
    color: '#2D9F6F',
    width: 2,
    animated: true,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'hwm-marker-left',
    label: 'High-Water Mark Datum Point',
    type: 'custom',
    position: [2, 10],
    color: '#1B3FC4',
    description: 'Mean high-water mark: baseline for 20m setback measurement',
    codeCitation: 'PD 1067 / DENR DAO',
  },
  {
    id: 'hwm-marker-right',
    label: 'High-Water Mark Datum',
    type: 'custom',
    position: [34, 10],
    color: '#1B3FC4',
    codeCitation: 'PD 1067',
  },
  {
    id: 'setback-marker',
    label: '20m Setback Marker',
    type: 'custom',
    position: [2, 30],
    color: '#D64545',
    description: '20m from high-water mark — no permanent structures seaward of this line',
    codeCitation: 'RA 8550 / PD 1067',
  },
  {
    id: 'violation-structure',
    label: 'Structure INSIDE Setback (Violation)',
    type: 'custom',
    position: [26, 18],
    color: '#D64545',
    description: 'Permanent structure within 20m setback — prohibited',
    codeCitation: 'RA 8550 / PD 1067',
  },
  {
    id: 'public-access-sign',
    label: 'Public Beach Access (Required)',
    type: 'custom',
    position: [18, 9],
    color: '#2D9F6F',
    description: 'Public access to shoreline must be maintained — cannot be blocked by private development',
    codeCitation: 'PD 1067',
  },
  {
    id: 'exit-road',
    label: 'Road Exit',
    type: 'exit',
    position: [18, 48],
    color: '#2D9F6F',
    codeCitation: 'PD 1096',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'setbackDistance',
    label: 'Setback Distance Provided',
    type: 'slider',
    min: 5,
    max: 50,
    step: 1,
    default: 20,
    unit: 'm',
    group: 'Setback',
  },
  {
    key: 'coastalZoneType',
    label: 'Coastal Zone Classification',
    type: 'dropdown',
    default: 'general',
    options: [
      { value: 'general', label: 'General Coastal (20m)' },
      { value: 'protected', label: 'Protected Area / NIPAS (stricter)' },
      { value: 'mangrove', label: 'Mangrove Zone (50m+)' },
    ],
    group: 'Zone',
  },
  {
    key: 'publicAccessProvided',
    label: 'Public Beach Access Provided',
    type: 'toggle',
    default: true,
    group: 'Compliance',
  },
  {
    key: 'structureInSetback',
    label: 'Permanent Structure in Setback',
    type: 'toggle',
    default: false,
    group: 'Compliance',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'setback-too-short',
    field: 'setbackDistance',
    severity: 'error',
    check: (p) => Number(p.setbackDistance) < 20,
    message: 'Shoreline setback below 20m minimum from mean high-water mark',
    codeCitation: 'RA 8550 / PD 1067 / DENR DAO',
    position: () => [18, 1, 20],
  },
  {
    id: 'structure-in-setback',
    field: 'structureInSetback',
    severity: 'error',
    check: (p) => !!p.structureInSetback,
    message: 'Permanent structure within 20m shoreline setback is prohibited',
    codeCitation: 'RA 8550 / PD 1067',
    position: () => [26, 1, 18],
  },
  {
    id: 'no-public-access',
    field: 'publicAccessProvided',
    severity: 'warning',
    check: (p) => !p.publicAccessProvided,
    message: 'Public access to shoreline must be maintained; cannot be blocked by private development',
    codeCitation: 'PD 1067',
    position: () => [18, 1, 10],
  },
  {
    id: 'protected-area-warning',
    field: 'coastalZoneType',
    severity: 'warning',
    check: (p) => p.coastalZoneType === 'protected' && Number(p.setbackDistance) < 50,
    message: 'Protected coastal areas (NIPAS) may require setbacks beyond 20m — verify with DENR',
    codeCitation: 'RA 7586 (NIPAS Act)',
    position: () => [18, 1, 25],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-hwm',
    label: 'Mean High-Water Mark',
    description: 'Baseline for setback measurement; determined by tidal data and NAMRIA surveys',
    codeCitation: 'PD 1067',
    position: () => [18, 1.5, 10],
  },
  {
    id: 'ann-20m',
    label: '20m Mandatory Setback',
    description: 'No permanent structures within 20m of high-water mark; temporary structures (cottages) may be allowed with LGU permit',
    codeCitation: 'RA 8550 / DENR DAO',
    position: () => [18, 1.5, 20],
  },
  {
    id: 'ann-buildable',
    label: 'Buildable Zone',
    description: 'Development beyond 20m setback; still subject to HLURB, PD 957/BP 220, and local zoning ordinances',
    codeCitation: 'PD 1067 / HLURB',
    position: () => [9, 1.5, 36],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard Coastal (20m)', values: { setbackDistance: 20, coastalZoneType: 'general', publicAccessProvided: true, structureInSetback: false } },
  { label: 'Protected Area (50m)', values: { setbackDistance: 50, coastalZoneType: 'protected', publicAccessProvided: true, structureInSetback: false } },
  { label: 'Mangrove Zone', values: { setbackDistance: 50, coastalZoneType: 'mangrove', publicAccessProvided: true, structureInSetback: false } },
  { label: 'Violation Demo', values: { setbackDistance: 8, coastalZoneType: 'general', publicAccessProvided: false, structureInSetback: true } },
]

export const shorelineSetbackConfig: FloorPlanConfig = {
  id: 'shoreline-setback',
  title: 'Shoreline Setback',
  description: 'Coastal site plan showing the 20m mandatory setback from mean high-water mark per RA 8550, PD 1067, and DENR regulations.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [36, 48],
  camera: { position: [0, 46, 18], fov: 48 },
  scale: 1,
}

