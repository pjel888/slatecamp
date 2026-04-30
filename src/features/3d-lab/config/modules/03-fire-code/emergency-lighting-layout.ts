// src/features/3d-lab/config/modules/emergency-lighting-layout.ts
// Emergency Lighting Layout — RA 9514 / PEC
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

// RA 9514 / PEC Emergency Lighting:
// Min 10.8 lux at floor level along egress paths
// Battery backup: min 90 minutes
// Exit signs: illuminated, min 50 lux face
// Self-contained or central battery system

const ROOMS: RoomDef[] = [
  { id: 'office-wing-a', label: 'Office Wing A', bounds: [0, 0, 15, 12], color: '#bfdbfe', opacity: 0.4 },
  { id: 'office-wing-b', label: 'Office Wing B', bounds: [16, 0, 15, 12], color: '#bfdbfe', opacity: 0.4 },
  { id: 'conference', label: 'Conference Room', bounds: [0, 13, 12, 7], color: '#c7d2fe', opacity: 0.45 },
  { id: 'breakroom', label: 'Break Room', bounds: [13, 13, 18, 7], color: '#d1fae5', opacity: 0.45 },
  { id: 'corridor', label: 'Main Egress Corridor', bounds: [0, 20, 31, 3.5], color: '#d4d4d8', opacity: 0.45, zone: 'corridor' },
  { id: 'stair-a', label: 'Stairwell A', bounds: [0, 23.5, 6, 5], color: '#fef9c3', opacity: 0.55 },
  { id: 'stair-b', label: 'Stairwell B', bounds: [25, 23.5, 6, 5], color: '#fef9c3', opacity: 0.55 },
]

const PATHS: PathDef[] = [
  {
    id: 'egress-path-a',
    label: 'Primary Egress Path — Exit A',
    points: [[7.5, 6], [7.5, 21.75], [3, 21.75], [3, 26]],
    color: '#2D9F6F',
    width: 3,
    animated: true,
  },
  {
    id: 'egress-path-b',
    label: 'Primary Egress Path — Exit B',
    points: [[23.5, 6], [23.5, 21.75], [28, 21.75], [28, 26]],
    color: '#2D9F6F',
    width: 3,
    animated: true,
  },
  {
    id: 'em-light-span',
    label: 'Emergency Lighting Coverage Band',
    points: [[0, 21.75], [31, 21.75]],
    color: '#fbbf24',
    width: 4,
  },
]

