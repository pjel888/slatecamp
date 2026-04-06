// src/app/dashboard/3d-lab/_config/modules/construction-types-comparison.ts
// Construction Types Comparison — PD 1096 Rule V
// ─────────────────────────────────────────────────────────────────────────────
// Side-by-side exploded comparison of 5 construction types (Type I–V)
// showing structural elements and fire resistance ratings.

import type { ExplodedAssemblyConfig, AssemblyPart } from '@/features/3d-lab/types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function yOffset(v: number): [number, number, number] {
  return [0, v, 0]
}

/**
 * Build parts for one construction type column.
 * Each type shows: foundation, column, beam, slab, wall, and roof.
 */
function makeTypeParts(
  prefix: string,
  typeLabel: string,
  opts: {
    foundationMat: string
    foundationColor: string
    columnMat: string
    columnColor: string
    beamMat: string
    beamColor: string
    slabMat: string
    slabColor: string
    wallMat: string
    wallColor: string
    roofMat: string
    roofColor: string
    fireRating: string
    description: string
  },
): AssemblyPart[] {
  const parts: AssemblyPart[] = []

  // 1. Foundation
  parts.push({
    id: `${prefix}-foundation`,
    label: `${typeLabel} Foundation`,
    description: `Foundation: ${opts.foundationMat}. ${opts.description}`,
    geometry: {
      id: `${prefix}-foundation-geo`,
      type: 'box',
      position: [0, 0.04, 0],
      args: [0.4, 0.08, 0.4],
      color: opts.foundationColor,
    },
    explodeOffset: yOffset(0),
  })

  // 2. Columns (4 corners)
  const colPositions: [number, number][] = [[-0.12, -0.12], [0.12, -0.12], [-0.12, 0.12], [0.12, 0.12]]
  colPositions.forEach(([x, z], i) => {
    parts.push({
      id: `${prefix}-col-${i}`,
      label: `${typeLabel} Column`,
      description: `Column: ${opts.columnMat}. Fire resistance: ${opts.fireRating}`,
      codeCitation: 'PD 1096 IRR Rule V',
      geometry: {
        id: `${prefix}-col-${i}-geo`,
        type: 'cylinder',
        position: [x, 0.33, z],
        args: [0.025, 0.025, 0.5, 12],
        color: opts.columnColor,
      },
      explodeOffset: yOffset(0.3),
    })
  })

  // 3. Beams (2 spanning beams)
  parts.push({
    id: `${prefix}-beam-x`,
    label: `${typeLabel} Beam (Span)`,
    description: `Beam: ${opts.beamMat}. Fire resistance: ${opts.fireRating}`,
    codeCitation: 'PD 1096 IRR Rule V',
    geometry: {
      id: `${prefix}-beam-x-geo`,
      type: 'box',
      position: [0, 0.6, -0.12],
      args: [0.3, 0.06, 0.04],
      color: opts.beamColor,
    },
    explodeOffset: yOffset(0.6),
  })
  parts.push({
    id: `${prefix}-beam-z`,
    label: `${typeLabel} Beam (Span)`,
    description: `Beam: ${opts.beamMat}`,
    geometry: {
      id: `${prefix}-beam-z-geo`,
      type: 'box',
      position: [0, 0.6, 0.12],
      args: [0.3, 0.06, 0.04],
      color: opts.beamColor,
    },
    explodeOffset: yOffset(0.6),
  })

  // 4. Floor slab
  parts.push({
    id: `${prefix}-slab`,
    label: `${typeLabel} Floor Slab`,
    description: `Floor slab: ${opts.slabMat}. Fire resistance: ${opts.fireRating}`,
    codeCitation: 'PD 1096 IRR Rule V',
    geometry: {
      id: `${prefix}-slab-geo`,
      type: 'box',
      position: [0, 0.66, 0],
      args: [0.36, 0.03, 0.36],
      color: opts.slabColor,
    },
    explodeOffset: yOffset(0.9),
  })

  // 5. Walls (2 sides)
  parts.push({
    id: `${prefix}-wall-front`,
    label: `${typeLabel} Wall`,
    description: `Wall: ${opts.wallMat}`,
    geometry: {
      id: `${prefix}-wall-front-geo`,
      type: 'box',
      position: [0, 0.33, 0.18],
      args: [0.36, 0.5, 0.02],
      color: opts.wallColor,
      opacity: 0.7,
      transparent: true,
    },
    explodeOffset: yOffset(0.3),
  })
  parts.push({
    id: `${prefix}-wall-side`,
    label: `${typeLabel} Wall`,
    description: `Wall: ${opts.wallMat}`,
    geometry: {
      id: `${prefix}-wall-side-geo`,
      type: 'box',
      position: [-0.18, 0.33, 0],
      args: [0.02, 0.5, 0.36],
      color: opts.wallColor,
      opacity: 0.7,
      transparent: true,
    },
    explodeOffset: yOffset(0.3),
  })

  // 6. Roof
  parts.push({
    id: `${prefix}-roof`,
    label: `${typeLabel} Roof`,
    description: `Roof: ${opts.roofMat}`,
    geometry: {
      id: `${prefix}-roof-geo`,
      type: 'box',
      position: [0, 0.72, 0],
      args: [0.4, 0.02, 0.4],
      color: opts.roofColor,
    },
    explodeOffset: yOffset(1.2),
  })

  return parts
}

