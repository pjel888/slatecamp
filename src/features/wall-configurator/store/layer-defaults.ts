import type { Layer } from '../types/wall.types'

export const CHB_DEFAULT_LAYERS: Layer[] = [
  { code: 'CHB_CORE', label: 'CHB Units', basis: 'piece', applyToSides: false, wasteFactor: 0.05, packaging: { unit: 'pcs', sizePerUnit: 1 }, enabled: true },
  { code: 'PLASTER', label: 'Cement-Sand Plaster', basis: 'area', applyToSides: true, wasteFactor: 0.05, packaging: { unit: 'bag', sizePerUnit: 40 }, enabled: true },
  { code: 'SKIM_COAT', label: 'Skim / Putty Coat', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'kg', sizePerUnit: 1 }, enabled: false },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

export const DRYWALL_DEFAULT_LAYERS: Layer[] = [
  { code: 'GYP_BOARD', label: "Gypsum Board 4'\u00d78'", basis: 'panel', applyToSides: true, wasteFactor: 0.05, packaging: { unit: 'board', sizePerUnit: 2.973 }, enabled: true },
  { code: 'JOINT_TAPE', label: 'Mesh Joint Tape', basis: 'linear', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'lm', sizePerUnit: 1 }, enabled: true },
  { code: 'JOINT_COMPOUND', label: 'Joint Compound', basis: 'linear', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

export const EXISTING_WALL_DEFAULT_LAYERS: Layer[] = [
  { code: 'SKIM_COAT', label: 'Skim / Putty Coat', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'kg', sizePerUnit: 1 }, enabled: false },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

export const PLYWOOD_DEFAULT_LAYERS: Layer[] = [
  { code: 'PLY_SHEET', label: "Plywood Sheet 4'×8'", basis: 'panel', applyToSides: true, wasteFactor: 0.05, packaging: { unit: 'sheet', sizePerUnit: 2.973 }, enabled: true },
  { code: 'WOOD_FRAME', label: 'Wood Frame (2×3 lumber)', basis: 'linear', applyToSides: false, wasteFactor: 0.10, packaging: { unit: 'pcs', sizePerUnit: 1 }, enabled: true },
  { code: 'NAILS', label: 'Common Wire Nails', basis: 'area', applyToSides: true, wasteFactor: 0.15, packaging: { unit: 'kg', sizePerUnit: 1 }, enabled: true },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

export const CEMENT_BOARD_DEFAULT_LAYERS: Layer[] = [
  { code: 'CB_SHEET', label: "Cement Board 4'×8'", basis: 'panel', applyToSides: true, wasteFactor: 0.05, packaging: { unit: 'sheet', sizePerUnit: 2.973 }, enabled: true },
  { code: 'JOINT_TAPE', label: 'Mesh Joint Tape', basis: 'linear', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'lm', sizePerUnit: 1 }, enabled: true },
  { code: 'JOINT_COMPOUND', label: 'Joint Compound', basis: 'linear', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'SKIM_COAT', label: 'Skim / Putty Coat', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'kg', sizePerUnit: 1 }, enabled: false },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

export const BRICK_DEFAULT_LAYERS: Layer[] = [
  { code: 'BRICK_CORE', label: 'Brick Units', basis: 'piece', applyToSides: false, wasteFactor: 0.05, packaging: { unit: 'pcs', sizePerUnit: 1 }, enabled: true },
  { code: 'PLASTER', label: 'Cement-Sand Plaster', basis: 'area', applyToSides: true, wasteFactor: 0.05, packaging: { unit: 'bag', sizePerUnit: 40 }, enabled: true },
  { code: 'SKIM_COAT', label: 'Skim / Putty Coat', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'kg', sizePerUnit: 1 }, enabled: false },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

export const SOLID_CONCRETE_DEFAULT_LAYERS: Layer[] = [
  { code: 'ROUGHENING', label: 'Surface Roughening / Hacking', basis: 'area', applyToSides: true, wasteFactor: 0, packaging: { unit: 'sqm', sizePerUnit: 1 }, enabled: true },
  { code: 'PLASTER', label: 'Cement-Sand Plaster', basis: 'area', applyToSides: true, wasteFactor: 0.05, packaging: { unit: 'bag', sizePerUnit: 40 }, enabled: true },
  { code: 'SKIM_COAT', label: 'Skim / Putty Coat', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'kg', sizePerUnit: 1 }, enabled: true },
  { code: 'PRIMER', label: 'Primer', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 4 }, enabled: true },
  { code: 'TOPCOAT', label: 'Topcoat Paint', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 16 }, enabled: true },
]

// Lason (concrete neutralizer) layer — only for masonry types
export const LASON_LAYER: Layer = {
  code: 'LASON', label: 'Lason (Concrete Neutralizer)', basis: 'area', applyToSides: true, wasteFactor: 0.10, packaging: { unit: 'L', sizePerUnit: 1 }, enabled: true,
}

// Tile layers
export const TILE_LAYERS: Layer[] = [
  { code: 'TILE', label: 'Wall Tiles', basis: 'area', applyToSides: false, wasteFactor: 0.10, packaging: { unit: 'pcs', sizePerUnit: 1 }, enabled: true },
  { code: 'TILE_ADHESIVE', label: 'Tile Adhesive', basis: 'area', applyToSides: false, wasteFactor: 0.10, packaging: { unit: 'bag', sizePerUnit: 25 }, enabled: true },
  { code: 'TILE_GROUT', label: 'Tile Grout', basis: 'area', applyToSides: false, wasteFactor: 0.10, packaging: { unit: 'bag', sizePerUnit: 1 }, enabled: true },
]

/** Masonry core types that support lason (concrete neutralizer) */
export const MASONRY_CORE_TYPES = new Set(['chb', 'brick', 'solid-concrete', 'existing-wall'])

export function getDefaultLayers(coreType: 'chb' | 'drywall' | 'plywood' | 'cement-board' | 'brick' | 'solid-concrete' | 'existing-wall'): Layer[] {
  const map = {
    chb: CHB_DEFAULT_LAYERS,
    drywall: DRYWALL_DEFAULT_LAYERS,
    plywood: PLYWOOD_DEFAULT_LAYERS,
    'cement-board': CEMENT_BOARD_DEFAULT_LAYERS,
    brick: BRICK_DEFAULT_LAYERS,
    'solid-concrete': SOLID_CONCRETE_DEFAULT_LAYERS,
    'existing-wall': EXISTING_WALL_DEFAULT_LAYERS,
  }
  // Return deep copies to avoid mutation
  return JSON.parse(JSON.stringify(map[coreType]))
}
