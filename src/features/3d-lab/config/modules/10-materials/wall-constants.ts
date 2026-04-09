// src/features/3d-lab/config/modules/10-materials/wall-constants.ts
// Wall Configurator v2 — Philippine code constants and material data
// Every constant has a source citation comment

// ─── Philippine Building Code Thresholds ────────────────────────────────────

export const WALL_CODES = {
  PD_1096: {
    /** Minimum ceiling height for habitable rooms */
    MIN_HABITABLE_HEIGHT_MM: 2400, // Source: PD 1096 Rule VII §708
    /** Minimum ceiling height for service rooms */
    MIN_SERVICE_HEIGHT_MM: 2100,   // Source: PD 1096 Rule VII §708
  },
  NSCP: {
    /** Minimum thickness for CHB load-bearing walls */
    CHB_BEARING_MIN_MM: 150,       // Source: NSCP 2015 §702.1
    /** Minimum thickness for CHB non-load-bearing walls */
    CHB_NON_BEARING_MIN_MM: 100,   // Source: NSCP 2015 §702.1
    /** Maximum brick wall height before engineering review */
    BRICK_HEIGHT_REVIEW_MM: 3600,  // Source: NSCP 2015 §705.2
    /** Maximum rebar spacing in CHB walls */
    CHB_MAX_REBAR_SPACING_MM: 1200, // Source: NSCP 2015 structural notes
    /** Maximum stiffener column spacing in CHB walls */
    CHB_MAX_STIFFENER_SPACING_MM: 4000, // Source: NSCP structural notes
  },
} as const

// ─── Layer Thicknesses (meters) ─────────────────────────────────────────────

export const LAYER_THICKNESSES = {
  plaster: 0.0127,   // 12.7mm — Source: Philippine construction standard practice
  skimCoat: 0.003,   // 3mm — Source: Philippine construction standard practice
  primer: 0.001,     // 1mm — Source: Paint manufacturer specification
  paint: 0.001,      // 1mm — Source: Paint manufacturer specification
} as const

// ─── Paint Colors ───────────────────────────────────────────────────────────

export const PAINT_COLORS: Record<string, string> = {
  'White':      '#ffffff',
  'Cream':      '#fef9ef',
  'Light Gray': '#e5e7eb',
  'Sky Blue':   '#bfdbfe',
  'Sage Green': '#bbf7d0',
  'Warm Beige': '#fde68a',
}

// ─── Structural Element Colors ──────────────────────────────────────────────

export const STRUCTURAL_ELEMENT_COLORS = {
  metalStud: '#94a3b8',           // Steel silver — drywall, plywood, cement board
  metalTrack: '#64748b',          // Steel silver (darker) — drywall, plywood, cement board
  rebar: '#374151',               // Dark steel — CHB, concrete
  groutFill: '#6b7280',           // Concrete gray — CHB (in cells containing rebar)
  insulationFiberglass: '#fda4af', // Pink — drywall (between studs)
  insulationMineralWool: '#fde047', // Yellow — drywall (between studs)
  bondBeam: '#9ca3af',            // Highlighted gray — CHB (grouted course)
} as const

// ─── Layer Colors ───────────────────────────────────────────────────────────

export const LAYER_COLORS = {
  plaster: '#d4d0ca',
  skimCoat: '#f5f5f0',
  primer: '#e8e8e8',
} as const

// ─── Layer Opacities ────────────────────────────────────────────────────────

export const LAYER_OPACITIES = {
  plaster: 0.85,
  skimCoat: 0.9,
  primer: 0.8,
  paint: 0.9,
} as const
