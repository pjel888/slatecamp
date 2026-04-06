// src/app/dashboard/3d-lab/_config/modules/fire-travel-distance.ts
// ─── Fire Code Travel Distance Module ───────────────────────────────────────
// RA 9514 IRR Rule 10 — Travel distance, dead-end corridors, exit requirements

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

// ─── RA 9514 Constants ──────────────────────────────────────────────────────

/** Travel distance max [no sprinkler, sprinklered] in meters */
const TRAVEL_LIMITS: Record<string, [number, number]> = {
  'Assembly/Business': [46, 61],
  Mercantile: [30, 46],
  Industrial: [31, 46],
  Educational: [46, 61],
  Residential: [46, 61],
}

/** Dead-end corridor max length in meters */
const DEAD_END_LIMITS: Record<string, number> = {
  'Assembly/Business': 6,
  Mercantile: 15,
  Industrial: 15,
  Educational: 6,
  Residential: 15,
}

/** Occupant Load Factor (sqm per person) */
const OLF: Record<string, number> = {
  'Assembly/Business': 1.4, // Assembly less concentrated (default for mixed A/B)
  Mercantile: 2.8, // Street floor
  Industrial: 9.3,
  Educational: 1.8, // Classrooms
  Residential: 18.6,
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getMaxTravel(occupancy: string, sprinklered: boolean): number {
  const limits = TRAVEL_LIMITS[occupancy] ?? [46, 61]
  return sprinklered ? limits[1] : limits[0]
}

function getDeadEndLimit(occupancy: string): number {
  return DEAD_END_LIMITS[occupancy] ?? 15
}

function getOLF(occupancy: string): number {
  return OLF[occupancy] ?? 9.3
}

function pathLength(points: Array<[number, number]>): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const dx = points[i][0] - points[i - 1][0]
    const dz = points[i][1] - points[i - 1][1]
    total += Math.sqrt(dx * dx + dz * dz)
  }
  return total
}

/** Minimum exits required for given occupant count (RA 9514 IRR Rule 10) */
function requiredExits(occupantCount: number): number {
  if (occupantCount <= 500) return 2
  if (occupantCount <= 1000) return 3
  return 4
}

// ─── Floor Plan Layout (~30m x 20m commercial building) ─────────────────────

