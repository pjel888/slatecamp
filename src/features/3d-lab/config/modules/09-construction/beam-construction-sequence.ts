// src/app/dashboard/3d-lab/_config/modules/beam-construction-sequence.ts
// Beam Construction Sequence — Construction
// ─────────────────────────────────────────────────────────────────────────────
// Shoring/props → bottom form → side form → bottom rebar → stirrups → top rebar → pour → strip.

import type { AnimatedSequenceConfig } from '@/features/3d-lab/types/templates'

export const beamConstructionSequenceConfig: AnimatedSequenceConfig = {
  id: 'beam-construction-sequence',
  title: 'Beam Construction Sequence',
  description:
    'Step-by-step construction of a reinforced concrete beam: shoring and props, bottom and side formwork, bottom tension rebar, stirrups at required spacing, top compression rebar, concrete pour and vibration, and formwork stripping.',
  subject: 'construction',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [3.5, 2, 2.5], target: [0, 0.5, 0], fov: 45 },
  steps: [
    // ── Step 1: Shoring & Props ──────────────────────────────────────────────
    {
      id: 'shoring',
      label: 'Step 1 — Shoring & Props',
      description:
        'Vertical props (tubular steel or timber) are placed at maximum 1.2m spacing to support beam formwork. Adjustable base plates allow precise leveling. Props must carry wet concrete load plus construction live load (2.4 kPa).',
      codeCitation: 'ACI 347R — Formwork for Concrete, Shoring Requirements',
      duration: 1800,
      geometry: [
        // Ground / floor
        { id: 'ground', type: 'box', args: [5, 0.1, 2], position: [0, -0.05, 0], color: '#d4d4d8' },
        // Props (tubular steel, 4 props)
        { id: 'prop-1', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [-1.5, 1.25, 0], color: '#64748b', label: 'Adjustable prop' },
        { id: 'prop-2', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [-0.5, 1.25, 0], color: '#64748b' },
        { id: 'prop-3', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [0.5, 1.25, 0], color: '#64748b' },
        { id: 'prop-4', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [1.5, 1.25, 0], color: '#64748b' },
        // Base plates
        { id: 'base-1', type: 'box', args: [0.2, 0.04, 0.2], position: [-1.5, 0.02, 0], color: '#475569' },
        { id: 'base-2', type: 'box', args: [0.2, 0.04, 0.2], position: [-0.5, 0.02, 0], color: '#475569' },
        { id: 'base-3', type: 'box', args: [0.2, 0.04, 0.2], position: [0.5, 0.02, 0], color: '#475569' },
        { id: 'base-4', type: 'box', args: [0.2, 0.04, 0.2], position: [1.5, 0.02, 0], color: '#475569' },
        // Stringers (longitudinal beams connecting props)
        { id: 'stringer', type: 'box', args: [3.2, 0.1, 0.1], position: [0, 2.48, 0], color: '#92400e', label: 'Stringer' },
        // Soldier beams at top of props
        { id: 'soldier-1', type: 'box', args: [0.1, 0.1, 0.1], position: [-1.5, 2.5, 0], color: '#7c3aed' },
        { id: 'soldier-2', type: 'box', args: [0.1, 0.1, 0.1], position: [1.5, 2.5, 0], color: '#7c3aed' },
        // Spacing indicator
        { id: 'spacing', type: 'box', args: [1.0, 0.005, 0.005], position: [-1.0, 0.15, 0], color: '#fbbf24', label: '1.2m max spacing' },
      ],
    },

    // ── Step 2: Bottom & Side Formwork ───────────────────────────────────────
    {
      id: 'formwork',
      label: 'Step 2 — Bottom & Side Formwork',
      description:
        'Bottom formwork (formply 18mm) is placed on stringers and leveled. Side forms are erected and waled with horizontal timber runners. Inside dimensions = beam width × depth. Chamfer strips at corners recommended.',
      codeCitation: 'ACI 347R — Beam Formwork Design',
      duration: 1800,
      geometry: [
        // Ground
        { id: 'ground', type: 'box', args: [5, 0.1, 2], position: [0, -0.05, 0], color: '#d4d4d8' },
        // Props (dimmed)
        { id: 'prop-1', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [-1.5, 1.25, 0], color: '#64748b', opacity: 0.5, transparent: true },
        { id: 'prop-2', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [-0.5, 1.25, 0], color: '#64748b', opacity: 0.5, transparent: true },
        { id: 'prop-3', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [0.5, 1.25, 0], color: '#64748b', opacity: 0.5, transparent: true },
        { id: 'prop-4', type: 'cylinder', args: [0.05, 0.05, 2.5, 8], position: [1.5, 1.25, 0], color: '#64748b', opacity: 0.5, transparent: true },
        // Stringer
        { id: 'stringer', type: 'box', args: [3.2, 0.1, 0.1], position: [0, 2.48, 0], color: '#92400e' },
        // Bottom form (formply)
        { id: 'form-bottom', type: 'box', args: [3.2, 0.018, 0.45], position: [0, 2.6, 0], color: '#fbbf24', label: 'Bottom form (18mm formply)' },
        // Side form left
        { id: 'form-left', type: 'box', args: [3.2, 0.55, 0.018], position: [0, 2.88, -0.23], color: '#fbbf24', label: 'Side form' },
        // Side form right
        { id: 'form-right', type: 'box', args: [3.2, 0.55, 0.018], position: [0, 2.88, 0.23], color: '#fbbf24' },
        // Wales (horizontal runners)
        { id: 'wale-l', type: 'box', args: [3.2, 0.08, 0.08], position: [0, 3.0, -0.28], color: '#92400e', label: 'Wale runner' },
        { id: 'wale-r', type: 'box', args: [3.2, 0.08, 0.08], position: [0, 3.0, 0.28], color: '#92400e' },
        // Interior space indicator
        { id: 'beam-void', type: 'box', args: [3.2, 0.5, 0.414], position: [0, 2.87, 0], color: '#bfdbfe', opacity: 0.2, transparent: true, label: 'Beam void' },
      ],
    },

    // ── Step 3: Bottom Rebar & Stirrups ──────────────────────────────────────
    {
      id: 'rebar-stirrups',
      label: 'Step 3 — Bottom Rebar & Stirrups',
      description:
        'Bottom tension bars are placed first (short span goes below long span at intersections). Bar chairs (plastic or concrete, 25mm clear cover) keep bars at correct position. Stirrups are then tied at calculated spacing — closer near supports, wider at midspan.',
      codeCitation: 'NSCP 2015 Section 409 — Beams, Shear Reinforcement',
      duration: 1800,
      geometry: [
        // Formwork (context)
        { id: 'form-bottom', type: 'box', args: [3.2, 0.018, 0.45], position: [0, 2.6, 0], color: '#fbbf24', opacity: 0.7, transparent: true },
        { id: 'form-left', type: 'box', args: [3.2, 0.55, 0.018], position: [0, 2.88, -0.23], color: '#fbbf24', opacity: 0.7, transparent: true },
        { id: 'form-right', type: 'box', args: [3.2, 0.55, 0.018], position: [0, 2.88, 0.23], color: '#fbbf24', opacity: 0.7, transparent: true },
        // Bar chairs
        { id: 'chair-1', type: 'box', args: [0.04, 0.025, 0.04], position: [-1.0, 2.63, 0], color: '#2D9F6F', label: 'Bar chair 25mm cover' },
        { id: 'chair-2', type: 'box', args: [0.04, 0.025, 0.04], position: [0, 2.63, 0], color: '#2D9F6F' },
        { id: 'chair-3', type: 'box', args: [0.04, 0.025, 0.04], position: [1.0, 2.63, 0], color: '#2D9F6F' },
        // Bottom tension bars (3 bars)
        { id: 'bot-bar-1', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 2.66, -0.12], color: '#D64545', label: 'Bottom tension bars' },
        { id: 'bot-bar-2', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 2.66, 0], color: '#D64545' },
        { id: 'bot-bar-3', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 2.66, 0.12], color: '#D64545' },
        // Stirrups — closer near ends (3 positions)
        { id: 'stir-end1', type: 'ring', args: [0.18, 0.2, 4, 1, 0, Math.PI * 2], position: [-1.4, 2.87, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316', label: 'Stirrups (close @supports)' },
        { id: 'stir-end2', type: 'ring', args: [0.18, 0.2, 4, 1, 0, Math.PI * 2], position: [-1.1, 2.87, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316' },
        { id: 'stir-mid', type: 'ring', args: [0.18, 0.2, 4, 1, 0, Math.PI * 2], position: [0, 2.87, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#fb923c', label: 'Stirrups (wider @midspan)' },
        { id: 'stir-end3', type: 'ring', args: [0.18, 0.2, 4, 1, 0, Math.PI * 2], position: [1.1, 2.87, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316' },
        { id: 'stir-end4', type: 'ring', args: [0.18, 0.2, 4, 1, 0, Math.PI * 2], position: [1.4, 2.87, 0], rotation: [Math.PI / 2, Math.PI / 4, 0], color: '#f97316' },
      ],
    },

    // ── Step 4: Top Rebar & Pour ─────────────────────────────────────────────
    {
      id: 'top-rebar-pour',
      label: 'Step 4 — Top Rebar, Pour & Strip',
      description:
        'Top compression bars and additional support bars (hanger bars) are tied. Concrete is placed by bucket or pump and consolidated with a 40mm internal vibrator. Formwork and props stripped after minimum 14 days (or when 70% f\'c achieved). Re-shoring required for slabs above.',
      codeCitation: 'NSCP 2015 Section 426.11 — Beam Formwork Removal',
      duration: 2200,
      geometry: [
        // Finished beam (concrete)
        { id: 'beam', type: 'box', args: [3.2, 0.5, 0.44], position: [0, 2.87, 0], color: '#94a3b8', label: 'Finished beam' },
        // Top rebar visible (pre-pour step)
        { id: 'top-bar-1', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 3.08, -0.15], color: '#D64545', label: 'Top compression bars' },
        { id: 'top-bar-2', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 3.08, 0.15], color: '#D64545' },
        // Hanger bars (2 corners)
        { id: 'hanger-1', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 3.08, -0.16], color: '#ef4444', opacity: 0.7, transparent: true },
        { id: 'hanger-2', type: 'box', args: [3.1, 0.025, 0.025], position: [0, 3.08, 0.16], color: '#ef4444', opacity: 0.7, transparent: true },
        // Props still in place
        { id: 'prop-1', type: 'cylinder', args: [0.05, 0.05, 2.6, 8], position: [-1.5, 1.3, 0], color: '#64748b' },
        { id: 'prop-4', type: 'cylinder', args: [0.05, 0.05, 2.6, 8], position: [1.5, 1.3, 0], color: '#64748b' },
        // Vibrator in beam during pour
        { id: 'vibrator', type: 'cylinder', args: [0.025, 0.025, 0.45, 8], position: [0.3, 2.88, 0], color: '#374151', label: '40mm vibrator' },
        // Stripped side forms (leaning)
        { id: 'form-strip', type: 'box', args: [3.2, 0.5, 0.018], position: [2.0, 2.7, 0.5], rotation: [Math.PI / 8, 0, 0], color: '#fbbf24', opacity: 0.7, transparent: true, label: 'Stripped form' },
        // Ground
        { id: 'ground', type: 'box', args: [5, 0.1, 2], position: [0, -0.05, 0], color: '#d4d4d8' },
      ],
    },
  ],
}

