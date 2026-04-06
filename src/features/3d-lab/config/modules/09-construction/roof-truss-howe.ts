// src/app/dashboard/3d-lab/_config/modules/roof-truss-howe.ts
// Howe Roof Truss — Construction
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const roofTrussHoweConfig: ExplodedAssemblyConfig = {
  id: 'roof-truss-howe',
  title: 'Howe Roof Truss',
  description: 'Exploded Howe roof truss — diagonals slope away from centre (in compression), verticals in tension. Opposite of Pratt. More efficient in timber where wood is strong in compression. Invented by William Howe (1840).',
  subject: 'construction',
  parts: [
    {
      id: 'howe-btm-chord',
      label: 'Bottom Chord',
      description: 'Horizontal bottom chord in tension. Howe truss historically used with timber chords and iron tension verticals.',
      codeCitation: 'NSCP Section 617',
      geometry: { id: 'howe-btm-chord-geo', type: 'box', position: [0, 0, 0], args: [1.2, 0.05, 0.05], color: '#92400e' },
      explodeOffset: yOff(-0.3),
    },
    {
      id: 'howe-top-chord-l',
      label: 'Top Chord Left (Compression)',
      description: 'Left top chord rafter in compression. Timber Howe truss excels here — wood handles compression well.',
      geometry: { id: 'howe-top-chord-l-geo', type: 'box', position: [-0.32, 0.25, 0], rotation: [0, 0, 0.4], args: [0.66, 0.05, 0.05], color: '#78350f' },
      explodeOffset: [-0.45, 0.25, 0],
    },
    {
      id: 'howe-top-chord-r',
      label: 'Top Chord Right (Compression)',
      description: 'Right top chord — symmetric compression rafter.',
      geometry: { id: 'howe-top-chord-r-geo', type: 'box', position: [0.32, 0.25, 0], rotation: [0, 0, -0.4], args: [0.66, 0.05, 0.05], color: '#78350f' },
      explodeOffset: [0.45, 0.25, 0],
    },
    {
      id: 'howe-vert-1',
      label: 'Vertical Hanger 1 (Tension)',
      description: 'Vertical member in TENSION — hangs from top chord to bottom chord. In Howe, verticals are tension members (opposite of Pratt). Historically iron rods in timber Howe bridges.',
      geometry: { id: 'howe-vert-1-geo', type: 'box', position: [-0.3, 0.13, 0], args: [0.04, 0.25, 0.04], color: '#3b82f6' },
      explodeOffset: [-0.45, 0.1, 0],
    },
    {
      id: 'howe-vert-2',
      label: 'Vertical Hanger 2 (Tension)',
      description: 'Second tension vertical. Rod or slender member — economical in iron/steel.',
      geometry: { id: 'howe-vert-2-geo', type: 'box', position: [0.3, 0.13, 0], args: [0.04, 0.25, 0.04], color: '#3b82f6' },
      explodeOffset: [0.45, 0.1, 0],
    },
    {
      id: 'howe-vert-centre',
      label: 'Central Tension Hanger',
      description: 'Tallest vertical tension hanger at centre. Carries load from ridge panel point down to bottom chord centre.',
      geometry: { id: 'howe-vert-centre-geo', type: 'box', position: [0, 0.22, 0], args: [0.04, 0.42, 0.04], color: '#1535A8' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'howe-diag-l',
      label: 'Diagonal Left (Compression)',
      description: 'Left diagonal sloping AWAY from centre — in COMPRESSION. Wider/bulkier than Pratt diagonals since compression members must resist buckling.',
      geometry: { id: 'howe-diag-l-geo', type: 'box', position: [-0.15, 0.12, 0], rotation: [0, 0, -0.85], args: [0.05, 0.38, 0.05], color: '#D64545' },
      explodeOffset: [-0.3, 0.2, 0],
    },
    {
      id: 'howe-diag-r',
      label: 'Diagonal Right (Compression)',
      description: 'Right diagonal sloping away from centre — in compression. Note reversed orientation from Pratt diagonals.',
      geometry: { id: 'howe-diag-r-geo', type: 'box', position: [0.15, 0.12, 0], rotation: [0, 0, 0.85], args: [0.05, 0.38, 0.05], color: '#D64545' },
      explodeOffset: [0.3, 0.2, 0],
    },
    {
      id: 'howe-ridge',
      label: 'Ridge Connection',
      description: 'Ridge connection block where left and right top chords meet. In timber Howe, often an iron strap with bolts.',
      geometry: { id: 'howe-ridge-geo', type: 'box', position: [0, 0.47, 0], args: [0.07, 0.05, 0.05], color: '#64748b' },
      explodeOffset: yOff(0.7),
    },
    {
      id: 'howe-bearing',
      label: 'End Bearing (Wall Plate)',
      description: 'End bearing at wall plate. Howe truss heel joint transfers horizontal thrust and vertical reaction to supporting wall or beam.',
      geometry: { id: 'howe-bearing-geo', type: 'box', position: [-0.6, 0.04, 0], args: [0.06, 0.07, 0.05], color: '#52525b' },
      explodeOffset: [-0.8, -0.1, 0],
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}

