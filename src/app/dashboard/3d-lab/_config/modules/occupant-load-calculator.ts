// src/app/dashboard/3d-lab/_config/modules/occupant-load-calculator.ts
// Occupant Load Calculator — RA 9514 IRR Rule 10
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

// ─── RA 9514 Occupant Load Factors ──────────────────────────────────────────
// Occupant Load Factor (OLF) in sqm per person

const OLF_TABLE: Record<string, { olf: number; label: string }> = {
  'Assembly-concentrated': { olf: 0.65, label: 'Assembly (Concentrated)' },
  'Assembly-less': { olf: 1.4, label: 'Assembly (Less Concentrated)' },
  'Business': { olf: 9.3, label: 'Business / Office' },
  'Educational': { olf: 1.8, label: 'Educational (Classroom)' },
  'Mercantile-street': { olf: 2.8, label: 'Mercantile (Street Floor)' },
  'Mercantile-upper': { olf: 5.6, label: 'Mercantile (Upper Floors)' },
  'Industrial': { olf: 9.3, label: 'Industrial' },
  'Residential': { olf: 18.6, label: 'Residential' },
  'Storage': { olf: 27.9, label: 'Storage / Warehouse' },
}

function getOLF(type: string): number {
  return OLF_TABLE[type]?.olf ?? 9.3
}

/** Minimum exits required per RA 9514 */
function requiredExits(occupants: number): number {
  if (occupants <= 500) return 2
  if (occupants <= 1000) return 3
  return 4
}

/** Minimum total exit width in mm (5.1mm per person, min 710mm per exit) */
function requiredExitWidth(occupants: number): number {
  return Math.max(710, Math.ceil(occupants * 5.1))
}

// ─── Floor Plan Layout ──────────────────────────────────────────────────────
// Generic rectangular floor: 25m x 18m

const ROOMS: RoomDef[] = [
  {
    id: 'main-area',
    label: 'Main Occupancy Area',
    bounds: [0, 0, 25, 14],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'corridor',
    label: 'Corridor',
    bounds: [0, 14, 25, 4],
    color: '#d4d4d8',
    opacity: 0.4,
    zone: 'corridor',
  },
]

// ─── Paths ──────────────────────────────────────────────────────────────────

const PATHS: PathDef[] = [
  {
    id: 'path-far-corner',
    label: 'Path: Far Corner → Exit A',
    points: [
      [24, 7],
      [24, 16],
      [1, 16],
    ],
    color: '#16a34a',
    width: 3,
  },
  {
    id: 'path-center-exit-b',
    label: 'Path: Center → Exit B',
    points: [
      [12.5, 7],
      [12.5, 16],
      [24, 16],
    ],
    color: '#2563eb',
    width: 3,
  },
]

// ─── Fixtures ───────────────────────────────────────────────────────────────

const FIXTURES: FixtureDef[] = [
  {
    id: 'exit-a',
    label: 'EXIT A',
    type: 'exit',
    position: [0, 16],
    color: '#16a34a',
    description: 'Primary exit — west',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'exit-b',
    label: 'EXIT B',
    type: 'exit',
    position: [25, 16],
    color: '#16a34a',
    description: 'Secondary exit — east',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
]

// ─── Parameters ─────────────────────────────────────────────────────────────

const PARAMETERS: ParameterDef[] = [
  {
    key: 'occupancyType',
    label: 'Occupancy Type',
    type: 'dropdown',
    default: 'Business',
    options: Object.entries(OLF_TABLE).map(([value, entry]) => ({
      value,
      label: entry.label,
    })),
    group: 'Occupancy',
  },
  {
    key: 'floorArea',
    label: 'Floor Area',
    type: 'slider',
    min: 50,
    max: 2000,
    step: 10,
    default: 350,
    unit: 'sqm',
    group: 'Occupancy',
  },
  {
    key: 'numExits',
    label: 'Provided Exits',
    type: 'slider',
    min: 1,
    max: 4,
    step: 1,
    default: 2,
    group: 'Egress',
  },
  {
    key: 'exitWidth',
    label: 'Exit Door Width',
    type: 'slider',
    min: 600,
    max: 2000,
    step: 10,
    default: 1000,
    unit: 'mm',
    group: 'Egress',
  },
]

// ─── Violations ─────────────────────────────────────────────────────────────

const VIOLATIONS: ViolationRule[] = [
  {
    id: 'insufficient-exits',
    field: 'numExits',
    severity: 'error',
    check: (p) => {
      const area = Number(p.floorArea ?? 350)
      const olf = getOLF(String(p.occupancyType ?? 'Business'))
      const occupants = Math.ceil(area / olf)
      const needed = requiredExits(occupants)
      return Number(p.numExits ?? 2) < needed
    },
    message: 'Insufficient exits for calculated occupant load',
    codeCitation: 'RA 9514 IRR Rule 10 §1005',
    position: () => [12.5, 1, 17],
  },
  {
    id: 'exit-width-insufficient',
    field: 'exitWidth',
    severity: 'error',
    check: (p) => {
      const area = Number(p.floorArea ?? 350)
      const olf = getOLF(String(p.occupancyType ?? 'Business'))
      const occupants = Math.ceil(area / olf)
      const totalWidth = Number(p.exitWidth ?? 1000) * Number(p.numExits ?? 2)
      const needed = requiredExitWidth(occupants)
      return totalWidth < needed
    },
    message: 'Total exit width insufficient for occupant load',
    codeCitation: 'RA 9514 IRR Rule 10 §1005',
    position: () => [12.5, 1, 14],
  },
  {
    id: 'single-exit',
    field: 'numExits',
    severity: 'warning',
    check: (p) => Number(p.numExits ?? 2) < 2,
    message: 'At least 2 exits required for most occupancy types',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [1, 1, 16],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-olf',
    label: 'Occupant Load Factor',
    description: 'Floor area per person based on occupancy type (RA 9514 Table)',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [12.5, 1.5, 7],
  },
  {
    id: 'ann-exit-req',
    label: 'Exit Requirements',
    description: 'Number and width of exits based on calculated occupant load',
    codeCitation: 'RA 9514 IRR Rule 10 §1005',
    position: () => [12.5, 1.5, 16],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  {
    label: 'Small Office',
    values: { occupancyType: 'Business', floorArea: 200, numExits: 2, exitWidth: 900 },
  },
  {
    label: 'Classroom Block',
    values: { occupancyType: 'Educational', floorArea: 400, numExits: 2, exitWidth: 1100 },
  },
  {
    label: 'Assembly Hall',
    values: { occupancyType: 'Assembly-concentrated', floorArea: 500, numExits: 3, exitWidth: 1200 },
  },
  {
    label: 'Retail Floor',
    values: { occupancyType: 'Mercantile-street', floorArea: 600, numExits: 2, exitWidth: 1000 },
  },
  {
    label: 'Violation Demo',
    values: { occupancyType: 'Assembly-concentrated', floorArea: 800, numExits: 1, exitWidth: 700 },
  },
]

// ─── Export ─────────────────────────────────────────────────────────────────

export const occupantLoadCalculatorConfig: FloorPlanConfig = {
  id: 'occupant-load-calculator',
  title: 'Occupant Load Calculator',
  description:
    'Calculate occupant load from floor area and occupancy type, then determine required number and width of exits per RA 9514 (Fire Code of the Philippines).',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [25, 18],
  camera: {
    position: [0, 22, 10],
    fov: 40,
  },
  scale: 1,
}
