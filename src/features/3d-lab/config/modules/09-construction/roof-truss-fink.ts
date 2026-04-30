// src/features/3d-lab/config/modules/roof-truss-fink.ts
// Fink Truss — Construction
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const roofTrussFinkConfig: ExplodedAssemblyConfig = {
  id: 'roof-truss-fink',
  title: 'Fink Roof Truss',
  description: 'Exploded Fink (W-web) roof truss — the most common residential truss type. Spans up to 10m efficiently. W-web pattern creates W-shape between top and bottom chords.',
  subject: 'construction',
  parts: [
    {
      id: 'fink-btm-chord',
      label: 'Bottom Chord (Tie Beam)',
      description: 'Bottom chord in tension — carries horizontal thrust from the sloped rafters. Acts as ceiling joist. Min 50×100mm for spans to 10m.',
      codeCitation: 'NSCP Section 617',
      geometry: { id: 'fink-btm-chord-geo', type: 'box', position: [0, 0, 0], args: [1.0, 0.04, 0.05], color: '#92400e' },
      explodeOffset: yOff(-0.3),
    },
    {
      id: 'fink-top-chord-l',
      label: 'Top Chord Left (Rafter)',
      description: 'Left rafter (top chord) — in compression. Slope typically 22.5°–30° for Philippine metal sheet roofing.',
      geometry: { id: 'fink-top-chord-l-geo', type: 'box', position: [-0.27, 0.3, 0], rotation: [0, 0, 0.48], args: [0.56, 0.04, 0.05], color: '#78350f' },
      explodeOffset: [-0.4, 0.3, 0],
    },
    {
      id: 'fink-top-chord-r',
      label: 'Top Chord Right (Rafter)',
      description: 'Right rafter (top chord). Meets at ridge with metal gang-nail plate or bolted connection.',
      geometry: { id: 'fink-top-chord-r-geo', type: 'box', position: [0.27, 0.3, 0], rotation: [0, 0, -0.48], args: [0.56, 0.04, 0.05], color: '#78350f' },
      explodeOffset: [0.4, 0.3, 0],
    },
    {
      id: 'fink-king-post',
      label: 'King Post (Vertical Web)',
      description: 'Central vertical web member connecting ridge to bottom chord midpoint. In tension — hangs the tie beam. Key element of Fink W-pattern.',
      geometry: { id: 'fink-king-post-geo', type: 'box', position: [0, 0.27, 0], args: [0.04, 0.5, 0.04], color: '#a3734c' },
      explodeOffset: [0, 0.5, 0],
    },
    {
      id: 'fink-web-l1',
      label: 'Diagonal Web Left (Tension)',
      description: 'W-web left diagonal — runs from lower top chord to inner bottom chord panel point. In tension.',
      geometry: { id: 'fink-web-l1-geo', type: 'box', position: [-0.25, 0.12, 0], rotation: [0, 0, 0.9], args: [0.03, 0.38, 0.03], color: '#b45309' },
      explodeOffset: [-0.4, 0.2, 0],
    },
    {
      id: 'fink-web-r1',
      label: 'Diagonal Web Right (Tension)',
      description: 'W-web right diagonal — symmetric with left web. The W-web creates efficient load path to supports.',
      geometry: { id: 'fink-web-r1-geo', type: 'box', position: [0.25, 0.12, 0], rotation: [0, 0, -0.9], args: [0.03, 0.38, 0.03], color: '#b45309' },
      explodeOffset: [0.4, 0.2, 0],
    },
    {
      id: 'fink-purlin',
      label: 'Purlin (C-Purlin)',
      description: 'Cold-formed C-purlin spanning between trusses at 1.2–1.8m O.C. to support roof cladding sheets.',
      geometry: { id: 'fink-purlin-geo', type: 'box', position: [-0.25, 0.37, 0.15], args: [0.04, 0.012, 0.3], color: '#94a3b8' },
      explodeOffset: [-0.25, 0.6, 0.3],
    },
    {
      id: 'fink-ridge-plate',
      label: 'Ridge Gang-Nail Plate',
      description: 'Metal gang-nail (connector) plate at ridge joining left and right top chords. Punched steel — installed by hydraulic press.',
      geometry: { id: 'fink-ridge-plate-geo', type: 'box', position: [0, 0.54, 0], args: [0.08, 0.04, 0.05], color: '#64748b' },
      explodeOffset: yOff(0.7),
    },
    {
      id: 'fink-bearing',
      label: 'Bearing Block / Heel Joint',
      description: 'Bearing block at heel where bottom chord meets top chord at wall plate. Critical joint — transfers vertical reaction to wall.',
      geometry: { id: 'fink-bearing-geo', type: 'box', position: [-0.5, 0.04, 0], args: [0.06, 0.08, 0.05], color: '#52525b' },
      explodeOffset: [-0.7, 0, 0],
    },
  ],
  camera: { position: [0, 1.5, 2.5], fov: 50 },
}

