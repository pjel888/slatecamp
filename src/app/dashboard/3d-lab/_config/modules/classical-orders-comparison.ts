// src/app/dashboard/3d-lab/_config/modules/classical-orders-comparison.ts
// ─── Classical Orders Comparison ────────────────────────────────────────────
// Side-by-side exploded comparison of the five classical column orders:
// Tuscan, Doric, Ionic, Corinthian, and Composite.

import type { ExplodedAssemblyConfig, AssemblyPart } from '../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build the explode offset vector along Y for a given offset magnitude. */
function yOffset(v: number): [number, number, number] {
  return [0, v, 0]
}

/**
 * Create a full set of 6 parts for one classical order.
 * @param prefix  Unique prefix for part ids (e.g. 'tuscan')
 * @param color   Base stone/marble color hex
 * @param opts    Per-order geometry overrides
 */
function makeOrderParts(
  prefix: string,
  orderLabel: string,
  color: string,
  opts: {
    /** Whether this order has a base (Greek Doric does not) */
    hasBase: boolean
    /** Shaft height (determines order proportional ratio) */
    shaftHeight: number
    /** Shaft bottom radius */
    shaftRadiusBottom: number
    /** Shaft top radius */
    shaftRadiusTop: number
    /** Shaft radial segments (flute count proxy) */
    shaftSegments: number
    /** Capital total height */
    capitalHeight: number
    /** Capital description */
    capitalDesc: string
    /** Number of architrave fascias */
    architraveFascias: 1 | 3
    /** Whether frieze has triglyph/metope divisions */
    friezeDivided: boolean
    /** Frieze description */
    friezeDesc: string
    /** Cornice description */
    corniceDesc: string
    /** Cornice has dentils */
    hasDentils: boolean
    /** Cornice has modillions */
    hasModillions: boolean
  },
): AssemblyPart[] {
  const parts: AssemblyPart[] = []

  // Slightly darker shade for architectural details
  const detailColor = darken(color, 0.08)
  const accentColor = darken(color, 0.15)

  // ── 1. Base / Stylobate ─────────────────────────────────────────────────
  if (opts.hasBase) {
    parts.push({
      id: `${prefix}-base`,
      label: `${orderLabel} Base`,
      description: `The base of the ${orderLabel} order. ${
        prefix === 'tuscan'
          ? 'A simple low torus molding — the most austere of the orders.'
          : prefix === 'doric'
            ? 'The Greek Doric order uniquely omits the base, placing the shaft directly on the stylobate.'
            : 'Composed of two tori (convex rings) separated by a scotia (concave molding), providing a refined transition from floor to shaft.'
      }`,
      geometry: {
        id: `${prefix}-base-geo`,
        type: 'cylinder',
        position: [0, 0.015, 0],
        args: prefix === 'ionic' || prefix === 'corinthian' || prefix === 'composite'
          ? [0.14, 0.14, 0.06, 24]  // Wider attic base
          : [0.12, 0.12, 0.03, 24], // Simple torus for Tuscan
        color,
      },
      explodeOffset: yOffset(0),
    })

    // For Ionic/Corinthian/Composite — add scotia + second torus
    if (prefix === 'ionic' || prefix === 'corinthian' || prefix === 'composite') {
      parts.push({
        id: `${prefix}-base-scotia`,
        label: `${orderLabel} Base (Scotia)`,
        description: 'The concave scotia molding between the two tori of the Attic base.',
        geometry: {
          id: `${prefix}-base-scotia-geo`,
          type: 'cylinder',
          position: [0, 0.045, 0],
          args: [0.11, 0.13, 0.02, 24],
          color: detailColor,
        },
        explodeOffset: yOffset(0),
      })
      parts.push({
        id: `${prefix}-base-torus2`,
        label: `${orderLabel} Base (Upper Torus)`,
        description: 'The upper torus of the Attic base.',
        geometry: {
          id: `${prefix}-base-torus2-geo`,
          type: 'cylinder',
          position: [0, 0.06, 0],
          args: [0.12, 0.12, 0.02, 24],
          color,
        },
        explodeOffset: yOffset(0),
      })
    }
  } else {
    // Doric stylobate — flat platform
    parts.push({
      id: `${prefix}-stylobate`,
      label: `${orderLabel} Stylobate`,
      description:
        'The Greek Doric order has no base. The column shaft rises directly from the stylobate — the topmost step of the temple platform. This austerity is a hallmark of the order.',
      geometry: {
        id: `${prefix}-stylobate-geo`,
        type: 'box',
        position: [0, 0.015, 0],
        args: [0.3, 0.03, 0.3],
        color: detailColor,
      },
      explodeOffset: yOffset(0),
    })
  }

  // ── 2. Shaft ────────────────────────────────────────────────────────────
  const shaftBaseY = opts.hasBase
    ? (prefix === 'ionic' || prefix === 'corinthian' || prefix === 'composite' ? 0.07 : 0.03)
    : 0.03
  const shaftCenterY = shaftBaseY + opts.shaftHeight / 2

  parts.push({
    id: `${prefix}-shaft`,
    label: `${orderLabel} Shaft`,
    description: `${
      prefix === 'tuscan'
        ? 'A smooth, unfluted shaft — the simplest of all orders. The Tuscan column is sturdy with a 1:7 height-to-diameter ratio.'
        : prefix === 'doric'
          ? 'The shaft features 20 shallow flutes with sharp arrises (no fillets). The bold shadow lines emphasize strength and verticality. Ratio 1:8.'
          : prefix === 'ionic'
            ? 'The shaft is taller (1:9 ratio) with 24 flutes separated by flat fillets, creating a more refined, slender appearance than the Doric.'
            : 'The tallest shaft (1:10 ratio) with 24 deep, sharp flutes. The extreme slenderness expresses elegance and aspiration.'
    }`,
    geometry: {
      id: `${prefix}-shaft-geo`,
      type: 'cylinder',
      position: [0, shaftCenterY, 0],
      args: [opts.shaftRadiusTop, opts.shaftRadiusBottom, opts.shaftHeight, opts.shaftSegments],
      color: prefix === 'tuscan' ? color : detailColor,
    },
    explodeOffset: yOffset(0.3),
  })

  // ── 3. Capital ──────────────────────────────────────────────────────────
  const capitalBaseY = shaftBaseY + opts.shaftHeight
  const capitalParts: AssemblyPart[] = []

  if (prefix === 'tuscan') {
    // Echinus + Abacus
    capitalParts.push({
      id: `${prefix}-capital`,
      label: `${orderLabel} Capital`,
      description: opts.capitalDesc,
      geometry: {
        id: `${prefix}-capital-echinus`,
        type: 'cylinder',
        position: [0, capitalBaseY + 0.02, 0],
        args: [0.12, opts.shaftRadiusTop, 0.04, 24],
        color,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-abacus`,
      label: `${orderLabel} Abacus`,
      description: 'A plain square slab crowning the capital.',
      geometry: {
        id: `${prefix}-abacus-geo`,
        type: 'box',
        position: [0, capitalBaseY + 0.055, 0],
        args: [0.26, 0.03, 0.26],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
  } else if (prefix === 'doric') {
    capitalParts.push({
      id: `${prefix}-capital`,
      label: `${orderLabel} Capital`,
      description: opts.capitalDesc,
      geometry: {
        id: `${prefix}-capital-echinus`,
        type: 'cylinder',
        position: [0, capitalBaseY + 0.025, 0],
        args: [0.14, opts.shaftRadiusTop, 0.05, 24],
        color,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-abacus`,
      label: `${orderLabel} Abacus`,
      description: 'A plain, undecorated square abacus — wider and heavier than later orders.',
      geometry: {
        id: `${prefix}-abacus-geo`,
        type: 'box',
        position: [0, capitalBaseY + 0.065, 0],
        args: [0.3, 0.03, 0.3],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
  } else if (prefix === 'ionic') {
    // Volute scrolls (wider element) + thin abacus
    capitalParts.push({
      id: `${prefix}-capital`,
      label: `${orderLabel} Capital`,
      description: opts.capitalDesc,
      geometry: {
        id: `${prefix}-capital-volute`,
        type: 'box',
        position: [0, capitalBaseY + 0.03, 0],
        args: [0.3, 0.06, 0.14],
        color,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-abacus`,
      label: `${orderLabel} Abacus`,
      description: 'A thin molded abacus with slight overhang.',
      geometry: {
        id: `${prefix}-abacus-geo`,
        type: 'box',
        position: [0, capitalBaseY + 0.07, 0],
        args: [0.24, 0.02, 0.24],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
  } else if (prefix === 'corinthian') {
    // Acanthus leaves (wider cylinder) + smaller cylinder + thin abacus
    capitalParts.push({
      id: `${prefix}-capital-leaves`,
      label: `${orderLabel} Capital (Acanthus)`,
      description: opts.capitalDesc,
      geometry: {
        id: `${prefix}-capital-acanthus`,
        type: 'cylinder',
        position: [0, capitalBaseY + 0.04, 0],
        args: [0.14, opts.shaftRadiusTop + 0.02, 0.08, 24],
        color,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-capital-bell`,
      label: `${orderLabel} Capital (Bell)`,
      description: 'The bell-shaped core of the Corinthian capital, from which acanthus leaves spring.',
      geometry: {
        id: `${prefix}-capital-bell-geo`,
        type: 'cylinder',
        position: [0, capitalBaseY + 0.1, 0],
        args: [0.10, 0.14, 0.04, 24],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-abacus`,
      label: `${orderLabel} Abacus`,
      description: 'A thin abacus with concave sides and corner horns — a Corinthian signature.',
      geometry: {
        id: `${prefix}-abacus-geo`,
        type: 'box',
        position: [0, capitalBaseY + 0.13, 0],
        args: [0.26, 0.02, 0.26],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
  } else {
    // Composite: Ionic volutes + Corinthian acanthus
    capitalParts.push({
      id: `${prefix}-capital-leaves`,
      label: `${orderLabel} Capital (Acanthus)`,
      description: opts.capitalDesc,
      geometry: {
        id: `${prefix}-capital-acanthus`,
        type: 'cylinder',
        position: [0, capitalBaseY + 0.04, 0],
        args: [0.14, opts.shaftRadiusTop + 0.02, 0.08, 24],
        color,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-capital-volute`,
      label: `${orderLabel} Capital (Volutes)`,
      description: 'Ionic-style volute scrolls crowning the Corinthian acanthus leaves — the defining hybrid of the Composite order.',
      geometry: {
        id: `${prefix}-capital-volute-geo`,
        type: 'box',
        position: [0, capitalBaseY + 0.1, 0],
        args: [0.3, 0.04, 0.14],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
    capitalParts.push({
      id: `${prefix}-abacus`,
      label: `${orderLabel} Abacus`,
      description: 'A thin abacus identical in form to the Corinthian.',
      geometry: {
        id: `${prefix}-abacus-geo`,
        type: 'box',
        position: [0, capitalBaseY + 0.13, 0],
        args: [0.26, 0.02, 0.26],
        color: detailColor,
      },
      explodeOffset: yOffset(0.6),
    })
  }

  parts.push(...capitalParts)

  // ── 4. Architrave ───────────────────────────────────────────────────────
  const capitalTopY = capitalBaseY + opts.capitalHeight
  const architraveHeight = 0.06

  if (opts.architraveFascias === 3) {
    // Three-fascia architrave
    const fasciaH = architraveHeight / 3
    for (let i = 0; i < 3; i++) {
      parts.push({
        id: `${prefix}-architrave${i > 0 ? `-f${i + 1}` : ''}`,
        label: i === 0 ? `${orderLabel} Architrave` : `${orderLabel} Architrave (Fascia ${i + 1})`,
        description:
          i === 0
            ? `A three-fascia architrave with progressively projecting bands — characteristic of the ${orderLabel} order.`
            : `Fascia ${i + 1} of the three-band architrave.`,
        geometry: {
          id: `${prefix}-architrave-f${i}-geo`,
          type: 'box',
          position: [0, capitalTopY + fasciaH * i + fasciaH / 2, 0],
          args: [0.28 + i * 0.01, fasciaH, 0.28 + i * 0.01],
          color: i === 0 ? color : i === 1 ? detailColor : accentColor,
        },
        explodeOffset: yOffset(0.9),
      })
    }
  } else {
    parts.push({
      id: `${prefix}-architrave`,
      label: `${orderLabel} Architrave`,
      description: `A plain, single-fascia architrave — the simplest beam form, spanning from column to column.`,
      geometry: {
        id: `${prefix}-architrave-geo`,
        type: 'box',
        position: [0, capitalTopY + architraveHeight / 2, 0],
        args: [0.28, architraveHeight, 0.28],
        color,
      },
      explodeOffset: yOffset(0.9),
    })
  }

  // ── 5. Frieze ───────────────────────────────────────────────────────────
  const friezeBaseY = capitalTopY + architraveHeight
  const friezeHeight = 0.08

  if (opts.friezeDivided) {
    // Doric triglyph-metope frieze: alternate colored segments
    parts.push({
      id: `${prefix}-frieze`,
      label: `${orderLabel} Frieze`,
      description: opts.friezeDesc,
      geometry: {
        id: `${prefix}-frieze-geo`,
        type: 'box',
        position: [0, friezeBaseY + friezeHeight / 2, 0],
        args: [0.3, friezeHeight, 0.3],
        color: detailColor,
      },
      explodeOffset: yOffset(1.2),
    })
    // Triglyph markers — 3 small darker boxes on front face
    parts.push({
      id: `${prefix}-triglyph`,
      label: `${orderLabel} Triglyphs`,
      description: 'Three-channelled blocks derived from the ends of wooden ceiling beams. Their regular spacing defines the Doric rhythm.',
      geometry: {
        id: `${prefix}-triglyph-geo`,
        type: 'box',
        position: [0, friezeBaseY + friezeHeight / 2, 0.151],
        args: [0.06, friezeHeight * 0.9, 0.005],
        color: accentColor,
      },
      explodeOffset: yOffset(1.2),
    })
  } else {
    parts.push({
      id: `${prefix}-frieze`,
      label: `${orderLabel} Frieze`,
      description: opts.friezeDesc,
      geometry: {
        id: `${prefix}-frieze-geo`,
        type: 'box',
        position: [0, friezeBaseY + friezeHeight / 2, 0],
        args: [0.3, friezeHeight, 0.3],
        color: prefix === 'tuscan' ? color : detailColor,
      },
      explodeOffset: yOffset(1.2),
    })
  }

  // ── 6. Cornice ──────────────────────────────────────────────────────────
  const corniceBaseY = friezeBaseY + friezeHeight
  const corniceHeight = 0.04

  parts.push({
    id: `${prefix}-cornice`,
    label: `${orderLabel} Cornice`,
    description: opts.corniceDesc,
    geometry: {
      id: `${prefix}-cornice-geo`,
      type: 'box',
      position: [0, corniceBaseY + corniceHeight / 2, 0],
      args: [0.34, corniceHeight, 0.34],
      color: accentColor,
    },
    explodeOffset: yOffset(1.5),
  })

  if (opts.hasDentils) {
    parts.push({
      id: `${prefix}-dentils`,
      label: `${orderLabel} Dentils`,
      description: 'A row of small, closely spaced rectangular blocks beneath the cornice — an Ionic invention symbolizing rafter ends.',
      geometry: {
        id: `${prefix}-dentils-geo`,
        type: 'box',
        position: [0, corniceBaseY - 0.005, 0],
        args: [0.32, 0.01, 0.32],
        color: darken(color, 0.2),
      },
      explodeOffset: yOffset(1.5),
    })
  }

  if (opts.hasModillions) {
    parts.push({
      id: `${prefix}-modillions`,
      label: `${orderLabel} Modillions`,
      description: 'Ornamental bracket-like projections beneath the cornice, unique to the Corinthian and Composite orders.',
      geometry: {
        id: `${prefix}-modillions-geo`,
        type: 'box',
        position: [0, corniceBaseY - 0.015, 0],
        args: [0.33, 0.01, 0.33],
        color: darken(color, 0.25),
      },
      explodeOffset: yOffset(1.5),
    })
  }

  return parts
}

// ─── Color Utility ──────────────────────────────────────────────────────────

/** Darken a hex color by a factor (0–1). */
function darken(hex: string, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const f = 1 - amount
  const nr = Math.round(r * f)
  const ng = Math.round(g * f)
  const nb = Math.round(b * f)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

// ─── Order Definitions ──────────────────────────────────────────────────────

const TUSCAN_PARTS = makeOrderParts('tuscan', 'Tuscan', '#d4a574', {
  hasBase: true,
  shaftHeight: 0.7,
  shaftRadiusBottom: 0.1,
  shaftRadiusTop: 0.08,
  shaftSegments: 24,
  capitalHeight: 0.085,
  capitalDesc:
    'The simplest capital: a plain echinus (convex cushion) supporting a square abacus. No carved ornamentation — pure structural expression.',
  architraveFascias: 1,
  friezeDivided: false,
  friezeDesc: 'A blank, unadorned frieze band — the Tuscan order avoids all decorative enrichment.',
  corniceDesc: 'A simple projecting cornice with minimal molding profile.',
  hasDentils: false,
  hasModillions: false,
})

const DORIC_PARTS = makeOrderParts('doric', 'Doric', '#c9b896', {
  hasBase: false,
  shaftHeight: 0.8,
  shaftRadiusBottom: 0.1,
  shaftRadiusTop: 0.08,
  shaftSegments: 20,
  capitalHeight: 0.095,
  capitalDesc:
    'The Doric capital features a bold, spreading echinus beneath a plain square abacus. The profile is the key identifier of the order — earlier temples show a more splayed echinus.',
  architraveFascias: 1,
  friezeDivided: true,
  friezeDesc:
    'The most distinctive Doric element: alternating triglyphs (three-channelled blocks from wooden beam-end origins) and metopes (panels, sometimes sculpted). The triglyph-metope rhythm is the hallmark of the Doric order.',
  corniceDesc: 'A projecting cornice with mutules (flat blocks with guttae) on the soffit — recalling timber rafter construction.',
  hasDentils: false,
  hasModillions: false,
})

const IONIC_PARTS = makeOrderParts('ionic', 'Ionic', '#e8dcc8', {
  hasBase: true,
  shaftHeight: 0.9,
  shaftRadiusBottom: 0.09,
  shaftRadiusTop: 0.075,
  shaftSegments: 24,
  capitalHeight: 0.09,
  capitalDesc:
    'Defined by paired lateral volute scrolls (spiral ornaments), the Ionic capital is more ornate than the Doric. The volutes create a directional capital — the front and back faces differ from the sides.',
  architraveFascias: 3,
  friezeDivided: false,
  friezeDesc:
    'A continuous, unbroken frieze band — often carved with a continuous narrative relief (as on the Parthenon inner frieze). No triglyph rhythm.',
  corniceDesc: 'A projecting cornice with a row of dentils (small tooth-like blocks) beneath — an Ionic signature derived from closely spaced rafter ends.',
  hasDentils: true,
  hasModillions: false,
})

const CORINTHIAN_PARTS = makeOrderParts('corinthian', 'Corinthian', '#f0e6d4', {
  hasBase: true,
  shaftHeight: 1.0,
  shaftRadiusBottom: 0.09,
  shaftRadiusTop: 0.07,
  shaftSegments: 24,
  capitalHeight: 0.15,
  capitalDesc:
    'The tallest and most ornate capital: two or three rows of acanthus leaves surround a bell-shaped core, from which small volutes (caulicoli) and helices spring. Invented in Athens, it became the Roman favorite.',
  architraveFascias: 3,
  friezeDivided: false,
  friezeDesc:
    'A continuous frieze, often richly carved with garlands, putti, or figural scenes in Roman examples.',
  corniceDesc: 'An elaborate cornice with both dentils and modillions (scroll-shaped brackets) — the most layered cornice of any order.',
  hasDentils: true,
  hasModillions: true,
})

const COMPOSITE_PARTS = makeOrderParts('composite', 'Composite', '#f5ece0', {
  hasBase: true,
  shaftHeight: 1.0,
  shaftRadiusBottom: 0.09,
  shaftRadiusTop: 0.07,
  shaftSegments: 24,
  capitalHeight: 0.15,
  capitalDesc:
    'A Roman invention combining the Ionic volute scrolls above Corinthian acanthus leaves. The capital is the tallest of any order, expressing maximum decorative richness and imperial grandeur.',
  architraveFascias: 3,
  friezeDivided: false,
  friezeDesc:
    'A continuous frieze identical in form to the Corinthian, often bearing imperial iconography.',
  corniceDesc: 'Identical to the Corinthian cornice: dentils and modillions beneath a boldly projecting crown molding.',
  hasDentils: true,
  hasModillions: true,
})

// ─── Exported Config ────────────────────────────────────────────────────────

export const classicalOrdersComparisonConfig: ExplodedAssemblyConfig = {
  id: 'classical-orders-comparison',
  title: 'Classical Orders Comparison',
  description:
    'Side-by-side exploded comparison of the five classical column orders — Tuscan, Doric, Ionic, Corinthian, and Composite — showing proportional ratios, part anatomy, and decorative progression.',
  subject: 'history',
  comparisonMode: true,
  parts: [
    ...TUSCAN_PARTS,
    ...DORIC_PARTS,
    ...IONIC_PARTS,
    ...CORINTHIAN_PARTS,
    ...COMPOSITE_PARTS,
  ],
  camera: {
    position: [8, 4, 8],
    fov: 40,
  },
}
