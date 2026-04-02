// Philippine construction engineering constants — single source of truth
// Update this file only when standards change; no formulas need modification.

export const CHB_FACE_WIDTH_M = 0.40
export const CHB_FACE_HEIGHT_M = 0.20
export const CHB_FACE_AREA_SQM = CHB_FACE_WIDTH_M * CHB_FACE_HEIGHT_M // 0.08

export const BOARD_WIDTH_M = 1.2192    // 4 ft
export const BOARD_HEIGHT_M = 2.4384   // 8 ft
export const BOARD_AREA_SQM = BOARD_WIDTH_M * BOARD_HEIGHT_M // 2.973

export const PLASTER_THICKNESS_M = 0.0127 // 12.7 mm = 1/2 inch minimum
export const DRY_VOLUME_FACTOR = 1.33
export const CEMENT_MIX_FRACTION = 1 / 3
export const SAND_MIX_FRACTION = 2 / 3
export const CEMENT_BULK_DENSITY_KG_M3 = 1440
export const CEMENT_BAG_KG = 40

export const PAINT_COVERAGE_SQM_PER_L = 7
export const JC_COVERAGE_LM_PER_LITER = 12

export const PACKAGE_PAINT_PAIL_L = 16
export const PACKAGE_PAINT_CAN_L = 4
export const PACKAGE_JC_CAN_SMALL_L = 4
export const PACKAGE_JC_CAN_LARGE_L = 16

// Plywood
export const PLYWOOD_SHEET_WIDTH_M = 1.2192  // 4 ft
export const PLYWOOD_SHEET_HEIGHT_M = 2.4384 // 8 ft
export const PLYWOOD_SHEET_AREA_SQM = PLYWOOD_SHEET_WIDTH_M * PLYWOOD_SHEET_HEIGHT_M // 2.973

// Cement board (HardieFlex)
export const CEMENT_BOARD_WIDTH_M = 1.2192   // 4 ft
export const CEMENT_BOARD_HEIGHT_M = 2.4384  // 8 ft
export const CEMENT_BOARD_AREA_SQM = CEMENT_BOARD_WIDTH_M * CEMENT_BOARD_HEIGHT_M // 2.973

// Brick
export const BRICK_LENGTH_M = 0.20
export const BRICK_HEIGHT_M = 0.10
export const BRICK_FACE_AREA_SQM = BRICK_LENGTH_M * BRICK_HEIGHT_M // 0.02
export const BRICKS_PER_SQM = 50 // ~50 pcs/sqm with 10mm mortar joints

// Solid concrete
export const CONCRETE_DEFAULT_THICKNESS_M = 0.15 // 150mm

// ─── PH Industry Standard Unit Prices (PHP, Metro Manila 2025 baseline) ──────
// Sources: Philcon Prices, ToolsPH, Construct PH, Boysen PH, hardware surveys.
// Users can override in the UI. Recommended midpoint values for estimation.

