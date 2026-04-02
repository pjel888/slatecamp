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

// Lason (concrete neutralizer/cleaner)
export const LASON_COVERAGE_SQM_PER_L = 10 // ~10 sqm per liter (diluted)
export const LASON_DILUTION_RATIO = 3 // 1 part muriatic acid : 3 parts water
export const LASON_PACKAGE_L = 1 // Standard 1L bottle

// Tile
export const TILE_ADHESIVE_KG_PER_SQM = 4 // ~4 kg per sqm (thin-bed)
export const TILE_GROUT_KG_PER_SQM = 0.5 // ~0.5 kg per sqm (wall tiles)
export const TILE_ADHESIVE_BAG_KG = 25 // Standard 25kg bag
export const TILE_GROUT_BAG_KG = 1 // Standard 1kg bag
