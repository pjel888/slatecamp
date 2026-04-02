export type CoreType =
  | 'chb'           // Concrete Hollow Block masonry
  | 'drywall'       // Gypsum board on metal/wood studs
  | 'plywood'       // Plywood partition on wood frame
  | 'cement-board'  // HardieFlex / fiber cement on studs
  | 'brick'         // Fired brick masonry
  | 'solid-concrete'// Cast-in-place or precast concrete
  | 'existing-wall' // Repaint/refinish only
export type LayerBasis = 'area' | 'linear' | 'piece' | 'panel';
export type SideCount = 1 | 2;

export interface Opening {
  id: string;
  label: string;
  widthM: number;
  heightM: number;
  quantity: number;
}

export interface PackagingSpec {
  unit: string;
  sizePerUnit: number;
}

export interface Layer {
  code: string;
  label: string;
  basis: LayerBasis;
  applyToSides: boolean;
  wasteFactor: number;
  packaging?: PackagingSpec;
  enabled: boolean;
}

export interface WallGeometry {
  lengthM: number;
  heightM: number;
  wallCount: number;
}

export interface WallConfig {
  coreType: CoreType;
  geometry: WallGeometry;
  openings: Opening[];
  sides: SideCount;
  layers: Layer[];
  seamLengthLM?: number;
  topcoatCoats?: number;
  paintCoverageSqmPerL?: number;
}

export interface AreaState {
  grossAreaSqm: number;
  openingAreaSqm: number;
  netAreaSqm: number;
  finishAreaSqm: number;
}

export interface BOMRow {
  layerCode: string;
  label: string;
  unit: string;
  theoreticalQty: number;
  adjustedQty: number;
  procurementQty: number;
  packagingNote: string;
}

export interface BOMResult {
  areaState: AreaState;
  rows: BOMRow[];
}

// ─── Finish Types ───────────────────────────────────────────────────────────

export type FinishType = 'paint' | 'tiles' | 'wallpaper' | 'exposed'

export interface TileConfig {
  sizeLabel: string;
  widthMM: number;
  heightMM: number;
  groutGapMM: number;
}

export const TILE_SIZES: TileConfig[] = [
  { sizeLabel: '300 x 300', widthMM: 300, heightMM: 300, groutGapMM: 3 },
  { sizeLabel: '300 x 600', widthMM: 300, heightMM: 600, groutGapMM: 3 },
  { sizeLabel: '600 x 600', widthMM: 600, heightMM: 600, groutGapMM: 3 },
]

// ─── Lason (Concrete Neutralizer) ───────────────────────────────────────────

export interface LasonConfig {
  enabled: boolean;
  productType: 'muriatic-acid' | 'commercial-neutralizer';
}

// ─── Sponsor Colors ─────────────────────────────────────────────────────────

export interface SponsorColor {
  name: string;
  hex: string;
  code?: string;
}

export interface SponsorBrand {
  id: string;
  name: string;
  logoUrl?: string;
  colors: SponsorColor[];
}

// ─── Extended Wall Config (for Wall Lab) ────────────────────────────────────

export interface WallLabConfig extends WallConfig {
  finishType: FinishType;
  tileConfig: TileConfig;
  lason: LasonConfig;
  selectedColorHex: string;
  selectedColorName: string;
  activeSponsorId: string | null;
  tilePattern: string;
}
