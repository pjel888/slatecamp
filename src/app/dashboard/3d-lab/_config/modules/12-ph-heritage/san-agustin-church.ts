// src/app/dashboard/3d-lab/_config/modules/san-agustin-church.ts
import type { CutawaySectionConfig } from '../../../_types/templates'

export const sanAgustinChurchConfig: CutawaySectionConfig = {
  id: 'san-agustin-church',
  title: 'San Agustin Church',
  description:
    'San Agustin Church, Manila (completed 1607) — oldest stone church in Philippines, UNESCO World Heritage, single-nave Baroque with buttresses and barrel vault.',
  subject: 'history',
  cutAxis: 'y',
  camera: { position: [5, 4.5, 5], fov: 42 },
  layers: [
    {
      id: 'coral-foundation',
      label: 'Coral Stone Foundation',
      material: 'Coral Stone / Rubble',
      description: 'Deep coral stone and rubble foundation — third church on the site (1571 bamboo, 1583 timber, 1607 stone). Foundation designed after first two buildings burned.',
      depth: 0,
      geometry: { id: 'geo-cfnd', type: 'box', args: [5, 1.0, 2.0], position: [0, 0.5, 0], color: '#d4a853' },
    },
    {
      id: 'single-nave-wall',
      label: 'Single Nave Masonry Wall',
      material: 'Volcanic Adobe / Coral Stone',
      description: 'Single-nave plan — no side aisles. Walls 1.5m thick volcanic adobe (adobe de Guadalupe) and coral stone. Survived multiple earthquakes due to mass.',
      depth: 0.2,
      geometry: { id: 'geo-nwall', type: 'box', args: [1.5, 8.0, 2.0], position: [-2.75, 4.5, 0], color: '#c4913f' },
    },
    {
      id: 'massive-buttress',
      label: 'Massive Engaged Buttress',
      material: 'Adobe Stone',
      description: 'Massive Baroque buttresses engaged with nave walls — larger than European counterparts due to Philippine seismic risk. Buttresses become an aesthetic feature.',
      depth: 0.35,
      geometry: { id: 'geo-mbut', type: 'box', args: [1.8, 8.0, 1.5], position: [-4.5, 4.5, 0], color: '#b8842e' },
    },
    {
      id: 'barrel-vault-stone',
      label: 'Brick Barrel Vault',
      material: 'Brick — Filipino Artisans',
      description: 'Brick barrel vault built by Chinese and Filipino craftsmen — construction supervised by Augustinian friars. Vault shows local craftsmanship with occasional irregular courses.',
      depth: 0.5,
      geometry: { id: 'geo-bvs', type: 'cylinder', args: [1.8, 1.8, 2.0, 20, 1, 1, 0, Math.PI], position: [0, 8.8, 0], rotation: [Math.PI / 2, 0, 0], color: '#c09060', opacity: 0.8, transparent: true },
    },
    {
      id: 'baroque-facade',
      label: 'Baroque Carved Stone Facade',
      material: 'Adobe with Carved Stucco',
      description: 'Baroque facade with carved adobe stone — two-tower facade (one octagonal, one never completed). The current facade dates to 1614 completion.',
      depth: 0.65,
      geometry: { id: 'geo-bface', type: 'box', args: [0.5, 10.0, 2.0], position: [-2.0, 6.0, 1.2], color: '#d4c4a0' },
    },
    {
      id: 'trompe-loeil-ceiling',
      label: 'Trompe l\'Oeil Painted Ceiling',
      material: 'Painted Plaster',
      description: 'Restored trompe l\'oeil painted ceiling — false architectural perspective creates illusion of greater height. 18th c. Baroque decorative painting tradition.',
      depth: 0.8,
      geometry: { id: 'geo-ceil', type: 'box', args: [3.5, 0.05, 2.0], position: [0, 8.65, 0], color: '#fef9c3' },
    },
    {
      id: 'choir-loft-stone',
      label: 'Stone Choir Loft (Rear)',
      material: 'Adobe Stone',
      description: 'Massive stone choir loft at west end above main entrance — heavy stone construction, well-integrated into thick rear wall.',
      depth: 0.9,
      geometry: { id: 'geo-choir', type: 'box', args: [3.5, 0.3, 2.0], position: [0, 3.5, 0], color: '#c4a878' },
    },
  ],
  annotations: [
    {
      id: 'ann-oldest',
      label: 'Oldest Stone Church in Philippines',
      description: 'Completed 1607 — the oldest stone church in the Philippines. Part of the Baroque Churches of the Philippines UNESCO World Heritage Site (1993), along with Paoay, Santa Maria, and Miag-ao.',
      position: () => [3.0, 8.5, 0.8],
    },
    {
      id: 'ann-resilient',
      label: 'Survived All Earthquakes & Wars',
      description: 'Survived the 1645, 1863, and 1880 earthquakes, plus WWII bombing. Thick walls and massive buttresses credited. Used as refuge after 1945 Battle of Manila.',
      position: () => [-4.5, 8.5, 0.8],
    },
    {
      id: 'ann-artisans',
      label: 'Chinese & Filipino Craftsmen',
      description: 'Built by Chinese (Sangley) and Filipino artisans under Augustinian supervision. Explains unique hybrid details — local volcanic stone, Chinese tile patterns in floor.',
      position: () => [-4.5, 4.0, 0.8],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 5.0 } },
    { label: 'Foundation', values: { cutPosition: 0.5 } },
    { label: 'Nave Level', values: { cutPosition: 4.0 } },
    { label: 'Vault & Ceiling', values: { cutPosition: 8.7 } },
  ],
}
