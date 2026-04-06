// src/app/dashboard/3d-lab/_config/modules/hagia-sophia-section.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const hagiaSophiaSectionConfig: CutawaySectionConfig = {
  id: 'hagia-sophia-section',
  title: 'Hagia Sophia Section',
  description:
    'Hagia Sophia (532–537 CE) — 32m dome at 55m height, 40 clerestory windows in drum, pendentives, half-domes absorbing thrust.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5.5, 4.5, 5.5], fov: 42 },
  layers: [
    {
      id: 'massive-piers',
      label: 'Four Massive Piers',
      material: 'Brick and Stone Masonry',
      description: 'Four enormous piers (7m × 7m at base) support the pendentives, dome, and half-dome system. Added massive exterior buttress piers by later Ottoman additions.',
      depth: 0,
      geometry: { id: 'geo-pier', type: 'box', args: [1.0, 5.0, 1.0], position: [-2.5, 2.5, -2.5], color: '#b0b0b0' },
    },
    {
      id: 'main-arches',
      label: 'Four Main Arches',
      material: 'Brick Arch',
      description: 'Four great arches spanning 32m between piers — carry pendentive edges and upper structure. Arches slightly pointed for structural efficiency.',
      depth: 0.2,
      geometry: { id: 'geo-mach', type: 'ring', args: [2.5, 3.0, 24], position: [0, 6.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#c4913f' },
    },
    {
      id: 'pendentive',
      label: 'Pendentives (4 Corners)',
      material: 'Thin Brick Shell',
      description: 'Four spherical triangular pendentives transition the square bay to the circular drum. Inscribed with large seraphim medallions in the Ottoman period.',
      depth: 0.35,
      geometry: { id: 'geo-pend', type: 'sphere', args: [3.0, 20, 20, 0, Math.PI / 2, 0, Math.PI / 4], position: [-2.5, 5.8, -2.5], color: '#d4a853', opacity: 0.7, transparent: true },
    },
    {
      id: 'dome-drum',
      label: 'Dome Drum with 40 Windows',
      material: 'Brick Drum, 40 Windows',
      description: 'Low drum with 40 arched windows — creates a ring of light at dome base. Dome appears to float on light. 32m diameter.',
      depth: 0.5,
      geometry: { id: 'geo-drum', type: 'cylinder', args: [2.3, 2.3, 0.5, 24, 1, 1], position: [0, 8.5, 0], color: '#9ca3af' },
    },
    {
      id: 'main-dome',
      label: 'Main Dome (32m)',
      material: 'Thin Brick — Lightweight',
      description: 'Shallow dome 32m diameter at 55m height — flatter than hemisphere, more efficient in compression. Lightweight brick from Rhodes for upper dome.',
      depth: 0.65,
      geometry: { id: 'geo-dome', type: 'sphere', args: [2.3, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2.5], position: [0, 8.75, 0], color: '#c4913f' },
    },
    {
      id: 'half-dome-east',
      label: 'Eastern Half-Dome',
      material: 'Brick Half-Dome',
      description: 'Eastern half-dome absorbs main dome thrust along the longitudinal axis — cascading structural system unique to Hagia Sophia.',
      depth: 0.8,
      geometry: { id: 'geo-hd', type: 'sphere', args: [2.0, 20, 20, 0, Math.PI, 0, Math.PI / 2], position: [2.2, 6.5, 0], rotation: [0, -Math.PI / 2, 0], color: '#b8842e', opacity: 0.8, transparent: true },
    },
    {
      id: 'interior-marble',
      label: 'Polychrome Marble Revetment',
      material: 'Matched Marble Slabs',
      description: 'Lower walls lined with matched book-matched marble slabs — patterns appear as large butterfly wings. Upper surfaces covered in gold mosaic.',
      depth: 0.95,
      geometry: { id: 'geo-marble', type: 'box', args: [0.03, 4.5, 8.0], position: [-3.4, 3.5, 0], color: '#fdf6e3' },
    },
  ],
  annotations: [
    {
      id: 'ann-float',
      label: '"Dome Floating on Light"',
      description: 'Procopius of Caesarea (537 CE): "suspended from heaven by a golden chain." 40 windows create continuous ring of light at dome base — pendentives disappear.',
      position: () => [2.5, 10.0, 0.8],
    },
    {
      id: 'ann-cascade',
      label: 'Cascading Half-Dome System',
      description: 'Unique structural system: dome → pendentives → half-domes east and west → smaller exedra → buttress piers. Longitudinal thrust absorbed by half-domes.',
      position: () => [3.5, 6.5, 0.8],
    },
    {
      id: 'ann-repair',
      label: 'Repeated Dome Repairs',
      description: 'Dome collapsed in 558 CE (earthquake) — rebuilt with higher profile. Cracked again 989, 1346. Modern buttresses and tie rods added to arrest deformation.',
      position: () => [-3.5, 9.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 6.0 } },
    { label: 'Pier Level', values: { cutPosition: 2.5 } },
    { label: 'Pendentive Zone', values: { cutPosition: 6.0 } },
    { label: 'Dome & Windows', values: { cutPosition: 8.8 } },
  ],
}

