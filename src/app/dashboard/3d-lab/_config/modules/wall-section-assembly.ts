// src/app/dashboard/3d-lab/_config/modules/wall-section-assembly.ts
// Wall Section Assembly — PD 1096 Construction
import type { ExplodedAssemblyConfig } from '../../_types/templates'

export const wallSectionAssemblyConfig: ExplodedAssemblyConfig = {
  id: 'wall-section-assembly',
  title: 'Wall Section Assembly',
  description: 'Exploded wall section showing full layer sequence: interior finish → plaster → CHB masonry → rebar → grout fill → exterior waterproofing, per PD 1096 standards.',
  subject: 'construction',
  parts: [
    {
      id: 'wsa-waterproofing',
      label: 'Exterior Waterproofing',
      description: 'Cementitious or elastomeric waterproofing applied to exterior CHB face. Prevents moisture ingress and efflorescence.',
      codeCitation: 'PD 1096 Section 1601',
      geometry: { id: 'wsa-waterproofing-geo', type: 'box', position: [0, 0, -0.26], args: [1.0, 1.2, 0.015], color: '#3b82f6', opacity: 0.7, transparent: true },
      explodeOffset: [0, 0, -0.7],
    },
    {
      id: 'wsa-chb',
      label: 'CHB Masonry (150mm)',
      description: 'Concrete Hollow Block — standard 150mm CHB laid in running bond with mortar joints. Backbone of most Philippine residential walls.',
      codeCitation: 'ASTM C90 / PNS 16',
      geometry: { id: 'wsa-chb-geo', type: 'box', position: [0, 0, -0.075], args: [1.0, 1.2, 0.15], color: '#d4d4d8' },
      explodeOffset: [0, 0, -0.3],
    },
    {
      id: 'wsa-rebar-vert',
      label: 'Vertical Rebar (10mm ø)',
      description: '10mm diameter vertical reinforcing bars at 600mm O.C. embedded in CHB cores and grouted in place.',
      codeCitation: 'NSCP Section 706',
      geometry: { id: 'wsa-rebar-vert-geo', type: 'cylinder', position: [-0.3, 0, 0], rotation: [0, 0, 1.5708], args: [0.008, 0.008, 1.0, 8], color: '#dc2626' },
      explodeOffset: [0, 0, 0.1],
    },
    {
      id: 'wsa-rebar-horiz',
      label: 'Horizontal Rebar (10mm ø)',
      description: '10mm horizontal tie bars at 600mm vertical spacing for seismic reinforcement of CHB wall.',
      codeCitation: 'NSCP Section 706',
      geometry: { id: 'wsa-rebar-horiz-geo', type: 'cylinder', position: [0, 0.2, 0], args: [0.008, 0.008, 1.2, 8], color: '#dc2626' },
      explodeOffset: [0, 0, 0.1],
    },
    {
      id: 'wsa-grout',
      label: 'Grout Fill (CHB Cores)',
      description: 'Fine concrete grout poured into CHB cores containing rebar, bonding reinforcement to masonry.',
      codeCitation: 'NSCP Section 706',
      geometry: { id: 'wsa-grout-geo', type: 'box', position: [0, 0, 0], args: [1.0, 1.2, 0.12], color: '#94a3b8', opacity: 0.5, transparent: true },
      explodeOffset: [0, 0, 0.15],
    },
    {
      id: 'wsa-plaster-ext',
      label: 'Exterior Plaster (12mm)',
      description: '12mm Portland cement plaster scratch coat + finish coat on exterior CHB face. Provides weather barrier and smooth substrate.',
      geometry: { id: 'wsa-plaster-ext-geo', type: 'box', position: [0, 0, 0.087], args: [1.0, 1.2, 0.024], color: '#e4e4e7' },
      explodeOffset: [0, 0, 0.3],
    },
    {
      id: 'wsa-plaster-int',
      label: 'Interior Plaster (12mm)',
      description: '12mm cement plaster on interior face. Provides flat substrate for paint or tile finish.',
      geometry: { id: 'wsa-plaster-int-geo', type: 'box', position: [0, 0, 0.162], args: [1.0, 1.2, 0.024], color: '#e4e4e7' },
      explodeOffset: [0, 0, 0.5],
    },
    {
      id: 'wsa-finish',
      label: 'Interior Wall Finish',
      description: 'Interior finish layer — paint, tile, or skim coat. Final surface visible to occupants.',
      geometry: { id: 'wsa-finish-geo', type: 'box', position: [0, 0, 0.19], args: [1.0, 1.2, 0.006], color: '#fafafa' },
      explodeOffset: [0, 0, 0.7],
    },
  ],
  camera: { position: [2, 1, 3], fov: 45 },
}