export const DEFAULT_UNIT_PRICES: Record<string, number> = {
  // CHB by thickness
  CHB_CORE_100: 18,           // ₱18/pc — 4" (100mm) non-load-bearing
  CHB_CORE_150: 19.5,         // ₱19.50/pc — 6" (150mm) standard load-bearing
  CHB_CORE_200: 20.5,         // ₱20.50/pc — 8" (200mm) heavy load-bearing
  CHB_CORE: 19.5,             // fallback
  CHB_MORTAR_CEMENT: 290,     // ₱290/bag (40kg Portland cement Type I)
  CHB_MORTAR_SAND: 1350,      // ₱1,350/cu.m (washed sand)

  // Brick
  BRICK_CORE: 17.5,           // ₱17.50/pc (standard clay brick)
  BRICK_MORTAR_CEMENT: 290,   // ₱290/bag

  // Gypsum board by thickness + moisture resistance
  GYP_BOARD_10: 340,          // ₱340/board — 9.5mm standard
  GYP_BOARD_13: 365,          // ₱365/board — 12.5mm standard (most common)
  GYP_BOARD_15: 550,          // ₱550/board — 15mm fire-rated
  GYP_BOARD_MR_10: 400,       // ₱400/board — 9.5mm moisture-resistant
  GYP_BOARD_MR_13: 425,       // ₱425/board — 12.5mm moisture-resistant
  GYP_BOARD_MR_15: 620,       // ₱620/board — 15mm moisture-resistant + fire
  GYP_BOARD: 365,             // fallback
  METAL_STUD: 180,            // ₱180/pc (C-stud 100×32mm, 0.5mm, 3m)

  // Plywood by thickness
  PLY_SHEET_9: 1350,          // ₱1,350/sheet — 9mm marine plywood 4'×8'
  PLY_SHEET_12: 1800,         // ₱1,800/sheet — 12mm marine plywood
  PLY_SHEET_18: 2900,         // ₱2,900/sheet — 18mm marine plywood
  PLY_SHEET: 1800,            // fallback

  // Cement board (HardieFlex) by thickness
  CB_SHEET_6: 650,            // ₱650/sheet — 6mm fiber cement 4'×8'
  CB_SHEET_9: 850,            // ₱850/sheet — 9mm fiber cement
  CB_SHEET_12: 1150,          // ₱1,150/sheet — 12mm fiber cement
  CB_SHEET: 850,              // fallback

  // Treatment
  LASON: 290,                 // ₱290/L (Boysen B-44 neutralizer)
  SKIM_COAT: 120,             // ₱120/kg (wall putty/skim coat)
  PLASTER_CEMENT: 290,        // ₱290/bag (40kg)
  PLASTER_SAND: 1350,         // ₱1,350/cu.m

  // Paint per liter
  PRIMER: 300,                // ₱300/L (latex primer, e.g. Boysen Permacoat)
  TOPCOAT: 370,               // ₱370/L (acrylic latex topcoat, mid-range)

  // Tiles per piece
  TILE_300: 70,               // ₱70/pc (ceramic 300×300)
  TILE_600: 115,              // ₱115/pc (ceramic 300×600)
  TILE_LARGE: 240,            // ₱240/pc (porcelain 600×600)
  TILE_ADHESIVE: 700,         // ₱700/bag (25kg)
  TILE_GROUT: 30,             // ₱30/bag (1kg)
}

/** Resolve the correct unit price key based on core type, thickness, and moisture resistance */
export function resolveUnitPrice(
  layerCode: string,
  coreThicknessMM: number,
  coreMoistureResistant: boolean,
): number {
  // CHB: price by thickness
  if (layerCode === 'CHB_CORE') {
    if (coreThicknessMM <= 100) return DEFAULT_UNIT_PRICES['CHB_CORE_100']
    if (coreThicknessMM <= 150) return DEFAULT_UNIT_PRICES['CHB_CORE_150']
    return DEFAULT_UNIT_PRICES['CHB_CORE_200']
  }

  // Gypsum board: price by thickness + MR
  if (layerCode === 'GYP_BOARD') {
    const prefix = coreMoistureResistant ? 'GYP_BOARD_MR_' : 'GYP_BOARD_'
    if (coreThicknessMM <= 10) return DEFAULT_UNIT_PRICES[prefix + '10'] ?? 340
    if (coreThicknessMM <= 13) return DEFAULT_UNIT_PRICES[prefix + '13'] ?? 365
    return DEFAULT_UNIT_PRICES[prefix + '15'] ?? 550
  }

  // Plywood: price by thickness
  if (layerCode === 'PLY_SHEET') {
    if (coreThicknessMM <= 9) return DEFAULT_UNIT_PRICES['PLY_SHEET_9']
    if (coreThicknessMM <= 12) return DEFAULT_UNIT_PRICES['PLY_SHEET_12']
    return DEFAULT_UNIT_PRICES['PLY_SHEET_18']
  }

  // Cement board: price by thickness
  if (layerCode === 'CB_SHEET') {
    if (coreThicknessMM <= 6) return DEFAULT_UNIT_PRICES['CB_SHEET_6']
    if (coreThicknessMM <= 9) return DEFAULT_UNIT_PRICES['CB_SHEET_9']
    return DEFAULT_UNIT_PRICES['CB_SHEET_12']
  }

  return DEFAULT_UNIT_PRICES[layerCode] ?? 0
}

