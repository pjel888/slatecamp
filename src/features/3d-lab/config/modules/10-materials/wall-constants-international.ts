// src/features/3d-lab/config/modules/10-materials/wall-constants-international.ts
// International wall construction reference data
// ⚠️ ALL VALUES ARE UNVERIFIED — for educational comparison only

// ─── Why Philippine Construction Favors CHB + RC Frame ──────────────────────
// ⚠️ UNVERIFIED — educational context for international comparison

export const PH_CONSTRUCTION_CONTEXT = {
  rationale: [
    'Seismic Zone: Philippines is in the Pacific Ring of Fire — masonry with RC frame provides ductility',
    'Typhoon Resistance: CHB + RC frame withstands sustained wind loads better than light-frame wood',
    'Termite Resistance: Wood-frame construction is vulnerable to tropical termite species',
    'Moisture Management: CHB handles tropical humidity without vapor barrier complexity',
    'Local Material Availability: CHB, cement, and rebar are locally manufactured throughout PH',
    'Labor Skill Base: Filipino masons are trained in CHB + RC construction from apprenticeship',
  ],
  /** Source: General construction practice in the Philippines */
  source: 'Philippine architectural practice — ⚠️ UNVERIFIED generalization',
} as const

// ─── North American Wood Frame (for comparison) ────────────────────────────
// ⚠️ UNVERIFIED

export const NORTH_AMERICAN_WOOD_FRAME = {
  description: 'Light wood frame — dominant residential construction in USA/Canada',
  studMaterial: '2×4 or 2×6 SPF (spruce-pine-fir) lumber',
  studSpacingMm: 406, // 16" on center
  sheathingMaterial: 'OSB or plywood, 11mm (7/16") typical',
  insulationType: 'Fiberglass batt or spray foam',
  exteriorCladding: 'Vinyl siding, fiber cement, or brick veneer',
  fireRatingMinutes: 30, // Unprotected; 60 with Type X gypsum
  stcRating: 33, // Basic wood frame, no insulation
  costPerSqmUSD: 120, // ⚠️ UNVERIFIED — rough US average 2024
  advantages: [
    'Fast construction (days for a house)',
    'Good thermal insulation (R-13 to R-21 in wall cavity)',
    'Lightweight — smaller foundations',
    'Easy to modify/renovate',
  ],
  disadvantages: [
    'Combustible — requires fire-treated materials or sprinklers',
    'Vulnerable to termites, rot, and moisture damage',
    'Poor seismic performance without shear walls',
    'Not typhoon-resistant without hurricane strapping',
  ],
  /** Source: IRC (International Residential Code) — ⚠️ UNVERIFIED */
  source: 'IRC 2021, general US construction practice',
} as const

// ─── European Masonry (for comparison) ─────────────────────────────────────
// ⚠️ UNVERIFIED

export const EUROPEAN_MASONRY = {
  description: 'Autoclaved Aerated Concrete (AAC) block — common in EU residential',
  blockMaterial: 'AAC (Autoclaved Aerated Concrete) — Ytong/Hebel',
  blockSizeMm: '600 × 250 × 200mm (typical)',
  mortarType: 'Thin-bed adhesive mortar (2-3mm joints)',
  fireRatingMinutes: 240, // AAC is excellent for fire
  stcRating: 42, // 200mm AAC block
  thermalRValue: 2.5, // Per 200mm — much better than CHB
  costPerSqmEUR: 80, // ⚠️ UNVERIFIED
  advantages: [
    'Excellent thermal insulation (no additional insulation needed in mild climates)',
    'Fire resistant (4-hour rating for 200mm)',
    'Lightweight (500 kg/m³ vs 2000 kg/m³ for CHB)',
    'Easy to cut and shape with hand tools',
    'Good acoustic performance',
  ],
  disadvantages: [
    'Lower compressive strength than CHB — limited height without reinforcement',
    'Absorbs moisture — requires rendering/plastering',
    'Not locally available in many tropical countries',
    'Requires specialized thin-bed mortar',
  ],
  source: 'European masonry practice — ⚠️ UNVERIFIED',
} as const

// ─── IBC Wall Requirements (for comparison) ────────────────────────────────
// ⚠️ UNVERIFIED

export const IBC_WALL_REQUIREMENTS = {
  /** IBC minimum STC for multifamily unit-to-unit partitions */
  minSTCMultifamily: 50, // Source: IBC §1207.2 — ⚠️ UNVERIFIED
  /** IBC minimum fire rating for corridor walls in commercial buildings */
  minFireRatingCorridorMinutes: 60, // Source: IBC Table 602 — ⚠️ UNVERIFIED
  /** IBC minimum fire rating for dwelling unit separation */
  minFireRatingDwellingMinutes: 60, // Source: IBC §420.2 — ⚠️ UNVERIFIED
  /** ASTM E119 — Standard test for fire resistance */
  fireTestStandard: 'ASTM E119',
  /** ASTM E90 — Standard test for sound transmission */
  soundTestStandard: 'ASTM E90',
  /** ASTM E413 — Classification of STC ratings */
  stcClassificationStandard: 'ASTM E413',
  source: 'IBC 2021 — ⚠️ UNVERIFIED',
} as const
