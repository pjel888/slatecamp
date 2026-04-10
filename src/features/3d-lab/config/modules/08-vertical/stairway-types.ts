// ──────────────────────────────────────────────────────────────────────────────
// stairway-types.ts — Stairway Configurator Type Definitions
// Stairway Configurator v2 module-specific types.
// These EXTEND (never replace) existing types from types/templates.ts.
// ──────────────────────────────────────────────────────────────────────────────

/** Raw parameter record type alias (matches ParametricSceneConfig.geometry signature) */
export type StairParams = Record<string, number | boolean | string>

// ── Comfort & Pitch ──────────────────────────────────────────────────────────

export type ComfortZoneStatus = 'comfortable' | 'too-cramped' | 'too-stretched'

export type PitchStatus = 'ramp-like' | 'comfortable' | 'steep' | 'ladder-like'

// ── Per-Law Compliance ───────────────────────────────────────────────────────

export interface PerLawEvaluation {
  applies: boolean
  passes: boolean
  limit: number       // The code-mandated threshold (mm)
  actual: number      // The current parameter value (mm)
  message: string     // Human-readable violation or pass message
  citation: string    // e.g., "PD 1096 IRR Rule VIII §804"
}

export interface ComplianceResult {
  pd1096: PerLawEvaluation
  bp220: PerLawEvaluation
  bp344: PerLawEvaluation
  ra9514: PerLawEvaluation
  conflicts: ConflictFlag[]
}

export type StairLawKey = 'pd1096' | 'bp220' | 'bp344' | 'ra9514'

export type StairDimensionKey =
  | 'riserHeight'
  | 'treadDepth'
  | 'stairWidth'
  | 'headroom'
  | 'handrailHeight'
  | 'verticalRise'

export type StairDimensionDirection = 'min' | 'max' | 'exact'

export interface StairLawStatus {
  lawKey: StairLawKey
  lawLabel: string
  color: string
  applies: boolean
  passes: boolean
  limit: number
  actual: number
  message: string
  citation: string
}

export interface StairDimensionStatus {
  dimension: StairDimensionKey
  direction: StairDimensionDirection
  actual: number
  activeLawKey: StairLawKey | null
  failingLawKey: StairLawKey | null
  color: string | null
  laws: StairLawStatus[]
  conflicts: ConflictFlag[]
}

export interface ConflictFlag {
  id: string            // e.g., "conflict-riser-bp220-vs-pd1096"
  laws: [string, string] // e.g., ["BP 220", "PD 1096"]
  dimension: string      // e.g., "riserHeight"
  message: string
}

// ── International Comparison ─────────────────────────────────────────────────

/** ⚠️ All international values are UNVERIFIED — require SME review before production */
export interface InternationalComparisonDelta {
  dimension: string    // e.g., "riserHeight"
  phValue: number      // Current Philippine law limit (mm)
  ibcValue: number     // IBC 2024 limit (mm)  ⚠️ UNVERIFIED
  adaValue: number     // ADA/ANSI A117.1 limit (mm)  ⚠️ UNVERIFIED
  ircValue: number     // IRC limit (mm)  ⚠️ UNVERIFIED
  phLaw: string        // Which PH law applies
}

// ── Stair Type Abstraction ───────────────────────────────────────────────────

export type StairTypeConfig =
  | { type: 'straight' }
  | { type: 'l-shape'; turnDirection: 'left' | 'right'; risersBeforeTurn: number }
  | { type: 'u-shape'; risersBeforeTurn: number }

export interface NormalizedTurningFlightSplit {
  before: number
  after: number
  minPerFlight: number
}

// ── Computed State (Single Source of Truth) ──────────────────────────────────

export interface ComputedStairState {
  // ── Raw parameters (passthrough) ──
  projectType: string
  isAccessibleRoute: boolean
  isExitStair: boolean
  isHighOccupancy: boolean
  stairWidth: number       // mm
  riserHeight: number      // mm
  treadDepth: number       // mm
  headroom: number         // mm
  handrailHeight: number   // mm
  numRisers: number

  // ── Stair type ──
  stairType: StairTypeConfig

  // ── Derived metrics ──
  twoRPlusT: number               // 2R+T Blondel value (mm)
  rPlusT: number                   // R+T secondary comfort check (mm)
  comfortStatus: ComfortZoneStatus // 600–650 mm → 'comfortable'
  pitchAngle: number               // degrees (atan2(riserHeight, treadDepth))
  pitchStatus: PitchStatus         // classification by angle range
  totalRise: number                // numRisers × riserHeight (mm)
  actualTotalRise: number          // Built rise including tolerance deviations (mm)
  totalRun: number                 // (numRisers - 1) × treadDepth (mm)
  stringerLength: number           // √(totalRise² + totalRun²) (mm)
  landingRequired: boolean         // totalRise > applicable maxVerticalRise
  actualRiserHeights: number[]     // Per-step riser heights after tolerance (mm)
  actualTreadElevations: number[]  // Cumulative tread elevations after each riser (mm)
  normalizedTurningFlightSplit: NormalizedTurningFlightSplit | null

  // ── Regime flags ──
  isBP220: boolean
  isResidential: boolean
  strictestMinWidth: number        // mm — max of all applicable law minimums
  widthDeficit: number             // max(0, strictestMinWidth - stairWidth) (mm)

  // ── Compliance evaluations (per dimension) ──
  riserCompliance: ComplianceResult
  treadCompliance: ComplianceResult
  widthCompliance: ComplianceResult
  headroomCompliance: ComplianceResult
  handrailCompliance: ComplianceResult
  verticalRiseCompliance: ComplianceResult
  dimensionStatuses: Record<StairDimensionKey, StairDimensionStatus>

  // ── Resolved violation colors (for geometry builder) ──
  riserColor: string | null       // Most severe active violation color, or null (pass)
  treadColor: string | null
  widthColor: string | null
  headroomViolation: boolean
  handrailColor: string | null

  // ── Tolerance mode (dimensional uniformity) ──
  toleranceMode: boolean
  toleranceRange: number           // mm (0–20)
  perStepRiserVariations: number[] // Array of length numRisers, each a deviation in mm
  uniformityViolationIndices: number[] // Indices of steps with >9.5mm deviation

  // ── International comparison deltas (Phase 2 preview) ──
  internationalDeltas: InternationalComparisonDelta[]
}

// ── Violation Preset Metadata ────────────────────────────────────────────────

export interface ViolationPresetMeta {
  primaryViolation: string   // Violation rule ID that this preset triggers
  primaryLaw: string         // Law code (e.g., "PD 1096")
  teachingGoal: string       // One-sentence pedagogical objective
}

export interface GeometryValidationFinding {
  code: string
  severity: 'error' | 'warning' | 'info'
  message: string
  ids: string[]
}

export interface GeometryValidationReport {
  findings: GeometryValidationFinding[]
  hasErrors: boolean
}
