// src/app/dashboard/3d-lab/_config/modules/composite-order.ts
// Composite Order — Classical Architecture History
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const compositeOrderConfig: ExplodedAssemblyConfig = {
  id: 'composite-order',
  title: 'Composite Order',
  description: 'Exploded Composite order — Roman invention combining Ionic volute scrolls on top of Corinthian acanthus leaves. Proportion 1:10. The most ornate of the five classical orders.',
  subject: 'history',
  parts: [
    {
      id: 'comp-base',
      label: 'Attic Base',
      description: 'Standard Attic base: plinth, lower torus, scotia, upper torus. Identical to Corinthian base.',
      geometry: { id: 'comp-base-geo', type: 'cylinder', position: [0, 0.09, 0], args: [0.13, 0.13, 0.18, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0),
    },
    {
      id: 'comp-shaft',
      label: 'Column Shaft (24 Flutes)',
      description: '24-fluted shaft with fillets. Same proportion and detail as Corinthian (1:10).',
      geometry: { id: 'comp-shaft-geo', type: 'cylinder', position: [0, 0.85, 0], args: [0.09, 0.07, 1.2, 24], color: '#e4e4e7' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'comp-acanthus-lower',
      label: 'Acanthus Leaves — Lower Row',
      description: 'First row of 8 acanthus leaves at capital base — identical to Corinthian lower row.',
      geometry: { id: 'comp-acanthus-lower-geo', type: 'cylinder', position: [0, 1.5, 0], args: [0.14, 0.11, 0.12, 16], color: '#2D9F6F' },
      explodeOffset: yOff(0.9),
    },
    {
      id: 'comp-acanthus-upper',
      label: 'Acanthus Leaves — Upper Row',
      description: 'Second row of acanthus leaves, transitioning upward to meet the Ionic volute zone.',
      geometry: { id: 'comp-acanthus-upper-geo', type: 'cylinder', position: [0, 1.63, 0], args: [0.15, 0.13, 0.08, 16], color: '#15803d' },
      explodeOffset: yOff(1.0),
    },
    {
      id: 'comp-ionic-volute-l',
      label: 'Large Ionic Volute (Left)',
      description: 'Full-size Ionic volute scroll added above the Corinthian acanthus. Larger than Corinthian angular volutes — this combination defines the Composite capital.',
      geometry: { id: 'comp-ionic-volute-l-geo', type: 'cylinder', position: [-0.13, 1.78, 0], args: [0.07, 0.07, 0.05, 16], color: '#a1a1aa' },
      explodeOffset: [-0.22, 1.1, 0],
    },
    {
      id: 'comp-ionic-volute-r',
      label: 'Large Ionic Volute (Right)',
      description: 'Right-side large Ionic scroll. The oversize volutes are the key visual distinction from pure Corinthian.',
      geometry: { id: 'comp-ionic-volute-r-geo', type: 'cylinder', position: [0.13, 1.78, 0], args: [0.07, 0.07, 0.05, 16], color: '#a1a1aa' },
      explodeOffset: [0.22, 1.1, 0],
    },
    {
      id: 'comp-ovolo',
      label: 'Ovolo (Egg-and-Dart)',
      description: 'Carved egg-and-dart ovolo moulding beneath the abacus, from the Ionic tradition. Richer than plain Corinthian echinus.',
      geometry: { id: 'comp-ovolo-geo', type: 'cylinder', position: [0, 1.84, 0], args: [0.14, 0.14, 0.04, 16], color: '#d4d4d8' },
      explodeOffset: yOff(1.18),
    },
    {
      id: 'comp-abacus',
      label: 'Abacus (Concave, Deep)',
      description: 'Abacus with four concave sides like Corinthian, but slightly deeper to accommodate the combined capital bulk.',
      geometry: { id: 'comp-abacus-geo', type: 'box', position: [0, 1.9, 0], args: [0.3, 0.05, 0.3], color: '#d4d4d8' },
      explodeOffset: yOff(1.25),
    },
    {
      id: 'comp-entablature',
      label: 'Entablature',
      description: 'Rich entablature: three-fascia architrave, continuous frieze with scrollwork, modillion cornice. Combines Ionic and Corinthian elements at maximum richness.',
      geometry: { id: 'comp-entablature-geo', type: 'box', position: [0, 2.1, 0], args: [0.34, 0.3, 0.3], color: '#94a3b8' },
      explodeOffset: yOff(1.5),
    },
  ],
  camera: { position: [2, 2.5, 2], fov: 45 },
}
