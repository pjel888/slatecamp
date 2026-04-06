// src/app/dashboard/3d-lab/_config/modules/gothic-ribbed-vault.ts
// Gothic Ribbed Vault — Architectural History
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

export const gothicRibbedVaultConfig: ExplodedAssemblyConfig = {
  id: 'gothic-ribbed-vault',
  title: 'Gothic Ribbed Vault',
  description: 'Exploded assembly of a Gothic ribbed vault showing pointed arches, diagonal ribs, keystones, and webbing panels characteristic of Gothic cathedral construction.',
  subject: 'history',
  parts: [
    {
      id: 'grv-springer',
      label: 'Springer Stone',
      description: 'Base springer stone at column capital where ribs originate. Clustered piers distribute thrust.',
      geometry: { id: 'grv-springer-geo', type: 'box', position: [0, 0, 0], args: [0.4, 0.12, 0.4], color: '#94a3b8' },
      explodeOffset: [0, 0, 0],
    },
    {
      id: 'grv-rib-diag-1',
      label: 'Diagonal Rib (NE–SW)',
      description: 'Main diagonal rib running corner to corner, creating the structural spine of the bay.',
      geometry: { id: 'grv-rib-diag-1-geo', type: 'cylinder', position: [0.3, 0.6, 0.3], rotation: [0.8, 0.785, 0], args: [0.025, 0.025, 1.4, 8], color: '#71717a' },
      explodeOffset: [0.3, 0.4, 0.3],
    },
    {
      id: 'grv-rib-diag-2',
      label: 'Diagonal Rib (NW–SE)',
      description: 'Second diagonal rib crossing the first, intersecting at the crown keystone.',
      geometry: { id: 'grv-rib-diag-2-geo', type: 'cylinder', position: [-0.3, 0.6, 0.3], rotation: [0.8, -0.785, 0], args: [0.025, 0.025, 1.4, 8], color: '#71717a' },
      explodeOffset: [-0.3, 0.4, 0.3],
    },
    {
      id: 'grv-transverse-rib',
      label: 'Transverse Arch',
      description: 'Pointed transverse arch separating bays. Carries thrust to the pier buttresses.',
      geometry: { id: 'grv-transverse-rib-geo', type: 'box', position: [0, 0.7, 0.5], rotation: [0.2, 0, 0], args: [0.8, 0.06, 0.04], color: '#52525b' },
      explodeOffset: [0, 0.5, 0.6],
    },
    {
      id: 'grv-wall-rib',
      label: 'Wall Rib (Formerets)',
      description: 'Formeret ribs running along the wall face, framing the clerestory windows.',
      geometry: { id: 'grv-wall-rib-geo', type: 'box', position: [0.5, 0.7, 0], rotation: [0, 0, 0.2], args: [0.04, 0.06, 0.8], color: '#52525b' },
      explodeOffset: [0.6, 0.5, 0],
    },
    {
      id: 'grv-tierceron-1',
      label: 'Tierceron Rib',
      description: 'Secondary rib running from springer to ridge rib, creating additional vault divisions.',
      geometry: { id: 'grv-tierceron-1-geo', type: 'cylinder', position: [0.15, 0.65, 0.4], rotation: [0.6, 0.4, 0], args: [0.015, 0.015, 0.9, 6], color: '#a1a1aa' },
      explodeOffset: [0.15, 0.35, 0.5],
    },
    {
      id: 'grv-keystone',
      label: 'Crown Keystone',
      description: 'Carved keystone at vault crown where all diagonal ribs meet. Often decorated with heraldic or foliate motifs.',
      codeCitation: 'Gothic structural system — rib intersection',
      geometry: { id: 'grv-keystone-geo', type: 'cylinder', position: [0, 1.1, 0], args: [0.06, 0.06, 0.1, 12], color: '#d4d4d8' },
      explodeOffset: [0, 0.8, 0],
    },
    {
      id: 'grv-web-panel-1',
      label: 'Vault Webbing (NE)',
      description: 'Thin infill web panel of dressed stone between ribs. Non-structural; carried by ribs.',
      geometry: { id: 'grv-web-panel-1-geo', type: 'box', position: [0.25, 0.75, 0.25], rotation: [0.3, 0, 0.3], args: [0.45, 0.03, 0.45], color: '#e4e4e7', opacity: 0.7, transparent: true },
      explodeOffset: [0.4, 0.6, 0.4],
    },
    {
      id: 'grv-web-panel-2',
      label: 'Vault Webbing (SW)',
      description: 'Thin infill web panel opposite NE quadrant. Lime mortar joints with no centering after erection.',
      geometry: { id: 'grv-web-panel-2-geo', type: 'box', position: [-0.25, 0.75, -0.25], rotation: [-0.3, 0, -0.3], args: [0.45, 0.03, 0.45], color: '#e4e4e7', opacity: 0.7, transparent: true },
      explodeOffset: [-0.4, 0.6, -0.4],
    },
    {
      id: 'grv-flying-buttress',
      label: 'Flying Buttress Stub',
      description: 'External flying buttress transfers lateral thrust from vault to outer pier, allowing thin clerestory walls.',
      geometry: { id: 'grv-flying-buttress-geo', type: 'box', position: [0.7, 0.5, 0], rotation: [0, 0, 0.35], args: [0.6, 0.1, 0.15], color: '#94a3b8' },
      explodeOffset: [0.9, 0.2, 0],
    },
  ],
  camera: { position: [3, 3, 3], fov: 45 },
}

