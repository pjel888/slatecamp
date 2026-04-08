// src/app/dashboard/3d-lab/_config/modules/mezzanine-clearances.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'
import { PD_1096 } from '@/features/3d-lab/config/constants'

export const mezzanineClearancesConfig: CutawaySectionConfig = {
  id: 'mezzanine-clearances',
  title: 'Mezzanine Clearances',
  description:
    'Building section showing mezzanine with required 1.80m minimum clear height above and below per PD 1096. Mezzanine cannot exceed 1/3 of floor area below.',
  subject: 'pd-1096',
  cutAxis: 'y',
  camera: { position: [4, 3, 4], fov: 42 },
  layers: [
    {
      id: 'ground-floor-slab',
      label: 'Ground Floor Slab',
      material: 'RC Slab 150mm',
      description: 'Ground floor concrete slab — base reference level.',
      depth: 0,
      geometry: { id: 'geo-gfslab', type: 'box', args: [4, 0.15, 0.8], position: [0, 0.075, 0], color: '#b0b0b0' },
    },
    {
      id: 'lower-space',
      label: 'Lower Space (min 1.80m clear)',
      material: 'Occupied Space',
      description: 'Space below mezzanine — minimum 1.80m clear height required by PD 1096 Rule VIII.',
      codeCitation: 'PD 1096 Rule VIII §805',
      depth: 0.15,
      geometry: { id: 'geo-lower', type: 'box', args: [4, PD_1096.CEILING_HEIGHT.mezzanine, 0.8], position: [0, 1.05, 0], color: '#dbeafe', opacity: 0.3, transparent: true }, // 1.8 m
    },
    {
      id: 'mezzanine-slab',
      label: 'Mezzanine Floor Slab',
      material: 'RC Slab 120mm',
      description: '120mm RC mezzanine floor slab. Cannot exceed 1/3 of the floor area below.',
      codeCitation: 'PD 1096 Rule VIII §805',
      depth: 0.4,
      geometry: { id: 'geo-mzslab', type: 'box', args: [1.5, 0.12, 0.8], position: [1.0, 1.96, 0], color: '#b0b0b0' },
    },
    {
      id: 'upper-space',
      label: 'Upper Space (min 1.80m clear)',
      material: 'Occupied Space',
      description: 'Space above mezzanine floor — also requires minimum 1.80m clear height to ceiling/underside of structure above.',
      codeCitation: 'PD 1096 Rule VIII §805',
      depth: 0.5,
      geometry: { id: 'geo-upper', type: 'box', args: [1.5, PD_1096.CEILING_HEIGHT.mezzanine, 0.8], position: [1.0, 2.96, 0], color: '#dcfce7', opacity: 0.3, transparent: true }, // 1.8 m
    },
    {
      id: 'ceiling-slab',
      label: 'Ceiling / Roof Slab',
      material: 'RC Slab 150mm',
      description: 'Upper floor or roof slab. Bottom of slab marks the ceiling height limit.',
      depth: 0.7,
      geometry: { id: 'geo-ceil', type: 'box', args: [4, 0.15, 0.8], position: [0, 3.835, 0], color: '#b0b0b0' },
    },
    {
      id: 'dimension-lower',
      label: 'Clear Height Indicator (Lower)',
      material: 'Dimension Reference',
      description: 'Visual indicator of 1.80m minimum clear height below mezzanine.',
      depth: 0.8,
      geometry: { id: 'geo-diml', type: 'box', args: [0.005, PD_1096.CEILING_HEIGHT.mezzanine, 0.005], position: [-1.8, 1.05, 0.35], color: '#D64545' }, // 1.8 m
    },
    {
      id: 'dimension-upper',
      label: 'Clear Height Indicator (Upper)',
      material: 'Dimension Reference',
      description: 'Visual indicator of 1.80m minimum clear height above mezzanine.',
      depth: 0.9,
      geometry: { id: 'geo-dimu', type: 'box', args: [0.005, PD_1096.CEILING_HEIGHT.mezzanine, 0.005], position: [2.0, 2.96, 0.35], color: '#2D9F6F' }, // 1.8 m
    },
  ],
  annotations: [
    {
      id: 'ann-lower',
      label: 'Below Mezzanine: min 1.80m',
      description: 'Minimum 1.80m clear height required below mezzanine slab to finished floor. This ensures occupiable space beneath.',
      codeCitation: 'PD 1096 Rule VIII §805',
      position: () => [-2.2, 1.05, 0.5],
    },
    {
      id: 'ann-upper',
      label: 'Above Mezzanine: min 1.80m',
      description: 'Minimum 1.80m clear height required above mezzanine floor to underside of ceiling above. Both spaces must meet this requirement.',
      codeCitation: 'PD 1096 Rule VIII §805',
      position: () => [2.2, 2.96, 0.5],
    },
    {
      id: 'ann-area',
      label: 'Mezzanine Area Limit (1/3)',
      description: 'Mezzanine floor area cannot exceed one-third (1/3) of the floor area of the room or space in which it is located.',
      codeCitation: 'PD 1096 Rule VIII §805',
      position: () => [0.5, 4.0, 0.5],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 2.5 } },
    { label: 'Lower Clearance', values: { cutPosition: 1.0 } },
    { label: 'Mezzanine Level', values: { cutPosition: 2.0 } },
    { label: 'Upper Clearance', values: { cutPosition: 3.0 } },
  ],
}

