// src/app/dashboard/3d-lab/_config/modules/construction-sequence.ts
import type { AnimatedSequenceConfig } from '../../_types/templates'

/**
 * Construction Sequence — Foundation to Slab
 *
 * Demonstrates the full construction workflow of an RC building from
 * site preparation through slab pour, referencing NSCP 2015 and PD 1096.
 */
export const constructionSequenceConfig: AnimatedSequenceConfig = {
  id: 'construction-sequence',
  title: 'Construction Sequence',
  description:
    'Foundation-to-slab construction sequence for a reinforced concrete building — excavation, footing, column, and slab phases.',
  subject: 'Construction Technology',
  loop: false,
  autoPlaySpeed: 2000,
  camera: { position: [4, 4, 4], fov: 40 },
  steps: [
    // ── Step 1: Site Preparation & Excavation ─────────────────────────────
    {
      id: 'excavation',
      label: 'Site Preparation & Excavation',
      description: 'Excavation to design depth for the foundation system.',
      duration: 800,
      geometry: [
        // Ground plane
        { id: 'ground', type: 'box', args: [5, 0.08, 5], position: [0, 0, 0], color: '#a3734c' },
        // Excavation pit (darker inset)
        { id: 'pit', type: 'box', args: [2.5, 0.12, 2.5], position: [0, -0.1, 0], color: '#78350f' },
      ],
    },

    // ── Step 2: Lean Concrete (75mm) ──────────────────────────────────────
    {
      id: 'lean-concrete',
      label: 'Lean Concrete (75mm)',
      description: '75mm lean concrete leveling course placed at pit bottom.',
      duration: 600,
      geometry: [
        { id: 'lean-slab', type: 'box', args: [2.2, 0.075, 2.2], position: [0, -0.07, 0], color: '#d4d4d8' },
      ],
    },

    // ── Step 3: Footing Rebar Placement ───────────────────────────────────
    {
      id: 'footing-rebar',
      label: 'Footing Rebar Placement',
      description:
        'Bottom reinforcement grid placed with minimum 75mm cover against earth.',
      codeCitation: 'NSCP 2015 \u00A7420.6.1.3',
      duration: 800,
      geometry: [
        // Rebar in X direction
        { id: 'rb-x1', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0, 0.0, -0.6], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        { id: 'rb-x2', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0, 0.0, -0.3], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        { id: 'rb-x3', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0, 0.0, 0], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        { id: 'rb-x4', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0, 0.0, 0.3], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        { id: 'rb-x5', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0, 0.0, 0.6], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        // Rebar in Z direction
        { id: 'rb-z1', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [-0.6, 0.02, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'rb-z2', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [-0.3, 0.02, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'rb-z3', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0, 0.02, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'rb-z4', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0.3, 0.02, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'rb-z5', type: 'cylinder', args: [0.015, 0.015, 1.8, 8], position: [0.6, 0.02, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
      ],
    },

    // ── Step 4: Footing Formwork ──────────────────────────────────────────
    {
      id: 'footing-formwork',
      label: 'Footing Formwork',
      description:
        'Wooden formwork set to minimum footing thickness 250mm, depth 600mm.',
      codeCitation: 'PD 1096',
      duration: 600,
      geometry: [
        // 4 sides of formwork (thin brown boxes)
        { id: 'fw-front', type: 'box', args: [2.0, 0.6, 0.04], position: [0, 0.25, 1.0], color: '#a16207' },
        { id: 'fw-back', type: 'box', args: [2.0, 0.6, 0.04], position: [0, 0.25, -1.0], color: '#a16207' },
        { id: 'fw-left', type: 'box', args: [0.04, 0.6, 2.0], position: [-1.0, 0.25, 0], color: '#a16207' },
        { id: 'fw-right', type: 'box', args: [0.04, 0.6, 2.0], position: [1.0, 0.25, 0], color: '#a16207' },
      ],
    },

    // ── Step 5: Concrete Pour — Class A (1:2:4) ──────────────────────────
    {
      id: 'footing-pour',
      label: 'Concrete Pour \u2014 Class A (1:2:4)',
      description:
        'Class A concrete, 3,500 psi (24 MPa), 9 bags/m\u00B3 placed into footing formwork.',
      codeCitation: 'PD 1096 IRR',
      duration: 1000,
      geometry: [
        { id: 'ftg-concrete', type: 'box', args: [1.92, 0.55, 1.92], position: [0, 0.25, 0], color: '#a8a29e', opacity: 0.85, transparent: true },
      ],
    },

    // ── Step 6: Starter Bars & Curing ─────────────────────────────────────
    {
      id: 'starter-bars',
      label: 'Starter Bars & Curing',
      description:
        'Vertical starter bars protrude from footing for column lap splice. Cure for minimum 7 days.',
      duration: 800,
      geometry: [
        // 4 starter bars at column position (center)
        { id: 'starter-1', type: 'cylinder', args: [0.015, 0.015, 0.8, 8], position: [-0.08, 0.9, -0.08], color: '#D64545' },
        { id: 'starter-2', type: 'cylinder', args: [0.015, 0.015, 0.8, 8], position: [0.08, 0.9, -0.08], color: '#D64545' },
        { id: 'starter-3', type: 'cylinder', args: [0.015, 0.015, 0.8, 8], position: [-0.08, 0.9, 0.08], color: '#D64545' },
        { id: 'starter-4', type: 'cylinder', args: [0.015, 0.015, 0.8, 8], position: [0.08, 0.9, 0.08], color: '#D64545' },
      ],
    },

    // ── Step 7: Column Rebar & Ties ───────────────────────────────────────
    {
      id: 'column-rebar',
      label: 'Column Rebar & Ties',
      description:
        'Vertical bars tied to starters with lateral ties at 200mm spacing.',
      duration: 800,
      geometry: [
        // Extended vertical bars
        { id: 'col-bar-1', type: 'cylinder', args: [0.015, 0.015, 2.0, 8], position: [-0.08, 1.8, -0.08], color: '#D64545' },
        { id: 'col-bar-2', type: 'cylinder', args: [0.015, 0.015, 2.0, 8], position: [0.08, 1.8, -0.08], color: '#D64545' },
        { id: 'col-bar-3', type: 'cylinder', args: [0.015, 0.015, 2.0, 8], position: [-0.08, 1.8, 0.08], color: '#D64545' },
        { id: 'col-bar-4', type: 'cylinder', args: [0.015, 0.015, 2.0, 8], position: [0.08, 1.8, 0.08], color: '#D64545' },
        // Lateral ties (rings at intervals)
        { id: 'tie-1', type: 'ring', args: [0.09, 0.12, 16], position: [0, 1.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-2', type: 'ring', args: [0.09, 0.12, 16], position: [0, 1.2, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-3', type: 'ring', args: [0.09, 0.12, 16], position: [0, 1.4, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-4', type: 'ring', args: [0.09, 0.12, 16], position: [0, 1.6, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-5', type: 'ring', args: [0.09, 0.12, 16], position: [0, 1.8, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-6', type: 'ring', args: [0.09, 0.12, 16], position: [0, 2.0, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-7', type: 'ring', args: [0.09, 0.12, 16], position: [0, 2.2, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-8', type: 'ring', args: [0.09, 0.12, 16], position: [0, 2.4, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'tie-9', type: 'ring', args: [0.09, 0.12, 16], position: [0, 2.6, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
      ],
    },

    // ── Step 8: Column Formwork & Pour ────────────────────────────────────
    {
      id: 'column-pour',
      label: 'Column Formwork & Pour',
      description:
        'Column formwork set with 40mm minimum cover. Strip formwork at 21 days.',
      codeCitation: 'NSCP 2015 \u00A7420.6.1.1',
      duration: 800,
      geometry: [
        // Column concrete
        { id: 'col-concrete', type: 'box', args: [0.3, 2.0, 0.3], position: [0, 1.8, 0], color: '#a8a29e', opacity: 0.8, transparent: true },
      ],
    },

    // ── Step 9: Slab Formwork (Shoring) ───────────────────────────────────
    {
      id: 'slab-formwork',
      label: 'Slab Formwork (Shoring)',
      description:
        '18mm formply on stringers supported by shores/props.',
      duration: 800,
      geometry: [
        // Shore/props (vertical cylinders)
        { id: 'shore-1', type: 'cylinder', args: [0.02, 0.02, 2.5, 8], position: [-0.6, 1.6, -0.6], color: '#737373' },
        { id: 'shore-2', type: 'cylinder', args: [0.02, 0.02, 2.5, 8], position: [0.6, 1.6, -0.6], color: '#737373' },
        { id: 'shore-3', type: 'cylinder', args: [0.02, 0.02, 2.5, 8], position: [-0.6, 1.6, 0.6], color: '#737373' },
        { id: 'shore-4', type: 'cylinder', args: [0.02, 0.02, 2.5, 8], position: [0.6, 1.6, 0.6], color: '#737373' },
        // Stringers (horizontal beams)
        { id: 'stringer-1', type: 'box', args: [1.6, 0.05, 0.05], position: [0, 2.85, -0.6], color: '#a16207' },
        { id: 'stringer-2', type: 'box', args: [1.6, 0.05, 0.05], position: [0, 2.85, 0.6], color: '#a16207' },
        // Formply (thin horizontal board)
        { id: 'formply', type: 'box', args: [1.8, 0.018, 1.8], position: [0, 2.89, 0], color: '#ca8a04', opacity: 0.7, transparent: true },
      ],
    },

    // ── Step 10: Slab Reinforcement ───────────────────────────────────────
    {
      id: 'slab-rebar',
      label: 'Slab Reinforcement',
      description:
        'Bottom rebar (short span lower, long span upper) on bar chairs, plus top bars at supports. 20-25mm cover.',
      codeCitation: 'NSCP 2015 \u00A7420.6.1.1',
      duration: 1000,
      geometry: [
        // Bottom bars — short span (X direction, lower layer)
        { id: 'slab-bx1', type: 'cylinder', args: [0.012, 0.012, 1.6, 8], position: [0, 2.92, -0.5], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        { id: 'slab-bx2', type: 'cylinder', args: [0.012, 0.012, 1.6, 8], position: [0, 2.92, 0], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        { id: 'slab-bx3', type: 'cylinder', args: [0.012, 0.012, 1.6, 8], position: [0, 2.92, 0.5], rotation: [0, 0, Math.PI / 2], color: '#D64545' },
        // Bottom bars — long span (Z direction, upper layer)
        { id: 'slab-bz1', type: 'cylinder', args: [0.012, 0.012, 1.6, 8], position: [-0.5, 2.95, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'slab-bz2', type: 'cylinder', args: [0.012, 0.012, 1.6, 8], position: [0, 2.95, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        { id: 'slab-bz3', type: 'cylinder', args: [0.012, 0.012, 1.6, 8], position: [0.5, 2.95, 0], rotation: [Math.PI / 2, 0, 0], color: '#D64545' },
        // Bar chairs (small supports)
        { id: 'chair-1', type: 'box', args: [0.03, 0.03, 0.03], position: [-0.5, 2.91, -0.5], color: '#737373' },
        { id: 'chair-2', type: 'box', args: [0.03, 0.03, 0.03], position: [0.5, 2.91, -0.5], color: '#737373' },
        { id: 'chair-3', type: 'box', args: [0.03, 0.03, 0.03], position: [-0.5, 2.91, 0.5], color: '#737373' },
        { id: 'chair-4', type: 'box', args: [0.03, 0.03, 0.03], position: [0.5, 2.91, 0.5], color: '#737373' },
      ],
    },

    // ── Step 11: Slab Pour & Cure ─────────────────────────────────────────
    {
      id: 'slab-pour',
      label: 'Slab Pour & Cure',
      description:
        'Pour Class A concrete to design slab thickness. Cure 7 days minimum, strip forms at 7+ days.',
      duration: 800,
      geometry: [
        { id: 'slab-concrete', type: 'box', args: [1.8, 0.12, 1.8], position: [0, 2.97, 0], color: '#a8a29e', opacity: 0.85, transparent: true },
      ],
    },
  ],
}
