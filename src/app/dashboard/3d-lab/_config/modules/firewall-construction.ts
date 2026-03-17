// src/app/dashboard/3d-lab/_config/modules/firewall-construction.ts
import type { CutawaySectionConfig } from '../../_types/templates'

export const firewallConstructionConfig: CutawaySectionConfig = {
  id: 'firewall-construction',
  title: 'Firewall Construction',
  description:
    'Firewall section per PD 1096: 2-hour fire-resistive construction, projects 400mm above roof, built on property line, no openings permitted.',
  subject: 'pd-1096',
  cutAxis: 'y',
  camera: { position: [3.5, 3.5, 3.5], fov: 40 },
  layers: [
    {
      id: 'footing',
      label: 'Reinforced Footing',
      material: 'RC Footing',
      description: 'Continuous RC footing supporting the firewall. Must be structurally independent from both buildings.',
      depth: 0,
      geometry: { id: 'geo-ftg', type: 'box', args: [0.6, 0.5, 1.0], position: [0, -0.25, 0], color: '#b0b0b0' },
    },
    {
      id: 'chb-wall',
      label: 'CHB Wall (200mm)',
      material: 'CHB 200mm Solid Grouted',
      description: '200mm solid grouted CHB — achieves 2-hour fire-resistance rating. No openings, chases, or penetrations.',
      codeCitation: 'PD 1096 Rule VII §708',
      depth: 0.2,
      geometry: { id: 'geo-chb', type: 'box', args: [0.2, 4.0, 1.0], position: [0, 2.15, 0], color: '#d6d3d1' },
    },
    {
      id: 'plaster-fire',
      label: 'Fire-Rated Plaster (Both Sides)',
      material: 'Gypsum-Portland Plaster 20mm',
      description: '20mm gypsum-portland plaster each side contributes to fire rating and moisture protection.',
      depth: 0.4,
      geometry: { id: 'geo-plaster', type: 'box', args: [0.04, 4.0, 1.0], position: [0.12, 2.15, 0], color: '#e5e7eb' },
    },
    {
      id: 'roof-structure',
      label: 'Roof Structure (Adjacent)',
      material: 'RC Roof Slab',
      description: 'Roof slab of building. Firewall must project 400mm above the highest point of the adjacent roof.',
      depth: 0.6,
      geometry: { id: 'geo-roof', type: 'box', args: [2.0, 0.15, 1.0], position: [-1.1, 3.225, 0], color: '#b0b0b0' },
    },
    {
      id: 'parapet-projection',
      label: 'Parapet Projection (400mm min)',
      material: 'CHB / RC Parapet',
      description: 'Firewall projects minimum 400mm above the highest roof surface. This parapet prevents fire spread over the top of the wall.',
      codeCitation: 'PD 1096 Rule VII §708',
      depth: 0.8,
      geometry: { id: 'geo-parapet', type: 'box', args: [0.2, 0.4, 1.0], position: [0, 3.5, 0], color: '#c0c0c0' },
    },
    {
      id: 'property-line',
      label: 'Property Line',
      material: 'Reference Line',
      description: 'Firewall is built exactly on the property line — wall centerline aligns with property boundary.',
      depth: 1.0,
      geometry: { id: 'geo-pl', type: 'box', args: [0.005, 5.0, 1.0], position: [0, 1.5, 0], color: '#dc2626' },
    },
  ],
  annotations: [
    {
      id: 'ann-400',
      label: '400mm Parapet Above Roof',
      description: 'Firewall must extend at least 400mm above the highest point of the roof on either side to prevent fire from leaping over the wall.',
      codeCitation: 'PD 1096 Rule VII §708',
      position: () => [0.8, 3.8, 0.6],
    },
    {
      id: 'ann-2hr',
      label: '2-Hour Fire Resistance',
      description: 'Firewall must achieve minimum 2-hour fire-resistance rating. Solid grouted 200mm CHB or equivalent satisfies this requirement.',
      codeCitation: 'PD 1096 Rule VII §708',
      position: () => [0.8, 2.0, 0.6],
    },
    {
      id: 'ann-noopen',
      label: 'No Openings Permitted',
      description: 'Firewalls on property lines may have no openings whatsoever — no doors, windows, pipes, or ducts.',
      codeCitation: 'PD 1096 Rule VII §709',
      position: () => [-1.5, 2.0, 0.6],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 2.0 } },
    { label: 'Footing', values: { cutPosition: 0.0 } },
    { label: 'Wall Body', values: { cutPosition: 2.0 } },
    { label: 'Parapet Zone', values: { cutPosition: 3.6 } },
  ],
}
