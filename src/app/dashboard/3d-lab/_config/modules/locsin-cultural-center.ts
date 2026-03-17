// src/app/dashboard/3d-lab/_config/modules/locsin-cultural-center.ts
import type { CutawaySectionConfig } from '../../_types/templates'

export const locsinCulturalCenterConfig: CutawaySectionConfig = {
  id: 'locsin-cultural-center',
  title: 'Locsin — Cultural Center of the Philippines',
  description:
    'Leandro Locsin\'s Cultural Center of the Philippines (1969) — brutalist board-formed concrete, massive cantilevers, and floating platform aesthetic.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4, 5], fov: 42 },
  layers: [
    {
      id: 'podium-slab',
      label: 'Elevated Podium / Platform',
      material: 'Board-Formed Concrete',
      description: 'Elevated concrete podium — raises the building above grade, creating a floating platform. Locsin\'s signature "floating volume" aesthetic rooted in Nipa hut stilts.',
      depth: 0,
      geometry: { id: 'geo-pod', type: 'box', args: [6, 0.8, 2.5], position: [0, 2.0, 0], color: '#9ca3af' },
    },
    {
      id: 'concrete-column',
      label: 'Tapered RC Columns',
      material: 'Board-Formed Concrete',
      description: 'Tapered reinforced concrete columns supporting the podium — board-formed texture exposes grain of timber formwork. Columns narrower at base (visual floating effect).',
      depth: 0.2,
      geometry: { id: 'geo-col', type: 'cylinder', args: [0.4, 0.6, 2.0, 8], position: [-2.0, 1.0, 0], color: '#6b7280' },
    },
    {
      id: 'shear-wall-core',
      label: 'RC Shear Wall Core',
      material: 'Reinforced Concrete',
      description: 'Central reinforced concrete shear wall core — provides lateral stability (seismic and wind). Houses vertical circulation and services.',
      depth: 0.35,
      geometry: { id: 'geo-core', type: 'box', args: [0.5, 6.0, 2.5], position: [0, 5.5, 0], color: '#9ca3af' },
    },
    {
      id: 'cantilever-slab',
      label: 'Massive Cantilever',
      material: 'Post-tensioned RC',
      description: 'Dramatic cantilevered floor plate extending 15–20m from core — made possible by post-tensioned concrete. Creates the characteristic overhang shadow effect.',
      depth: 0.5,
      geometry: { id: 'geo-cant', type: 'box', args: [4.0, 0.6, 2.5], position: [2.5, 5.0, 0], color: '#6b7280' },
    },
    {
      id: 'concrete-facade',
      label: 'Board-Formed Concrete Facade',
      material: 'Exposed Board-Formed Concrete',
      description: 'Exposed concrete facade with board-formed texture — Brutalist honesty of materials. No cladding, paint, or applied decoration.',
      depth: 0.65,
      geometry: { id: 'geo-face', type: 'box', args: [0.3, 6.0, 2.5], position: [-3.0, 5.5, 0], color: '#9ca3af' },
    },
    {
      id: 'theater-volume',
      label: 'Theater / Performance Volume',
      material: 'Concrete Shell with Acoustic Lining',
      description: 'Main theater volume — concrete exterior shell with acoustic panel interior lining. Fly tower above stage area.',
      depth: 0.8,
      geometry: { id: 'geo-theater', type: 'box', args: [3.0, 5.0, 2.5], position: [-1.0, 5.5, 0], color: '#78716c', opacity: 0.7, transparent: true },
    },
    {
      id: 'recessed-base',
      label: 'Recessed Ground Level',
      material: 'Concrete / Landscape',
      description: 'Ground level deliberately recessed under podium — creates deep shadow and reinforces the floating appearance. Service and parking below.',
      depth: 0.9,
      geometry: { id: 'geo-recessed', type: 'box', args: [6, 2.0, 2.5], position: [0, 1.0, 0], color: '#374151', opacity: 0.4, transparent: true },
    },
  ],
  annotations: [
    {
      id: 'ann-floating',
      label: '"Floating Volume" Concept',
      description: 'Locsin\'s design philosophy: massive volumes seemingly floating on minimal supports — aesthetic rooted in Philippine Nipa hut on stilts, expressed in concrete.',
      position: () => [3.0, 5.5, 0.8],
    },
    {
      id: 'ann-brutalism',
      label: 'Philippine Brutalism',
      description: 'CCP represents Philippine Brutalism: board-formed concrete, exposed services, structural honesty. Locsin also designed the PhilAm Life Building, Insular Life, and PICC.',
      position: () => [-4.0, 5.5, 0.8],
    },
    {
      id: 'ann-cantilever',
      label: 'Post-Tensioned Cantilevers',
      description: 'Cantilevered floors use post-tensioned concrete — prestress cables threaded through slabs after casting, tensioned to resist sagging. Enables dramatic overhangs.',
      position: () => [4.5, 4.5, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 4.0 } },
    { label: 'Podium Level', values: { cutPosition: 2.0 } },
    { label: 'Cantilever', values: { cutPosition: 5.0 } },
    { label: 'Column Base', values: { cutPosition: 1.0 } },
  ],
}
