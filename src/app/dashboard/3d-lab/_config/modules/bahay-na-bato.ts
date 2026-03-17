// src/app/dashboard/3d-lab/_config/modules/bahay-na-bato.ts
// ─── Bahay na Bato — Philippine Heritage House ──────────────────────────────
// Exploded assembly of the traditional Filipino stone house showing
// structural layers from coral-stone foundation to clay tile roof.

import type { ExplodedAssemblyConfig, AssemblyPart } from '../../_types/templates'

// ─── Helpers ────────────────────────────────────────────────────────────────

function yOffset(v: number): [number, number, number] {
  return [0, v, 0]
}

// ─── Parts (bottom to top) ──────────────────────────────────────────────────

const parts: AssemblyPart[] = [
  // 1. Stone Foundation
  {
    id: 'stone-foundation',
    label: 'Stone Foundation',
    description: 'Coral stone/brick foundation — the massive masonry base that distinguishes the Bahay na Bato from its all-wood predecessor, the Bahay Kubo.',
    geometry: {
      id: 'stone-foundation-geo',
      type: 'box',
      position: [0, 0.15, 0],
      args: [1.8, 0.3, 1.4],
      color: '#8B8682',
    },
    explodeOffset: yOffset(0),
    group: 'lower-storey',
  },

  // 2. Silong/Zaguan Walls
  {
    id: 'silong-walls',
    label: 'Silong / Zaguan Walls',
    description: 'Stone/brick walls (silong/zaguan) — the ground-floor enclosure used for storage, stables, or commercial space. Thick masonry provides thermal mass and flood resistance.',
    geometry: {
      id: 'silong-walls-geo',
      type: 'box',
      position: [0, 0.65, 0],
      args: [1.7, 0.7, 1.3],
      color: '#a0937e',
    },
    explodeOffset: yOffset(0.4),
    group: 'lower-storey',
  },

  // 3. Wooden Floor Framing
  {
    id: 'wooden-floor',
    label: 'Hardwood Floor Framing',
    description: 'Hardwood floor framing — heavy timber joists and planking forming the transition between the masonry lower storey and the wooden upper storey.',
    geometry: {
      id: 'wooden-floor-geo',
      type: 'box',
      position: [0, 1.05, 0],
      args: [1.8, 0.06, 1.4],
      color: '#c9a86c',
    },
    explodeOffset: yOffset(0.8),
    group: 'upper-storey',
  },

  // 4. Upper Storey Walls
  {
    id: 'upper-walls',
    label: 'Upper Storey Walls',
    description: 'Wooden upper storey walls with openings — the living quarters (vivienda), constructed of hardwood framing with large window openings for cross-ventilation.',
    geometry: {
      id: 'upper-walls-geo',
      type: 'box',
      position: [0, 1.55, 0],
      args: [1.7, 0.9, 1.3],
      color: '#d4a574',
    },
    explodeOffset: yOffset(1.2),
    group: 'upper-storey',
  },

  // 5. Volada (Cantilevered Balcony)
  {
    id: 'volada-balcony',
    label: 'Volada',
    description: 'Volada — cantilevered balcony projecting from the upper storey facade. A distinctive feature providing shade, rain protection, and outdoor living space.',
    geometry: {
      id: 'volada-balcony-geo',
      type: 'box',
      position: [0, 1.35, 0.85],
      args: [1.5, 0.06, 0.4],
      color: '#b8956a',
    },
    explodeOffset: yOffset(1.2),
    group: 'upper-storey',
  },

  // 6. Ventanillas
  {
    id: 'ventanillas',
    label: 'Ventanillas',
    description: 'Ventanillas — small ventilation windows below the main windows. These sliding wooden panels allow low-level airflow while maintaining privacy.',
    geometry: {
      id: 'ventanillas-geo',
      type: 'box',
      position: [0, 1.18, 0.66],
      args: [1.2, 0.12, 0.04],
      color: '#e8d5b7',
    },
    explodeOffset: yOffset(1.2),
    group: 'upper-storey',
  },

  // 7. Capiz Shell Windows
  {
    id: 'capiz-windows',
    label: 'Capiz Shell Windows',
    description: 'Capiz shell sliding windows — translucent windowpane placuna shells set in wooden lattice frames. They admit diffused light while blocking direct sun and rain.',
    geometry: {
      id: 'capiz-windows-geo',
      type: 'box',
      position: [0, 1.6, 0.66],
      args: [1.2, 0.5, 0.04],
      color: '#f5f0e0',
      opacity: 0.7,
      transparent: true,
    },
    explodeOffset: yOffset(1.6),
    group: 'upper-storey',
  },

  // 8. Timber Roof Framing
  {
    id: 'roof-frame',
    label: 'Timber Roof Framing',
    description: 'Timber roof framing — the structural skeleton of the hip or gable roof, using traditional joinery techniques with hardwood members.',
    geometry: {
      id: 'roof-frame-geo',
      type: 'box',
      position: [0, 2.2, 0],
      rotation: [0.15, 0, 0],
      args: [1.9, 0.12, 1.6],
      color: '#8B7355',
    },
    explodeOffset: yOffset(2.0),
    group: 'roof',
  },

  // 9. Clay Tile Roofing
  {
    id: 'tile-roof',
    label: 'Clay Tile Roofing',
    description: 'Clay tile roofing — fired terracotta tiles (teja) introduced by the Spanish, replacing the original nipa palm thatch. Provides superior fire and weather resistance.',
    geometry: {
      id: 'tile-roof-geo',
      type: 'box',
      position: [0, 2.35, 0],
      rotation: [0.15, 0, 0],
      args: [2.0, 0.06, 1.7],
      color: '#c45a3c',
    },
    explodeOffset: yOffset(2.4),
    group: 'roof',
  },
]

// ─── Exported Config ────────────────────────────────────────────────────────

export const bahayNaBatoConfig: ExplodedAssemblyConfig = {
  id: 'bahay-na-bato',
  title: 'Bahay na Bato',
  description:
    'Exploded assembly of the traditional Filipino stone house (Bahay na Bato) showing structural layers from coral-stone foundation to clay tile roof — a synthesis of indigenous and Spanish colonial building traditions.',
  subject: 'history',
  parts,
  camera: {
    position: [4, 3, 4],
    fov: 40,
  },
}
