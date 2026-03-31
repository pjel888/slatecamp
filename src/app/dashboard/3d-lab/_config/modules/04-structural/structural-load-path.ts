// src/app/dashboard/3d-lab/_config/modules/structural-load-path.ts
import type { AnimatedSequenceConfig } from '../../../_types/templates'

/**
 * Structural Load Path Animation
 *
 * Demonstrates how loads flow through a 2-bay, 2-storey RC frame:
 * Dead/Live loads -> Slab -> Beam -> Column -> Footing -> Soil
 *
 * Reference: NSCP 2015 (National Structural Code of the Philippines)
 */
export const structuralLoadPathConfig: AnimatedSequenceConfig = {
  id: 'structural-load-path',
  title: 'Structural Load Path',
  description:
    'Step-by-step visualization of gravity load transfer through a 2-bay, 2-storey RC frame — from applied loads down to soil bearing.',
  subject: 'Structural Engineering',
  loop: false,
  autoPlaySpeed: 1500,
  camera: { position: [5, 5, 5], fov: 40 },
  steps: [
    // ── Step 1: Building Frame ────────────────────────────────────────────
    {
      id: 'frame',
      label: 'Building Frame',
      description:
        'A 2-bay, 2-storey reinforced concrete frame with 3 columns per level, beams at each floor, and spread footings.',
      duration: 800,
      geometry: [
        // Ground-floor columns (y 0 → 3)
        { id: 'col-g-l', type: 'cylinder', args: [0.15, 0.15, 3, 16], position: [-2, 1.5, 0], color: '#94a3b8' },
        { id: 'col-g-c', type: 'cylinder', args: [0.15, 0.15, 3, 16], position: [0, 1.5, 0], color: '#94a3b8' },
        { id: 'col-g-r', type: 'cylinder', args: [0.15, 0.15, 3, 16], position: [2, 1.5, 0], color: '#94a3b8' },
        // 1st-floor columns (y 3 → 6)
        { id: 'col-1-l', type: 'cylinder', args: [0.15, 0.15, 3, 16], position: [-2, 4.5, 0], color: '#94a3b8' },
        { id: 'col-1-c', type: 'cylinder', args: [0.15, 0.15, 3, 16], position: [0, 4.5, 0], color: '#94a3b8' },
        { id: 'col-1-r', type: 'cylinder', args: [0.15, 0.15, 3, 16], position: [2, 4.5, 0], color: '#94a3b8' },
        // 1st-floor beams at y = 3
        { id: 'beam-1-left', type: 'box', args: [2, 0.3, 0.2], position: [-1, 3, 0], color: '#94a3b8' },
        { id: 'beam-1-right', type: 'box', args: [2, 0.3, 0.2], position: [1, 3, 0], color: '#94a3b8' },
        // Roof beams at y = 6
        { id: 'beam-2-left', type: 'box', args: [2, 0.3, 0.2], position: [-1, 6, 0], color: '#94a3b8' },
        { id: 'beam-2-right', type: 'box', args: [2, 0.3, 0.2], position: [1, 6, 0], color: '#94a3b8' },
        // Footings at y = 0
        { id: 'ftg-l', type: 'box', args: [0.8, 0.15, 0.8], position: [-2, 0, 0], color: '#94a3b8' },
        { id: 'ftg-c', type: 'box', args: [0.8, 0.15, 0.8], position: [0, 0, 0], color: '#94a3b8' },
        { id: 'ftg-r', type: 'box', args: [0.8, 0.15, 0.8], position: [2, 0, 0], color: '#94a3b8' },
      ],
    },

    // ── Step 2: Dead Loads Applied ────────────────────────────────────────
    {
      id: 'dead-loads',
      label: 'Dead Loads Applied',
      description:
        'Self-weight of RC slabs and beams acts as uniformly distributed dead load. RC unit weight: 23.6 kN/m\u00B3.',
      codeCitation: 'NSCP 2015 Table 204-1',
      duration: 800,
      geometry: [
        // Arrows on roof beams (dead load)
        { id: 'dl-roof-1', type: 'box', args: [0.06, 0.5, 0.06], position: [-1.5, 6.5, 0], color: '#6366f1', label: 'DL' },
        { id: 'dl-roof-2', type: 'box', args: [0.06, 0.5, 0.06], position: [-0.5, 6.5, 0], color: '#6366f1' },
        { id: 'dl-roof-3', type: 'box', args: [0.06, 0.5, 0.06], position: [0.5, 6.5, 0], color: '#6366f1' },
        { id: 'dl-roof-4', type: 'box', args: [0.06, 0.5, 0.06], position: [1.5, 6.5, 0], color: '#6366f1' },
        // Arrows on 1st-floor beams
        { id: 'dl-flr-1', type: 'box', args: [0.06, 0.5, 0.06], position: [-1.5, 3.5, 0], color: '#6366f1' },
        { id: 'dl-flr-2', type: 'box', args: [0.06, 0.5, 0.06], position: [-0.5, 3.5, 0], color: '#6366f1' },
        { id: 'dl-flr-3', type: 'box', args: [0.06, 0.5, 0.06], position: [0.5, 3.5, 0], color: '#6366f1' },
        { id: 'dl-flr-4', type: 'box', args: [0.06, 0.5, 0.06], position: [1.5, 3.5, 0], color: '#6366f1' },
        // Label arrow
        { id: 'dl-label', type: 'box', args: [0.06, 0.5, 0.06], position: [-1, 6.5, 0], color: '#6366f1', label: 'RC Slab: 23.6 kN/m\u00B3' },
      ],
    },

    // ── Step 3: Live Loads Applied ────────────────────────────────────────
    {
      id: 'live-loads',
      label: 'Live Loads Applied',
      description:
        'Occupancy live loads applied to floor slabs. Default: Office — 2.4 kPa.',
      codeCitation: 'NSCP 2015 Table 205-1',
      duration: 800,
      geometry: [
        // Live load arrows on 1st floor only (occupied floors)
        { id: 'll-flr-1', type: 'box', args: [0.06, 0.4, 0.06], position: [-1.5, 3.6, 0.15], color: '#f97316', label: 'LL' },
        { id: 'll-flr-2', type: 'box', args: [0.06, 0.4, 0.06], position: [-0.5, 3.6, 0.15], color: '#f97316' },
        { id: 'll-flr-3', type: 'box', args: [0.06, 0.4, 0.06], position: [0.5, 3.6, 0.15], color: '#f97316' },
        { id: 'll-flr-4', type: 'box', args: [0.06, 0.4, 0.06], position: [1.5, 3.6, 0.15], color: '#f97316' },
        // Label
        { id: 'll-label', type: 'box', args: [0.06, 0.4, 0.06], position: [-1, 3.6, 0.15], color: '#f97316', label: 'Office: 2.4 kPa' },
      ],
    },

    // ── Step 4: Slab → Beam Transfer ──────────────────────────────────────
    {
      id: 'slab-beam-transfer',
      label: 'Slab \u2192 Beam Transfer',
      description:
        'One-way slab transfers load to supporting beams via tributary area. Load distributes as UDL on beam span.',
      duration: 1000,
      geometry: [
        // Tributary area zones (colored translucent planes on 1st floor)
        { id: 'trib-1f-l', type: 'box', args: [2, 0.02, 0.8], position: [-1, 3.16, 0], color: '#818cf8', opacity: 0.3, transparent: true },
        { id: 'trib-1f-r', type: 'box', args: [2, 0.02, 0.8], position: [1, 3.16, 0], color: '#818cf8', opacity: 0.3, transparent: true },
        // Transfer arrows (slab → beam) — downward pointing
        { id: 'xfer-sb-1', type: 'cone', args: [0.08, 0.2, 8], position: [-1.5, 3.25, 0], color: '#4f46e5' },
        { id: 'xfer-sb-2', type: 'cone', args: [0.08, 0.2, 8], position: [-0.5, 3.25, 0], color: '#4f46e5' },
        { id: 'xfer-sb-3', type: 'cone', args: [0.08, 0.2, 8], position: [0.5, 3.25, 0], color: '#4f46e5' },
        { id: 'xfer-sb-4', type: 'cone', args: [0.08, 0.2, 8], position: [1.5, 3.25, 0], color: '#4f46e5' },
        // Label
        { id: 'xfer-sb-label', type: 'sphere', args: [0.05, 8, 8], position: [0, 3.4, 0.3], color: '#4f46e5', label: 'Slab \u2192 Beam' },
      ],
    },

    // ── Step 5: Beam → Column Transfer ────────────────────────────────────
    {
      id: 'beam-column-transfer',
      label: 'Beam \u2192 Column Transfer',
      description:
        'Beam reactions at supports become column axial loads. Reaction forces concentrate at beam-column joints.',
      duration: 1000,
      geometry: [
        // Reaction indicators at beam-column joints (1st floor)
        { id: 'rxn-1-l', type: 'sphere', args: [0.12, 12, 12], position: [-2, 3, 0], color: '#ef4444' },
        { id: 'rxn-1-c', type: 'sphere', args: [0.14, 12, 12], position: [0, 3, 0], color: '#ef4444' },
        { id: 'rxn-1-r', type: 'sphere', args: [0.12, 12, 12], position: [2, 3, 0], color: '#ef4444' },
        // Reaction indicators at beam-column joints (roof)
        { id: 'rxn-2-l', type: 'sphere', args: [0.1, 12, 12], position: [-2, 6, 0], color: '#ef4444' },
        { id: 'rxn-2-c', type: 'sphere', args: [0.12, 12, 12], position: [0, 6, 0], color: '#ef4444' },
        { id: 'rxn-2-r', type: 'sphere', args: [0.1, 12, 12], position: [2, 6, 0], color: '#ef4444' },
        // Downward arrows from beam to column
        { id: 'xfer-bc-l', type: 'cone', args: [0.08, 0.25, 8], position: [-2, 2.7, 0], color: '#ef4444' },
        { id: 'xfer-bc-c', type: 'cone', args: [0.1, 0.25, 8], position: [0, 2.7, 0], color: '#ef4444' },
        { id: 'xfer-bc-r', type: 'cone', args: [0.08, 0.25, 8], position: [2, 2.7, 0], color: '#ef4444' },
        // Label
        { id: 'xfer-bc-label', type: 'sphere', args: [0.05, 8, 8], position: [0, 2.5, 0.3], color: '#ef4444', label: 'Beam \u2192 Column' },
      ],
    },

    // ── Step 6: Column → Footing Transfer ─────────────────────────────────
    {
      id: 'column-footing-transfer',
      label: 'Column \u2192 Footing Transfer',
      description:
        'Column axial loads accumulate from upper floors and transfer to spread footings at the base.',
      duration: 1000,
      geometry: [
        // Highlighted arrows from column bases to footings
        { id: 'xfer-cf-l', type: 'cone', args: [0.1, 0.3, 8], position: [-2, 0.25, 0], color: '#D4951A' },
        { id: 'xfer-cf-c', type: 'cone', args: [0.12, 0.3, 8], position: [0, 0.25, 0], color: '#D4951A' },
        { id: 'xfer-cf-r', type: 'cone', args: [0.1, 0.3, 8], position: [2, 0.25, 0], color: '#D4951A' },
        // Cumulative load labels
        { id: 'load-l', type: 'sphere', args: [0.05, 8, 8], position: [-2, 0.5, 0.3], color: '#D4951A', label: 'P = \u03A3 loads' },
        { id: 'load-c', type: 'sphere', args: [0.05, 8, 8], position: [0, 0.5, 0.3], color: '#D4951A', label: 'P = \u03A3 loads (max)' },
        { id: 'load-r', type: 'sphere', args: [0.05, 8, 8], position: [2, 0.5, 0.3], color: '#D4951A', label: 'P = \u03A3 loads' },
      ],
    },

    // ── Step 7: Footing → Soil ────────────────────────────────────────────
    {
      id: 'footing-soil',
      label: 'Footing \u2192 Soil',
      description:
        'Spread footings distribute concentrated column loads over a larger area, reducing pressure to within allowable soil bearing capacity.',
      duration: 800,
      geometry: [
        // Ground / soil plane
        { id: 'soil-plane', type: 'box', args: [6, 0.06, 3], position: [0, -0.15, 0], color: '#a3734c', opacity: 0.5, transparent: true },
        // Spread pressure arrows under each footing
        { id: 'soil-l1', type: 'cone', args: [0.06, 0.2, 8], position: [-2.2, -0.3, -0.2], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-l2', type: 'cone', args: [0.06, 0.2, 8], position: [-2, -0.3, 0], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-l3', type: 'cone', args: [0.06, 0.2, 8], position: [-1.8, -0.3, 0.2], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-c1', type: 'cone', args: [0.06, 0.2, 8], position: [-0.2, -0.3, -0.2], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-c2', type: 'cone', args: [0.06, 0.2, 8], position: [0, -0.3, 0], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-c3', type: 'cone', args: [0.06, 0.2, 8], position: [0.2, -0.3, 0.2], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-r1', type: 'cone', args: [0.06, 0.2, 8], position: [1.8, -0.3, -0.2], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-r2', type: 'cone', args: [0.06, 0.2, 8], position: [2, -0.3, 0], color: '#78350f', rotation: [Math.PI, 0, 0] },
        { id: 'soil-r3', type: 'cone', args: [0.06, 0.2, 8], position: [2.2, -0.3, 0.2], color: '#78350f', rotation: [Math.PI, 0, 0] },
        // Label
        { id: 'soil-label', type: 'sphere', args: [0.05, 8, 8], position: [0, -0.5, 0.5], color: '#78350f', label: 'Soil bearing pressure' },
      ],
    },
  ],
}
