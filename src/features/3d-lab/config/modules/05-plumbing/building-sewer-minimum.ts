// src/features/3d-lab/config/modules/building-sewer-minimum.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

export const buildingSewerMinimumConfig: CutawaySectionConfig = {
  id: 'building-sewer-minimum',
  title: 'Building Sewer Minimum',
  description:
    'Building sewer cross-section — 150mm minimum diameter, 1% minimum slope, bedding, cover, and connection to public sewer per NPCP §701.',
  subject: 'npcp',
  cutAxis: 'y',
  camera: { position: [4, 2.5, 3.5], fov: 40 },
  layers: [
    {
      id: 'subsoil-undisturbed',
      label: 'Undisturbed Subsoil',
      material: 'Native Earth',
      description: 'Undisturbed native earth below trench bottom — provides firm bearing for pipe bedding.',
      depth: 0,
      geometry: { id: 'geo-sub', type: 'box', args: [4, 0.8, 1.0], position: [0, -0.4, 0], color: '#6b4f2a' },
    },
    {
      id: 'granular-bedding',
      label: 'Granular Pipe Bedding (150mm)',
      material: 'Crushed Stone / Gravel',
      description: '150mm granular bedding below pipe — uniform support preventing point loading. Crushed stone or clean gravel.',
      codeCitation: 'NPCP §701',
      depth: 0.15,
      geometry: { id: 'geo-bed', type: 'box', args: [4, 0.15, 1.0], position: [0, 0.075, 0], color: '#d4a853' },
    },
    {
      id: 'building-sewer-pipe',
      label: 'Building Sewer (PVC 150mm)',
      material: 'PVC SDR 35, 150mm',
      description: 'Building sewer — minimum 150mm (6") diameter PVC SDR 35. Slope minimum 1% (1:100). Carries all building drainage to public sewer or septic.',
      codeCitation: 'NPCP §701.2 — 150mm min, 1% slope',
      depth: 0.3,
      geometry: { id: 'geo-bsp', type: 'cylinder', args: [0.075, 0.075, 3.5, 16], position: [0, 0.225, 0], rotation: [0, 0, Math.PI / 2 + 0.01], color: '#374151' },
    },
    {
      id: 'pipe-surround',
      label: 'Granular Pipe Surround',
      material: 'Crushed Stone to Crown',
      description: 'Granular surround to top of pipe — prevents point loads from backfill compaction. Critical for PVC pipe protection.',
      depth: 0.45,
      geometry: { id: 'geo-surround', type: 'box', args: [4, 0.3, 1.0], position: [0, 0.3, 0], color: '#d4c090' },
    },
    {
      id: 'trench-backfill',
      label: 'Controlled Trench Backfill',
      material: 'Compacted Fill (Lifts)',
      description: 'Controlled compaction backfill in 200mm lifts — prevents settlement. No large rocks or debris near pipe.',
      depth: 0.6,
      geometry: { id: 'geo-fill', type: 'box', args: [4, 0.8, 1.0], position: [0, 0.7, 0], color: '#8B7355' },
    },
    {
      id: 'min-cover',
      label: 'Min 300mm Cover to Surface',
      material: 'Fill / Pavement',
      description: 'Minimum 300mm of compacted fill above pipe crown before any paved surface. Protects from surface loads.',
      codeCitation: 'NPCP §701',
      depth: 0.75,
      geometry: { id: 'geo-cover', type: 'box', args: [4, 0.3, 1.0], position: [0, 1.25, 0], color: '#9ca3af' },
    },
    {
      id: 'public-sewer-connection',
      label: 'Public Sewer Connection',
      material: 'Wye Connection',
      description: 'Building sewer connects to public sewer at a wye or tee saddle — connection must be made watertight. Requires permit from local utility.',
      codeCitation: 'NPCP §701.1',
      depth: 0.9,
      geometry: { id: 'geo-conn', type: 'cylinder', args: [0.1, 0.1, 0.5, 12], position: [1.8, 0.05, 0], color: '#64748b' },
    },
  ],
  annotations: [
    {
      id: 'ann-150',
      label: 'Min 150mm Diameter',
      description: 'Building sewer must be at least 150mm (6") diameter — ensures capacity for peak flows and self-cleaning velocity at low flows.',
      codeCitation: 'NPCP §701.2',
      position: () => [2.0, 0.25, 0.6],
    },
    {
      id: 'ann-slope',
      label: 'Min 1% Slope (1:100)',
      description: 'Minimum 1% slope (10mm drop per meter) for building sewer — ensures self-cleansing flow velocity of at least 0.6 m/s.',
      codeCitation: 'NPCP §701.2',
      position: () => [-2.0, 0.5, 0.6],
    },
    {
      id: 'ann-bedding',
      label: '150mm Granular Bedding',
      description: 'Granular pipe bedding distributes pipe weight uniformly — prevents cracking from point loads. Required for PVC and all flexible pipe materials.',
      codeCitation: 'NPCP §701',
      position: () => [-2.0, -0.2, 0.6],
    },
  ],
  presets: [
    { label: 'Full Section', values: { cutPosition: 1.0 } },
    { label: 'Pipe & Bedding', values: { cutPosition: 0.3 } },
    { label: 'Backfill', values: { cutPosition: 0.8 } },
    { label: 'Surface Cover', values: { cutPosition: 1.4 } },
  ],
}

