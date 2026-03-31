// src/app/dashboard/3d-lab/_config/modules/notre-dame-section.ts
import type { CutawaySectionConfig } from '../../../_types/templates'

export const notreDameSectionConfig: CutawaySectionConfig = {
  id: 'notre-dame-section',
  title: 'Notre-Dame Section',
  description:
    'Notre-Dame de Paris (1163–1345) — Gothic nave section with flying buttresses, ribbed vault, tracery windows, and compound piers.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5.5, 5, 5.5], fov: 42 },
  layers: [
    {
      id: 'nave-floor',
      label: 'Nave Floor (Stone Paving)',
      material: 'Limestone Paving',
      description: 'Nave floor — limestone slabs over a crypt. Slightly higher at the choir end due to medieval topography.',
      depth: 0,
      geometry: { id: 'geo-nfloor', type: 'box', args: [5, 0.15, 1.5], position: [0, 0.075, 0], color: '#d4d4d4' },
    },
    {
      id: 'compound-pier',
      label: 'Compound Pier',
      material: 'Limestone Clustered Shafts',
      description: 'Compound pier with clustered cylindrical shafts — each sub-shaft corresponds to a vault rib or arcade arch above. Notre-Dame piers 5.5m tall.',
      depth: 0.2,
      geometry: { id: 'geo-cpier', type: 'cylinder', args: [0.45, 0.45, 6.5, 8], position: [-1.8, 3.4, 0], color: '#d6d3d1' },
    },
    {
      id: 'arcade-arch',
      label: 'Nave Arcade (Pointed Arches)',
      material: 'Limestone Voussoirs',
      description: 'Lower arcade pointed arches opening into aisles. Notre-Dame has a 5-aisle plan — two nave aisles each side.',
      depth: 0.35,
      geometry: { id: 'geo-aarch', type: 'ring', args: [1.4, 1.7, 24], position: [0, 5.5, 0], rotation: [Math.PI / 2, 0, 0], color: '#c4c4c4' },
    },
    {
      id: 'triforium',
      label: 'Triforium Gallery',
      material: 'Open Arcade / Stone',
      description: 'Triforium: narrow gallery passage above the arcade, below the clerestory. Notre-Dame\'s triforium is glazed in the 13th c. rebuilding — adds transparency.',
      depth: 0.5,
      geometry: { id: 'geo-trif', type: 'box', args: [5, 0.8, 0.3], position: [0, 7.0, 0.6], color: '#e2e8f0' },
    },
    {
      id: 'clerestory-glass',
      label: 'Clerestory Stained Glass',
      material: 'Stained Glass + Stone Tracery',
      description: 'Large clerestory windows with bar tracery — Gothic innovation made possible by flying buttresses. Notre-Dame clerestory doubled in size during 13th c. reconstruction.',
      depth: 0.65,
      geometry: { id: 'geo-clglass', type: 'box', args: [1.2, 3.5, 0.06], position: [-1.5, 9.5, 0.6], color: '#93c5fd', opacity: 0.8, transparent: true },
    },
    {
      id: 'ribbed-vault',
      label: 'Sexpartite Ribbed Vault',
      material: 'Limestone Ribs + Stone',
      description: 'Sexpartite (6-part) vault over nave — two bays of nave correspond to one vault bay. Later Gothic prefers simpler quadripartite vaults.',
      depth: 0.8,
      geometry: { id: 'geo-rib', type: 'cylinder', args: [0.06, 0.06, 3.0, 8], position: [0, 11.5, 0], rotation: [0, 0, Math.PI / 4], color: '#c0c0c0' },
    },
    {
      id: 'flying-buttress',
      label: 'Flying Buttress (Double)',
      material: 'Limestone Arch',
      description: 'Notre-Dame\'s double flying buttresses — outer arm at clerestory level, inner arm at triforium. Innovative double arch resists dome spread and wind loads.',
      depth: 0.95,
      geometry: { id: 'geo-fb', type: 'cylinder', args: [0.1, 0.1, 3.5, 8], position: [-3.0, 8.5, 0], rotation: [0, 0, Math.PI / 4], color: '#d4d4d4' },
    },
  ],
  annotations: [
    {
      id: 'ann-fb',
      label: 'Double Flying Buttress',
      description: 'Notre-Dame pioneered double flying buttresses in 1180s — outer arc at upper clerestory, inner arc at lower level, providing more complete thrust management.',
      position: () => [-4.0, 8.5, 0.8],
    },
    {
      id: 'ann-5aisle',
      label: '5-Aisle Plan',
      description: 'Five-aisle plan (widest Gothic cathedral of its era) required the innovative buttressing system — width creates both lateral stability challenges and grandeur.',
      position: () => [3.0, 2.0, 0.8],
    },
    {
      id: 'ann-vault',
      label: 'Sexpartite → Quadripartite',
      description: 'Early Gothic used sexpartite (6-part) vaults covering two bays each — structurally less efficient. Later Gothic shifted to simpler quadripartite (4-part) vaults per bay.',
      position: () => [2.0, 12.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 7.0 } },
    { label: 'Arcade Level', values: { cutPosition: 5.0 } },
    { label: 'Triforium', values: { cutPosition: 7.0 } },
    { label: 'Clerestory & Vault', values: { cutPosition: 10.0 } },
  ],
}
