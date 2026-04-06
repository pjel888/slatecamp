// src/app/dashboard/3d-lab/_config/modules/tuscan-order.ts
// Tuscan Order — Classical Architecture History
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const tuscanOrderConfig: ExplodedAssemblyConfig = {
  id: 'tuscan-order',
  title: 'Tuscan Order',
  description: 'Exploded assembly of the Tuscan order — the simplest of the five classical orders. Proportion 1:7 (diameter to height). Smooth unfluted shaft, simple torus base, plain capital, and unadorned entablature.',
  subject: 'history',
  parts: [
    {
      id: 'to-stylobate',
      label: 'Stylobate',
      description: 'Top step of the three-stepped platform (crepidoma). Direct support for column base.',
      geometry: { id: 'to-stylobate-geo', type: 'box', position: [0, 0.025, 0], args: [0.6, 0.05, 0.6], color: '#d4d4d8' },
      explodeOffset: yOff(0),
    },
    {
      id: 'to-plinth',
      label: 'Base Plinth',
      description: 'Square plinth at base of column. Used in Roman Tuscan; absent in Greek Doric.',
      geometry: { id: 'to-plinth-geo', type: 'box', position: [0, 0.08, 0], args: [0.24, 0.06, 0.24], color: '#d4d4d8' },
      explodeOffset: yOff(0.1),
    },
    {
      id: 'to-torus',
      label: 'Base Torus',
      description: 'Single torus moulding — simple convex ring at column base. Tuscan base is simpler than Attic base (two tori + scotia).',
      geometry: { id: 'to-torus-geo', type: 'cylinder', position: [0, 0.13, 0], args: [0.12, 0.12, 0.04, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.2),
    },
    {
      id: 'to-shaft',
      label: 'Column Shaft (Smooth)',
      description: 'Smooth, unfluted shaft with entasis (slight convex taper). Proportion: height = 7× lower diameter. Simpler than fluted Doric.',
      geometry: { id: 'to-shaft-geo', type: 'cylinder', position: [0, 0.63, 0], args: [0.09, 0.07, 0.9, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'to-necking',
      label: 'Necking',
      description: 'Narrow band at top of shaft just below the echinus. Marks transition from shaft to capital.',
      geometry: { id: 'to-necking-geo', type: 'cylinder', position: [0, 1.1, 0], args: [0.08, 0.09, 0.04, 16], color: '#d4d4d8' },
      explodeOffset: yOff(0.8),
    },
    {
      id: 'to-echinus',
      label: 'Echinus (Capital)',
      description: 'Simple convex echinus moulding forming the capital. Plainer than Doric — no annulets.',
      geometry: { id: 'to-echinus-geo', type: 'cylinder', position: [0, 1.17, 0], args: [0.11, 0.08, 0.06, 16], color: '#d4d4d8' },
      explodeOffset: yOff(0.9),
    },
    {
      id: 'to-abacus',
      label: 'Abacus',
      description: 'Square flat slab capping the capital, directly supporting the architrave.',
      geometry: { id: 'to-abacus-geo', type: 'box', position: [0, 1.23, 0], args: [0.26, 0.05, 0.26], color: '#d4d4d8' },
      explodeOffset: yOff(1.0),
    },
    {
      id: 'to-architrave',
      label: 'Architrave',
      description: 'Plain unadorned architrave (epistyle). Spans between column capitals. Simple fascia — no divisions.',
      geometry: { id: 'to-architrave-geo', type: 'box', position: [0, 1.31, 0], args: [0.28, 0.06, 0.26], color: '#a1a1aa' },
      explodeOffset: yOff(1.2),
    },
    {
      id: 'to-frieze',
      label: 'Frieze (Plain)',
      description: 'Smooth, undecorated frieze band. Tuscan lacks the triglyph/metope of Doric and the dentils of Ionic.',
      geometry: { id: 'to-frieze-geo', type: 'box', position: [0, 1.4, 0], args: [0.28, 0.07, 0.26], color: '#a1a1aa' },
      explodeOffset: yOff(1.4),
    },
    {
      id: 'to-cornice',
      label: 'Cornice',
      description: 'Simple projecting cornice with cyma recta and corona. Crowns the entablature.',
      geometry: { id: 'to-cornice-geo', type: 'box', position: [0, 1.5, 0], args: [0.32, 0.06, 0.3], color: '#94a3b8' },
      explodeOffset: yOff(1.6),
    },
  ],
  camera: { position: [2, 2, 2], fov: 45 },
}

