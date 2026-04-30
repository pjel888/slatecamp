// src/features/3d-lab/config/modules/earthquake-baroque-church.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const earthquakeBaroqueChurchConfig: CutawaySectionConfig = {
  id: 'earthquake-baroque-church',
  title: 'Earthquake Baroque Church',
  description:
    'Philippine Earthquake Baroque: massive buttresses, lower proportions, thick walls, and heavy façade adapted for seismic resistance in the 17th–18th centuries.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4, 5], fov: 42 },
  layers: [
    {
      id: 'foundation',
      label: 'Coral Stone Foundation',
      material: 'Coral Stone / Rubble Masonry',
      description: 'Deep coral stone foundation — wide footprint to resist overturning from seismic and typhoon loads. Philippine church foundations often 2–4m deep.',
      depth: 0,
      geometry: { id: 'geo-fnd', type: 'box', args: [5, 0.8, 2.0], position: [0, 0.4, 0], color: '#d4a853' },
    },
    {
      id: 'massive-wall',
      label: 'Thick Nave Wall (1.5–2m)',
      material: 'Coral Stone / Brick / Rubble',
      description: 'Nave walls 1.5–2m thick — much thicker than European Baroque equivalents. Mass provides seismic inertia and resistance to lateral forces.',
      depth: 0.2,
      geometry: { id: 'geo-mwall', type: 'box', args: [1.8, 7.0, 2.0], position: [-2.6, 4.5, 0], color: '#c4913f' },
    },
    {
      id: 'buttress',
      label: 'Massive External Buttress',
      material: 'Coral Stone / Brick',
      description: 'Massive external buttresses every 3–5m along nave walls — much larger than required for vault thrust alone. Provides additional seismic resistance and overturning resistance.',
      depth: 0.35,
      geometry: { id: 'geo-butt', type: 'box', args: [1.5, 7.0, 1.5], position: [-4.1, 4.5, 0], color: '#b8842e' },
    },
    {
      id: 'vault-low',
      label: 'Lower Vault / Barrel Roof',
      material: 'Brick Barrel Vault',
      description: 'Lower and wider barrel vault compared to European counterparts — lower center of gravity improves seismic stability.',
      depth: 0.5,
      geometry: { id: 'geo-vault', type: 'cylinder', args: [2.0, 2.0, 2.0, 20, 1, 1, 0, Math.PI], position: [0, 8.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#c0b090', opacity: 0.8, transparent: true },
    },
    {
      id: 'bell-tower-separate',
      label: 'Separate Bell Tower',
      material: 'Coral Stone',
      description: 'Bell tower often built separate from church nave — reduces seismic coupling. If attached, minimal wall connection allows independent movement.',
      depth: 0.65,
      geometry: { id: 'geo-tower', type: 'box', args: [1.2, 8.0, 1.2], position: [3.0, 4.0, 0], color: '#d4a853' },
    },
    {
      id: 'facade-ornament',
      label: 'Baroque Façade Ornament',
      material: 'Coral Stone / Stucco',
      description: 'Baroque ornamental façade — twisted columns, shell niches, saints\' statues — Spanish Baroque vocabulary adapted with local coral stone.',
      depth: 0.8,
      geometry: { id: 'geo-facade', type: 'box', args: [0.3, 8.0, 2.0], position: [-1.8, 5.0, 1.1], color: '#f0e0c0' },
    },
    {
      id: 'choir-loft',
      label: 'Stone Choir Loft',
      material: 'Coral Stone Gallery',
      description: 'Heavy stone choir loft at west end — in seismically adapted churches, kept low and robustly connected to walls rather than cantilevered.',
      depth: 0.95,
      geometry: { id: 'geo-choir', type: 'box', args: [3.5, 0.2, 2.0], position: [0, 2.5, 0], color: '#d4c090' },
    },
  ],
  annotations: [
    {
      id: 'ann-buttress',
      label: 'Massive Buttresses — Seismic Adaptation',
      description: 'Philippine Baroque buttresses far exceed what vault thrust demands — deliberate seismic design strategy by Spanish Augustinian, Dominican, and Franciscan friars.',
      position: () => [-5.0, 4.5, 0.8],
    },
    {
      id: 'ann-proportion',
      label: 'Lower Proportions',
      description: 'Philippine Baroque churches are squat compared to Spanish originals — lower height reduces overturning moment. Wide nave and low vault are characteristic.',
      position: () => [2.0, 8.5, 0.8],
    },
    {
      id: 'ann-tower',
      label: 'Detached Bell Tower',
      description: 'Detached or minimally connected bell towers — seismic isolation prevents tower collapse from triggering nave failure. San Agustin (Paoay) has massive engaged buttresses.',
      position: () => [4.0, 4.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 4.5 } },
    { label: 'Foundation', values: { cutPosition: 0.5 } },
    { label: 'Buttress Level', values: { cutPosition: 4.0 } },
    { label: 'Vault & Tower', values: { cutPosition: 8.0 } },
  ],
}