// ─── Construction Type Definitions ──────────────────────────────────────────

const TYPE_I = makeTypeParts('type-i', 'Type I (Fire-Resistive)', {
  foundationMat: 'Reinforced Concrete',
  foundationColor: '#94a3b8',
  columnMat: 'Reinforced Concrete',
  columnColor: '#94a3b8',
  beamMat: 'Reinforced Concrete',
  beamColor: '#94a3b8',
  slabMat: 'Reinforced Concrete (150mm)',
  slabColor: '#94a3b8',
  wallMat: 'Masonry / Concrete',
  wallColor: '#a1a1aa',
  roofMat: 'Concrete Roof Deck',
  roofColor: '#78716c',
  fireRating: '4-hour',
  description: 'Type I: All structural elements are non-combustible with highest fire resistance. Structural frame: 4-hr rating. Unlimited area and height.',
})

const TYPE_II = makeTypeParts('type-ii', 'Type II (Non-Combustible)', {
  foundationMat: 'Reinforced Concrete',
  foundationColor: '#94a3b8',
  columnMat: 'Structural Steel',
  columnColor: '#64748b',
  beamMat: 'Structural Steel',
  beamColor: '#64748b',
  slabMat: 'Steel Deck + Concrete',
  slabColor: '#71717a',
  wallMat: 'Metal Panel / Masonry',
  wallColor: '#a8a29e',
  roofMat: 'Metal Roof Deck',
  roofColor: '#57534e',
  fireRating: '2-hour',
  description: 'Type II: Non-combustible materials but with lower fire resistance. Steel members may be unprotected (IIB) or fire-protected (IIA). 2-hr rating for protected.',
})

const TYPE_III = makeTypeParts('type-iii', 'Type III (Ordinary)', {
  foundationMat: 'Reinforced Concrete',
  foundationColor: '#94a3b8',
  columnMat: 'Masonry / Concrete',
  columnColor: '#a1a1aa',
  beamMat: 'Wood / Steel',
  beamColor: '#a3734c',
  slabMat: 'Wood Joist + Plywood',
  slabColor: '#b45309',
  wallMat: 'CHB Masonry (Non-combustible)',
  wallColor: '#d6d3d1',
  roofMat: 'Wood Truss + Metal Roofing',
  roofColor: '#78350f',
  fireRating: '1-hour',
  description: 'Type III: Exterior walls non-combustible (masonry/concrete), interior structure may be combustible (wood). Common in Filipino mid-rise construction.',
})

const TYPE_IV = makeTypeParts('type-iv', 'Type IV (Heavy Timber)', {
  foundationMat: 'Reinforced Concrete',
  foundationColor: '#94a3b8',
  columnMat: 'Heavy Timber (≥200mm)',
  columnColor: '#92400e',
  beamMat: 'Heavy Timber (≥150mm)',
  beamColor: '#92400e',
  slabMat: 'Heavy Timber Decking',
  slabColor: '#a3734c',
  wallMat: 'Non-combustible Exterior',
  wallColor: '#d6d3d1',
  roofMat: 'Heavy Timber + Metal',
  roofColor: '#78350f',
  fireRating: '1-hour (HT)',
  description: 'Type IV: Heavy timber construction with minimum 200mm columns and 150mm beams. Inherent fire resistance from mass timber charring layer.',
})

const TYPE_V = makeTypeParts('type-v', 'Type V (Wood Frame)', {
  foundationMat: 'Concrete / CMU',
  foundationColor: '#94a3b8',
  columnMat: 'Wood Stud (50x100mm)',
  columnColor: '#c2410c',
  beamMat: 'Wood (50x200mm)',
  beamColor: '#c2410c',
  slabMat: 'Wood Joist + Plywood',
  slabColor: '#ea580c',
  wallMat: 'Wood Frame + Plywood/Hardie',
  wallColor: '#fbbf24',
  roofMat: 'Wood Truss + Light Roofing',
  roofColor: '#b91c1c',
  fireRating: '0-hour (VA) / 1-hour (VB)',
  description: 'Type V: All-combustible light wood frame. Most area/height restrictions. Common for low-rise residential. VA allows 1-hr fire protection.',
})

// ─── Export ─────────────────────────────────────────────────────────────────

export const constructionTypesComparisonConfig: ExplodedAssemblyConfig = {
  id: 'construction-types-comparison',
  title: 'Construction Types Comparison',
  description:
    'Side-by-side exploded comparison of the five construction types (Type I–V) per PD 1096 IRR Rule V, showing structural materials, fire resistance ratings, and area/height implications.',
  subject: 'pd-1096',
  comparisonMode: true,
  parts: [
    ...TYPE_I,
    ...TYPE_II,
    ...TYPE_III,
    ...TYPE_IV,
    ...TYPE_V,
  ],
  camera: {
    position: [8, 4, 8],
    fov: 40,
  },
}

