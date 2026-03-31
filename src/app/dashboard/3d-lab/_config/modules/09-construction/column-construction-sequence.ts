// src/app/dashboard/3d-lab/_config/modules/column-construction-sequence.ts
// Column Construction Sequence — Construction
// ─────────────────────────────────────────────────────────────────────────────
// Step-by-step: layout → vertical rebar → lateral ties → formwork → pour → cure → strip.

import type { AnimatedSequenceConfig } from '../../../_types/templates'

export const columnConstructionSequenceConfig: AnimatedSequenceConfig = {
  id: 'column-construction-sequence',
  title: 'Column Construction Sequence',
  description:
    'Step-by-step construction of a reinforced concrete column: layout and dowel positioning, vertical rebar placement, lateral tie installation, formwork assembly, concrete pour and consolidation, curing, and formwork stripping at 21 days.',
  subject: 'construction',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [2.5, 2.5, 2.5], target: [0, 1.2, 0], fov: 45 },
  steps: [
    // ── Step 1: Layout & Dowels ──────────────────────────────────────────────
    {
      id: 'layout',
      label: 'Step 1 — Layout & Starter Dowels',
      description:
        'Column centreline and corners are established using a theodolite and plumb line. Starter dowels (column bars extended from footing or previous pour) are cleaned and straightened. Minimum lap length: 40db per NSCP.',
      codeCitation: 'NSCP 2015 Section 425.5 — Development and Splice Lengths',
      duration: 1800,
      geometry: [
        // Footing (concrete base)
        { id: 'footing', type: 'box', args: [1.6, 0.4, 1.6], position: [0, 0.2, 0], color: '#94a3b8' },
        // Floor level reference slab
        { id: 'slab', type: 'box', args: [3, 0.12, 3], position: [0, 0.46, 0], color: '#d4d4d8', opacity: 0.7, transparent: true },
        // Column corner markers
        { id: 'mark-ne', type: 'cylinder', args: [0.04, 0.04, 0.3, 8], position: [0.25, 0.72, 0.25], color: '#fbbf24', label: 'Corner marker' },
        { id: 'mark-nw', type: 'cylinder', args: [0.04, 0.04, 0.3, 8], position: [-0.25, 0.72, 0.25], color: '#fbbf24' },
        { id: 'mark-se', type: 'cylinder', args: [0.04, 0.04, 0.3, 8], position: [0.25, 0.72, -0.25], color: '#fbbf24' },
        { id: 'mark-sw', type: 'cylinder', args: [0.04, 0.04, 0.3, 8], position: [-0.25, 0.72, -0.25], color: '#fbbf24' },
        // Starter dowels (4 corners)
        { id: 'dowel-ne', type: 'cylinder', args: [0.028, 0.028, 1.0, 8], position: [0.2, 1.08, 0.2], color: '#D64545', label: 'Starter dowels' },
        { id: 'dowel-nw', type: 'cylinder', args: [0.028, 0.028, 1.0, 8], position: [-0.2, 1.08, 0.2], color: '#D64545' },
        { id: 'dowel-se', type: 'cylinder', args: [0.028, 0.028, 1.0, 8], position: [0.2, 1.08, -0.2], color: '#D64545' },
        { id: 'dowel-sw', type: 'cylinder', args: [0.028, 0.028, 1.0, 8], position: [-0.2, 1.08, -0.2], color: '#D64545' },
        // Chalk line on floor
        { id: 'chalk-x', type: 'box', args: [0.6, 0.005, 0.01], position: [0, 0.47, 0], color: '#ffffff' },
        { id: 'chalk-z', type: 'box', args: [0.01, 0.005, 0.6], position: [0, 0.47, 0], color: '#ffffff' },
      ],
    },

    // ── Step 2: Vertical Rebar ───────────────────────────────────────────────
    {
      id: 'vertical-rebar',
      label: 'Step 2 — Vertical Rebar Installation',
      description:
        'Main vertical bars (longitudinal reinforcement) are placed at all four corners and intermediate positions. Minimum 4 bars, maximum bar spacing ≤ 150mm for tied columns. Cover: 40mm to tie face.',
      codeCitation: 'NSCP 2015 Section 425.7.2 — Column Longitudinal Reinforcement',
      duration: 1800,
      geometry: [
        // Footing
        { id: 'footing', type: 'box', args: [1.6, 0.4, 1.6], position: [0, 0.2, 0], color: '#94a3b8' },
        // Floor slab
        { id: 'slab', type: 'box', args: [3, 0.12, 3], position: [0, 0.46, 0], color: '#d4d4d8', opacity: 0.6, transparent: true },
        // 4 corner bars (full height)
        { id: 'bar-ne', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [0.2, 1.86, 0.2], color: '#D64545' },
        { id: 'bar-nw', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [-0.2, 1.86, 0.2], color: '#D64545' },
        { id: 'bar-se', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [0.2, 1.86, -0.2], color: '#D64545' },
        { id: 'bar-sw', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [-0.2, 1.86, -0.2], color: '#D64545' },
        // 4 intermediate bars (mid-face)
        { id: 'bar-n', type: 'cylinder', args: [0.022, 0.022, 2.8, 8], position: [0, 1.86, 0.2], color: '#ef4444' },
        { id: 'bar-s', type: 'cylinder', args: [0.022, 0.022, 2.8, 8], position: [0, 1.86, -0.2], color: '#ef4444' },
        { id: 'bar-e', type: 'cylinder', args: [0.022, 0.022, 2.8, 8], position: [0.2, 1.86, 0], color: '#ef4444' },
        { id: 'bar-w', type: 'cylinder', args: [0.022, 0.022, 2.8, 8], position: [-0.2, 1.86, 0], color: '#ef4444' },
        // Cover indicators
        { id: 'cover-n', type: 'box', args: [0.04, 0.005, 0.04], position: [0, 0.58, 0.28], color: '#fbbf24', label: '40mm cover' },
        { id: 'cover-e', type: 'box', args: [0.04, 0.005, 0.04], position: [0.28, 0.58, 0], color: '#fbbf24' },
      ],
    },

    // ── Step 3: Lateral Ties ─────────────────────────────────────────────────
    {
      id: 'lateral-ties',
      label: 'Step 3 — Lateral Tie Installation',
      description:
        'Lateral ties (stirrups) confine the concrete core and prevent bar buckling. Tie diameter: ≥ 10mm for bars ≤ 32mm. Maximum tie spacing = least of: 16db, 48 tie-bar diameters, least column dimension. Hooks: 135° with 6db extension.',
      codeCitation: 'NSCP 2015 Section 425.7.2.2 — Column Transverse Reinforcement',
      duration: 1800,
      geometry: [
        // Footing
        { id: 'footing', type: 'box', args: [1.6, 0.4, 1.6], position: [0, 0.2, 0], color: '#94a3b8' },
        // Vertical bars (same as step 2)
        { id: 'bar-ne', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [0.2, 1.86, 0.2], color: '#D64545' },
        { id: 'bar-nw', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [-0.2, 1.86, 0.2], color: '#D64545' },
        { id: 'bar-se', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [0.2, 1.86, -0.2], color: '#D64545' },
        { id: 'bar-sw', type: 'cylinder', args: [0.028, 0.028, 2.8, 8], position: [-0.2, 1.86, -0.2], color: '#D64545' },
        // Lateral ties — rectangular loops at spacing
        { id: 'tie-1', type: 'ring', args: [0.3, 0.33, 4, 1, 0, Math.PI * 2], position: [0, 0.9, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316', label: 'Lateral tie' },
        { id: 'tie-2', type: 'ring', args: [0.3, 0.33, 4, 1, 0, Math.PI * 2], position: [0, 1.4, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316' },
        { id: 'tie-3', type: 'ring', args: [0.3, 0.33, 4, 1, 0, Math.PI * 2], position: [0, 1.9, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316' },
        { id: 'tie-4', type: 'ring', args: [0.3, 0.33, 4, 1, 0, Math.PI * 2], position: [0, 2.4, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316' },
        // Tie spacing indicator
        { id: 'spacing', type: 'box', args: [0.005, 0.5, 0.005], position: [0.42, 1.15, 0], color: '#fbbf24', label: '≤ 150mm' },
      ],
    },

    // ── Step 4: Formwork ─────────────────────────────────────────────────────
    {
      id: 'formwork',
      label: 'Step 4 — Formwork Assembly',
      description:
        'Column forms (plywood or steel panels) are assembled around the rebar cage. Forms are plumbed with a level or plumb bob. Form ties and kickers resist lateral pressure from fresh concrete. Minimum form dimensions: column cross-section + cover.',
      codeCitation: 'ACI 347R — Guide to Formwork for Concrete',
      duration: 1800,
      geometry: [
        // Footing
        { id: 'footing', type: 'box', args: [1.6, 0.4, 1.6], position: [0, 0.2, 0], color: '#94a3b8' },
        // Rebar cage (simplified — visible through form)
        { id: 'bar-ne', type: 'cylinder', args: [0.025, 0.025, 2.8, 8], position: [0.2, 1.86, 0.2], color: '#D64545', opacity: 0.5, transparent: true },
        { id: 'bar-nw', type: 'cylinder', args: [0.025, 0.025, 2.8, 8], position: [-0.2, 1.86, 0.2], color: '#D64545', opacity: 0.5, transparent: true },
        { id: 'bar-se', type: 'cylinder', args: [0.025, 0.025, 2.8, 8], position: [0.2, 1.86, -0.2], color: '#D64545', opacity: 0.5, transparent: true },
        { id: 'bar-sw', type: 'cylinder', args: [0.025, 0.025, 2.8, 8], position: [-0.2, 1.86, -0.2], color: '#D64545', opacity: 0.5, transparent: true },
        // Formwork panels (4 sides — plywood yellow)
        { id: 'form-n', type: 'box', args: [0.72, 2.8, 0.018], position: [0, 1.86, 0.37], color: '#fbbf24', label: 'Formwork' },
        { id: 'form-s', type: 'box', args: [0.72, 2.8, 0.018], position: [0, 1.86, -0.37], color: '#fbbf24' },
        { id: 'form-e', type: 'box', args: [0.018, 2.8, 0.72], position: [0.37, 1.86, 0], color: '#fbbf24' },
        { id: 'form-w', type: 'box', args: [0.018, 2.8, 0.72], position: [-0.37, 1.86, 0], color: '#fbbf24' },
        // Form kickers / braces
        { id: 'kicker-1', type: 'box', args: [0.04, 0.9, 0.04], position: [0.65, 1.2, 0.37], rotation: [0, 0, Math.PI / 5], color: '#92400e', label: 'Form brace' },
        { id: 'kicker-2', type: 'box', args: [0.04, 0.9, 0.04], position: [-0.65, 1.2, -0.37], rotation: [0, 0, -Math.PI / 5], color: '#92400e' },
        // Plumb bob line
        { id: 'plumb', type: 'box', args: [0.005, 1.5, 0.005], position: [0.45, 1.5, 0.45], color: '#fbbf24' },
        { id: 'plumb-bob', type: 'sphere', args: [0.04, 8, 8], position: [0.45, 0.7, 0.45], color: '#fbbf24', label: 'Plumb bob' },
      ],
    },

    // ── Step 5: Pour & Cure → Strip ──────────────────────────────────────────
    {
      id: 'pour-cure-strip',
      label: 'Steps 5–7 — Pour, Cure & Strip',
      description:
        'Concrete is placed in 300mm lifts and consolidated with an internal vibrator. Curing compound or wet burlap applied immediately after pour. Forms stripped at 21 days minimum (28-day strength). Column surface exposed — ready for slab construction above.',
      codeCitation: 'NSCP 2015 Section 426.12 — Curing Requirements',
      duration: 2200,
      geometry: [
        // Footing
        { id: 'footing', type: 'box', args: [1.6, 0.4, 1.6], position: [0, 0.2, 0], color: '#94a3b8' },
        // Finished column (concrete)
        { id: 'column', type: 'box', args: [0.6, 2.85, 0.6], position: [0, 1.89, 0], color: '#94a3b8', label: 'Finished column' },
        // Rebar visible at column top (lap for next pour)
        { id: 'bar-ne-top', type: 'cylinder', args: [0.025, 0.025, 0.5, 8], position: [0.18, 3.57, 0.18], color: '#D64545', label: 'Lap bars' },
        { id: 'bar-nw-top', type: 'cylinder', args: [0.025, 0.025, 0.5, 8], position: [-0.18, 3.57, 0.18], color: '#D64545' },
        { id: 'bar-se-top', type: 'cylinder', args: [0.025, 0.025, 0.5, 8], position: [0.18, 3.57, -0.18], color: '#D64545' },
        { id: 'bar-sw-top', type: 'cylinder', args: [0.025, 0.025, 0.5, 8], position: [-0.18, 3.57, -0.18], color: '#D64545' },
        // Vibrator during pour (tool)
        { id: 'vibrator', type: 'cylinder', args: [0.04, 0.04, 0.6, 8], position: [0.05, 2.2, 0.05], color: '#374151', label: 'Immersion vibrator' },
        // Curing indicator (moisture on surface)
        { id: 'cure-coat', type: 'box', args: [0.62, 2.87, 0.62], position: [0, 1.89, 0], color: '#bfdbfe', opacity: 0.15, transparent: true, label: '21-day cure' },
        // Stripped form panels leaning against wall
        { id: 'form-stripped-1', type: 'box', args: [0.72, 2.8, 0.018], position: [1.2, 1.86, 0], rotation: [0, 0, Math.PI / 20], color: '#fbbf24', opacity: 0.7, transparent: true, label: 'Stripped form' },
        { id: 'form-stripped-2', type: 'box', args: [0.72, 2.8, 0.018], position: [1.4, 1.86, 0], rotation: [0, 0, Math.PI / 16], color: '#fbbf24', opacity: 0.7, transparent: true },
      ],
    },
  ],
}
