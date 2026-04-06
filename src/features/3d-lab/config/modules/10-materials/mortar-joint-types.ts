// src/app/dashboard/3d-lab/_config/modules/mortar-joint-types.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const mortarJointTypesConfig: CutawaySectionConfig = {
  id: 'mortar-joint-types',
  title: 'Mortar Joint Types',
  description:
    'Masonry mortar joint profile cross-sections — concave, V-joint, flush, raked, and struck joints showing tooling method and water resistance.',
  subject: 'materials',
  cutAxis: 'y',
  camera: { position: [5, 2, 5], fov: 40 },
  layers: [
    {
      id: 'masonry-units',
      label: 'Masonry Units (CHB / Brick)',
      material: 'Concrete Hollow Block / Fired Brick',
      description: 'Masonry units — CHB or fired clay brick. Joints visible between units.',
      depth: 0,
      geometry: { id: 'geo-units', type: 'box', args: [5, 2.0, 0.2], position: [0, 1.0, 0], color: '#d6d3d1' },
    },
    {
      id: 'concave-joint',
      label: 'Concave Joint (Best for Weather)',
      material: 'Tooled Mortar — Jointer',
      description: 'Concave (rodded) joint — most weather-resistant. Mortar pressed into joint by curved jointer, compacts surface and seals voids. Recommended for exterior.',
      depth: 0.15,
      geometry: { id: 'geo-conc', type: 'cylinder', args: [0.006, 0.006, 0.2, 8], position: [-1.8, 1.0, 0.1], rotation: [0, 0, Math.PI / 2], color: '#9ca3af' },
    },
    {
      id: 'v-joint',
      label: 'V-Joint',
      material: 'Tooled Mortar — V-Jointer',
      description: 'V-shaped joint tooled with V-jointer — good weather resistance. Creates sharp shadow line, distinctive appearance. Slightly less weather resistant than concave.',
      depth: 0.3,
      geometry: { id: 'geo-vj', type: 'box', args: [0.012, 0.012, 0.2], position: [-0.9, 1.0, 0.1], color: '#9ca3af' },
    },
    {
      id: 'flush-joint',
      label: 'Flush Joint',
      material: 'Struck Flush with Trowel',
      description: 'Flush joint — mortar cut flush with masonry face. Minimal shadow line. Moderate weather resistance. Common as base for paint or plaster.',
      depth: 0.45,
      geometry: { id: 'geo-flush', type: 'box', args: [0.01, 0.01, 0.2], position: [0, 1.0, 0.1], color: '#a8a29e' },
    },
    {
      id: 'raked-joint',
      label: 'Raked Joint',
      material: 'Raked with Skid / Skrew',
      description: 'Raked joint — mortar removed 6–10mm from face. Creates strong shadow line, dramatic texture. Least weather resistant — allows water to pond. Interior use only.',
      depth: 0.6,
      geometry: { id: 'geo-raked', type: 'box', args: [0.01, 0.01, 0.2], position: [0.9, 0.93, 0.1], color: '#78716c' },
    },
    {
      id: 'struck-joint',
      label: 'Struck Joint',
      material: 'Troweled at Angle',
      description: 'Struck joint — top of joint flush, bottom undercut at angle. Moderate weather resistance. Creates directional shadow effect. Quick to produce.',
      depth: 0.75,
      geometry: { id: 'geo-struck', type: 'box', args: [0.01, 0.01, 0.2], position: [1.8, 1.0, 0.1], rotation: [Math.PI / 12, 0, 0], color: '#a8a29e' },
    },
    {
      id: 'joint-mortar',
      label: 'Mortar Mix (Type S / N)',
      material: 'Portland Cement + Lime + Sand',
      description: 'Type S mortar (1:½:4½ PC:Lime:Sand) — high strength, weather resistant. Type N (1:1:6) — general purpose. Type O (1:2:9) — interior non-loadbearing only.',
      depth: 0.9,
      geometry: { id: 'geo-mortar', type: 'box', args: [5, 0.01, 0.2], position: [0, 0.5, 0.1], color: '#d4c090' },
    },
  ],
  annotations: [
    {
      id: 'ann-weather',
      label: 'Weather Resistance Ranking',
      description: 'Best to worst weather resistance: Concave > V-joint > Flush > Struck > Raked. Raked joints not recommended for Philippine exterior walls — traps rain, accelerates deterioration.',
      position: () => [-2.5, 2.5, 0.3],
    },
    {
      id: 'ann-type',
      label: 'Mortar Types: S, N, O',
      description: 'Type S: PC:Lime:Sand = 1:½:4½. High strength, exterior and below-grade. Type N: 1:1:6, general exterior. Type O: 1:2:9, interior non-load-bearing only.',
      position: () => [2.5, 2.5, 0.3],
    },
    {
      id: 'ann-tooling',
      label: 'Tooling Compacts Mortar',
      description: 'Tooled joints (concave, V) compact mortar surface — reduces porosity and voids, improves bond at masonry interface. Flush cut joints do not achieve this compression.',
      position: () => [-2.5, 0.5, 0.3],
    },
  ],
  presets: [
    { label: 'All Joints', values: { cutPosition: 1.0 } },
    { label: 'Best (Concave)', values: { cutPosition: 1.0 } },
    { label: 'Raked (Avoid Exterior)', values: { cutPosition: 0.9 } },
    { label: 'Mortar Mix Detail', values: { cutPosition: 0.5 } },
  ],
}

