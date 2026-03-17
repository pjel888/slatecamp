// src/app/dashboard/3d-lab/_config/modules/pipe-slope-visualization.ts
// Pipe Slope Visualization — NPCP
// ─────────────────────────────────────────────────────────────────────────────
// Cutaway building section showing drainage pipe slopes:
// ≥100mm diameter: 1% slope (10.4 mm/m)
// ≤75mm diameter:  2% slope (20.8 mm/m)

import type { CutawaySectionConfig } from '../../_types/templates'

const SECTION_WIDTH = 3.0
const SECTION_DEPTH = 0.8

export const pipeSlopeVisualizationConfig: CutawaySectionConfig = {
  id: 'pipe-slope-visualization',
  title: 'Pipe Slope Visualization',
  description:
    'Cross-section of a building drainage system showing required pipe slopes by diameter per the National Plumbing Code of the Philippines (NPCP). Pipes ≥100mm: 1% slope; Pipes ≤75mm: 2% slope.',
  subject: 'npcp',
  cutAxis: 'y',
  camera: {
    position: [3, 2.5, 3],
    fov: 40,
  },
  layers: [
    // 1. Ground/soil layer
    {
      id: 'soil',
      label: 'Soil / Ground',
      material: 'Compacted Earth',
      description: 'Compacted earth below the building slab. Building sewer runs through this layer.',
      depth: 0,
      geometry: {
        id: 'geo-soil',
        type: 'box',
        args: [SECTION_WIDTH, 0.5, SECTION_DEPTH],
        position: [0, 0.25, 0],
        color: '#8B7355',
      },
    },
    // 2. Building sewer (150mm, 1% slope)
    {
      id: 'building-sewer',
      label: 'Building Sewer (150mm)',
      material: 'PVC 150mm',
      description: 'Main building sewer — minimum 150mm diameter. Slope: 1% (10.4 mm/m). Connects to public sewer or septic system.',
      codeCitation: 'NPCP §701.2 — Min 150mm, 1% slope for ≥100mm pipes',
      depth: 0.15,
      geometry: {
        id: 'geo-sewer',
        type: 'cylinder',
        args: [0.075, 0.075, SECTION_WIDTH * 0.9, 16],
        position: [0, 0.35, 0],
        rotation: [0, 0, Math.PI / 2 + 0.01], // 1% slope = ~0.01 rad
        color: '#374151',
      },
    },
    // 3. Concrete floor slab
    {
      id: 'concrete-slab',
      label: 'Concrete Floor Slab',
      material: 'Reinforced Concrete 150mm',
      description: '150mm reinforced concrete slab — floor structure.',
      depth: 0.5,
      geometry: {
        id: 'geo-slab',
        type: 'box',
        args: [SECTION_WIDTH, 0.15, SECTION_DEPTH],
        position: [0, 0.575, 0],
        color: '#b0b0b0',
      },
    },
    // 4. Soil stack (100mm vertical, connects to sewer)
    {
      id: 'soil-stack',
      label: 'Soil Stack (100mm)',
      material: 'PVC 100mm Vertical',
      description: 'Vertical soil stack — 100mm PVC. Carries waste from upper floors down to building drain.',
      codeCitation: 'NPCP §710.1',
      depth: 0.65,
      geometry: {
        id: 'geo-soil-stack',
        type: 'cylinder',
        args: [0.05, 0.05, 1.5, 16],
        position: [-0.8, 1.4, 0],
        color: '#374151',
      },
    },
    // 5. Horizontal branch drain (100mm, 1% slope)
    {
      id: 'branch-drain-100',
      label: 'Branch Drain (100mm)',
      material: 'PVC 100mm',
      description: 'Horizontal branch drain — 100mm diameter. Slope: 1% (10.4 mm/m). Connects WC to soil stack.',
      codeCitation: 'NPCP §708.1 — 1% slope for pipes ≥100mm',
      depth: 0.8,
      geometry: {
        id: 'geo-branch-100',
        type: 'cylinder',
        args: [0.05, 0.05, 1.2, 16],
        position: [-0.1, 0.85, 0],
        rotation: [0, 0, Math.PI / 2 + 0.01], // 1% slope
        color: '#dc2626',
      },
    },
    // 6. WC fixture connection (76mm trap)
    {
      id: 'wc-trap',
      label: 'WC Trap (76mm)',
      material: 'P-Trap 76mm',
      description: 'Water closet P-trap — 76mm. Connects to 100mm branch drain. Trap seal: 51-102mm.',
      codeCitation: 'NPCP §1002.1 — WC trap 76mm, 4 DFU',
      depth: 0.9,
      geometry: {
        id: 'geo-wc-trap',
        type: 'cylinder',
        args: [0.038, 0.038, 0.15, 16],
        position: [0.5, 0.9, 0],
        color: '#ef4444',
      },
    },
    // 7. Lavatory branch drain (32mm, 2% slope)
    {
      id: 'branch-drain-32',
      label: 'Lavatory Drain (32mm)',
      material: 'PVC 32mm',
      description: 'Lavatory drain — 32mm diameter. Slope: 2% (20.8 mm/m). Higher slope required for smaller diameter pipes.',
      codeCitation: 'NPCP §708.1 — 2% slope for pipes ≤75mm',
      depth: 1.0,
      geometry: {
        id: 'geo-branch-32',
        type: 'cylinder',
        args: [0.016, 0.016, 1.0, 16],
        position: [0.5, 1.3, 0],
        rotation: [0, 0, Math.PI / 2 + 0.02], // 2% slope
        color: '#3b82f6',
      },
    },
    // 8. Lavatory trap (32mm)
    {
      id: 'lav-trap',
      label: 'Lavatory Trap (32mm)',
      material: 'P-Trap 32mm',
      description: 'Lavatory P-trap — 32mm. 1 DFU. Connects to waste branch.',
      codeCitation: 'NPCP §1002.1 — Lavatory trap 32mm, 1 DFU',
      depth: 1.1,
      geometry: {
        id: 'geo-lav-trap',
        type: 'cylinder',
        args: [0.016, 0.016, 0.08, 16],
        position: [1.0, 1.35, 0],
        color: '#3b82f6',
      },
    },
    // 9. Vent stack (50mm, vertical)
    {
      id: 'vent-stack',
      label: 'Vent Stack (50mm)',
      material: 'PVC 50mm Vent',
      description: 'Vent stack — minimum 50mm (≥½ drain diameter). Prevents siphonage of trap seals. Extends through roof.',
      codeCitation: 'NPCP §906.1',
      depth: 1.2,
      geometry: {
        id: 'geo-vent-stack',
        type: 'cylinder',
        args: [0.025, 0.025, 1.8, 16],
        position: [0.8, 1.55, 0],
        color: '#16a34a',
      },
    },
    // 10. Wall (CHB background)
    {
      id: 'wall',
      label: 'Wall (CHB 150mm)',
      material: 'CHB 150mm',
      description: 'Concrete hollow block wall — background reference for pipe routing.',
      depth: 1.3,
      geometry: {
        id: 'geo-wall',
        type: 'box',
        args: [SECTION_WIDTH, 2.0, 0.15],
        position: [0, 1.65, -SECTION_DEPTH / 2 + 0.075],
        color: '#d6d3d1',
      },
    },
    // 11. Slope reference lines (1% and 2% visual guides)
    {
      id: 'slope-guide-1pct',
      label: 'Slope Guide: 1% (≥100mm)',
      material: 'Reference Line',
      description: '1% slope reference (10.4 mm per meter run). Required for pipes ≥100mm diameter.',
      codeCitation: 'NPCP §708.1',
      depth: 1.4,
      geometry: {
        id: 'geo-slope-1pct',
        type: 'box',
        args: [2.0, 0.003, 0.003],
        position: [0, 0.65, SECTION_DEPTH / 2 - 0.1],
        rotation: [0, 0, 0.01], // 1% = 0.01 rad
        color: '#f97316',
      },
    },
    {
      id: 'slope-guide-2pct',
      label: 'Slope Guide: 2% (≤75mm)',
      material: 'Reference Line',
      description: '2% slope reference (20.8 mm per meter run). Required for pipes ≤75mm diameter.',
      codeCitation: 'NPCP §708.1',
      depth: 1.45,
      geometry: {
        id: 'geo-slope-2pct',
        type: 'box',
        args: [2.0, 0.003, 0.003],
        position: [0, 1.35, SECTION_DEPTH / 2 - 0.1],
        rotation: [0, 0, 0.02], // 2% = 0.02 rad
        color: '#8b5cf6',
      },
    },
  ],

  annotations: [
    {
      id: 'ann-1pct-slope',
      label: 'Pipes ≥100mm: 1% Slope',
      description: 'Minimum 1% gradient (10.4 mm/m) for drainage pipes ≥100mm diameter (soil stacks, branch drains for WC).',
      codeCitation: 'NPCP §708.1',
      position: () => [-1.2, 0.85, 0.5],
    },
    {
      id: 'ann-2pct-slope',
      label: 'Pipes ≤75mm: 2% Slope',
      description: 'Minimum 2% gradient (20.8 mm/m) for drainage pipes ≤75mm diameter (lavatory, sink drains).',
      codeCitation: 'NPCP §708.1',
      position: () => [0.5, 1.5, 0.5],
    },
    {
      id: 'ann-trap-seal',
      label: 'Trap Seal: 51–102mm',
      description: 'All fixture traps must maintain a water seal depth between 51mm and 102mm to prevent sewer gas entry.',
      codeCitation: 'NPCP §1002.3',
      position: () => [1.2, 0.9, 0.5],
      visibleWhen: (p) => typeof p.cutPosition === 'number' ? p.cutPosition >= 0.9 : true,
    },
  ],

  presets: [
    { label: 'Full Section', values: { cutPosition: 1.5 } },
    { label: 'Below Slab', values: { cutPosition: 0.5 } },
    { label: 'Drain Level', values: { cutPosition: 1.0 } },
    { label: 'Vent Level', values: { cutPosition: 1.3 } },
  ],
}