const ROOMS: RoomDef[] = [
  // Main corridor: 30m long, 3m wide, centered at z=8.5..11.5
  {
    id: 'corridor-main',
    label: 'Main Corridor',
    bounds: [0, 8.5, 30, 3],
    color: '#d4d4d8',
    opacity: 0.4,
    zone: 'corridor',
  },
  // Dead-end corridor spur: 8m long, 3m wide, branching off the east end
  {
    id: 'corridor-deadend',
    label: 'Dead-End Spur',
    bounds: [22, 11.5, 8, 3],
    color: '#fecaca',
    opacity: 0.5,
    zone: 'dead-end',
  },

  // ── North side offices (4 rooms, each ~6m x 5m) ──
  {
    id: 'office-n1',
    label: 'Office 1',
    bounds: [0, 3.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'office-n2',
    label: 'Office 2',
    bounds: [6, 3.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'office-n3',
    label: 'Office 3',
    bounds: [12, 3.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'office-n4',
    label: 'Office 4',
    bounds: [18, 3.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },

  // ── South side offices (4 rooms, each ~6m x 5m) ──
  {
    id: 'office-s1',
    label: 'Office 5',
    bounds: [0, 11.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'office-s2',
    label: 'Office 6',
    bounds: [6, 11.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'office-s3',
    label: 'Office 7',
    bounds: [12, 11.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },
  {
    id: 'office-s4',
    label: 'Office 8',
    bounds: [18, 11.5, 6, 5],
    color: '#bfdbfe',
    opacity: 0.5,
  },

  // Assembly room at the west end: 10m x 8m
  {
    id: 'assembly',
    label: 'Assembly Room',
    bounds: [24, 0, 6, 8.5],
    color: '#fde68a',
    opacity: 0.5,
    zone: 'assembly',
  },
]

// ─── Travel Paths ───────────────────────────────────────────────────────────

const PATHS: PathDef[] = [
  // Path A: From far east office to west exit — ~28m (near limit)
  {
    id: 'path-a',
    label: 'Path A: Office 4 → West Exit',
    points: [
      [21, 6],     // Office 4 center
      [21, 10],    // Into corridor
      [1, 10],     // Walk corridor west
    ],
    color: '#2D9F6F',
    width: 3,
  },
  // Path B: From assembly room to east exit — ~18m (short, compliant)
  {
    id: 'path-b',
    label: 'Path B: Assembly → East Exit',
    points: [
      [27, 4],     // Assembly room center
      [27, 10],    // Into corridor
      [29, 10],    // East exit
    ],
    color: '#2D9F6F',
    width: 3,
  },
  // Path C: From dead-end spur to nearest exit — ~45m (right at boundary)
  {
    id: 'path-c',
    label: 'Path C: Dead-End → West Exit',
    points: [
      [29, 13],    // End of dead-end spur
      [22, 13],    // Back to corridor junction
      [22, 10],    // Main corridor
      [1, 10],     // West exit
    ],
    color: '#2D9F6F',
    width: 3,
  },
  // Path D: From south office 6 to east exit — ~24m (compliant)
  {
    id: 'path-d',
    label: 'Path D: Office 6 → East Exit',
    points: [
      [9, 14],     // Office 6 center
      [9, 10],     // Into corridor
      [29, 10],    // East exit
    ],
    color: '#2D9F6F',
    width: 3,
  },
]

// ─── Fixtures ───────────────────────────────────────────────────────────────

const EXITS: FixtureDef[] = [
  {
    id: 'exit-west',
    label: 'EXIT',
    type: 'exit',
    position: [0, 10],
    color: '#2D9F6F',
    description: 'West exit door',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
  {
    id: 'exit-east',
    label: 'EXIT',
    type: 'exit',
    position: [30, 10],
    color: '#2D9F6F',
    description: 'East exit door',
    codeCitation: 'RA 9514 IRR Rule 10',
  },
]

// Sprinkler heads in a 6m grid pattern covering the floor
function generateSprinklers(): FixtureDef[] {
  const sprinklers: FixtureDef[] = []
  let idx = 0
  for (let x = 3; x <= 27; x += 6) {
    for (let z = 3; z <= 17; z += 6) {
      sprinklers.push({
        id: `sprinkler-${idx++}`,
        label: '',
        type: 'sprinkler',
        position: [x, z],
        color: '#1B3FC4',
      })
    }
  }
  return sprinklers
}

const FIXTURES: FixtureDef[] = [...EXITS, ...generateSprinklers()]

// ─── Parameters ─────────────────────────────────────────────────────────────

const PARAMETERS: ParameterDef[] = [
  {
    key: 'occupancyType',
    label: 'Occupancy Type',
    type: 'dropdown',
    default: 'Assembly/Business',
    options: [
      { value: 'Assembly/Business', label: 'Assembly / Business' },
      { value: 'Mercantile', label: 'Mercantile' },
      { value: 'Industrial', label: 'Industrial' },
      { value: 'Educational', label: 'Educational' },
      { value: 'Residential', label: 'Residential' },
    ],
    group: 'Building Properties',
  },
  {
    key: 'sprinklered',
    label: 'Sprinkler System',
    type: 'toggle',
    default: true,
    group: 'Building Properties',
  },
  {
    key: 'floorArea',
    label: 'Floor Area',
    type: 'slider',
    min: 200,
    max: 2000,
    step: 10,
    default: 600,
    unit: 'sqm',
    group: 'Building Properties',
  },
]

// ─── Violation Rules ────────────────────────────────────────────────────────

const VIOLATIONS: ViolationRule[] = [
  // Travel distance exceeded — check each path
  {
    id: 'travel-distance-exceeded-a',
    field: 'occupancyType',
    severity: 'error',
    check: (params) => {
      const occ = String(params.occupancyType ?? 'Assembly/Business')
      const spr = Boolean(params.sprinklered ?? true)
      const maxDist = getMaxTravel(occ, spr)
      return pathLength(PATHS[0].points) > maxDist
    },
    message: 'Travel distance exceeds maximum',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [11, 0.5, 10],
  },
  {
    id: 'travel-distance-exceeded-c',
    field: 'occupancyType',
    severity: 'error',
    check: (params) => {
      const occ = String(params.occupancyType ?? 'Assembly/Business')
      const spr = Boolean(params.sprinklered ?? true)
      const maxDist = getMaxTravel(occ, spr)
      return pathLength(PATHS[2].points) > maxDist
    },
    message: 'Travel distance exceeds maximum',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [15, 0.5, 13],
  },
  // Dead-end corridor exceeded
  {
    id: 'dead-end-exceeded',
    field: 'occupancyType',
    severity: 'error',
    check: (params) => {
      const occ = String(params.occupancyType ?? 'Assembly/Business')
      const limit = getDeadEndLimit(occ)
      return 8 > limit // Dead-end spur is 8m
    },
    message: 'Dead-end corridor exceeds limit',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [26, 0.5, 14.5],
  },
  // Insufficient exits
  {
    id: 'insufficient-exits',
    field: 'floorArea',
    severity: 'error',
    check: (params) => {
      const occ = String(params.occupancyType ?? 'Assembly/Business')
      const area = Number(params.floorArea ?? 600)
      const olf = getOLF(occ)
      const occupantCount = Math.ceil(area / olf)
      const needed = requiredExits(occupantCount)
      return needed > 2 // We have 2 exits
    },
    message: 'Insufficient exits for occupant load',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [15, 1, 5],
  },
]

// ─── Annotations ────────────────────────────────────────────────────────────

const ANNOTATIONS: AnnotationDef[] = [
  {
    id: 'ann-max-travel',
    label: 'Max travel distance',
    description: 'Maximum travel distance to nearest exit per RA 9514',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: (params) => {
      const occ = String(params.occupancyType ?? 'Assembly/Business')
      const spr = Boolean(params.sprinklered ?? true)
      const max = getMaxTravel(occ, spr)
      return [15, 1.5, 1] satisfies [number, number, number]
    },
  },
  {
    id: 'ann-dead-end',
    label: 'Dead-end: 8m spur',
    description: 'Dead-end corridor length',
    codeCitation: 'RA 9514 IRR Rule 10',
    position: () => [26, 0.8, 11.5],
  },
]

// ─── Presets ────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  {
    label: 'Office Floor (Sprinklered)',
    values: { occupancyType: 'Assembly/Business', sprinklered: true, floorArea: 600 },
  },
  {
    label: 'Retail (No Sprinklers)',
    values: { occupancyType: 'Mercantile', sprinklered: false, floorArea: 400 },
  },
  {
    label: 'School Building',
    values: { occupancyType: 'Educational', sprinklered: false, floorArea: 800 },
  },
  {
    label: 'Assembly Hall',
    values: { occupancyType: 'Assembly/Business', sprinklered: true, floorArea: 1200 },
  },
]

// ─── Module Config Export ───────────────────────────────────────────────────

export const fireTravelDistanceConfig: FloorPlanConfig = {
  id: 'fire-travel-distance',
  title: 'Fire Travel Distance',
  description:
    'Visualize maximum travel distances to exits, dead-end corridor limits, and sprinkler coverage per RA 9514 (Fire Code of the Philippines).',
  subject: 'ra-9514',
  rooms: ROOMS,
  paths: PATHS,
  fixtures: FIXTURES,
  parameters: PARAMETERS,
  violations: VIOLATIONS,
  annotations: ANNOTATIONS,
  presets: PRESETS,
  planSize: [30, 20],
  camera: {
    position: [0, 20, 12],
    fov: 40,
  },
  scale: 1,
}

