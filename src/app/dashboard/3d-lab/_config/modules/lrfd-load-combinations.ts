// src/app/dashboard/3d-lab/_config/modules/lrfd-load-combinations.ts
// LRFD Load Combinations — NSCP
// ─────────────────────────────────────────────────────────────────────────────
// Seven NSCP LRFD load combinations shown as colored force arrows on a building.

import type { AnimatedSequenceConfig } from '../../_types/templates'

export const lrfdLoadCombinationsConfig: AnimatedSequenceConfig = {
  id: 'lrfd-load-combinations',
  title: 'LRFD Load Combinations (NSCP)',
  description:
    'The seven NSCP LRFD load combinations visualized as colored force arrows on a building frame. Each combination highlights the governing loads: Dead (D), Live (L), Roof Live (Lr), Wind (W), and Seismic (E).',
  subject: 'nscp',
  loop: true,
  autoPlaySpeed: 1800,
  camera: { position: [3.5, 3, 4], target: [0, 1.5, 0], fov: 45 },
  steps: [
    // ── U1 = 1.4D ───────────────────────────────────────────────────────────
    {
      id: 'u1',
      label: 'U1 = 1.4D (Dead Load Only)',
      description:
        'U1 = 1.4D. Governs when dead load is the dominant action — e.g., heavy concrete structures with minimal live load. 40% amplification on dead load covers variability in material weights.',
      codeCitation: 'NSCP 2015 Section 203.3 Load Combinations for LRFD',
      duration: 1500,
      geometry: [
        // Building frame
        { id: 'col-left', type: 'box', args: [0.15, 3, 0.15], position: [-1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'col-right', type: 'box', args: [0.15, 3, 0.15], position: [1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'beam', type: 'box', args: [2.15, 0.25, 0.3], position: [0, 3.0, 0], color: '#64748b' },
        { id: 'slab', type: 'box', args: [2.15, 0.15, 1.0], position: [0, 3.25, 0], color: '#94a3b8' },
        { id: 'base', type: 'box', args: [2.8, 0.1, 1.2], position: [0, 0, 0], color: '#d4d4d8' },
        // Dead load arrows (downward, gray, large)
        { id: 'd1', type: 'cone', args: [0.1, 0.3, 8], position: [-0.6, 3.65, 0], rotation: [Math.PI, 0, 0], color: '#71717a', label: '1.4D' },
        { id: 'd2', type: 'cone', args: [0.1, 0.3, 8], position: [0, 3.65, 0], rotation: [Math.PI, 0, 0], color: '#71717a' },
        { id: 'd3', type: 'cone', args: [0.1, 0.3, 8], position: [0.6, 3.65, 0], rotation: [Math.PI, 0, 0], color: '#71717a' },
        { id: 'd1-shaft', type: 'box', args: [0.04, 0.35, 0.04], position: [-0.6, 3.97, 0], color: '#71717a' },
        { id: 'd2-shaft', type: 'box', args: [0.04, 0.35, 0.04], position: [0, 3.97, 0], color: '#71717a' },
        { id: 'd3-shaft', type: 'box', args: [0.04, 0.35, 0.04], position: [0.6, 3.97, 0], color: '#71717a' },
        // Column compression
        { id: 'col-comp-l', type: 'cone', args: [0.07, 0.2, 8], position: [-1.0, 0.15, 0], rotation: [Math.PI, 0, 0], color: '#71717a' },
        { id: 'col-comp-r', type: 'cone', args: [0.07, 0.2, 8], position: [1.0, 0.15, 0], rotation: [Math.PI, 0, 0], color: '#71717a' },
      ],
    },

    // ── U2 = 1.2D + 1.6L + 0.5Lr ────────────────────────────────────────────
    {
      id: 'u2',
      label: 'U2 = 1.2D + 1.6L + 0.5Lr',
      description:
        'U2 = 1.2D + 1.6L + 0.5Lr. The most common governing combination for floor design. Live load (L) amplified 1.6× dominates. Roof live load (Lr) at 0.5× companion action.',
      codeCitation: 'NSCP 2015 Section 203.3',
      duration: 1500,
      geometry: [
        // Frame
        { id: 'col-left', type: 'box', args: [0.15, 3, 0.15], position: [-1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'col-right', type: 'box', args: [0.15, 3, 0.15], position: [1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'beam', type: 'box', args: [2.15, 0.25, 0.3], position: [0, 3.0, 0], color: '#64748b' },
        { id: 'slab', type: 'box', args: [2.15, 0.15, 1.0], position: [0, 3.25, 0], color: '#94a3b8' },
        { id: 'base', type: 'box', args: [2.8, 0.1, 1.2], position: [0, 0, 0], color: '#d4d4d8' },
        // Dead load (gray, medium)
        { id: 'd-arrow', type: 'cone', args: [0.08, 0.22, 8], position: [-0.7, 3.62, 0], rotation: [Math.PI, 0, 0], color: '#71717a', label: '1.2D' },
        { id: 'd-shaft', type: 'box', args: [0.03, 0.28, 0.03], position: [-0.7, 3.88, 0], color: '#71717a' },
        // Live load (blue, largest arrows)
        { id: 'l1-arrow', type: 'cone', args: [0.12, 0.38, 8], position: [0, 3.7, 0], rotation: [Math.PI, 0, 0], color: '#3B6B9C', label: '1.6L' },
        { id: 'l1-shaft', type: 'box', args: [0.05, 0.45, 0.05], position: [0, 4.08, 0], color: '#3B6B9C' },
        // Roof live (green, small)
        { id: 'lr-arrow', type: 'cone', args: [0.07, 0.18, 8], position: [0.7, 3.6, 0], rotation: [Math.PI, 0, 0], color: '#2D9F6F', label: '0.5Lr' },
        { id: 'lr-shaft', type: 'box', args: [0.03, 0.22, 0.03], position: [0.7, 3.82, 0], color: '#2D9F6F' },
        // Column reactions
        { id: 'col-comp-l', type: 'cone', args: [0.07, 0.2, 8], position: [-1.0, 0.15, 0], rotation: [Math.PI, 0, 0], color: '#64748b' },
        { id: 'col-comp-r', type: 'cone', args: [0.07, 0.2, 8], position: [1.0, 0.15, 0], rotation: [Math.PI, 0, 0], color: '#64748b' },
      ],
    },

    // ── U4 = 1.2D + 1.0W + L + 0.5Lr ────────────────────────────────────────
    {
      id: 'u4',
      label: 'U4 = 1.2D + 1.0W + L + 0.5Lr',
      description:
        'U4 = 1.2D + 1.0W + L + 0.5Lr. Wind (W) as the primary variable action. Critical for lateral frame design — wind creates combined gravity + overturning. Governs windward columns in tension.',
      codeCitation: 'NSCP 2015 Section 203.3',
      duration: 1800,
      geometry: [
        // Frame
        { id: 'col-left', type: 'box', args: [0.15, 3, 0.15], position: [-1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'col-right', type: 'box', args: [0.15, 3, 0.15], position: [1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'beam', type: 'box', args: [2.15, 0.25, 0.3], position: [0, 3.0, 0], color: '#64748b' },
        { id: 'slab', type: 'box', args: [2.15, 0.15, 1.0], position: [0, 3.25, 0], color: '#94a3b8' },
        { id: 'base', type: 'box', args: [2.8, 0.1, 1.2], position: [0, 0, 0], color: '#d4d4d8' },
        // Gravity loads (dead + live + roof live)
        { id: 'd-arrow', type: 'cone', args: [0.07, 0.2, 8], position: [0, 3.62, 0], rotation: [Math.PI, 0, 0], color: '#71717a', label: '1.2D+L+0.5Lr' },
        { id: 'd-shaft', type: 'box', args: [0.03, 0.25, 0.03], position: [0, 3.85, 0], color: '#71717a' },
        // Wind load (cyan, large horizontal arrow)
        { id: 'w-arrow', type: 'cone', args: [0.14, 0.4, 8], position: [-1.3, 2.0, 0], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4', label: '1.0W' },
        { id: 'w-shaft', type: 'box', args: [0.5, 0.05, 0.05], position: [-1.85, 2.0, 0], color: '#06b6d4' },
        { id: 'w-arrow2', type: 'cone', args: [0.1, 0.3, 8], position: [-1.3, 1.0, 0], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'w-shaft2', type: 'box', args: [0.4, 0.04, 0.04], position: [-1.8, 1.0, 0], color: '#06b6d4' },
        // Frame deflecting (lateral shift indicator)
        { id: 'drift-arrow', type: 'cone', args: [0.06, 0.18, 8], position: [0, 3.45, 0], rotation: [0, 0, -Math.PI / 2], color: '#D4951A', label: 'Drift' },
      ],
    },

    // ── U5 = 1.2D + 1.0E + L ────────────────────────────────────────────────
    {
      id: 'u5',
      label: 'U5 = 1.2D + 1.0E + L (Seismic)',
      description:
        'U5 = 1.2D + 1.0E + L. Seismic (E) as primary lateral load. The seismic force E = ρQE ± 0.2SDS·D includes both horizontal and vertical seismic components. Critical for column and shear wall design in high-seismic zones.',
      codeCitation: 'NSCP 2015 Section 208 Earthquake Loads',
      duration: 1800,
      geometry: [
        // Frame
        { id: 'col-left', type: 'box', args: [0.15, 3, 0.15], position: [-1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'col-right', type: 'box', args: [0.15, 3, 0.15], position: [1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'beam', type: 'box', args: [2.15, 0.25, 0.3], position: [0, 3.0, 0], color: '#64748b' },
        { id: 'slab', type: 'box', args: [2.15, 0.15, 1.0], position: [0, 3.25, 0], color: '#94a3b8' },
        { id: 'base', type: 'box', args: [2.8, 0.1, 1.2], position: [0, 0, 0], color: '#d4d4d8' },
        // Gravity (dead + live)
        { id: 'd-arrow', type: 'cone', args: [0.07, 0.2, 8], position: [0.3, 3.62, 0], rotation: [Math.PI, 0, 0], color: '#71717a', label: '1.2D+L' },
        { id: 'd-shaft', type: 'box', args: [0.03, 0.25, 0.03], position: [0.3, 3.85, 0], color: '#71717a' },
        // Seismic arrows — horizontal at each story (red, bidirectional)
        { id: 'e1-arrow', type: 'cone', args: [0.13, 0.38, 8], position: [-1.3, 3.0, 0], rotation: [0, 0, -Math.PI / 2], color: '#D64545', label: '1.0E' },
        { id: 'e1-shaft', type: 'box', args: [0.45, 0.05, 0.05], position: [-1.75, 3.0, 0], color: '#D64545' },
        { id: 'e2-arrow', type: 'cone', args: [0.1, 0.28, 8], position: [-1.3, 1.5, 0], rotation: [0, 0, -Math.PI / 2], color: '#D64545' },
        { id: 'e2-shaft', type: 'box', args: [0.35, 0.04, 0.04], position: [-1.7, 1.5, 0], color: '#D64545' },
        // Vertical seismic component indicator
        { id: 'ev-arrow', type: 'cone', args: [0.07, 0.2, 8], position: [-0.4, 3.62, 0], rotation: [Math.PI, 0, 0], color: '#f97316', label: '±0.2SDS·D' },
        { id: 'ev-shaft', type: 'box', args: [0.03, 0.25, 0.03], position: [-0.4, 3.85, 0], color: '#f97316' },
        // Shear wall indicator
        { id: 'shear-wall', type: 'box', args: [0.25, 3.0, 0.6], position: [-1.0, 1.5, -0.4], color: '#D64545', opacity: 0.3, transparent: true, label: 'Shear Wall' },
      ],
    },

    // ── U6 = 0.9D + 1.0W ────────────────────────────────────────────────────
    {
      id: 'u6',
      label: 'U6 = 0.9D + 1.0W (Uplift Check)',
      description:
        'U6 = 0.9D + 1.0W. The minimum dead load (0.9D) combined with wind uplift (W) checks for net tension in columns and overturning of the structure. Governs anchor bolt design and foundation uplift.',
      codeCitation: 'NSCP 2015 Section 203.3',
      duration: 1800,
      geometry: [
        // Frame
        { id: 'col-left', type: 'box', args: [0.15, 3, 0.15], position: [-1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'col-right', type: 'box', args: [0.15, 3, 0.15], position: [1.0, 1.5, 0], color: '#94a3b8' },
        { id: 'beam', type: 'box', args: [2.15, 0.25, 0.3], position: [0, 3.0, 0], color: '#64748b' },
        { id: 'slab', type: 'box', args: [2.15, 0.15, 1.0], position: [0, 3.25, 0], color: '#94a3b8' },
        { id: 'base', type: 'box', args: [2.8, 0.1, 1.2], position: [0, 0, 0], color: '#d4d4d8' },
        // Dead load (small — only 0.9×)
        { id: 'd-arrow', type: 'cone', args: [0.07, 0.18, 8], position: [0, 3.6, 0], rotation: [Math.PI, 0, 0], color: '#71717a', label: '0.9D' },
        { id: 'd-shaft', type: 'box', args: [0.03, 0.22, 0.03], position: [0, 3.82, 0], color: '#71717a' },
        // Wind uplift arrows (upward on roof — cyan pointing up)
        { id: 'w-uplift1', type: 'cone', args: [0.09, 0.25, 8], position: [-0.6, 3.6, 0], rotation: [0, 0, 0], color: '#06b6d4', label: 'Wind uplift' },
        { id: 'wu1-shaft', type: 'box', args: [0.03, 0.3, 0.03], position: [-0.6, 3.35, 0], color: '#06b6d4' },
        { id: 'w-uplift2', type: 'cone', args: [0.09, 0.25, 8], position: [0.6, 3.6, 0], rotation: [0, 0, 0], color: '#06b6d4' },
        { id: 'wu2-shaft', type: 'box', args: [0.03, 0.3, 0.03], position: [0.6, 3.35, 0], color: '#06b6d4' },
        // Wind lateral (horizontal)
        { id: 'wl-arrow', type: 'cone', args: [0.11, 0.32, 8], position: [-1.3, 2.2, 0], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'wl-shaft', type: 'box', args: [0.42, 0.05, 0.05], position: [-1.75, 2.2, 0], color: '#06b6d4' },
        // Tension indicator at leeward column base
        { id: 'tension', type: 'cone', args: [0.08, 0.22, 8], position: [1.0, -0.2, 0], rotation: [0, 0, 0], color: '#D64545', label: 'Column tension' },
        { id: 'tension-shaft', type: 'box', args: [0.03, 0.28, 0.03], position: [1.0, -0.45, 0], color: '#D64545' },
      ],
    },
  ],
}
