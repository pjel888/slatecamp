// src/features/3d-lab/config/modules/10-materials/wall-constants-performance.ts
// Wall Configurator v2 — Performance data and material costs
// ⚠️ ALL VALUES ARE APPROXIMATE FOR EDUCATIONAL USE — NEEDS SME VERIFICATION

import type { CoreType } from './wall-types'

// ─── Fire Resistance Ratings ────────────────────────────────────────────────
// ⚠️ UNVERIFIED — approximate values per ASTM E119 testing data

export const FIRE_RATING_BASE: Record<CoreType, number> = {
  'chb': 60,              // Source: NCMA TEK 7-1D — 150mm CHB unfilled = 1 hour
  'drywall': 30,          // Source: American Gypsum — single ½" gypsum each side = 30 min
  'plywood': 0,           // Source: Combustible assembly — not rated
  'cement-board': 60,     // Source: USG — cement board + Type X backing = 1 hour
  'brick': 120,           // Source: NCMA — 200mm brick masonry = 2 hours
  'solid-concrete': 120,  // Source: ACI 216 — 150mm solid concrete = 2 hours
  'existing-wall': 60,    // Source: Assumed — generic existing wall
} as const

export const FIRE_RATING_BONUSES = {
  /** Per gypsum layer bonus (minutes) — ⚠️ UNVERIFIED */
  gypsumLayerBonus: {
    '12.5': 15,           // ½" standard gypsum
    '15.9': 30,           // ⅝" Type X gypsum — Source: ASTM E119
  },
  /** Grouting bonus for CHB (minutes) — ⚠️ UNVERIFIED */
  groutingBonus: {
    none: 0,
    partial: 60,          // Source: NCMA — partially grouted adds ~1 hour
    solid: 180,           // Source: NCMA — solidly grouted 150mm = 4 hours total
  },
  /** Plaster bonus per side (minutes) — ⚠️ UNVERIFIED */
  plasterBonusPerSide: 15, // Source: ACI 216 — plaster adds protection
} as const

// ─── STC (Sound Transmission Class) Ratings ─────────────────────────────────
// ⚠️ UNVERIFIED — approximate values per ASTM E90/E413

export const STC_BASE: Record<CoreType, number> = {
  'chb': 45,              // Source: CMHA TEK 13-01D — 150mm CHB unplastered
  'drywall': 35,          // Source: National Gypsum — single ½" metal studs no insulation
  'plywood': 28,          // Source: Estimated — plywood on studs
  'cement-board': 33,     // Source: Estimated — cement board on metal studs
  'brick': 50,            // Source: CMHA — 200mm brick plastered
  'solid-concrete': 47,   // Source: Estimated — 150mm solid concrete
  'existing-wall': 40,    // Source: Assumed — generic existing wall
} as const

export const STC_BONUSES = {
  /** Insulation bonus (points) — ⚠️ UNVERIFIED */
  insulationBonus: 8,     // Source: National Gypsum — fiberglass adds 6-10 STC points
  /** Surface seal bonus per plastered side (points) — ⚠️ UNVERIFIED */
  surfaceSealBonusPerSide: 2, // Source: CMHA — plaster adds 2-3 STC points
  /** Double gypsum bonus (points) — ⚠️ UNVERIFIED */
  doubleGypsumBonus: 5,   // Source: National Gypsum — double layer adds ~5 STC
} as const

// ─── R-Value (Thermal Resistance) ───────────────────────────────────────────
// ⚠️ UNVERIFIED

export const R_VALUE_BASE: Record<CoreType, number> = {
  'chb': 1.8,
  'drywall': 1.0,
  'plywood': 1.5,
  'cement-board': 0.8,
  'brick': 1.5,
  'solid-concrete': 1.2,
  'existing-wall': 1.5,
} as const

export const R_VALUE_BONUSES = {
  /** Fiberglass batt insulation per 25mm depth — ⚠️ UNVERIFIED */
  insulationPerMm: 0.035,
} as const

// ─── Material Costs (Philippine Peso) ───────────────────────────────────────
// ⚠️ UNVERIFIED — approximate Metro Manila rates as of 2026-04
// Disclaimer: Prices vary by region and supplier

