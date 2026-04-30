// src/features/3d-lab/config/modules/roman-arch-vault.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const romanArchVaultConfig: CutawaySectionConfig = {
  id: 'roman-arch-vault',
  title: 'Roman Arch & Vault',
  description:
    'Roman structural system cross-section — semicircular arch with voussoirs and keystone, barrel vault, and groin vault intersections.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [4.5, 3.5, 4.5], fov: 42 },
  layers: [
    {
      id: 'foundation',
      label: 'Concrete Foundation (Opus Caementicium)',
      material: 'Roman Concrete (Pozzolana)',
      description: 'Roman opus caementicium — volcanic pozzolana aggregate concrete. Enabled massive foundations and vaults. Stronger than modern concrete in compression.',
      depth: 0,
      geometry: { id: 'geo-fnd', type: 'box', args: [4.5, 0.6, 1.2], position: [0, 0.3, 0], color: '#9ca3af' },
    },
    {
      id: 'pier',
      label: 'Masonry Pier / Abutment',
      material: 'Concrete & Brick (Opus Incertum)',
      description: 'Massive masonry piers absorbing horizontal thrust from the arch. Roman piers are wide relative to the span to resist outward thrust.',
      depth: 0.2,
      geometry: { id: 'geo-pier1', type: 'box', args: [0.7, 3.0, 1.2], position: [-1.65, 2.1, 0], color: '#b0b0b0' },
    },
    {
      id: 'pier-right',
      label: 'Right Pier',
      material: 'Concrete & Brick',
      description: 'Right masonry pier — pair of piers form the supports (springings) for the arch.',
      depth: 0.25,
      geometry: { id: 'geo-pier2', type: 'box', args: [0.7, 3.0, 1.2], position: [1.65, 2.1, 0], color: '#b0b0b0' },
    },
    {
      id: 'arch-voussoirs',
      label: 'Semicircular Arch (Voussoirs)',
      material: 'Cut Stone / Brick Voussoirs',
      description: 'Semicircular arch composed of wedge-shaped voussoirs — all load carried in pure compression. No mortar tensile strength needed.',
      depth: 0.4,
      geometry: { id: 'geo-arch', type: 'ring', args: [0.9, 1.3, 32], position: [0, 3.6, 0], rotation: [Math.PI / 2, 0, 0], color: '#a87030' },
    },
    {
      id: 'keystone',
      label: 'Keystone (Crown)',
      material: 'Cut Stone Keystone',
      description: 'Keystone at crown of arch — final piece placed during construction, locks voussoirs in compression. Ceremonially significant.',
      depth: 0.55,
      geometry: { id: 'geo-key', type: 'box', args: [0.2, 0.3, 0.4], position: [0, 5.0, 0], color: '#8B6914' },
    },
    {
      id: 'barrel-vault',
      label: 'Barrel Vault (Extruded Arch)',
      material: 'Roman Concrete Vault',
      description: 'Barrel vault — semicircular arch extruded along an axis. Simplest vault form, generates continuous outward thrust along full length. Requires thick walls.',
      depth: 0.7,
      geometry: { id: 'geo-barrel', type: 'cylinder', args: [1.1, 1.1, 1.2, 20, 1, 1, 0, Math.PI], position: [0, 3.5, 0], rotation: [Math.PI / 2, 0, 0], color: '#9ca3af', opacity: 0.7, transparent: true },
    },
    {
      id: 'spandrel-fill',
      label: 'Spandrel Fill',
      material: 'Rubble Concrete',
      description: 'Rubble concrete filling the spandrel (triangular area between arch and surrounding structure) — adds mass, distributes loads to piers.',
      depth: 0.85,
      geometry: { id: 'geo-spandrel', type: 'box', args: [0.7, 1.1, 1.2], position: [-1.3, 3.9, 0], color: '#6b7280' },
    },
  ],
  annotations: [
    {
      id: 'ann-compression',
      label: 'Pure Compression Path',
      description: 'Roman arch works entirely in compression — no tensile stress. Voussoir joints open under tension, so mortar only needed for fine-tuning fit.',
      position: () => [0, 5.5, 0.7],
    },
    {
      id: 'ann-thrust',
      label: 'Horizontal Thrust to Piers',
      description: 'Semicircular arch generates significant horizontal outward thrust at springings — resisted by thick piers, buttresses, or adjacent parallel arches.',
      position: () => [-2.5, 2.5, 0.7],
    },
    {
      id: 'ann-barrel',
      label: 'Barrel Vault: Continuous Thrust',
      description: 'Barrel vault exerts uniform thrust along its entire length — requires solid, continuous walls on both sides. No windows possible without structural compromise.',
      position: () => [2.5, 3.5, 0.7],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 3.0 } },
    { label: 'Pier Base', values: { cutPosition: 0.8 } },
    { label: 'Arch Crown', values: { cutPosition: 5.0 } },
    { label: 'Barrel Vault', values: { cutPosition: 3.5 } },
  ],
}

