// src/app/dashboard/3d-lab/_config/modules/roof-truss-king-post.ts
// King Post Roof Truss — Construction
import type { ExplodedAssemblyConfig } from '../../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const roofTrussKingPostConfig: ExplodedAssemblyConfig = {
  id: 'roof-truss-king-post',
  title: 'King Post Roof Truss',
  description: 'Exploded King Post truss — simplest form of timber roof truss. Single vertical king post at centre with two rafters and two diagonal struts. Spans up to 8m. Ideal for small residential and agricultural buildings.',
  subject: 'construction',
  parts: [
    {
      id: 'kp-tie-beam',
      label: 'Tie Beam (Bottom Chord)',
      description: 'Horizontal tie beam spans between wall plates. In tension — prevents rafters from spreading. Minimum 100×75mm for spans to 8m.',
      codeCitation: 'NSCP Section 617',
      geometry: { id: 'kp-tie-beam-geo', type: 'box', position: [0, 0, 0], args: [0.8, 0.06, 0.05], color: '#92400e' },
      explodeOffset: yOff(-0.3),
    },
    {
      id: 'kp-rafter-l',
      label: 'Principal Rafter Left',
      description: 'Left principal rafter — in compression, spans from wall plate to ridge. 30° pitch typical. Min 100×50mm for 8m span.',
      geometry: { id: 'kp-rafter-l-geo', type: 'box', position: [-0.21, 0.22, 0], rotation: [0, 0, 0.55], args: [0.5, 0.05, 0.05], color: '#78350f' },
      explodeOffset: [-0.35, 0.2, 0],
    },
    {
      id: 'kp-rafter-r',
      label: 'Principal Rafter Right',
      description: 'Right principal rafter — symmetric compression member. Rafters joined at ridge with a half-lap or metal connector.',
      geometry: { id: 'kp-rafter-r-geo', type: 'box', position: [0.21, 0.22, 0], rotation: [0, 0, -0.55], args: [0.5, 0.05, 0.05], color: '#78350f' },
      explodeOffset: [0.35, 0.2, 0],
    },
    {
      id: 'kp-king-post',
      label: 'King Post (Tension)',
      description: 'Central vertical king post — in TENSION. Hangs the midpoint of the tie beam from the ridge apex. Critical member: if it fails, the tie beam sags. Min 100×100mm.',
      geometry: { id: 'kp-king-post-geo', type: 'box', position: [0, 0.2, 0], args: [0.05, 0.38, 0.05], color: '#a3734c' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'kp-strut-l',
      label: 'Left Strut (Compression)',
      description: 'Diagonal strut from king post foot to midpoint of left rafter — in compression. Reduces effective rafter span, allowing longer overall spans.',
      geometry: { id: 'kp-strut-l-geo', type: 'box', position: [-0.13, 0.12, 0], rotation: [0, 0, 0.9], args: [0.04, 0.32, 0.04], color: '#b45309' },
      explodeOffset: [-0.25, 0.15, 0],
    },
    {
      id: 'kp-strut-r',
      label: 'Right Strut (Compression)',
      description: 'Diagonal strut from king post foot to midpoint of right rafter — symmetric compression member.',
      geometry: { id: 'kp-strut-r-geo', type: 'box', position: [0.13, 0.12, 0], rotation: [0, 0, -0.9], args: [0.04, 0.32, 0.04], color: '#b45309' },
      explodeOffset: [0.25, 0.15, 0],
    },
    {
      id: 'kp-ridge-connection',
      label: 'Ridge Connection Block',
      description: 'Ridge block joining the two rafters and the top of the king post. Traditionally a mortise-and-tenon or modern bolt/strap connection.',
      geometry: { id: 'kp-ridge-connection-geo', type: 'box', position: [0, 0.41, 0], args: [0.07, 0.05, 0.05], color: '#64748b' },
      explodeOffset: yOff(0.7),
    },
    {
      id: 'kp-wall-plate',
      label: 'Wall Plate',
      description: 'Timber wall plate bearing on top of masonry wall, spreading the rafter heel load. Min 100×75mm. Anchored to wall with strap ties.',
      geometry: { id: 'kp-wall-plate-geo', type: 'box', position: [-0.43, -0.04, 0], args: [0.12, 0.04, 0.06], color: '#D4951A' },
      explodeOffset: [-0.6, -0.1, 0],
    },
    {
      id: 'kp-ceiling-joist',
      label: 'Ceiling Joist (Tie)',
      description: 'Ceiling joist lap-jointed to tie beam — carries ceiling lining and adds redundancy to the tension tie.',
      geometry: { id: 'kp-ceiling-joist-geo', type: 'box', position: [0, -0.04, 0.08], args: [0.78, 0.04, 0.04], color: '#ca8a04' },
      explodeOffset: yOff(-0.5),
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}
