// src/app/dashboard/3d-lab/_config/modules/slab-construction-sequence.ts
// Slab Construction Sequence — Construction
// ─────────────────────────────────────────────────────────────────────────────
// Shoring → stringers → formply (18mm) → bottom rebar → bar chairs → top rebar → MEP sleeves → pour → cure → strip.

import type { AnimatedSequenceConfig } from '../../../_types/templates'

export const slabConstructionSequenceConfig: AnimatedSequenceConfig = {
  id: 'slab-construction-sequence',
  title: 'Slab Construction Sequence',
  description:
    'Step-by-step construction of a reinforced concrete floor slab: shoring and stringers, 18mm formply, bottom rebar (short span lower), bar chairs for 20–25mm cover, top rebar at supports, MEP sleeves, concrete pour, 7-day cure, and form stripping.',
  subject: 'construction',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [3, 3, 3], target: [0, 1, 0], fov: 48 },
  steps: [
    // ── Step 1: Shoring & Stringers ──────────────────────────────────────────
    {
      id: 'shoring-stringers',
      label: 'Step 1 — Shoring & Stringers',
      description:
        'Adjustable steel props at ≤ 1.5m centres support horizontal stringers (timber or steel beams). Stringers then support joists and formply. Shoring must carry self-weight of slab (typically 2.4–3.6 kPa wet), plus 1.5 kPa construction live load.',
      codeCitation: 'ACI 347R — Formwork Safety and Shoring Design',
      duration: 1800,
      geometry: [
        // Ground slab below
        { id: 'ground', type: 'box', args: [5, 0.15, 4], position: [0, -0.075, 0], color: '#d4d4d8' },
        // Props grid (9 props, 3×3)
        { id: 'p-00', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [-1.5, 1.4, -1.2], color: '#64748b', label: 'Adjustable prop' },
        { id: 'p-01', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [0, 1.4, -1.2], color: '#64748b' },
        { id: 'p-02', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [1.5, 1.4, -1.2], color: '#64748b' },
        { id: 'p-10', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [-1.5, 1.4, 0], color: '#64748b' },
        { id: 'p-11', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [0, 1.4, 0], color: '#64748b' },
        { id: 'p-12', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [1.5, 1.4, 0], color: '#64748b' },
        { id: 'p-20', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [-1.5, 1.4, 1.2], color: '#64748b' },
        { id: 'p-21', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [0, 1.4, 1.2], color: '#64748b' },
        { id: 'p-22', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [1.5, 1.4, 1.2], color: '#64748b' },
        // Stringers (X direction — 3 runs)
        { id: 'str-z-0', type: 'box', args: [3.2, 0.12, 0.12], position: [0, 2.77, -1.2], color: '#92400e', label: 'Stringer' },
        { id: 'str-z-1', type: 'box', args: [3.2, 0.12, 0.12], position: [0, 2.77, 0], color: '#92400e' },
        { id: 'str-z-2', type: 'box', args: [3.2, 0.12, 0.12], position: [0, 2.77, 1.2], color: '#92400e' },
        // Joists perpendicular (3 runs)
        { id: 'jst-x-0', type: 'box', args: [0.09, 0.09, 2.55], position: [-1.0, 2.87, 0], color: '#a16207' },
        { id: 'jst-x-1', type: 'box', args: [0.09, 0.09, 2.55], position: [0, 2.87, 0], color: '#a16207' },
        { id: 'jst-x-2', type: 'box', args: [0.09, 0.09, 2.55], position: [1.0, 2.87, 0], color: '#a16207' },
      ],
    },

    // ── Step 2: Formply & Bottom Rebar ───────────────────────────────────────
    {
      id: 'formply-rebar',
      label: 'Step 2 — Formply & Bottom Rebar',
      description:
        'Formply sheets (18mm) are laid on joists, joints staggered, edges sealed. Bottom rebar: short-span bars placed first (below long-span bars, keeping lower effective depth for critical direction). Bar chairs (20–25mm plastic) maintain cover.',
      codeCitation: 'NSCP 2015 Section 426 — Cover and Spacing of Slab Reinforcement',
      duration: 1800,
      geometry: [
        // Shoring (dimmed)
        { id: 'ground', type: 'box', args: [5, 0.15, 4], position: [0, -0.075, 0], color: '#d4d4d8' },
        { id: 'prop-rep', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [0, 1.4, 0], color: '#64748b', opacity: 0.4, transparent: true },
        // Formply (18mm)
        { id: 'formply', type: 'box', args: [3.5, 0.018, 2.8], position: [0, 2.94, 0], color: '#fbbf24', label: 'Formply 18mm' },
        // Bar chairs (grid pattern)
        { id: 'chair-00', type: 'box', args: [0.04, 0.022, 0.04], position: [-1.0, 2.961, -0.8], color: '#2D9F6F', label: 'Bar chair (25mm cover)' },
        { id: 'chair-01', type: 'box', args: [0.04, 0.022, 0.04], position: [0, 2.961, -0.8], color: '#2D9F6F' },
        { id: 'chair-02', type: 'box', args: [0.04, 0.022, 0.04], position: [1.0, 2.961, -0.8], color: '#2D9F6F' },
        { id: 'chair-10', type: 'box', args: [0.04, 0.022, 0.04], position: [-1.0, 2.961, 0], color: '#2D9F6F' },
        { id: 'chair-11', type: 'box', args: [0.04, 0.022, 0.04], position: [0, 2.961, 0], color: '#2D9F6F' },
        { id: 'chair-12', type: 'box', args: [0.04, 0.022, 0.04], position: [1.0, 2.961, 0.8], color: '#2D9F6F' },
        // Bottom short-span bars (Z direction — below)
        { id: 'bs-1', type: 'box', args: [0.02, 0.02, 2.7], position: [-1.0, 2.985, 0], color: '#D64545', label: 'Short-span bars (lower)' },
        { id: 'bs-2', type: 'box', args: [0.02, 0.02, 2.7], position: [-0.5, 2.985, 0], color: '#D64545' },
        { id: 'bs-3', type: 'box', args: [0.02, 0.02, 2.7], position: [0, 2.985, 0], color: '#D64545' },
        { id: 'bs-4', type: 'box', args: [0.02, 0.02, 2.7], position: [0.5, 2.985, 0], color: '#D64545' },
        { id: 'bs-5', type: 'box', args: [0.02, 0.02, 2.7], position: [1.0, 2.985, 0], color: '#D64545' },
        // Bottom long-span bars (X direction — above)
        { id: 'bl-1', type: 'box', args: [3.4, 0.02, 0.02], position: [0, 3.007, -0.8], color: '#ef4444', label: 'Long-span bars (upper)' },
        { id: 'bl-2', type: 'box', args: [3.4, 0.02, 0.02], position: [0, 3.007, 0], color: '#ef4444' },
        { id: 'bl-3', type: 'box', args: [3.4, 0.02, 0.02], position: [0, 3.007, 0.8], color: '#ef4444' },
      ],
    },

    // ── Step 3: MEP Sleeves & Top Rebar ──────────────────────────────────────
    {
      id: 'mep-top-rebar',
      label: 'Step 3 — MEP Sleeves & Top Rebar',
      description:
        'MEP (Mechanical, Electrical, Plumbing) sleeves (PVC or steel conduit) are placed and secured within the slab thickness. Top rebar is placed at support regions (negative moment zones). Top cover: 20mm for protected slabs.',
      codeCitation: 'NSCP 2015 Section 426.3 — Slab Minimum Cover',
      duration: 1800,
      geometry: [
        // Formply
        { id: 'formply', type: 'box', args: [3.5, 0.018, 2.8], position: [0, 2.94, 0], color: '#fbbf24', opacity: 0.7, transparent: true },
        // Bottom rebar (context)
        { id: 'bot-rebar', type: 'box', args: [3.4, 0.02, 2.7], position: [0, 2.995, 0], color: '#D64545', opacity: 0.3, transparent: true, label: 'Bottom rebar' },
        // MEP conduit sleeves (PVC)
        { id: 'sleeve-1', type: 'cylinder', args: [0.04, 0.04, 0.16, 8], position: [-0.5, 3.04, 0.3], color: '#f97316', label: 'PVC conduit sleeve' },
        { id: 'sleeve-2', type: 'cylinder', args: [0.04, 0.04, 0.16, 8], position: [0, 3.04, -0.3], color: '#f97316' },
        { id: 'sleeve-3', type: 'cylinder', args: [0.03, 0.03, 0.16, 8], position: [0.6, 3.04, 0.6], color: '#3b82f6', label: 'Water sleeve' },
        // Top rebar at support zones (X direction)
        { id: 'top-x-1', type: 'box', args: [1.0, 0.02, 0.02], position: [-1.2, 3.1, -1.0], color: '#7c3aed', label: 'Top bars (−M zone)' },
        { id: 'top-x-2', type: 'box', args: [1.0, 0.02, 0.02], position: [-1.2, 3.1, -0.5], color: '#7c3aed' },
        { id: 'top-x-3', type: 'box', args: [1.0, 0.02, 0.02], position: [1.2, 3.1, -1.0], color: '#7c3aed' },
        { id: 'top-x-4', type: 'box', args: [1.0, 0.02, 0.02], position: [1.2, 3.1, -0.5], color: '#7c3aed' },
        // Top bars Z direction at support
        { id: 'top-z-1', type: 'box', args: [0.02, 0.02, 1.0], position: [-1.4, 3.1, -0.75], color: '#6d28d9' },
        { id: 'top-z-2', type: 'box', args: [0.02, 0.02, 1.0], position: [1.4, 3.1, -0.75], color: '#6d28d9' },
        // Slab thickness indicator
        { id: 'thk-arrow', type: 'box', args: [0.005, 0.15, 0.005], position: [1.9, 3.04, 0], color: '#fbbf24', label: '150mm slab' },
      ],
    },

    // ── Step 4: Pour, Cure & Strip ───────────────────────────────────────────
    {
      id: 'pour-cure-strip',
      label: 'Step 4 — Pour, Cure & Strip',
      description:
        'Concrete is placed by pump or bucket at one end and spread by rakes. Strike-off and float finishing. Curing: wet burlap + poly sheet or curing compound for 7 days minimum. Formwork stripped after 7+ days. Re-shoring removed after full strength achieved.',
      codeCitation: 'NSCP 2015 Section 426.12.2 — Slab Shoring Removal (7-day min)',
      duration: 2200,
      geometry: [
        // Finished slab (concrete)
        { id: 'slab', type: 'box', args: [3.5, 0.15, 2.8], position: [0, 3.045, 0], color: '#94a3b8', label: 'Finished RC slab' },
        // Supporting beams at edges
        { id: 'beam-x1', type: 'box', args: [3.5, 0.4, 0.35], position: [0, 2.8, -1.5], color: '#64748b' },
        { id: 'beam-x2', type: 'box', args: [3.5, 0.4, 0.35], position: [0, 2.8, 1.5], color: '#64748b' },
        // Curing blanket
        { id: 'cure', type: 'box', args: [3.5, 0.02, 2.8], position: [0, 3.13, 0], color: '#bbf7d0', opacity: 0.55, transparent: true, label: '7-day wet cure' },
        // Concrete pump hose
        { id: 'pump-hose', type: 'cylinder', args: [0.06, 0.06, 1.0, 8], position: [-2.0, 3.35, 0], rotation: [0, 0, Math.PI / 6], color: '#374151', label: 'Pump hose' },
        // Finishing float
        { id: 'float', type: 'box', args: [0.6, 0.04, 0.25], position: [0.5, 3.14, 0.5], color: '#475569', label: 'Float (bull float)' },
        // Stripped formply leaning
        { id: 'formply-strip', type: 'box', args: [3.5, 0.018, 2.8], position: [2.5, 2.0, 0], rotation: [0, 0, Math.PI / 8], color: '#fbbf24', opacity: 0.6, transparent: true, label: 'Stripped formply' },
        // Re-shoring below
        { id: 'reshoring', type: 'cylinder', args: [0.05, 0.05, 2.8, 8], position: [0, 1.4, 0], color: '#3b82f6', label: 'Re-shoring (keep until 28-day)' },
        // Ground
        { id: 'ground', type: 'box', args: [5, 0.15, 4], position: [0, -0.075, 0], color: '#d4d4d8' },
      ],
    },
  ],
}
