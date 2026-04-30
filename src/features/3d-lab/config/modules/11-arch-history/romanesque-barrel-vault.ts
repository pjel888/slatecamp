// src/features/3d-lab/config/modules/romanesque-barrel-vault.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const romanesqueBarrelVaultConfig: CutawaySectionConfig = {
  id: 'romanesque-barrel-vault',
  title: 'Romanesque Barrel Vault',
  description:
    'Romanesque nave cross-section — massive walls, round-arched barrel vault, thick piers, and small windows necessitated by continuous vault thrust.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4.5, 4, 4.5], fov: 42 },
  layers: [
    {
      id: 'thick-wall',
      label: 'Massive Exterior Wall (1–2m)',
      material: 'Rubble Core / Ashlar Face',
      description: 'Romanesque walls 1–2m thick — required to resist horizontal thrust from barrel vault without buttresses. Limits window size severely.',
      depth: 0,
      geometry: { id: 'geo-wall', type: 'box', args: [1.2, 6.0, 1.5], position: [-2.1, 3.0, 0], color: '#9ca3af' },
    },
    {
      id: 'thick-wall-right',
      label: 'Right Exterior Wall',
      material: 'Rubble Core / Ashlar Face',
      description: 'Right nave wall — equally massive, small round-arched windows (clerestory avoided due to structural constraints).',
      depth: 0.05,
      geometry: { id: 'geo-wallr', type: 'box', args: [1.2, 6.0, 1.5], position: [2.1, 3.0, 0], color: '#9ca3af' },
    },
    {
      id: 'small-window',
      label: 'Small Round-Arched Window',
      material: 'Stone Surround, Small Glazing',
      description: 'Small round-arched window — kept minimal to preserve wall strength. Romanesque interiors are characteristically dark.',
      depth: 0.2,
      geometry: { id: 'geo-win', type: 'box', args: [0.4, 0.7, 0.05], position: [-2.0, 5.0, 0.73], color: '#dbeafe' },
    },
    {
      id: 'pier',
      label: 'Heavy Nave Pier',
      material: 'Solid Masonry',
      description: 'Massive rectangular or compound pier supporting the vault. No slender columns — structural necessity of vault thrust demands bulk.',
      depth: 0.35,
      geometry: { id: 'geo-pier', type: 'box', args: [0.5, 4.5, 0.6], position: [-1.25, 2.55, 0], color: '#b0b0b0' },
    },
    {
      id: 'barrel-vault',
      label: 'Barrel Vault (Round Arch)',
      material: 'Stone Vault',
      description: 'Semicircular barrel vault covering the nave. Continuous lateral thrust transferred to side walls — no clerestory possible without aisle vaults.',
      depth: 0.5,
      geometry: { id: 'geo-bv', type: 'cylinder', args: [1.6, 1.6, 1.5, 20, 1, 1, 0, Math.PI], position: [0, 6.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#c4913f', opacity: 0.8, transparent: true },
    },
    {
      id: 'transverse-arch',
      label: 'Transverse Arch (Reinforcing)',
      material: 'Stone Arch',
      description: 'Transverse arches across the nave divide the barrel vault into bays — structural stiffeners reducing vault deformation.',
      depth: 0.65,
      geometry: { id: 'geo-ta', type: 'ring', args: [1.4, 1.8, 24], position: [0, 6.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#a87030' },
    },
    {
      id: 'aisle-vault',
      label: 'Side Aisle Half-Vault',
      material: 'Stone Half-Vault / Quadrant',
      description: 'Side aisle quadrant vault — transfers nave vault thrust to outer wall. Precursor to the flying buttress concept.',
      depth: 0.8,
      geometry: { id: 'geo-av', type: 'cylinder', args: [0.8, 0.8, 1.5, 20, 1, 1, 0, Math.PI / 2], position: [-1.7, 5.8, 0], rotation: [Math.PI / 2, 0, -Math.PI / 2], color: '#b0a090', opacity: 0.7, transparent: true },
    },
  ],
  annotations: [
    {
      id: 'ann-thrust',
      label: 'Continuous Lateral Thrust',
      description: 'Barrel vault exerts continuous lateral thrust along its full length — necessitates massive walls or aisle half-vaults. Severely limits window openings.',
      position: () => [2.5, 4.0, 0.8],
    },
    {
      id: 'ann-dark',
      label: 'Dark Interiors',
      description: 'Romanesque buildings characteristically dark — thick walls limit window size. Contrast with Gothic where flying buttresses free the wall for large windows.',
      position: () => [-3.0, 5.0, 0.8],
    },
    {
      id: 'ann-aisle',
      label: 'Aisle as Buttress',
      description: 'Side aisles with lower half-vaults act as concealed buttresses, absorbing nave vault thrust before it reaches the outer wall.',
      position: () => [-3.0, 3.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 3.5 } },
    { label: 'Pier Level', values: { cutPosition: 2.0 } },
    { label: 'Vault Crown', values: { cutPosition: 6.2 } },
    { label: 'Window Level', values: { cutPosition: 5.0 } },
  ],
}

