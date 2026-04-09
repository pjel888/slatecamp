// ──────────────────────────────────────────────────────────────────────────────
// stairway-constants.ts — Philippine Code Constants & Rendering Constants
// All thresholds extracted from stairway-configurator.ts with code citations.
// ──────────────────────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────────────────────
// PD 1096 — National Building Code (NBCP)
// Source: PD 1096 IRR Rule VIII §804
// ──────────────────────────────────────────────────────────────────────────────
export const PD1096_MAX_RISER_HEIGHT_MM = 200       // PD 1096 IRR Rule VIII §804
export const PD1096_MIN_TREAD_DEPTH_MM = 200        // PD 1096 IRR Rule VIII §804
export const PD1096_MIN_HEADROOM_MM = 2000          // PD 1096 IRR Rule VIII §804
export const PD1096_MAX_VERTICAL_RISE_MM = 3600     // PD 1096 IRR Rule VIII §804
export const PD1096_MIN_WIDTH_HIGH_OCC_MM = 1100    // PD 1096 IRR Rule VIII §804 (occupant load > 50)
export const PD1096_MIN_WIDTH_COMMERCIAL_MM = 900   // PD 1096 IRR Rule VIII §804 (10–50 occupants)
export const PD1096_MIN_WIDTH_RESIDENTIAL_MM = 750  // PD 1096 IRR Rule VIII §804 (private, ≤10 persons)
export const PD1096_HANDRAIL_MIN_HEIGHT_MM = 800    // PD 1096 IRR Rule VIII §804
export const PD1096_HANDRAIL_MAX_HEIGHT_MM = 900    // PD 1096 IRR Rule VIII §804

// ──────────────────────────────────────────────────────────────────────────────
// BP 220 — Socialized/Economic Housing
// Source: BP 220 IRR · DHSUD
// ──────────────────────────────────────────────────────────────────────────────
export const BP220_MAX_RISER_HEIGHT_MM = 250        // BP 220 IRR · DHSUD
export const BP220_MIN_TREAD_DEPTH_MM = 200         // BP 220 IRR · DHSUD
export const BP220_MIN_WIDTH_MM = 600               // BP 220 IRR · DHSUD

// ──────────────────────────────────────────────────────────────────────────────
// BP 344 — Accessibility Law
// Source: BP 344 IRR · DPWH
// ──────────────────────────────────────────────────────────────────────────────
export const BP344_MIN_ACCESSIBLE_WIDTH_MM = 1200   // BP 344 IRR · DPWH
export const BP344_HANDRAIL_UPPER_HEIGHT_MM = 900   // BP 344 IRR · DPWH
export const BP344_HANDRAIL_LOWER_HEIGHT_MM = 700   // BP 344 IRR · DPWH
export const BP344_HANDRAIL_EXTENSION_MM = 300      // BP 344 IRR · DPWH

// ──────────────────────────────────────────────────────────────────────────────
// RA 9514 — Fire Code of the Philippines
// Source: RA 9514 IRR · BFP
// ──────────────────────────────────────────────────────────────────────────────
export const RA9514_MAX_RISER_HEIGHT_MM = 180       // RA 9514 IRR · BFP
export const RA9514_MIN_TREAD_DEPTH_MM = 200        // RA 9514 IRR · BFP
export const RA9514_MIN_WIDTH_MM = 900              // RA 9514 IRR · BFP
export const RA9514_MAX_VERTICAL_RISE_MM = 3000     // RA 9514 IRR · BFP

// ──────────────────────────────────────────────────────────────────────────────
// Blondel Comfort Formula
// Source: François Blondel, Cours d'Architecture (1675)
// ──────────────────────────────────────────────────────────────────────────────
export const BLONDEL_COMFORT_MIN_MM = 600           // 2R+T minimum (Blondel 1672)
export const BLONDEL_COMFORT_MAX_MM = 650           // 2R+T maximum (Blondel 1672)
export const BLONDEL_COMFORT_OPTIMAL_MM = 630       // 2R+T sweet spot (Blondel 1672)
export const BLONDEL_SECONDARY_MIN_MM = 430         // R+T minimum (European practice)
export const BLONDEL_SECONDARY_MAX_MM = 450         // R+T maximum (European practice)

// ──────────────────────────────────────────────────────────────────────────────
// Pitch Angle Thresholds (degrees)
// Source: Stairway ergonomics research (Templer, 1976)
// ──────────────────────────────────────────────────────────────────────────────
export const PITCH_RAMP_THRESHOLD_DEG = 20          // Below = ramp-like
export const PITCH_COMFORTABLE_MAX_DEG = 35         // Above = steep
export const PITCH_STEEP_MAX_DEG = 42               // Above = ladder-like

// ──────────────────────────────────────────────────────────────────────────────
// Dimensional Uniformity
// Source: IBC 2024 §1011.5.4 (tolerance applies to Philippine practice)
// ──────────────────────────────────────────────────────────────────────────────
export const UNIFORMITY_TOLERANCE_MM = 9.5          // Max deviation between largest/smallest in flight

// ──────────────────────────────────────────────────────────────────────────────
// Geometry Rendering Constants (scene units = meters)
// ──────────────────────────────────────────────────────────────────────────────
export const TREAD_THICKNESS_M = 0.03
export const RISER_THICKNESS_M = 0.015
export const STRINGER_THICKNESS_M = 0.04
export const HANDRAIL_RADIUS_M = 0.02
export const BP344_GHOST_RAIL_RADIUS_M = 0.015
export const BP344_GHOST_OPACITY = 0.4
export const BP344_GHOST_OFFSET_M = 0.03
export const WIDTH_DEFICIT_OPACITY = 0.15
export const HEADROOM_PLANE_OPACITY = 0.3
export const HEADROOM_PASS_COLOR = '#dbeafe'        // Light blue — headroom plane when passing

// ──────────────────────────────────────────────────────────────────────────────
// Law Color Palette (Ordered by Severity)
// Each law has a permanent color identity. These are never reused elsewhere.
// ──────────────────────────────────────────────────────────────────────────────
export const LAW_COLORS = {
  RA_9514: '#E74C3C',   // Evacuation Red — CRITICAL (life-safety)
  BP_344:  '#3498DB',    // Access Blue — HIGH (civil rights overlay)
  PD_1096: '#4A7FAD',    // Code Slate — STANDARD (baseline)
  BP_220:  '#F5A623',    // Housing Amber — CONTEXTUAL (relaxes baseline)
  PASS:    '#2ECC71',    // Clearance Green
} as const

export const NEUTRAL_COLORS = {
  TREAD:    '#a1a1aa',
  RISER:    '#a1a1aa',
  LANDING:  '#a1a1aa',
  HANDRAIL: '#71717a',
} as const
