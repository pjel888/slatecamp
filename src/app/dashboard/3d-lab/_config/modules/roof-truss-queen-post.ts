// src/app/dashboard/3d-lab/_config/modules/roof-truss-queen-post.ts
// Queen Post Roof Truss — Construction
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const roofTrussQueenPostConfig: ExplodedAssemblyConfig = {
  id: 'roof-truss-queen-post',
  title: 'Queen Post Roof Truss',
  description: 'Exploded Queen Post truss — two vertical queen posts flanking a horizontal straining beam (straining sill). Spans 8–12m; wider than king post. Creates a wider attic or ceiling void between posts.',
  subject: 'construction',
  parts: [
    {
      id: 'qp-tie-beam',
      label: 'Tie Beam (Bottom Chord)',
      description: 'Horizontal tie beam spanning the full width 8–12m. In tension — resists rafter spread. Larger section than king post: min 150×75mm.',
      codeCitation: 'NSCP Section 617',
      geometry: { id: 'qp-tie-beam-geo', type: 'box', position: [0, 0, 0], args: [1.0, 0.06, 0.05], color: '#92400e' },
      explodeOffset: yOff(-0.3),
    },
    {
      id: 'qp-rafter-l',
      label: 'Principal Rafter Left',
      description: 'Left rafter from wall plate to ridge. In compression. Longer than king post rafter due to wider span.',
      geometry: { id: 'qp-rafter-l-geo', type: 'box', position: [-0.26, 0.26, 0], rotation: [0, 0, 0.48], args: [0.62, 0.055, 0.05], color: '#78350f' },
      explodeOffset: [-0.4, 0.25, 0],
    },
    {
      id: 'qp-rafter-r',
      label: 'Principal Rafter Right',
      description: 'Right rafter symmetric to left. Both rafters bear on queen post heads via cogged or bolted joints.',
      geometry: { id: 'qp-rafter-r-geo', type: 'box', position: [0.26, 0.26, 0], rotation: [0, 0, -0.48], args: [0.62, 0.055, 0.05], color: '#78350f' },
      explodeOffset: [0.4, 0.25, 0],
    },
    {
      id: 'qp-queen-post-l',
      label: 'Left Queen Post (Tension)',
      description: 'Left queen post — in TENSION. Suspends the tie beam from the straining beam above. Positioned at 1/3 to 2/5 of span from each end.',
      geometry: { id: 'qp-queen-post-l-geo', type: 'box', position: [-0.22, 0.19, 0], args: [0.05, 0.36, 0.05], color: '#a3734c' },
      explodeOffset: [-0.35, 0.2, 0],
    },
    {
      id: 'qp-queen-post-r',
      label: 'Right Queen Post (Tension)',
      description: 'Right queen post — also in tension. Two posts create a wider clear span between them for attic use.',
      geometry: { id: 'qp-queen-post-r-geo', type: 'box', position: [0.22, 0.19, 0], args: [0.05, 0.36, 0.05], color: '#a3734c' },
      explodeOffset: [0.35, 0.2, 0],
    },
    {
      id: 'qp-straining-beam',
      label: 'Straining Beam (Compression)',
      description: 'Horizontal straining beam connecting queen post heads — in COMPRESSION. Key difference from king post: the straining beam replaces the single king post and allows wider clear span.',
      geometry: { id: 'qp-straining-beam-geo', type: 'box', position: [0, 0.37, 0], args: [0.44, 0.055, 0.05], color: '#d97706' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'qp-strut-l',
      label: 'Strut Left (Compression)',
      description: 'Diagonal strut from queen post foot to mid-rafter, reducing rafter effective span. In compression.',
      geometry: { id: 'qp-strut-l-geo', type: 'box', position: [-0.25, 0.17, 0], rotation: [0, 0, 0.75], args: [0.04, 0.3, 0.04], color: '#b45309' },
      explodeOffset: [-0.4, 0.2, 0],
    },
    {
      id: 'qp-strut-r',
      label: 'Strut Right (Compression)',
      description: 'Symmetric right diagonal strut in compression.',
      geometry: { id: 'qp-strut-r-geo', type: 'box', position: [0.25, 0.17, 0], rotation: [0, 0, -0.75], args: [0.04, 0.3, 0.04], color: '#b45309' },
      explodeOffset: [0.4, 0.2, 0],
    },
    {
      id: 'qp-ridge-piece',
      label: 'Ridge Piece',
      description: 'Horizontal ridge piece at apex receiving both rafters. Supported at midspan by the straining beam via a short king bolt or strut.',
      geometry: { id: 'qp-ridge-piece-geo', type: 'box', position: [0, 0.5, 0], args: [0.12, 0.05, 0.05], color: '#64748b' },
      explodeOffset: yOff(0.7),
    },
    {
      id: 'qp-wall-plate',
      label: 'Wall Plate',
      description: 'Continuous timber wall plate on top of masonry wall. Queen post truss spans are wider — wall plate is heavier: min 150×75mm.',
      geometry: { id: 'qp-wall-plate-geo', type: 'box', position: [-0.53, -0.04, 0], args: [0.12, 0.04, 0.06], color: '#ca8a04' },
      explodeOffset: [-0.7, -0.1, 0],
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}
