// ──────────────────────────────────────────────────────────────────────────────
// stairway-constants.ts — Philippine Code Constants & Rendering Constants
// All thresholds extracted from stairway-code-compliance.ts with code citations.
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
export const HEADROOM_PLANE_OPACITY = 0.5
export const HEADROOM_PASS_COLOR = '#dbeafe'        // Light blue — headroom plane when passing
export const CODE_VIOLATION_COLOR = '#DC2626'       // Universal red — active code/legal violation
export const STAIR_MODEL_COLOR = '#6B7280'          // Single neutral gray for the stair assembly

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
  TREAD:    STAIR_MODEL_COLOR,
  RISER:    STAIR_MODEL_COLOR,
  LANDING:  STAIR_MODEL_COLOR,
  HANDRAIL: STAIR_MODEL_COLOR,
} as const

// ──────────────────────────────────────────────────────────────────────────────
// Egress Requirements
// Source: RA 9514 IRR Rule 10 + PD 1096 Rule X
// ──────────────────────────────────────────────────────────────────────────────

/** Occupant Load Factors (sqm per person) — RA 9514 IRR Rule 10 §1004 */
export const OCCUPANT_LOAD_FACTORS: Record<string, number> = {
  assembly: 0.65,       // RA 9514 IRR Rule 10 §1004
  business: 9.3,        // RA 9514 IRR Rule 10 §1004
  educational: 1.85,    // RA 9514 IRR Rule 10 §1004
  residential: 18.6,    // RA 9514 IRR Rule 10 §1004
  mercantile: 2.8,      // RA 9514 IRR Rule 10 §1004
  industrial: 9.3,      // RA 9514 IRR Rule 10 §1004
}

/** Required Exits by Occupant Load — RA 9514 IRR Rule 10 §1005 */
export const RA9514_EXIT_THRESHOLDS = [
  { maxOccupants: 10, minExits: 1 },      // RA 9514 IRR Rule 10 §1005
  { maxOccupants: 100, minExits: 2 },      // RA 9514 IRR Rule 10 §1005
  { maxOccupants: 500, minExits: 3 },      // RA 9514 IRR Rule 10 §1005
  { maxOccupants: Infinity, minExits: 4 }, // RA 9514 IRR Rule 10 §1005
] as const

/** PD 1096 Floor Area Threshold for Minimum 2 Exits */
export const PD1096_LARGE_FLOOR_AREA_SQM = 500    // PD 1096 Rule X §1004

/** Exit Width Capacity — RA 9514 IRR Rule 10 §10.2.5 */
export const RA9514_WIDTH_PER_PERSON_MM = 5.1      // RA 9514 IRR Rule 10 §10.2.5
export const RA9514_MIN_EXIT_WIDTH_MM = 710         // RA 9514 IRR Rule 10 §1008

/** Travel Distance Limits (meters, unsprinklered) — RA 9514 IRR Rule 10 §1016 */
export const TRAVEL_DISTANCE_UNSPRINKLERED: Record<string, number> = {
  assembly: 46,     // RA 9514 IRR Rule 10 §1016
  business: 46,     // RA 9514 IRR Rule 10 §1016
  educational: 46,  // RA 9514 IRR Rule 10 §1016
  residential: 46,  // RA 9514 IRR Rule 10 §1016
  mercantile: 30,   // RA 9514 IRR Rule 10 §1016
  industrial: 31,   // RA 9514 IRR Rule 10 §1016
}

/** Travel Distance Limits (meters, sprinklered) — RA 9514 IRR Rule 10 §1016 */
export const TRAVEL_DISTANCE_SPRINKLERED: Record<string, number> = {
  assembly: 61,     // RA 9514 IRR Rule 10 §1016
  business: 61,     // RA 9514 IRR Rule 10 §1016
  educational: 61,  // RA 9514 IRR Rule 10 §1016
  residential: 61,  // RA 9514 IRR Rule 10 §1016
  mercantile: 46,   // RA 9514 IRR Rule 10 §1016
  industrial: 46,   // RA 9514 IRR Rule 10 §1016
}

// ──────────────────────────────────────────────────────────────────────────────
// Children's Safety — ADA §504 Advisory + IBC §1013.2
// ──────────────────────────────────────────────────────────────────────────────
export const ADA_CHILDREN_HANDRAIL_MAX_HEIGHT_MM = 711  // ADA §504 Advisory (28") ⚠️ UNVERIFIED
export const ADA_CHILDREN_MIN_CLEARANCE_MM = 229        // ADA §504 min clearance (9") ⚠️ UNVERIFIED
export const IBC_GUARD_MAX_SPACING_MM = 102             // IBC §1013.2 (4" sphere rule) ⚠️ UNVERIFIED
export const IBC_RISER_MAX_OPENING_MM = 13              // IBC §1011.3 (½" sphere) ⚠️ UNVERIFIED

// ──────────────────────────────────────────────────────────────────────────────
// Landing Requirements
// Source: IBC 2024 §1011.6 (Philippine practice follows IBC)
// ──────────────────────────────────────────────────────────────────────────────
export const LANDING_MIN_DEPTH_MM = 1219                // IBC 2024 §1011.6 (48") ⚠️ UNVERIFIED
export const COMPARISON_GHOST_COLOR = '#94a3b8'         // Ghost geometry for comparison/overlay
export const COMPARISON_GHOST_OPACITY = 0.2
