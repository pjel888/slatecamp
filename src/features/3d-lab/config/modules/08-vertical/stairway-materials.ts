// ──────────────────────────────────────────────────────────────────────────────
// stairway-materials.ts — Material Definitions with Slip Resistance Data
// PBR material properties and ASTM F1679 / OSHA slip coefficients.
// ──────────────────────────────────────────────────────────────────────────────

export interface StairMaterial {
  id: string
  label: string
  baseColor: string      // Hex color for tread surface
  roughness: number      // PBR roughness (0–1)
  metalness: number      // PBR metalness (0–1)
  dryCoF: number         // Coefficient of friction (dry)
  wetCoF: number         // Coefficient of friction (wet)
  slipDryStatus: 'safe' | 'caution' | 'danger'
  slipWetStatus: 'safe' | 'caution' | 'danger'
}

export const STAIR_MATERIALS: StairMaterial[] = [
  {
    id: 'polished-marble',
    label: 'Polished Marble',
    baseColor: '#E8E8E8',
    roughness: 0.1,
    metalness: 0.0,
    dryCoF: 0.48,
    wetCoF: 0.26,
    slipDryStatus: 'safe',
    slipWetStatus: 'danger',
  },
  {
    id: 'honed-granite',
    label: 'Honed Granite',
    baseColor: '#9C9C9C',
    roughness: 0.4,
    metalness: 0.0,
    dryCoF: 0.65,
    wetCoF: 0.42,
    slipDryStatus: 'safe',
    slipWetStatus: 'caution',
  },
  {
    id: 'ceramic-tile',
    label: 'Ceramic Tile (Matte)',
    baseColor: '#D4D4D4',
    roughness: 0.5,
    metalness: 0.0,
    dryCoF: 0.65,
    wetCoF: 0.50,
    slipDryStatus: 'safe',
    slipWetStatus: 'caution',
  },
  {
    id: 'concrete',
    label: 'Concrete (Textured)',
    baseColor: '#B8B8B8',
    roughness: 0.7,
    metalness: 0.0,
    dryCoF: 0.70,
    wetCoF: 0.60,
    slipDryStatus: 'safe',
    slipWetStatus: 'caution',
  },
  {
    id: 'wood',
    label: 'Wood (Sealed)',
    baseColor: '#8B7355',
    roughness: 0.6,
    metalness: 0.0,
    dryCoF: 0.55,
    wetCoF: 0.35,
    slipDryStatus: 'safe',
    slipWetStatus: 'danger',
  },
  {
    id: 'steel',
    label: 'Steel (Diamond Plate)',
    baseColor: '#A9A9A9',
    roughness: 0.2,
    metalness: 0.8,
    dryCoF: 0.40,
    wetCoF: 0.25,
    slipDryStatus: 'safe',
    slipWetStatus: 'danger',
  },
]

/** Find a material by ID */
export const getMaterialById = (id: string): StairMaterial | undefined =>
  STAIR_MATERIALS.find((m) => m.id === id)
