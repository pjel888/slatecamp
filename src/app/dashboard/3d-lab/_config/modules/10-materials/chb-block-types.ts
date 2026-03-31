// src/app/dashboard/3d-lab/_config/modules/chb-block-types.ts
// CHB Block Types — Building Materials
// ─────────────────────────────────────────────────────────────────────────────
// Exploded view of standard Philippine CHB (Concrete Hollow Block) sizes:
// 4" (100mm), 5" (125mm), 6" (150mm), and 8" (200mm)

import type { ExplodedAssemblyConfig, AssemblyPart } from '../../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function yOffset(v: number): [number, number, number] {
  return [0, v, 0]
}

// ─── CHB Specifications ─────────────────────────────────────────────────────
// Standard Philippine CHB: 400mm (L) × 200mm (H) × varies (W)
// All dimensions in meters for Three.js scene units

const CHB_LENGTH = 0.4    // 400mm
const CHB_HEIGHT = 0.2    // 200mm
const MORTAR_JOINT = 0.01 // 10mm mortar joint

interface CHBSpec {
  prefix: string
  label: string
  width: number       // meters
  widthLabel: string   // display label
  weight: number       // kg per piece
  pcsPerSqm: number   // pieces per sqm of wall
  compStrength: string // MPa
  color: string
  description: string
}

const CHB_SPECS: CHBSpec[] = [
  {
    prefix: 'chb4',
    label: '4" CHB (100mm)',
    width: 0.1,
    widthLabel: '100mm (4")',
    weight: 7.5,
    pcsPerSqm: 12.5,
    compStrength: '4.14 MPa (non-load bearing)',
    color: '#a1a1aa',
    description: '4-inch (100mm) non-load bearing CHB. Used for interior partitions, fences, and non-structural walls. Lightest standard block.',
  },
  {
    prefix: 'chb5',
    label: '5" CHB (125mm)',
    width: 0.125,
    widthLabel: '125mm (5")',
    weight: 9.0,
    pcsPerSqm: 12.5,
    compStrength: '5.52 MPa',
    color: '#9ca3af',
    description: '5-inch (125mm) CHB. Intermediate size, common in residential construction for interior load-bearing and exterior walls in single-storey structures.',
  },
  {
    prefix: 'chb6',
    label: '6" CHB (150mm)',
    width: 0.15,
    widthLabel: '150mm (6")',
    weight: 11.0,
    pcsPerSqm: 12.5,
    compStrength: '6.89 MPa (load bearing)',
    color: '#78716c',
    description: '6-inch (150mm) load-bearing CHB. Standard for multi-storey residential and low-rise commercial exterior walls. Most common size in Philippine construction.',
  },
  {
    prefix: 'chb8',
    label: '8" CHB (200mm)',
    width: 0.2,
    widthLabel: '200mm (8")',
    weight: 15.0,
    pcsPerSqm: 12.5,
    compStrength: '8.27 MPa (load bearing)',
    color: '#57534e',
    description: '8-inch (200mm) heavy-duty load-bearing CHB. Used for retaining walls, firewalls, multi-storey buildings, and where structural masonry is specified. Heaviest standard block.',
  },
]

// ─── Build Parts for Each Block Type ────────────────────────────────────────

function makeBlockParts(spec: CHBSpec): AssemblyPart[] {
  const parts: AssemblyPart[] = []
  const { prefix, label, width, description, color } = spec

  // Outer shell — full block
  parts.push({
    id: `${prefix}-block`,
    label: label,
    description: description,
    geometry: {
      id: `${prefix}-block-geo`,
      type: 'box',
      position: [0, CHB_HEIGHT / 2, 0],
      args: [CHB_LENGTH, CHB_HEIGHT, width],
      color: color,
    },
    explodeOffset: yOffset(0),
  })

  // Hollow cores (2 cores, represented as darker inset boxes)
  const coreWidth = width * 0.55
  const coreHeight = CHB_HEIGHT * 0.7
  const coreLength = CHB_LENGTH * 0.35
  const coreSpacing = CHB_LENGTH * 0.22

  for (const side of [-1, 1] as const) {
    parts.push({
      id: `${prefix}-core-${side === -1 ? 'l' : 'r'}`,
      label: `${label} — Hollow Core`,
      description: 'Hollow core reduces weight and provides space for rebar and grout. Cores are typically grouted at reinforced cells.',
      geometry: {
        id: `${prefix}-core-${side === -1 ? 'l' : 'r'}-geo`,
        type: 'box',
        position: [side * coreSpacing, CHB_HEIGHT / 2 + 0.001, 0],
        args: [coreLength, coreHeight, coreWidth],
        color: '#44403c',
        opacity: 0.5,
        transparent: true,
      },
      explodeOffset: yOffset(0.15),
    })
  }

  // Mortar joint (thin layer on top)
  parts.push({
    id: `${prefix}-mortar`,
    label: `${label} — Mortar Joint`,
    description: `10mm mortar joint (Type M or S mortar). Laying factor: ${spec.pcsPerSqm} pcs/sqm.`,
    geometry: {
      id: `${prefix}-mortar-geo`,
      type: 'box',
      position: [0, CHB_HEIGHT + MORTAR_JOINT / 2, 0],
      args: [CHB_LENGTH, MORTAR_JOINT, width],
      color: '#d6d3d1',
    },
    explodeOffset: yOffset(0.3),
  })

  // Width dimension indicator (small colored bar)
  parts.push({
    id: `${prefix}-width-indicator`,
    label: `Width: ${spec.widthLabel}`,
    description: `Block width: ${spec.widthLabel}. Weight: ${spec.weight} kg/pc. Compressive strength: ${spec.compStrength}.`,
    geometry: {
      id: `${prefix}-width-indicator-geo`,
      type: 'box',
      position: [0, -0.02, 0],
      args: [0.005, 0.005, width],
      color: '#3b82f6',
    },
    explodeOffset: yOffset(0),
  })

  return parts
}

// ─── Build All Block Parts ──────────────────────────────────────────────────

const ALL_PARTS: AssemblyPart[] = CHB_SPECS.flatMap(makeBlockParts)

// ─── Export ─────────────────────────────────────────────────────────────────

export const chbBlockTypesConfig: ExplodedAssemblyConfig = {
  id: 'chb-block-types',
  title: 'CHB Block Types',
  description:
    'Exploded view of the four standard Philippine Concrete Hollow Block (CHB) sizes — 4" (100mm), 5" (125mm), 6" (150mm), and 8" (200mm) — at actual scale with mortar joints, hollow cores, and laying factors.',
  subject: 'materials',
  comparisonMode: true,
  parts: ALL_PARTS,
  camera: {
    position: [1.5, 0.8, 1.5],
    fov: 40,
  },
}
