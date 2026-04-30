// src/features/3d-lab/config/modules/corinthian-order.ts
// Corinthian Order — Classical Architecture History
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const corinthianOrderConfig: ExplodedAssemblyConfig = {
  id: 'corinthian-order',
  title: 'Corinthian Order',
  description: 'Exploded Corinthian order. Proportion 1:10. Attic base, 24-fluted shaft, elaborate acanthus-leaf capital with caulicoli and abacus with concave sides, modillion cornice.',
  subject: 'history',
  parts: [
    {
      id: 'cor-base',
      label: 'Attic Base (Plinth + Tori)',
      description: 'Attic base identical in profile to Ionic: plinth, lower torus, scotia, upper torus. Corinthian excels above the base.',
      geometry: { id: 'cor-base-geo', type: 'cylinder', position: [0, 0.09, 0], args: [0.13, 0.13, 0.18, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0),
    },
    {
      id: 'cor-shaft',
      label: 'Column Shaft (24 Flutes)',
      description: '24 flutes with fillets. Tallest and most slender of the orders at 1:10. Nearly identical to Ionic shaft.',
      geometry: { id: 'cor-shaft-geo', type: 'cylinder', position: [0, 0.85, 0], args: [0.09, 0.07, 1.2, 24], color: '#e4e4e7' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'cor-acanthus-lower',
      label: 'Acanthus Leaves — Lower Row',
      description: 'First row of 8 large acanthus leaves at base of capital. Based on the leaf of Acanthus spinosus. Legend: Callimachus invented capital inspired by basket on tomb.',
      geometry: { id: 'cor-acanthus-lower-geo', type: 'cylinder', position: [0, 1.5, 0], args: [0.14, 0.11, 0.12, 16], color: '#2D9F6F' },
      explodeOffset: yOff(0.9),
    },
    {
      id: 'cor-acanthus-upper',
      label: 'Acanthus Leaves — Upper Row',
      description: 'Second row of 8 smaller acanthus leaves above the first, alternating with the lower.',
      geometry: { id: 'cor-acanthus-upper-geo', type: 'cylinder', position: [0, 1.65, 0], args: [0.15, 0.13, 0.1, 16], color: '#15803d' },
      explodeOffset: yOff(1.0),
    },
    {
      id: 'cor-caulicoli',
      label: 'Caulicoli (Stalks)',
      description: 'Eight spiral stalks (caulicoli) rising from between the upper acanthus leaves, curling to support the volutes and central flower.',
      geometry: { id: 'cor-caulicoli-geo', type: 'cylinder', position: [0.1, 1.76, 0.1], args: [0.015, 0.015, 0.14, 8], color: '#a3734c' },
      explodeOffset: [0.2, 1.1, 0.2],
    },
    {
      id: 'cor-volutes',
      label: 'Angular Volutes',
      description: 'Four pairs of small volutes at corners of the capital, supporting the projecting corners of the abacus.',
      geometry: { id: 'cor-volutes-geo', type: 'sphere', position: [0.13, 1.82, 0.13], args: [0.04, 8, 8], color: '#a1a1aa' },
      explodeOffset: [0.2, 1.15, 0.2],
    },
    {
      id: 'cor-abacus',
      label: 'Abacus (Concave Sides)',
      description: 'Thin abacus with four concave sides and projecting corners — key distinguishing feature from Ionic abacus (straight sides).',
      geometry: { id: 'cor-abacus-geo', type: 'box', position: [0, 1.9, 0], args: [0.3, 0.04, 0.3], color: '#d4d4d8' },
      explodeOffset: yOff(1.2),
    },
    {
      id: 'cor-architrave',
      label: 'Architrave (Three Fasciae)',
      description: 'Three stepped fasciae as in Ionic, topped with bead-and-reel and cyma mouldings.',
      geometry: { id: 'cor-architrave-geo', type: 'box', position: [0, 2.0, 0], args: [0.34, 0.09, 0.3], color: '#a1a1aa' },
      explodeOffset: yOff(1.4),
    },
    {
      id: 'cor-frieze',
      label: 'Frieze (Continuous)',
      description: 'Continuous plain or carved frieze. May contain acanthus scrolls, garlands, or figured relief.',
      geometry: { id: 'cor-frieze-geo', type: 'box', position: [0, 2.12, 0], args: [0.34, 0.09, 0.3], color: '#a1a1aa' },
      explodeOffset: yOff(1.6),
    },
    {
      id: 'cor-modillions',
      label: 'Modillions',
      description: 'S-curved scroll brackets under the cornice soffit. Characteristic Corinthian element absent in Doric and Ionic.',
      geometry: { id: 'cor-modillions-geo', type: 'box', position: [0.1, 2.22, 0], args: [0.04, 0.04, 0.06], color: '#71717a' },
      explodeOffset: [0.15, 1.75, 0],
    },
    {
      id: 'cor-cornice',
      label: 'Cornice with Corona',
      description: 'Deep projecting cornice with cyma recta, corona, and overhang. Most elaborate of the five orders.',
      geometry: { id: 'cor-cornice-geo', type: 'box', position: [0, 2.3, 0], args: [0.38, 0.08, 0.35], color: '#94a3b8' },
      explodeOffset: yOff(1.9),
    },
  ],
  camera: { position: [2, 2.5, 2], fov: 45 },
}

