// src/app/dashboard/3d-lab/_config/modules/stairwell-enclosure.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const stairwellEnclosureConfig: CutawaySectionConfig = {
  id: 'stairwell-enclosure',
  title: 'Stairwell Enclosure',
  description:
    'Fire-rated stairwell enclosure per RA 9514: 1-hour rating for 3 storeys or less, 2-hour rating for 4 or more storeys. Section shows wall assembly, fire door, and pressurization.',
  subject: 'ra-9514',
  cutAxis: 'y',
  camera: { position: [4, 3.5, 4], fov: 42 },
  layers: [
    {
      id: 'stair-floor',
      label: 'Stair Landing / Floor',
      material: 'RC Slab with Non-Slip Finish',
      description: 'Stair landing slab — non-slip finish required. Continues as stair flight above.',
      depth: 0,
      geometry: { id: 'geo-landing', type: 'box', args: [2.0, 0.15, 1.2], position: [0, 0.075, 0], color: '#b0b0b0' },
    },
    {
      id: 'stair-flight',
      label: 'Stair Flight (RC)',
      material: 'RC Stair with Non-Slip Treads',
      description: 'Reinforced concrete stair flight. Tread minimum 280mm, riser maximum 180mm per PD 1096.',
      depth: 0.15,
      geometry: { id: 'geo-stair', type: 'box', args: [1.2, 1.5, 1.0], position: [0.4, 0.9, 0], rotation: [0, 0, -0.3], color: '#9ca3af' },
    },
    {
      id: 'enclosure-wall-1hr',
      label: 'Enclosure Wall (1-hour rated)',
      material: 'CMU 150mm or RC 100mm',
      description: '1-hour fire-resistive enclosure for stairs in buildings ≤3 storeys. 150mm CMU or 100mm RC achieves 1-hour rating.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.1',
      depth: 0.4,
      geometry: { id: 'geo-wall1', type: 'box', args: [0.15, 4.0, 1.2], position: [-1.075, 2.15, 0], color: '#d6d3d1' },
    },
    {
      id: 'enclosure-wall-2hr',
      label: 'Enclosure Wall (2-hour rated)',
      material: 'CMU 200mm Solid Grouted',
      description: '2-hour fire-resistive enclosure for stairs in buildings ≥4 storeys. 200mm solid grouted CMU achieves 2-hour rating.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.2',
      depth: 0.55,
      geometry: { id: 'geo-wall2', type: 'box', args: [0.15, 4.0, 1.2], position: [1.075, 2.15, 0], color: '#b0b0b0' },
    },
    {
      id: 'fire-door',
      label: 'Stairwell Fire Door',
      material: 'Steel Fire Door — 20-min min',
      description: 'Minimum 20-minute rated fire door at stairwell entry, self-closing and positive-latching. Swing direction: out from stairwell.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.3',
      depth: 0.7,
      geometry: { id: 'geo-fdoor', type: 'box', args: [0.04, 2.1, 0.9], position: [-0.98, 1.2, 0], color: '#78716c' },
    },
    {
      id: 'pressurization-duct',
      label: 'Stair Pressurization Duct',
      material: 'Sheet Metal Duct',
      description: 'Stair pressurization system duct for high-rise buildings — maintains positive pressure to prevent smoke entry during evacuation.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.5',
      depth: 0.85,
      geometry: { id: 'geo-duct', type: 'box', args: [0.3, 0.3, 0.3], position: [0, 3.8, 0], color: '#64748b' },
    },
  ],
  annotations: [
    {
      id: 'ann-1hr',
      label: '1-hour: ≤3 Storeys',
      description: 'Buildings 3 storeys or fewer: stairwell enclosure must achieve minimum 1-hour fire-resistance rating.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.1',
      position: () => [-2.0, 2.0, 0.7],
    },
    {
      id: 'ann-2hr',
      label: '2-hour: 4+ Storeys',
      description: 'Buildings 4 storeys or more: stairwell enclosure must achieve minimum 2-hour fire-resistance rating. High-rise requires pressurization.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.2',
      position: () => [2.0, 2.0, 0.7],
    },
    {
      id: 'ann-door',
      label: 'Self-Closing Fire Door',
      description: 'Stairwell doors must be self-closing, positive-latching, rated at minimum 20-min. Swing in the direction of egress travel.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.2.7.3',
      position: () => [-1.5, 1.0, 0.7],
    },
  ],
  presets: [
    { label: 'Full Enclosure', values: { cutPosition: 2.5 } },
    { label: 'Door Level', values: { cutPosition: 1.2 } },
    { label: 'Mid-Height', values: { cutPosition: 2.5 } },
    { label: 'Top / Pressurization', values: { cutPosition: 3.8 } },
  ],
}

