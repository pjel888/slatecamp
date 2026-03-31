// src/app/dashboard/3d-lab/_config/modules/roof-truss-pratt.ts
// Pratt Roof Truss — Construction
import type { ExplodedAssemblyConfig } from '../../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const roofTrussPrattConfig: ExplodedAssemblyConfig = {
  id: 'roof-truss-pratt',
  title: 'Pratt Roof Truss',
  description: 'Exploded Pratt roof truss — diagonal members slope toward the centre (in tension under gravity). Vertical members in compression. Efficient for steel construction. Named after Caleb and Thomas Pratt (1844).',
  subject: 'construction',
  parts: [
    {
      id: 'pratt-btm-chord',
      label: 'Bottom Chord',
      description: 'Horizontal bottom chord in tension. Longer span than Fink — Pratt is typically used for 8–20m spans in steel or timber.',
      codeCitation: 'NSCP Section 617',
      geometry: { id: 'pratt-btm-chord-geo', type: 'box', position: [0, 0, 0], args: [1.2, 0.05, 0.05], color: '#64748b' },
      explodeOffset: yOff(-0.3),
    },
    {
      id: 'pratt-top-chord-l',
      label: 'Top Chord Left',
      description: 'Left inclined top chord in compression. Pratt configuration: diagonals lean toward centre from both ends.',
      geometry: { id: 'pratt-top-chord-l-geo', type: 'box', position: [-0.32, 0.25, 0], rotation: [0, 0, 0.4], args: [0.66, 0.05, 0.05], color: '#52525b' },
      explodeOffset: [-0.45, 0.25, 0],
    },
    {
      id: 'pratt-top-chord-r',
      label: 'Top Chord Right',
      description: 'Right inclined top chord — symmetric compression member.',
      geometry: { id: 'pratt-top-chord-r-geo', type: 'box', position: [0.32, 0.25, 0], rotation: [0, 0, -0.4], args: [0.66, 0.05, 0.05], color: '#52525b' },
      explodeOffset: [0.45, 0.25, 0],
    },
    {
      id: 'pratt-vert-1',
      label: 'Vertical Member 1 (Compression)',
      description: 'First vertical member — in compression under gravity loads. Pratt distinguishing feature: verticals compress, diagonals tension.',
      geometry: { id: 'pratt-vert-1-geo', type: 'box', position: [-0.3, 0.13, 0], args: [0.04, 0.25, 0.04], color: '#94a3b8' },
      explodeOffset: [-0.45, 0.1, 0],
    },
    {
      id: 'pratt-vert-2',
      label: 'Vertical Member 2',
      description: 'Second vertical compression member. Panel spacing at 300mm O.C.',
      geometry: { id: 'pratt-vert-2-geo', type: 'box', position: [0.3, 0.13, 0], args: [0.04, 0.25, 0.04], color: '#94a3b8' },
      explodeOffset: [0.45, 0.1, 0],
    },
    {
      id: 'pratt-vert-centre',
      label: 'Centre Vertical (King Post)',
      description: 'Centre vertical at peak — carries ridge load. In Pratt, centre verticals are the tallest compression members.',
      geometry: { id: 'pratt-vert-centre-geo', type: 'box', position: [0, 0.22, 0], args: [0.04, 0.42, 0.04], color: '#71717a' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'pratt-diag-l',
      label: 'Diagonal Member Left (Tension)',
      description: 'Left diagonal sloping toward centre — in TENSION under gravity load. The Pratt\'s key advantage: tension diagonals are more efficient in steel (slender members ok in tension).',
      geometry: { id: 'pratt-diag-l-geo', type: 'box', position: [-0.15, 0.12, 0], rotation: [0, 0, 0.85], args: [0.04, 0.38, 0.04], color: '#3b82f6' },
      explodeOffset: [-0.3, 0.2, 0],
    },
    {
      id: 'pratt-diag-r',
      label: 'Diagonal Member Right (Tension)',
      description: 'Right diagonal sloping toward centre — tension member symmetric to left diagonal.',
      geometry: { id: 'pratt-diag-r-geo', type: 'box', position: [0.15, 0.12, 0], rotation: [0, 0, -0.85], args: [0.04, 0.38, 0.04], color: '#3b82f6' },
      explodeOffset: [0.3, 0.2, 0],
    },
    {
      id: 'pratt-purlin',
      label: 'Purlin at Panel Point',
      description: 'Purlin seated at truss panel point (node). Top-chord loads applied at panel points — avoids bending in top chord.',
      geometry: { id: 'pratt-purlin-geo', type: 'box', position: [-0.3, 0.27, 0.15], args: [0.04, 0.012, 0.3], color: '#a1a1aa' },
      explodeOffset: [-0.3, 0.5, 0.3],
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}
