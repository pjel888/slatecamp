// src/features/3d-lab/config/modules/manila-cathedral-section.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const manilaCathedralSectionConfig: CutawaySectionConfig = {
  id: 'manila-cathedral-section',
  title: 'Manila Cathedral Section',
  description:
    'Manila Cathedral (current 1958 rebuilding, 8th structure) — Neoromanesque nave section with barrel vault, rose window, and RC structural frame.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4.5, 5], fov: 42 },
  layers: [
    {
      id: 'rc-foundation',
      label: 'RC Foundation',
      material: 'Reinforced Concrete',
      description: 'Reinforced concrete foundation of the 1958 rebuilding — 8th structure on site. Original built 1571, destroyed multiple times by earthquakes and war.',
      depth: 0,
      geometry: { id: 'geo-rcfnd', type: 'box', args: [5, 0.8, 2.0], position: [0, 0.4, 0], color: '#b0b0b0' },
    },
    {
      id: 'stone-faced-wall',
      label: 'RC Wall with Stone Facing',
      material: 'RC with Volcanic Stone Face',
      description: 'Reinforced concrete structural wall faced with volcanic stone (Guadalupe stone) — imitates traditional Baroque masonry while using modern structure.',
      depth: 0.2,
      geometry: { id: 'geo-rcwall', type: 'box', args: [1.0, 8.0, 2.0], position: [-2.5, 4.5, 0], color: '#9ca3af' },
    },
    {
      id: 'romanesque-arcade',
      label: 'Neoromanesque Arcade',
      material: 'RC Columns with Stone Capitals',
      description: 'Round-arch arcade in Neoromanesque style — columns with carved stone capitals. Nave arcade opens to side aisles.',
      depth: 0.35,
      geometry: { id: 'geo-arcade', type: 'ring', args: [1.0, 1.3, 24], position: [0, 5.5, 0], rotation: [Math.PI / 2, 0, 0], color: '#d4a853' },
    },
    {
      id: 'barrel-vault-rc',
      label: 'RC Barrel Vault (Neoromanesque)',
      material: 'RC Barrel Vault with Stone Facing',
      description: 'Reinforced concrete barrel vault — round-arched Romanesque form. 1958 construction uses RC for seismic resistance while maintaining historical vocabulary.',
      depth: 0.5,
      geometry: { id: 'geo-bvrc', type: 'cylinder', args: [2.0, 2.0, 2.0, 20, 1, 1, 0, Math.PI], position: [0, 8.5, 0], rotation: [Math.PI / 2, 0, 0], color: '#c0b090', opacity: 0.8, transparent: true },
    },
    {
      id: 'rose-window',
      label: 'Rose Window (West Facade)',
      material: 'Stained Glass + Stone Tracery',
      description: 'Romanesque rose window on west facade — circular stained glass with stone tracery. Major symbolic element of the cathedral facade.',
      depth: 0.65,
      geometry: { id: 'geo-rose', type: 'ring', args: [0.6, 0.8, 24], position: [0, 7.5, 1.1], rotation: [Math.PI / 2, 0, 0], color: '#fbbf24' },
    },
    {
      id: 'campanario',
      label: 'Bell Towers (Campanario)',
      material: 'RC with Stone Veneer',
      description: 'Flanking bell towers in Neoromanesque style — RC frame with stone veneer. Contain bells and serve as visual anchors for the west facade.',
      depth: 0.8,
      geometry: { id: 'geo-camp', type: 'box', args: [1.0, 10.0, 1.5], position: [3.0, 5.0, 0], color: '#c4913f' },
    },
    {
      id: 'apse-vault',
      label: 'Semicircular Apse',
      material: 'RC with Mosaic',
      description: 'Semicircular apse at east end — mosaic-decorated interior. Houses the main altar and tabernacle.',
      depth: 0.9,
      geometry: { id: 'geo-apse', type: 'cylinder', args: [1.5, 1.5, 0.8, 12, 1, 1, 0, Math.PI], position: [0, 7.5, -0.9], rotation: [Math.PI / 2, 0, 0], color: '#d4a853', opacity: 0.7, transparent: true },
    },
  ],
  annotations: [
    {
      id: 'ann-rebuilt',
      label: '8th Structure (1958)',
      description: 'Manila Cathedral has been destroyed and rebuilt 8 times: 1571 (original bamboo/nipa), 1581, 1592, 1600, 1654, 1751 (earthquake), 1863 (earthquake), 1945 (war), 1958 (current).',
      position: () => [3.0, 9.5, 0.8],
    },
    {
      id: 'ann-neoro',
      label: 'Neoromanesque Style',
      description: 'Current cathedral by Fernando Ocampo in Neoromanesque style — round arches, barrel vault, rose window. RC structure clad in traditional volcanic stone.',
      position: () => [3.0, 5.5, 0.8],
    },
    {
      id: 'ann-significance',
      label: 'Metropolitan Cathedral',
      description: 'Cathedral of the Archdiocese of Manila — seat of the Archbishop. Located in Intramuros, the historic walled city of Manila, a UNESCO World Heritage Site.',
      position: () => [-3.5, 5.5, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 5.0 } },
    { label: 'Nave Arcade', values: { cutPosition: 5.5 } },
    { label: 'Rose Window', values: { cutPosition: 7.5 } },
    { label: 'Apse', values: { cutPosition: 7.5 } },
  ],
}

