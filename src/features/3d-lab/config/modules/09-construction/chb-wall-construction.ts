// src/app/dashboard/3d-lab/_config/modules/chb-wall-construction.ts
// CHB Wall Construction Sequence — Construction
// ─────────────────────────────────────────────────────────────────────────────
// Layout → dry first course → mortar bed → running bond → vertical rebar → grout → lintels → plastering.

import type { AnimatedSequenceConfig } from '@/features/3d-lab/types/templates'

export const chbWallConstructionConfig: AnimatedSequenceConfig = {
  id: 'chb-wall-construction',
  title: 'CHB Wall Construction Sequence',
  description:
    'Step-by-step construction of a Concrete Hollow Block (CHB) masonry wall: layout and dry first course, mortar bed (10mm), running bond pattern, vertical rebar insertion, grouting every 5 courses, lintel beam, and cement plaster finish.',
  subject: 'construction',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [3, 2.5, 3.5], target: [0, 1.0, 0], fov: 45 },
  steps: [
    // ── Step 1: Layout & Dry First Course ────────────────────────────────────
    {
      id: 'layout-dry',
      label: 'Step 1 — Layout & Dry First Course',
      description:
        'Chalk lines establish wall alignment on the floor slab. CHB units are laid dry (no mortar) to check spacing, door/window openings, and joint alignment. Standard CHB: 100mm × 200mm × 400mm. Adjust block spacing to avoid slivers.',
      codeCitation: 'NSCP 2015 Section 706 — Masonry Walls, Laying Procedure',
      duration: 1800,
      geometry: [
        // Floor slab
        { id: 'floor', type: 'box', args: [4.5, 0.12, 1.2], position: [0, 0.06, 0], color: '#d4d4d8' },
        // Chalk lines
        { id: 'chalk-l', type: 'box', args: [4.2, 0.003, 0.003], position: [0, 0.13, -0.5], color: '#ffffff', label: 'Chalk line' },
        { id: 'chalk-r', type: 'box', args: [4.2, 0.003, 0.003], position: [0, 0.13, 0.5], color: '#ffffff' },
        // Dry CHB first course (7 blocks, no mortar — slightly spaced)
        { id: 'blk-d1', type: 'box', args: [0.4, 0.2, 0.2], position: [-1.8, 0.22, 0], color: '#a1a1aa', label: 'CHB dry-laid' },
        { id: 'blk-d2', type: 'box', args: [0.4, 0.2, 0.2], position: [-1.38, 0.22, 0], color: '#a1a1aa' },
        { id: 'blk-d3', type: 'box', args: [0.4, 0.2, 0.2], position: [-0.96, 0.22, 0], color: '#a1a1aa' },
        { id: 'blk-d4', type: 'box', args: [0.4, 0.2, 0.2], position: [-0.54, 0.22, 0], color: '#a1a1aa' },
        { id: 'blk-d5', type: 'box', args: [0.4, 0.2, 0.2], position: [-0.12, 0.22, 0], color: '#a1a1aa' },
        { id: 'blk-d6', type: 'box', args: [0.4, 0.2, 0.2], position: [0.3, 0.22, 0], color: '#a1a1aa' },
        { id: 'blk-d7', type: 'box', args: [0.4, 0.2, 0.2], position: [0.72, 0.22, 0], color: '#a1a1aa' },
        // CHB hollow core indicator
        { id: 'core-1', type: 'box', args: [0.14, 0.15, 0.12], position: [-1.8, 0.22, 0], color: '#71717a', opacity: 0.4, transparent: true },
        { id: 'core-2', type: 'box', args: [0.14, 0.15, 0.12], position: [-1.38, 0.22, 0], color: '#71717a', opacity: 0.4, transparent: true },
        // Corner gauge / story pole
        { id: 'story-pole', type: 'cylinder', args: [0.025, 0.025, 2.8, 8], position: [-2.2, 1.4, -0.55], color: '#fbbf24', label: 'Story pole' },
        { id: 'mark-1', type: 'box', args: [0.15, 0.005, 0.005], position: [-2.12, 0.22, -0.55], color: '#fbbf24' },
        { id: 'mark-2', type: 'box', args: [0.15, 0.005, 0.005], position: [-2.12, 0.43, -0.55], color: '#fbbf24' },
      ],
    },

    // ── Step 2: Mortar Bed & First Course ────────────────────────────────────
    {
      id: 'mortar-first-course',
      label: 'Step 2 — Mortar Bed & First Course (Laid)',
      description:
        'Full mortar bed (10mm thick) spread on floor. First course laid, tapped level and plumb. Mortar: 1 part Portland cement : 3 parts sand. Head joints (vertical) fully buttered. First course is most critical — governs wall plumb.',
      codeCitation: 'NSCP 2015 Section 706.3 — Mortar Joint Thickness (10mm)',
      duration: 1800,
      geometry: [
        // Floor slab
        { id: 'floor', type: 'box', args: [4.5, 0.12, 1.2], position: [0, 0.06, 0], color: '#d4d4d8' },
        // Mortar bed layer
        { id: 'mortar-bed', type: 'box', args: [4.0, 0.01, 0.22], position: [0, 0.125, 0], color: '#d4a853', label: 'Mortar bed 10mm' },
        // 7 CHB blocks with mortar joints (properly bedded)
        { id: 'blk-1', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.8, 0.238, 0], color: '#94a3b8', label: 'CHB 400×200×100' },
        { id: 'blk-2', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.39, 0.238, 0], color: '#94a3b8' },
        { id: 'blk-3', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.98, 0.238, 0], color: '#94a3b8' },
        { id: 'blk-4', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.57, 0.238, 0], color: '#94a3b8' },
        { id: 'blk-5', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.16, 0.238, 0], color: '#94a3b8' },
        { id: 'blk-6', type: 'box', args: [0.39, 0.195, 0.19], position: [0.25, 0.238, 0], color: '#94a3b8' },
        { id: 'blk-7', type: 'box', args: [0.39, 0.195, 0.19], position: [0.66, 0.238, 0], color: '#94a3b8' },
        // Mortar trowel
        { id: 'trowel', type: 'box', args: [0.25, 0.02, 0.1], position: [1.3, 0.25, 0.3], rotation: [0, Math.PI / 8, 0], color: '#475569', label: 'Masons trowel' },
        // Level tool
        { id: 'level', type: 'box', args: [0.9, 0.04, 0.04], position: [-0.8, 0.36, -0.15], color: '#374151', label: "Spirit level — 'plumb & level'" },
      ],
    },

    // ── Step 3: Running Bond & Rebar ─────────────────────────────────────────
    {
      id: 'running-bond-rebar',
      label: 'Step 3 — Running Bond & Vertical Rebar',
      description:
        'Running bond pattern: each course offset by half a block (200mm) from the course below. Vertical reinforcing bars (10mm or 12mm dia.) are threaded through hollow cores at max 600mm centres. Bars tied to horizontal starters from the footing or floor slab.',
      codeCitation: 'NSCP 2015 Section 706.6 — Vertical Reinforcement in Masonry',
      duration: 2000,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [4.5, 0.12, 1.2], position: [0, 0.06, 0], color: '#d4d4d8' },
        // Course 1 (running bond — offset 0)
        { id: 'c1-b1', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.8, 0.238, 0], color: '#94a3b8' },
        { id: 'c1-b2', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.39, 0.238, 0], color: '#94a3b8' },
        { id: 'c1-b3', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.98, 0.238, 0], color: '#94a3b8' },
        { id: 'c1-b4', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.57, 0.238, 0], color: '#94a3b8' },
        { id: 'c1-b5', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.16, 0.238, 0], color: '#94a3b8' },
        // Course 2 (offset +200mm)
        { id: 'c2-b1', type: 'box', args: [0.39, 0.195, 0.19], position: [-2.0, 0.448, 0], color: '#a1a1aa', label: 'Running bond offset' },
        { id: 'c2-b2', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.59, 0.448, 0], color: '#a1a1aa' },
        { id: 'c2-b3', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.18, 0.448, 0], color: '#a1a1aa' },
        { id: 'c2-b4', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.77, 0.448, 0], color: '#a1a1aa' },
        { id: 'c2-b5', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.36, 0.448, 0], color: '#a1a1aa' },
        // Course 3
        { id: 'c3-b1', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.8, 0.658, 0], color: '#94a3b8' },
        { id: 'c3-b2', type: 'box', args: [0.39, 0.195, 0.19], position: [-1.39, 0.658, 0], color: '#94a3b8' },
        { id: 'c3-b3', type: 'box', args: [0.39, 0.195, 0.19], position: [-0.98, 0.658, 0], color: '#94a3b8' },
        // Vertical rebar in cores
        { id: 'vbar-1', type: 'cylinder', args: [0.018, 0.018, 0.75, 8], position: [-1.8, 0.495, 0], color: '#D64545', label: 'Vertical rebar @600mm' },
        { id: 'vbar-2', type: 'cylinder', args: [0.018, 0.018, 0.75, 8], position: [-1.19, 0.495, 0], color: '#D64545' },
        { id: 'vbar-3', type: 'cylinder', args: [0.018, 0.018, 0.75, 8], position: [-0.58, 0.495, 0], color: '#D64545' },
      ],
    },

    // ── Step 4: Grouting, Lintel & Plaster ───────────────────────────────────
    {
      id: 'grout-lintel-plaster',
      label: 'Step 4 — Grout, Lintel Beam & Plaster',
      description:
        'Cores with vertical rebar are grouted every 5 courses (high-slump grout, rodded or vibrated). Lintel beam poured at door/window head: minimum 2-T12 bars, 200mm bearing each side. Cement plaster (1:3) applied after wall cures: 12mm scratch coat + 8mm finish coat.',
      codeCitation: 'NSCP 2015 Section 706.8 — Grouting of Masonry; Section 707 — Lintels',
      duration: 2200,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [4.5, 0.12, 1.2], position: [0, 0.06, 0], color: '#d4d4d8' },
        // Full wall (5 courses)
        { id: 'wall-body', type: 'box', args: [3.5, 1.0, 0.2], position: [0, 0.62, 0], color: '#94a3b8', label: '5-course CHB wall' },
        // Grout fill in cores (highlight)
        { id: 'grout-1', type: 'cylinder', args: [0.04, 0.04, 1.0, 8], position: [-1.2, 0.62, 0], color: '#d4a853', label: 'Grout in cores' },
        { id: 'grout-2', type: 'cylinder', args: [0.04, 0.04, 1.0, 8], position: [-0.6, 0.62, 0], color: '#d4a853' },
        { id: 'grout-3', type: 'cylinder', args: [0.04, 0.04, 1.0, 8], position: [0, 0.62, 0], color: '#d4a853' },
        { id: 'grout-4', type: 'cylinder', args: [0.04, 0.04, 1.0, 8], position: [0.6, 0.62, 0], color: '#d4a853' },
        // Lintel beam over window opening
        { id: 'lintel', type: 'box', args: [1.4, 0.2, 0.22], position: [1.2, 1.22, 0], color: '#64748b', label: 'RC Lintel beam' },
        { id: 'lintel-bar-1', type: 'box', args: [1.35, 0.022, 0.022], position: [1.2, 1.15, -0.06], color: '#D64545', label: 'T12 lintel bar' },
        { id: 'lintel-bar-2', type: 'box', args: [1.35, 0.022, 0.022], position: [1.2, 1.15, 0.06], color: '#D64545' },
        // Plaster coat (outer face)
        { id: 'plaster-face', type: 'box', args: [3.5, 1.1, 0.02], position: [0, 0.62, 0.12], color: '#f5f5f4', opacity: 0.7, transparent: true, label: 'Cement plaster (20mm)' },
        // Window opening void
        { id: 'window-void', type: 'box', args: [0.9, 0.6, 0.25], position: [1.2, 0.82, 0], color: '#bfdbfe', opacity: 0.3, transparent: true, label: 'Window opening' },
        // Grout vibrator (tool)
        { id: 'grout-vib', type: 'cylinder', args: [0.018, 0.018, 0.5, 8], position: [-1.2, 1.1, 0], color: '#374151', label: 'Grout vibrator' },
      ],
    },
  ],
}