const FIXTURES: FixtureDef[] = [
  // Emergency luminaires along corridor (spaced ≤6m apart)
  { id: 'em-1', label: 'Emergency Luminaire', type: 'custom', position: [3, 21.75], color: '#fbbf24', description: 'Min 10.8 lux, 90-min battery', codeCitation: 'RA 9514 / PEC' },
  { id: 'em-2', label: 'Emergency Luminaire', type: 'custom', position: [9, 21.75], color: '#fbbf24', codeCitation: 'RA 9514 / PEC' },
  { id: 'em-3', label: 'Emergency Luminaire', type: 'custom', position: [15.5, 21.75], color: '#fbbf24', codeCitation: 'RA 9514 / PEC' },
  { id: 'em-4', label: 'Emergency Luminaire', type: 'custom', position: [22, 21.75], color: '#fbbf24', codeCitation: 'RA 9514 / PEC' },
  { id: 'em-5', label: 'Emergency Luminaire', type: 'custom', position: [28, 21.75], color: '#fbbf24', codeCitation: 'RA 9514 / PEC' },
  // Emergency lights in stairwells
  { id: 'em-stair-a', label: 'Stair A Emergency Light', type: 'custom', position: [3, 26], color: '#fbbf24', codeCitation: 'RA 9514' },
  { id: 'em-stair-b', label: 'Stair B Emergency Light', type: 'custom', position: [28, 26], color: '#fbbf24', codeCitation: 'RA 9514' },
  // Illuminated exit signs
  { id: 'exit-sign-a', label: 'EXIT Sign (Illuminated)', type: 'exit', position: [3, 20], color: '#2D9F6F', description: 'Min 50 lux on face; self-luminous or electrically illuminated', codeCitation: 'RA 9514' },
  { id: 'exit-sign-b', label: 'EXIT Sign (Illuminated)', type: 'exit', position: [28, 20], color: '#2D9F6F', codeCitation: 'RA 9514' },
  // Transfer switch
  { id: 'ats', label: 'Automatic Transfer Switch', type: 'custom', position: [15.5, 28.5], color: '#7c3aed', description: 'ATS: transfers to emergency power within 10s', codeCitation: 'PEC' },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'minLux',
    label: 'Minimum Egress Illuminance',
    type: 'slider',
    min: 2,
    max: 50,
    step: 1,
    default: 10.8,
    unit: 'lux',
    group: 'Illuminance',
  },
  {
    key: 'batteryDuration',
    label: 'Battery Backup Duration',
    type: 'slider',
    min: 30,
    max: 180,
    step: 15,
    default: 90,
    unit: 'min',
    group: 'System',
  },
  {
    key: 'luminaireSpacing',
    label: 'Luminaire Spacing',
    type: 'slider',
    min: 2,
    max: 12,
    step: 0.5,
    default: 6,
    unit: 'm',
    group: 'Layout',
  },
  {
    key: 'systemType',
    label: 'Emergency Power Source',
    type: 'dropdown',
    default: 'self-contained',
    options: [
      { value: 'self-contained', label: 'Self-Contained Battery Units' },
      { value: 'central-battery', label: 'Central Battery System' },
      { value: 'generator', label: 'Generator + ATS' },
    ],
    group: 'System',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'lux-too-low',
    field: 'minLux',
    severity: 'error',
    check: (p) => Number(p.minLux) < 10.8,
    message: 'Emergency lighting must provide min 10.8 lux at floor level along egress paths',
    codeCitation: 'RA 9514 IRR Rule 10 / PEC',
    position: () => [15.5, 1, 21.75],
  },
  {
    id: 'battery-too-short',
    field: 'batteryDuration',
    severity: 'error',
    check: (p) => Number(p.batteryDuration) < 90,
    message: 'Battery backup must provide min 90 minutes of emergency lighting',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [15.5, 1, 28],
  },
  {
    id: 'spacing-too-wide',
    field: 'luminaireSpacing',
    severity: 'warning',
    check: (p) => Number(p.luminaireSpacing) > 8,
    message: 'Luminaire spacing > 8m may create dark spots along egress path',
    codeCitation: 'RA 9514',
    position: () => [15.5, 1, 22],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-min-lux',
    label: 'Minimum 10.8 Lux Requirement',
    description: 'Emergency lighting must maintain 10.8 lux min at floor level along the entire egress path width',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [15.5, 1.5, 21],
  },
  {
    id: 'ann-battery',
    label: '90-Minute Battery Rule',
    description: 'Self-contained emergency lights must operate for 90 minutes on battery; tested monthly',
    codeCitation: 'RA 9514',
    position: () => [15.5, 1.5, 27],
  },
  {
    id: 'ann-exit-sign',
    label: 'Illuminated Exit Signs',
    description: 'All exits and exit paths require continuously illuminated signs; visible from 30m away',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [15.5, 1.5, 19],
  },
]

const PRESETS: Preset[] = [
  { label: 'Standard Compliant', values: { minLux: 10.8, batteryDuration: 90, luminaireSpacing: 6, systemType: 'self-contained' } },
  { label: 'High-Security (Generator)', values: { minLux: 20, batteryDuration: 120, luminaireSpacing: 4, systemType: 'generator' } },
  { label: 'Central Battery', values: { minLux: 10.8, batteryDuration: 90, luminaireSpacing: 6, systemType: 'central-battery' } },
  { label: 'Violation Demo', values: { minLux: 5, batteryDuration: 30, luminaireSpacing: 10, systemType: 'self-contained' } },
]

export const emergencyLightingLayoutConfig: FloorPlanConfig = {
  id: 'emergency-lighting-layout',
  title: 'Emergency Lighting Layout',
  description: 'Floor plan showing emergency luminaire placement along egress paths, min 10.8 lux requirement, and 90-min battery backup per RA 9514.',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [31, 29],
  camera: { position: [0, 28, 10], fov: 44 },
  scale: 1,
}

