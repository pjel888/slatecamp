// src/app/dashboard/3d-lab/_config/modules/clup-zoning-overlay.ts
// CLUP Zoning Overlay — Environmental Planning / HLURB
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

// CLUP (Comprehensive Land Use Plan) zone types:
// R — Residential (R-1 low, R-2 medium, R-3 high density)
// C — Commercial (C-1 neighborhood, C-2 community, C-3 regional)
// I — Industrial (I-1 light, I-2 medium, I-3 heavy)
// GI — General Institutional (schools, hospitals, govt offices)
// AGR — Agricultural
// PAS — Parks, Recreational, Open Space
// Buffer zones required between incompatible uses

const ROOMS: RoomDef[] = [
  { id: 'zone-r1', label: 'R-1 Low-Density Residential', bounds: [0, 0, 14, 14], color: '#fef9c3', opacity: 0.55 },
  { id: 'zone-r2', label: 'R-2 Medium-Density Residential', bounds: [0, 15, 14, 12], color: '#fef08a', opacity: 0.55 },
  { id: 'zone-c1', label: 'C-1 Neighborhood Commercial', bounds: [15, 0, 12, 10], color: '#bfdbfe', opacity: 0.55 },
  { id: 'zone-c2', label: 'C-2 Community Commercial', bounds: [15, 11, 12, 16], color: '#93c5fd', opacity: 0.55 },
  { id: 'zone-gi', label: 'GI — General Institutional', bounds: [28, 0, 10, 12], color: '#e0e7ff', opacity: 0.55 },
  { id: 'zone-pas', label: 'Parks / Open Space', bounds: [28, 13, 10, 14], color: '#bbf7d0', opacity: 0.55 },
  { id: 'main-road', label: 'Major Road ROW (10m)', bounds: [0, 27, 38, 3], color: '#d1d5db', opacity: 0.5, zone: 'corridor' },
]

const PATHS: PathDef[] = [
  {
    id: 'major-road',
    label: 'Major Road (10m ROW)',
    points: [[0, 28.5], [38, 28.5]],
    color: '#374151',
    width: 5,
  },
  {
    id: 'local-road',
    label: 'Local Road (8m ROW)',
    points: [[14, 0], [14, 27]],
    color: '#6b7280',
    width: 3,
  },
  {
    id: 'minor-road',
    label: 'Minor Road (6m ROW)',
    points: [[27, 0], [27, 27]],
    color: '#9ca3af',
    width: 2,
  },
]

const FIXTURES: FixtureDef[] = [
  {
    id: 'school',
    label: 'Elementary School (GI Zone)',
    type: 'custom',
    position: [33, 6],
    color: '#6366f1',
    description: 'Institutional use: school in GI zone',
    codeCitation: 'HLURB Zoning Ordinance',
  },
  {
    id: 'park',
    label: 'Neighborhood Park (PAS)',
    type: 'custom',
    position: [33, 20],
    color: '#2D9F6F',
    description: 'Open space / park — min 3.5 sqm/person',
    codeCitation: 'HLURB',
  },
  {
    id: 'commercial-anchor',
    label: 'Commercial Anchor (C-2)',
    type: 'custom',
    position: [21, 19],
    color: '#3B6B9C',
    description: 'Community-scale commercial development',
    codeCitation: 'HLURB Zoning Ordinance',
  },
  {
    id: 'buffer-marker',
    label: 'Buffer Zone Marker',
    type: 'custom',
    position: [14, 14],
    color: '#D64545',
    description: 'Buffer zone between incompatible uses required',
    codeCitation: 'HLURB',
  },
  {
    id: 'exit-main',
    label: 'Area Exit / Gate',
    type: 'exit',
    position: [19, 28],
    color: '#2D9F6F',
    codeCitation: 'Planning Code',
  },
]

const PARAMETERS: ParameterDef[] = [
  {
    key: 'planningPeriod',
    label: 'CLUP Planning Period',
    type: 'dropdown',
    default: '10yr',
    options: [
      { value: '5yr', label: '5-Year Medium Term' },
      { value: '10yr', label: '10-Year Long Range' },
      { value: '15yr', label: '15-Year Comprehensive' },
    ],
    group: 'Plan',
  },
  {
    key: 'residentialDensity',
    label: 'Residential Zone Density',
    type: 'dropdown',
    default: 'medium',
    options: [
      { value: 'low', label: 'Low Density (R-1)' },
      { value: 'medium', label: 'Medium Density (R-2)' },
      { value: 'high', label: 'High Density (R-3)' },
    ],
    group: 'Zoning',
  },
  {
    key: 'openSpacePercent',
    label: 'Open Space Allocation (%)',
    type: 'slider',
    min: 5,
    max: 40,
    step: 1,
    default: 15,
    unit: '%',
    group: 'Open Space',
  },
  {
    key: 'bufferZones',
    label: 'Buffer Zones Provided',
    type: 'toggle',
    default: true,
    group: 'Zoning',
  },
]

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'open-space-insufficient',
    field: 'openSpacePercent',
    severity: 'warning',
    check: (p) => Number(p.openSpacePercent) < 10,
    message: 'Open space allocation below 10% recommended minimum for CLUP compliance',
    codeCitation: 'HLURB Guidelines',
    position: () => [33, 1, 20],
  },
  {
    id: 'no-buffer',
    field: 'bufferZones',
    severity: 'warning',
    check: (p) => !p.bufferZones,
    message: 'Buffer zones required between residential and commercial/industrial uses',
    codeCitation: 'HLURB Zoning Ordinance',
    position: () => [14, 1, 14],
  },
]

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-clup',
    label: 'CLUP Purpose',
    description: 'Comprehensive Land Use Plan guides land allocation per population, economic, and environmental goals over 10-year horizon',
    codeCitation: 'LGC 1991 / HLURB',
    position: () => [19, 1.5, 14],
  },
  {
    id: 'ann-compatibility',
    label: 'Use Compatibility',
    description: 'Incompatible adjacent uses (e.g., R-1 + I-2) require buffer zones; zoning board approval for conditional uses',
    codeCitation: 'HLURB Zoning Ordinance',
    position: () => [14, 1.5, 14],
  },
  {
    id: 'ann-road-hierarchy',
    label: 'Road Hierarchy',
    description: 'Major road (10m ROW) → Collector (8m) → Local (6.5m); right-of-way widths from DPWH standards',
    codeCitation: 'DPWH / HLURB',
    position: () => [19, 1.5, 28],
  },
]

const PRESETS: Preset[] = [
  { label: 'Urban Mix (10yr)', values: { planningPeriod: '10yr', residentialDensity: 'medium', openSpacePercent: 15, bufferZones: true } },
  { label: 'Low-Density Suburban', values: { planningPeriod: '15yr', residentialDensity: 'low', openSpacePercent: 25, bufferZones: true } },
  { label: 'High-Density Urban', values: { planningPeriod: '10yr', residentialDensity: 'high', openSpacePercent: 10, bufferZones: true } },
  { label: 'No Buffer (Violation)', values: { planningPeriod: '5yr', residentialDensity: 'medium', openSpacePercent: 5, bufferZones: false } },
]

export const clupZoningOverlayConfig: FloorPlanConfig = {
  id: 'clup-zoning-overlay',
  title: 'CLUP Zoning Overlay',
  description: 'Land use plan showing CLUP zones (Residential, Commercial, Institutional, Open Space) with road hierarchy and buffer zones per HLURB guidelines.',
  subject: 'planning',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [38, 30],
  camera: { position: [0, 36, 14], fov: 48 },
  scale: 1,
}
