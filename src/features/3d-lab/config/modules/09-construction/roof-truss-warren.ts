// src/app/dashboard/3d-lab/_config/modules/roof-truss-warren.ts
// Warren Roof Truss — Construction
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const roofTrussWarrenConfig: ExplodedAssemblyConfig = {
  id: 'roof-truss-warren',
  title: 'Warren Roof Truss',
  description: 'Exploded Warren roof truss — equilateral or isoceles triangle web pattern with no verticals (or with verticals for modified Warren). Alternating tension and compression diagonals. Patented by James Warren (1848).',
  subject: 'construction',
  parts: [
    {
      id: 'war-btm-chord',
      label: 'Bottom Chord',
      description: 'Horizontal bottom chord in tension. Warren truss typically used for flat or low-pitch roofs and bridge girders. Efficient for 10–30m spans.',
      codeCitation: 'NSCP Section 617 / AISC',
      geometry: { id: 'war-btm-chord-geo', type: 'box', position: [0, 0, 0], args: [1.2, 0.05, 0.05], color: '#64748b' },
      explodeOffset: yOff(-0.3),
    },
    {
      id: 'war-top-chord',
      label: 'Top Chord',
      description: 'Top chord in compression. In Warren, applied as flat truss — shown here with slight pitch for roof drainage.',
      geometry: { id: 'war-top-chord-geo', type: 'box', position: [0, 0.22, 0], args: [1.2, 0.05, 0.05], color: '#52525b' },
      explodeOffset: yOff(0.3),
    },
    {
      id: 'war-diag-1',
      label: 'Diagonal 1 (Compression)',
      description: 'First diagonal — sloping up-left to down-right, in COMPRESSION under gravity. Warren alternates compression and tension diagonals.',
      geometry: { id: 'war-diag-1-geo', type: 'box', position: [-0.45, 0.11, 0], rotation: [0, 0, 0.73], args: [0.05, 0.44, 0.05], color: '#D64545' },
      explodeOffset: [-0.55, 0.1, 0],
    },
    {
      id: 'war-diag-2',
      label: 'Diagonal 2 (Tension)',
      description: 'Second diagonal — sloping up-right to down-left, in TENSION. Adjacent diagonals carry opposite force types — the Warren hallmark.',
      geometry: { id: 'war-diag-2-geo', type: 'box', position: [-0.15, 0.11, 0], rotation: [0, 0, -0.73], args: [0.04, 0.44, 0.04], color: '#3b82f6' },
      explodeOffset: [-0.1, 0.1, 0],
    },
    {
      id: 'war-diag-3',
      label: 'Diagonal 3 (Compression)',
      description: 'Third diagonal — compression, same orientation as diagonal 1.',
      geometry: { id: 'war-diag-3-geo', type: 'box', position: [0.15, 0.11, 0], rotation: [0, 0, 0.73], args: [0.05, 0.44, 0.05], color: '#D64545' },
      explodeOffset: [0.1, 0.1, 0],
    },
    {
      id: 'war-diag-4',
      label: 'Diagonal 4 (Tension)',
      description: 'Fourth diagonal — tension, same orientation as diagonal 2. The W-pattern of compression/tension creates equilateral triangles.',
      geometry: { id: 'war-diag-4-geo', type: 'box', position: [0.45, 0.11, 0], rotation: [0, 0, -0.73], args: [0.04, 0.44, 0.04], color: '#3b82f6' },
      explodeOffset: [0.55, 0.1, 0],
    },
    {
      id: 'war-vert-1',
      label: 'Vertical (Modified Warren)',
      description: 'Optional vertical in "Modified Warren" — added to reduce panel length and distribute purlin loads to panel points. Without verticals = pure Warren.',
      geometry: { id: 'war-vert-1-geo', type: 'box', position: [0, 0.11, 0], args: [0.03, 0.22, 0.03], color: '#a1a1aa' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'war-purlin-1',
      label: 'Purlin at Panel Point',
      description: 'Cold-formed purlin at top chord panel point. Essential to apply loads at nodes — prevents secondary bending in top chord.',
      geometry: { id: 'war-purlin-1-geo', type: 'box', position: [-0.3, 0.245, 0.15], args: [0.04, 0.012, 0.3], color: '#94a3b8' },
      explodeOffset: [-0.3, 0.5, 0.3],
    },
    {
      id: 'war-end-panel',
      label: 'End Panel (Compression Diagonal)',
      description: 'End diagonal from top chord bearing to first bottom chord panel point — always in compression.',
      geometry: { id: 'war-end-panel-geo', type: 'box', position: [-0.55, 0.06, 0], rotation: [0, 0, 1.05], args: [0.05, 0.26, 0.05], color: '#D64545' },
      explodeOffset: [-0.7, 0, 0],
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}

