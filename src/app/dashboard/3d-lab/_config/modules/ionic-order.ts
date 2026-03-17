// src/app/dashboard/3d-lab/_config/modules/ionic-order.ts
// Ionic Order — Classical Architecture History
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const ionicOrderConfig: ExplodedAssemblyConfig = {
  id: 'ionic-order',
  title: 'Ionic Order',
  description: 'Exploded Ionic order. Proportion 1:9. Attic base with two tori and scotia, 24 flutes with flat fillets, volute scroll capital, and dentilated cornice.',
  subject: 'history',
  parts: [
    {
      id: 'ion-plinth',
      label: 'Plinth (Attic Base)',
      description: 'Square plinth base. The Attic base distinguishes Ionic from the baseless Greek Doric.',
      geometry: { id: 'ion-plinth-geo', type: 'box', position: [0, 0.025, 0], args: [0.26, 0.05, 0.26], color: '#d4d4d8' },
      explodeOffset: yOff(0),
    },
    {
      id: 'ion-lower-torus',
      label: 'Lower Torus',
      description: 'Large lower torus moulding of the Attic base — convex ring.',
      geometry: { id: 'ion-lower-torus-geo', type: 'cylinder', position: [0, 0.09, 0], args: [0.12, 0.12, 0.05, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.1),
    },
    {
      id: 'ion-scotia',
      label: 'Scotia',
      description: 'Concave scotia moulding between the two tori. Creates deep shadow line defining the Attic base profile.',
      geometry: { id: 'ion-scotia-geo', type: 'cylinder', position: [0, 0.14, 0], args: [0.1, 0.12, 0.04, 16], color: '#d4d4d8' },
      explodeOffset: yOff(0.15),
    },
    {
      id: 'ion-upper-torus',
      label: 'Upper Torus',
      description: 'Smaller upper torus above the scotia. Together, lower torus + scotia + upper torus = Attic base.',
      geometry: { id: 'ion-upper-torus-geo', type: 'cylinder', position: [0, 0.18, 0], args: [0.11, 0.11, 0.04, 16], color: '#e4e4e7' },
      explodeOffset: yOff(0.2),
    },
    {
      id: 'ion-shaft',
      label: 'Column Shaft (24 Flutes)',
      description: '24 flutes separated by flat fillets. Slender proportion 1:9. Gentle entasis. More refined than Doric.',
      geometry: { id: 'ion-shaft-geo', type: 'cylinder', position: [0, 0.78, 0], args: [0.09, 0.07, 1.1, 24], color: '#e4e4e7' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'ion-volute-l',
      label: 'Volute Scroll (Left)',
      description: 'Characteristic Ionic volute — spiral scroll on left face of capital. Eye of scroll at centre.',
      geometry: { id: 'ion-volute-l-geo', type: 'cylinder', position: [-0.12, 1.42, 0], args: [0.06, 0.06, 0.04, 16], color: '#a1a1aa' },
      explodeOffset: [-0.2, 1.0, 0],
    },
    {
      id: 'ion-volute-r',
      label: 'Volute Scroll (Right)',
      description: 'Right-side Ionic volute scroll. The two-sided capital means Ionic is directional — problem resolved at corners.',
      geometry: { id: 'ion-volute-r-geo', type: 'cylinder', position: [0.12, 1.42, 0], args: [0.06, 0.06, 0.04, 16], color: '#a1a1aa' },
      explodeOffset: [0.2, 1.0, 0],
    },
    {
      id: 'ion-echinus',
      label: 'Echinus with Ovolo',
      description: 'Ovolo (egg-and-dart) moulding beneath the abacus. Less prominent than Doric echinus.',
      geometry: { id: 'ion-echinus-geo', type: 'cylinder', position: [0, 1.42, 0], args: [0.13, 0.1, 0.04, 16], color: '#d4d4d8' },
      explodeOffset: yOff(0.95),
    },
    {
      id: 'ion-abacus',
      label: 'Abacus (Thin)',
      description: 'Thin moulded abacus — thinner and more delicate than Doric abacus. May be stepped or curved.',
      geometry: { id: 'ion-abacus-geo', type: 'box', position: [0, 1.47, 0], args: [0.3, 0.03, 0.28], color: '#d4d4d8' },
      explodeOffset: yOff(1.0),
    },
    {
      id: 'ion-architrave',
      label: 'Architrave (Three Fasciae)',
      description: 'Three stepped fasciae of increasing projection. More refined than single-fascia Doric architrave.',
      geometry: { id: 'ion-architrave-geo', type: 'box', position: [0, 1.56, 0], args: [0.32, 0.08, 0.28], color: '#a1a1aa' },
      explodeOffset: yOff(1.2),
    },
    {
      id: 'ion-frieze',
      label: 'Frieze (Continuous)',
      description: 'Continuous frieze band — may bear sculptural relief. No triglyphs. Continuous narrative scroll possible (e.g., Parthenon frieze).',
      geometry: { id: 'ion-frieze-geo', type: 'box', position: [0, 1.67, 0], args: [0.32, 0.08, 0.28], color: '#a1a1aa' },
      explodeOffset: yOff(1.4),
    },
    {
      id: 'ion-dentils',
      label: 'Dentils',
      description: 'Row of small rectangular blocks (dentils) in the bed mould below the corona. Characteristic Ionic element absent in Doric.',
      geometry: { id: 'ion-dentils-geo', type: 'box', position: [0, 1.77, 0], args: [0.32, 0.04, 0.02], color: '#71717a' },
      explodeOffset: yOff(1.5),
    },
    {
      id: 'ion-cornice',
      label: 'Cornice with Cymatium',
      description: 'Projecting cornice with cyma recta (wave moulding) and corona. Crowns the Ionic entablature.',
      geometry: { id: 'ion-cornice-geo', type: 'box', position: [0, 1.85, 0], args: [0.36, 0.06, 0.32], color: '#94a3b8' },
      explodeOffset: yOff(1.6),
    },
  ],
  camera: { position: [2, 2, 2], fov: 45 },
}
