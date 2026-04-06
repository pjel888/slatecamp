// src/app/dashboard/3d-lab/_config/modules/lumber-sizes.ts
// Philippine Standard Lumber Dimensions
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

// Scale: 1:10. Lengths shown at 2.4m = 0.24 units. Nominal dimensions.
// Philippine lumber is sold in nominal inches: 2×2, 2×3, 2×4, 2×6, 4×4, etc.
// Actual sizes per PTCP are ~2–3mm less than nominal.

export const lumberSizesConfig: ExplodedAssemblyConfig = {
  id: 'lumber-sizes',
  title: 'Philippine Standard Lumber Sizes',
  description: 'Side-by-side comparison of Philippine standard lumber dimensions from 2×2 through 6×6 (nominal inches). All shown at 2.4m length. Actual dressed sizes are 2–3mm less than nominal per PTCP.',
  subject: 'materials',
  comparisonMode: true,
  parts: [
    {
      id: 'ls-2x2',
      label: '2×2 (50×50mm nominal)',
      description: 'Smallest common lumber — 2×2″ nominal (50×50mm). Used for light framing, furring strips, nailers, and temporary bracing.',
      codeCitation: 'PTCP / Philippine lumber standard',
      geometry: { id: 'ls-2x2-geo', type: 'box', position: [-1.4, 0, 0], args: [0.05, 0.05, 0.24], color: '#92400e' },
      explodeOffset: [-1.4, 0, 0],
    },
    {
      id: 'ls-2x3',
      label: '2×3 (50×75mm nominal)',
      description: '2×3″ nominal (50×75mm). Common for interior partition stud in Philippine residential — lighter than 2×4.',
      geometry: { id: 'ls-2x3-geo', type: 'box', position: [-1.1, 0, 0], args: [0.05, 0.075, 0.24], color: '#a3734c' },
      explodeOffset: [-1.1, 0, 0],
    },
    {
      id: 'ls-2x4',
      label: '2×4 (50×100mm nominal)',
      description: '2×4″ nominal (50×100mm). Standard wall stud and joist. Most common framing lumber globally.',
      geometry: { id: 'ls-2x4-geo', type: 'box', position: [-0.8, 0, 0], args: [0.05, 0.1, 0.24], color: '#b45309' },
      explodeOffset: [-0.8, 0, 0],
    },
    {
      id: 'ls-2x6',
      label: '2×6 (50×150mm nominal)',
      description: '2×6″ nominal (50×150mm). Rafters, floor joists, heavier studs, ledger boards.',
      geometry: { id: 'ls-2x6-geo', type: 'box', position: [-0.5, 0, 0], args: [0.05, 0.15, 0.24], color: '#ca8a04' },
      explodeOffset: [-0.5, 0, 0],
    },
    {
      id: 'ls-2x8',
      label: '2×8 (50×200mm nominal)',
      description: '2×8″ nominal (50×200mm). Heavy rafters, ridge beams, floor joists for longer spans.',
      geometry: { id: 'ls-2x8-geo', type: 'box', position: [-0.2, 0, 0], args: [0.05, 0.2, 0.24], color: '#D4951A' },
      explodeOffset: [-0.2, 0, 0],
    },
    {
      id: 'ls-2x10',
      label: '2×10 (50×250mm nominal)',
      description: '2×10″ nominal (50×250mm). Long-span floor joists and roof rafters.',
      geometry: { id: 'ls-2x10-geo', type: 'box', position: [0.1, 0, 0], args: [0.05, 0.25, 0.24], color: '#D4951A' },
      explodeOffset: [0.1, 0, 0],
    },
    {
      id: 'ls-4x4',
      label: '4×4 (100×100mm nominal)',
      description: '4×4″ nominal (100×100mm). Posts, deck columns, short beam. Square section — efficient for columns.',
      geometry: { id: 'ls-4x4-geo', type: 'box', position: [0.4, 0, 0], args: [0.1, 0.1, 0.24], color: '#78350f' },
      explodeOffset: [0.4, 0, 0],
    },
    {
      id: 'ls-4x6',
      label: '4×6 (100×150mm nominal)',
      description: '4×6″ nominal (100×150mm). Beam, girder, post for medium loads.',
      geometry: { id: 'ls-4x6-geo', type: 'box', position: [0.7, 0, 0], args: [0.1, 0.15, 0.24], color: '#92400e' },
      explodeOffset: [0.7, 0, 0],
    },
    {
      id: 'ls-6x6',
      label: '6×6 (150×150mm nominal)',
      description: '6×6″ nominal (150×150mm). Heavy timber columns and posts. Minimum for heavy timber (Type IV) construction.',
      geometry: { id: 'ls-6x6-geo', type: 'box', position: [1.0, 0, 0], args: [0.15, 0.15, 0.24], color: '#451a03' },
      explodeOffset: [1.0, 0, 0],
    },
    {
      id: 'ls-coco',
      label: 'Coconut Lumber (Coco Lumber)',
      description: 'Coconut lumber — recycled from senescent coconut palms. Denser than softwood at 600–700 kg/m³. Common low-cost framing lumber in Philippine provinces. Sizes match standard lumber.',
      geometry: { id: 'ls-coco-geo', type: 'box', position: [1.3, 0, 0], args: [0.05, 0.1, 0.24], color: '#1c0a00' },
      explodeOffset: [1.3, 0, 0],
    },
  ],
  camera: { position: [0, 2, 3], fov: 55 },
}