// ─── PH Labor Rates & Productivity (2025 Metro Manila) ──────────────────────
// Daily wage rates (8-hour workday)
export const LABOR_DAILY_RATE_MASON = 700        // ₱700/day — skilled mason
export const LABOR_DAILY_RATE_HELPER = 550       // ₱550/day — helper/laborer
export const LABOR_DAILY_RATE_PAINTER = 650      // ₱650/day — painter
export const LABOR_DAILY_RATE_CARPENTER = 700    // ₱700/day — carpenter/installer

// Productivity rates (m²/day per small crew = 1 skilled + 1 helper)
export interface LaborTask {
  label: string
  productivitySqmPerDay: number
  crewDailyRate: number  // combined daily rate for the crew
}

export const LABOR_TASKS: Record<string, LaborTask[]> = {
  chb: [
    { label: 'CHB Laying', productivitySqmPerDay: 8, crewDailyRate: 1250 },
    { label: 'Plastering (both sides)', productivitySqmPerDay: 4, crewDailyRate: 1250 },
  ],
  drywall: [
    { label: 'Framing + Boarding', productivitySqmPerDay: 18, crewDailyRate: 1400 },
    { label: 'Jointing (3 coats)', productivitySqmPerDay: 12, crewDailyRate: 1250 },
  ],
  plywood: [
    { label: 'Frame + Sheathing', productivitySqmPerDay: 18, crewDailyRate: 1400 },
    { label: 'Putty + Sanding', productivitySqmPerDay: 15, crewDailyRate: 1250 },
  ],
  'cement-board': [
    { label: 'Framing + Boarding', productivitySqmPerDay: 14, crewDailyRate: 1400 },
    { label: 'Jointing', productivitySqmPerDay: 11, crewDailyRate: 1250 },
  ],
  brick: [
    { label: 'Brick Laying', productivitySqmPerDay: 6.5, crewDailyRate: 1250 },
    { label: 'Plastering (both sides)', productivitySqmPerDay: 4, crewDailyRate: 1250 },
  ],
  'solid-concrete': [
    { label: 'Formwork + Rebar', productivitySqmPerDay: 10, crewDailyRate: 2100 },
    { label: 'Skim / Render', productivitySqmPerDay: 9, crewDailyRate: 1250 },
  ],
  'existing-wall': [
    { label: 'Surface Prep', productivitySqmPerDay: 30, crewDailyRate: 1200 },
  ],
}

// Painting labor (applies to all types when paint finish selected)
export const LABOR_PAINTING: LaborTask = {
  label: 'Painting (primer + topcoat)',
  productivitySqmPerDay: 22,
  crewDailyRate: 1200, // painter + helper
}

// Lason (concrete neutralizer/cleaner)
export const LASON_COVERAGE_SQM_PER_L = 10 // ~10 sqm per liter (diluted)
export const LASON_DILUTION_RATIO = 3 // 1 part muriatic acid : 3 parts water
export const LASON_PACKAGE_L = 1 // Standard 1L bottle

// Tile
export const TILE_ADHESIVE_KG_PER_SQM = 4 // ~4 kg per sqm (thin-bed)
export const TILE_GROUT_KG_PER_SQM = 0.5 // ~0.5 kg per sqm (wall tiles)
export const TILE_ADHESIVE_BAG_KG = 25 // Standard 25kg bag
export const TILE_GROUT_BAG_KG = 1 // Standard 1kg bag