export const PRICE_DISCLAIMER = 'Prices are approximate Metro Manila rates as of 2026-04. Actual prices vary by region and supplier.'
export const PRICE_LAST_UPDATED = '2026-04'
export const PRICE_REGION = 'Metro Manila'

export const MATERIAL_COSTS_PHP = {
  chbPiece150: 18,            // Source: Scribd CHB doc — per piece 150×200×400mm
  chbPiece100: 14,            // Source: Scribd CHB doc — per piece 100×200×400mm
  mortarPerCuM: 3500,         // Source: Mackunhardware — Class B mortar per cu.m.
  rebarPerPiece6m_10mm: 75,   // Source: PH hardware suppliers — 10mm × 6m bar
  rebarPerPiece6m_12mm: 85,   // Source: PH hardware suppliers — 12mm × 6m bar
  rebarPerPiece6m_16mm: 150,  // Source: PH hardware suppliers — 16mm × 6m bar
  groutPerCuM: 4000,          // Source: Estimated — grout fill per cu.m.
  gypsumSheetHalf: 350,       // Source: PH suppliers — 12.5mm 4'×8' sheet
  gypsumSheetTypeX: 550,      // Source: PH suppliers — 15.9mm Type X 4'×8' sheet
  metalStudPiece: 120,        // Source: PH suppliers — C-stud per piece
  metalTrackPiece: 100,       // Source: PH suppliers — U-track per piece
  screwsPerBox: 180,          // Source: PH suppliers — box of 1000 drywall screws
  plasterPerCuM: 3500,        // Source: Similar to mortar cost
  skimCoatPerBag25kg: 350,    // Source: PH suppliers — per 25kg bag
  primerPerLiter: 200,        // Source: PH paint suppliers
  paintPerLiter: 250,         // Source: PH paint suppliers
  insulationPerSqm: 350,     // Source: PH suppliers — fiberglass batt per sqm
  brickPerPiece: 12,          // Source: PH suppliers — standard clay brick
} as const

// ─── Material Quantities per sqm ────────────────────────────────────────────

export const MATERIAL_QUANTITIES = {
  chbPerSqm: 12.5,           // Source: Scribd — 150×200×400mm CHB per sqm
  mortarPerSqm: 0.02,        // Source: Scribd — cu.m. mortar per sqm CHB
  gypsumSheetArea: 2.98,     // Source: Standard — 1.22m × 2.44m = 2.98 sqm per sheet
  studsPerLinearMeter: 1.67, // Source: At 600mm o.c. spacing
  screwsPerSqm: 24,          // Source: Standard — 300mm edge, 400mm field spacing
  paintCoveragePerLiter: 9,  // Source: Paint manufacturers — sqm per liter per coat
  primerCoveragePerLiter: 11, // Source: Paint manufacturers — sqm per liter
  skimCoatCoveragePerBag: 5, // Source: Manufacturer — sqm per 25kg bag
  plasterPerSqm: 0.013,      // Source: Standard — cu.m. plaster (12.7mm thick) per sqm
  brickPerSqm: 50,           // Source: Standard — 200×100×65mm bricks per sqm
} as const

// ─── Waste Factors ──────────────────────────────────────────────────────────

export const WASTE_FACTORS = {
  chb: 0.08,                  // 8% — Source: Industry standard
  gypsum: 0.12,               // 12% — Source: Industry standard (cuts/waste)
  mortar: 0.10,               // 10% — Source: Industry standard
  brick: 0.05,                // 5% — Source: Industry standard
  general: 0.10,              // 10% — Default waste factor
} as const

// ─── Labor Rates (PHP per day) ──────────────────────────────────────────────
// ⚠️ UNVERIFIED — approximate Metro Manila daily rates

export const LABOR_RATES_PHP = {
  masonPerDay: 900,           // Source: DPWH labor rates (approx)
  helperPerDay: 600,          // Source: DPWH labor rates (approx)
  drywallerPerDay: 1000,      // Source: Estimated
  painterPerDay: 800,         // Source: Estimated
  /** Sqm output per mason per day for CHB work */
  masonOutputSqmPerDay: 5,   // Source: Industry standard
  /** Sqm output per drywaller per day */
  drywallerOutputSqmPerDay: 10, // Source: Industry standard
  /** Sqm output per painter per day (2 coats) */
  painterOutputSqmPerDay: 25, // Source: Industry standard
} as const
