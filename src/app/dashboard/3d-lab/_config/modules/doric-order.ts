// src/app/dashboard/3d-lab/_config/modules/doric-order.ts
// Doric Order — Classical Architecture History
import type { ExplodedAssemblyConfig } from '../../_types/templates'

function yOff(v: number): [number, number, number] { return [0, v, 0] }

export const doricOrderConfig: ExplodedAssemblyConfig = {
  id: 'doric-order',
  title: 'Doric Order',
  description: 'Exploded Doric order (Roman variant with base). Proportion 1:8. 20 shallow flutes meeting at sharp arris, echinus+abacus capital, triglyph and metope frieze.',
  subject: 'history',
  parts: [
    {
      id: 'dor-stylobate',
      label: 'Stylobate',
      description: 'Top step of the three-stepped crepidoma. Greek Doric column rises directly from stylobate with no individual base.',
      geometry: { id: 'dor-stylobate-geo', type: 'box', position: [0, 0.025, 0], args: [0.6, 0.05, 0.6], color: '#d4d4d8' },
      explodeOffset: yOff(0),
    },
    {
      id: 'dor-plinth',
      label: 'Base Plinth (Roman Doric)',
      description: 'Roman Doric adds a plinth+torus base. Greek Doric omits this — shaft rises directly from stylobate.',
      geometry: { id: 'dor-plinth-geo', type: 'box', position: [0, 0.07, 0], args: [0.22, 0.04, 0.22], color: '#d4d4d8' },
      explodeOffset: yOff(0.1),
    },
    {
      id: 'dor-shaft',
      label: 'Column Shaft (20 Flutes)',
      description: '20 shallow flutes with sharp arrises (no fillets). Strong vertical emphasis. Slight entasis creates optical refinement.',
      geometry: { id: 'dor-shaft-geo', type: 'cylinder', position: [0, 0.65, 0], args: [0.1, 0.08, 1.0, 20], color: '#e4e4e7' },
      explodeOffset: yOff(0.5),
    },
    {
      id: 'dor-annulets',
      label: 'Annulets (3 Grooves)',
      description: 'Three narrow horizontal grooves (annulets) at top of shaft beneath the echinus. Distinctive Doric detail.',
      geometry: { id: 'dor-annulets-geo', type: 'cylinder', position: [0, 1.17, 0], args: [0.09, 0.09, 0.03, 16], color: '#d4d4d8' },
      explodeOffset: yOff(0.8),
    },
    {
      id: 'dor-echinus',
      label: 'Echinus',
      description: 'Cushion-like convex moulding. In early Doric very flat; later becomes more upright.',
      geometry: { id: 'dor-echinus-geo', type: 'cylinder', position: [0, 1.22, 0], args: [0.14, 0.09, 0.07, 16], color: '#d4d4d8' },
      explodeOffset: yOff(0.9),
    },
    {
      id: 'dor-abacus',
      label: 'Abacus',
      description: 'Thick square slab. Doric abacus is heavier and less refined than Ionic or Corinthian.',
      geometry: { id: 'dor-abacus-geo', type: 'box', position: [0, 1.3, 0], args: [0.3, 0.06, 0.3], color: '#d4d4d8' },
      explodeOffset: yOff(1.0),
    },
    {
      id: 'dor-architrave',
      label: 'Architrave (Plain)',
      description: 'Single plain fascia. Doric architrave has no division into fasciae unlike Ionic (three fasciae).',
      geometry: { id: 'dor-architrave-geo', type: 'box', position: [0, 1.38, 0], args: [0.32, 0.06, 0.28], color: '#a1a1aa' },
      explodeOffset: yOff(1.2),
    },
    {
      id: 'dor-triglyph',
      label: 'Triglyph',
      description: 'Three vertical grooves (glyphs) separated by flat metopes. Triglyphs align over each column and at column centrelines.',
      geometry: { id: 'dor-triglyph-geo', type: 'box', position: [0, 1.47, 0], args: [0.09, 0.08, 0.07], color: '#71717a' },
      explodeOffset: yOff(1.35),
    },
    {
      id: 'dor-metope',
      label: 'Metope (Carved Panel)',
      description: 'Square panel between triglyphs. May be plain or carved with relief sculpture (e.g., Parthenon metopes with Lapith/Centaur battle scenes).',
      geometry: { id: 'dor-metope-geo', type: 'box', position: [0.14, 1.47, 0], args: [0.09, 0.08, 0.04], color: '#a1a1aa' },
      explodeOffset: yOff(1.35),
    },
    {
      id: 'dor-cornice',
      label: 'Cornice with Mutules',
      description: 'Projecting cornice with flat mutule slabs beneath (corresponding to triglyphs). Mutules carry guttae (drops).',
      geometry: { id: 'dor-cornice-geo', type: 'box', position: [0, 1.58, 0], args: [0.36, 0.07, 0.34], color: '#94a3b8' },
      explodeOffset: yOff(1.5),
    },
  ],
  camera: { position: [2, 2, 2], fov: 45 },
}
