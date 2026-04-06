// src/app/dashboard/3d-lab/_config/modules/fire-suppression-overview.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const fireSuppressionOverviewConfig: CutawaySectionConfig = {
  id: 'fire-suppression-overview',
  title: 'Fire Suppression Overview',
  description:
    'Building section with automatic sprinkler system and standpipe per RA 9514: sprinklers required for buildings 15m+ height, standpipe classes I/II/III.',
  subject: 'ra-9514',
  cutAxis: 'y',
  camera: { position: [5, 4, 5], fov: 42 },
  layers: [
    {
      id: 'ground-slab',
      label: 'Ground Floor',
      material: 'RC Slab',
      description: 'Ground floor reference level.',
      depth: 0,
      geometry: { id: 'geo-g', type: 'box', args: [5, 0.15, 1.0], position: [0, 0.075, 0], color: '#b0b0b0' },
    },
    {
      id: 'building-envelope',
      label: 'Building Envelope',
      material: 'RC Frame / CHB Walls',
      description: 'Multi-storey building envelope — sprinkler and standpipe system installed throughout.',
      depth: 0.1,
      geometry: { id: 'geo-env', type: 'box', args: [5, 9.0, 1.0], position: [0, 4.65, 0], color: '#e2e8f0', opacity: 0.2, transparent: true },
    },
    {
      id: 'main-supply',
      label: 'Fire Water Main Supply',
      material: 'Schedule 40 Steel Pipe',
      description: 'Underground fire water supply main from city connection or fire storage tank to building riser.',
      depth: 0.25,
      geometry: { id: 'geo-fmain', type: 'cylinder', args: [0.05, 0.05, 4.0, 12], position: [0, 0.05, 0], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
    },
    {
      id: 'standpipe-riser',
      label: 'Standpipe Riser',
      material: 'Schedule 40 Steel 100mm',
      description: 'Vertical standpipe riser serving all floors. Class III combines Class I (2½") and Class II (1½") outlets.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.4',
      depth: 0.4,
      geometry: { id: 'geo-riser', type: 'cylinder', args: [0.05, 0.05, 9.0, 12], position: [-2.0, 4.65, 0], color: '#D64545' },
    },
    {
      id: 'sprinkler-branch',
      label: 'Sprinkler Branch Lines',
      material: 'Schedule 40 Steel 25mm',
      description: 'Horizontal sprinkler branch lines at each floor ceiling. Wet-pipe system — pipes charged with water at all times.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.3.2',
      depth: 0.6,
      geometry: { id: 'geo-branch', type: 'cylinder', args: [0.0125, 0.0125, 4.0, 12], position: [0, 3.15, 0], rotation: [0, 0, Math.PI / 2], color: '#f97316' },
    },
    {
      id: 'sprinkler-head',
      label: 'Sprinkler Heads (Pendant)',
      material: 'Pendant Sprinkler 68°C',
      description: 'Pendant-type sprinkler heads at ceiling, rated 68°C (standard). Coverage area 12m² per head.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.3.1',
      depth: 0.75,
      geometry: { id: 'geo-head', type: 'sphere', args: [0.03, 8, 8], position: [0, 3.05, 0], color: '#fbbf24' },
    },
    {
      id: 'hose-cabinet',
      label: 'Fire Hose Cabinet (Class II)',
      material: 'Recessed Steel Cabinet',
      description: 'Class II standpipe hose cabinet — 1½" hose for trained occupant use, at each floor landing.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.4.2',
      depth: 0.9,
      geometry: { id: 'geo-hose', type: 'box', args: [0.6, 0.5, 0.15], position: [2.0, 1.5, 0], color: '#D64545' },
    },
  ],
  annotations: [
    {
      id: 'ann-15m',
      label: 'Sprinklers Required at 15m+',
      description: 'Automatic sprinkler system required for buildings 15m or more in height. Also required for certain occupancies regardless of height.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.3.1',
      position: () => [3.0, 8.5, 0.6],
    },
    {
      id: 'ann-standpipe',
      label: 'Standpipe Classes',
      description: 'Class I: 2½" for fire dept use. Class II: 1½" for occupants. Class III: both outlets combined. Class III required for buildings 15m+.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.4',
      position: () => [-3.0, 5.0, 0.6],
    },
    {
      id: 'ann-coverage',
      label: 'Sprinkler Coverage',
      description: 'Each standard sprinkler head covers max 12m² area (3.7m × 3.7m). Maximum spacing 4.6m center-to-center.',
      codeCitation: 'RA 9514 IRR Rule 10 §10.3.3',
      position: () => [2.5, 3.0, 0.6],
    },
  ],
  presets: [
    { label: 'Full Building', values: { cutPosition: 5.0 } },
    { label: 'Ground Floor', values: { cutPosition: 1.0 } },
    { label: 'Mid Floor', values: { cutPosition: 3.5 } },
    { label: 'Upper Floor', values: { cutPosition: 7.0 } },
  ],
}

