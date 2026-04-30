// src/features/3d-lab/config/modules/plumbing-fixture-cutaway.ts
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'

// ─── NPCP Reference Table ───────────────────────────────────────────────────
// Fixture             Trap Size   DFU
// WC (flush tank)     76mm        4
// Lavatory            32mm        1
// Kitchen Sink        38mm        2
// Bathtub             38mm        2
// Urinal (flush vlv)  51mm        4
// Trap seal depth: 51–102mm
// Pipe slope ≥100mm: 1% (10.4 mm/m)
// Pipe slope ≤75mm:  2% (20.8 mm/m)

const SLAB_WIDTH = 1.5
const SLAB_DEPTH = 0.8

export const plumbingFixtureCutaway: CutawaySectionConfig = {
  id: 'plumbing-fixture-cutaway',
  title: 'Plumbing Fixture Installation Cutaway',
  description:
    'Cross-section of a toilet and lavatory installation revealing all internal plumbing components per the National Plumbing Code of the Philippines (NPCP).',
  subject: 'Plumbing',
  cutAxis: 'y',
  camera: {
    position: [2, 1.5, 2],
    fov: 40,
  },
  layers: [
    // 1. Soil/ground
    {
      id: 'soil',
      label: 'Soil / Ground',
      material: 'Compacted Earth',
      description: 'Compacted earth below the building slab.',
      depth: 0,
      geometry: {
        id: 'geo-soil',
        type: 'box',
        args: [SLAB_WIDTH, 0.3, SLAB_DEPTH],
        position: [0, 0.15, 0],
        color: '#8B7355',
      },
    },
    // 2. Building sewer pipe
    {
      id: 'building-sewer',
      label: 'Building Sewer Pipe',
      material: 'PVC 150mm',
      description: 'Main building sewer — minimum 150mm diameter per code.',
      codeCitation: 'NPCP §701.2 — Min 150mm building sewer',
      depth: 0.3,
      geometry: {
        id: 'geo-sewer',
        type: 'cylinder',
        args: [0.075, 0.075, SLAB_DEPTH, 16],
        position: [0, 0.375, 0],
        rotation: [Math.PI / 2, 0, 0],
        color: '#4a4a4a',
      },
    },
    // 3. Concrete floor slab
    {
      id: 'concrete-slab',
      label: 'Concrete Floor Slab',
      material: 'Reinforced Concrete 150mm',
      description: '150mm reinforced concrete slab.',
      depth: 0.45,
      geometry: {
        id: 'geo-slab',
        type: 'box',
        args: [SLAB_WIDTH, 0.15, SLAB_DEPTH],
        position: [0, 0.525, 0],
        color: '#b0b0b0',
      },
    },
    // 4. Floor waterproofing membrane
    {
      id: 'waterproofing',
      label: 'Floor Waterproofing',
      material: 'Cementitious Membrane',
      description: 'Waterproof membrane applied over the concrete slab.',
      depth: 0.6,
      geometry: {
        id: 'geo-waterproof',
        type: 'box',
        args: [SLAB_WIDTH, 0.02, SLAB_DEPTH],
        position: [0, 0.61, 0],
        color: '#1B3FC4',
      },
    },
    // 5. Floor tile
    {
      id: 'floor-tile',
      label: 'Floor Tile',
      material: 'Ceramic Tile 20mm',
      description: 'Finished floor surface — ceramic tile.',
      depth: 0.62,
      geometry: {
        id: 'geo-floor-tile',
        type: 'box',
        args: [SLAB_WIDTH, 0.02, SLAB_DEPTH],
        position: [0, 0.63, 0],
        color: '#e5e7eb',
      },
    },
    // 6. WC trap (P-trap)
    {
      id: 'wc-trap',
      label: 'WC Trap (P-Trap 76mm)',
      material: 'P-Trap 76mm',
      description: 'Water closet trap — 76mm, rated at 4 DFU. Trap seal depth 51–102mm.',
      codeCitation: 'NPCP §1002.1 — WC trap size 76mm, 4 DFU',
      depth: 0.64,
      geometry: {
        id: 'geo-wc-trap',
        type: 'cylinder',
        args: [0.038, 0.038, 0.076, 16],
        position: [-0.25, 0.678, 0],
        color: '#D64545',
      },
    },
    // 7. Soil stack (vertical)
    {
      id: 'soil-stack',
      label: 'Soil Stack (Vertical)',
      material: 'PVC Soil Stack 100mm',
      description: 'Vertical soil stack — 100mm PVC. Slope ≥100mm: 1% (10.4 mm/m).',
      depth: 0.72,
      geometry: {
        id: 'geo-soil-stack',
        type: 'cylinder',
        args: [0.05, 0.05, 0.1, 16],
        position: [-0.25, 0.77, 0],
        color: '#374151',
      },
    },
    // 8. Vent pipe
    {
      id: 'vent-pipe',
      label: 'Vent Pipe',
      material: 'PVC Vent 50mm (≥ ½ drain)',
      description: 'Vent pipe — minimum ½ the diameter of the drain it serves.',
      codeCitation: 'NPCP §906.1',
      depth: 0.82,
      geometry: {
        id: 'geo-vent',
        type: 'cylinder',
        args: [0.025, 0.025, 0.05, 16],
        position: [-0.25, 0.845, 0],
        color: '#2D9F6F',
      },
    },
    // 9. Wall framing (CHB)
    {
      id: 'wall-framing',
      label: 'Wall Framing',
      material: 'CHB 100mm',
      description: 'Concrete hollow block wall framing — 100mm thick.',
      depth: 0.87,
      geometry: {
        id: 'geo-wall-frame',
        type: 'box',
        args: [SLAB_WIDTH, 0.1, 0.1],
        position: [0, 0.92, -SLAB_DEPTH / 2 + 0.05],
        color: '#D4951A',
      },
    },
    // 10. Wall tile
    {
      id: 'wall-tile',
      label: 'Wall Tile',
      material: 'Wall Tile 10mm',
      description: 'Finished wall surface — ceramic tile.',
      depth: 0.97,
      geometry: {
        id: 'geo-wall-tile',
        type: 'box',
        args: [SLAB_WIDTH, 0.01, 0.01],
        position: [0, 0.975, -SLAB_DEPTH / 2 + 0.005],
        color: '#fafafa',
      },
    },
    // 11. Lavatory trap
    {
      id: 'lavatory-trap',
      label: 'Lavatory Trap (P-Trap 32mm)',
      material: 'P-Trap 32mm',
      description: 'Lavatory trap — 32mm, rated at 1 DFU. Pipe slope ≤75mm: 2% (20.8 mm/m).',
      codeCitation: 'NPCP §1002.1 — Lavatory trap 32mm, 1 DFU',
      depth: 1.0,
      geometry: {
        id: 'geo-lav-trap',
        type: 'cylinder',
        args: [0.016, 0.016, 0.032, 16],
        position: [0.3, 1.016, 0],
        color: '#D64545',
      },
    },
    // 12. Supply pipe
    {
      id: 'supply-pipe',
      label: 'Supply Pipe',
      material: 'PPR Supply 20mm',
      description: 'Hot/cold water supply pipe — PPR 20mm.',
      depth: 1.05,
      geometry: {
        id: 'geo-supply',
        type: 'cylinder',
        args: [0.01, 0.01, 0.4, 16],
        position: [0.3, 1.06, -SLAB_DEPTH / 2 + 0.05],
        color: '#3b82f6',
      },
    },
  ],

  annotations: [
    {
      id: 'ann-npcp-table',
      label: 'NPCP Fixture Trap & DFU Reference',
      description:
        'WC: 76mm / 4 DFU | Lavatory: 32mm / 1 DFU | Kitchen Sink: 38mm / 2 DFU | Bathtub: 38mm / 2 DFU | Urinal: 51mm / 4 DFU',
      codeCitation: 'NPCP §1002.1',
      position: () => [1.2, 0.5, 0],
    },
    {
      id: 'ann-trap-seal',
      label: 'Trap Seal Depth',
      description: 'All fixture traps must maintain a water seal of 51–102mm.',
      codeCitation: 'NPCP §1002.3',
      position: () => [-0.6, 0.678, 0],
      visibleWhen: (p) => (typeof p.cutPosition === 'number' ? p.cutPosition >= 0.64 : true),
    },
    {
      id: 'ann-slope-large',
      label: 'Pipe Slope (≥100mm)',
      description: '1% gradient — 10.4 mm/m minimum slope for pipes ≥100mm diameter.',
      position: () => [-0.6, 0.375, 0],
      visibleWhen: (p) => (typeof p.cutPosition === 'number' ? p.cutPosition >= 0.3 : true),
    },
    {
      id: 'ann-slope-small',
      label: 'Pipe Slope (≤75mm)',
      description: '2% gradient — 20.8 mm/m minimum slope for pipes ≤75mm diameter.',
      position: () => [0.6, 1.016, 0],
      visibleWhen: (p) => (typeof p.cutPosition === 'number' ? p.cutPosition >= 1.0 : true),
    },
  ],

  presets: [
    {
      label: 'Fully Revealed',
      values: { cutPosition: 1.1 },
    },
    {
      label: 'Below Slab',
      values: { cutPosition: 0.45 },
    },
    {
      label: 'Floor Level',
      values: { cutPosition: 0.64 },
    },
    {
      label: 'WC Trap',
      values: { cutPosition: 0.82 },
    },
  ],
}

