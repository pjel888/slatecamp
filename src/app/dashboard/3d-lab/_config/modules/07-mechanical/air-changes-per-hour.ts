// src/app/dashboard/3d-lab/_config/modules/air-changes-per-hour.ts
// Air Changes Per Hour (ACH) — PMEC
// ─────────────────────────────────────────────────────────────────────────────
// Room section animations showing airflow patterns by occupancy type.

import type { AnimatedSequenceConfig } from '../../../_types/templates'

export const airChangesPerHourConfig: AnimatedSequenceConfig = {
  id: 'air-changes-per-hour',
  title: 'Air Changes Per Hour (ACH)',
  description:
    'Animated cross-sections showing airflow patterns and required ACH by room type: offices (3 ACH), kitchens (10 ACH), and operating rooms (15–25 ACH). Higher ACH removes contaminants and maintains air quality.',
  subject: 'pmec',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [0, 2.5, 5], target: [0, 1.2, 0], fov: 45 },
  steps: [
    // ── Step 1: Office — 3 ACH ───────────────────────────────────────────────
    {
      id: 'office-ach',
      label: 'Office Space — 3 ACH',
      description:
        'Offices require a minimum of 3 air changes per hour per PMEC. Low contaminant load. Typical supply: ceiling diffuser, return: low sidewall. Gentle airflow pattern avoids drafts.',
      codeCitation: 'PMEC Table 403.3.1.1 — Minimum Ventilation Rates',
      duration: 1800,
      geometry: [
        // Room envelope
        { id: 'floor', type: 'box', args: [4, 0.08, 2.5], position: [0, 0, 0], color: '#d4d4d8' },
        { id: 'ceiling', type: 'box', args: [4, 0.08, 2.5], position: [0, 2.8, 0], color: '#e7e5e4' },
        { id: 'wall-left', type: 'box', args: [0.1, 2.8, 2.5], position: [-2.0, 1.4, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [0.1, 2.8, 2.5], position: [2.0, 1.4, 0], color: '#a1a1aa' },
        // Supply diffuser (ceiling center)
        { id: 'diffuser', type: 'box', args: [0.4, 0.04, 0.4], position: [0, 2.76, 0], color: '#3b82f6', label: 'Supply Diffuser' },
        // Return grille (low sidewall)
        { id: 'return', type: 'box', args: [0.35, 0.25, 0.06], position: [-1.95, 0.3, 0], color: '#64748b', label: 'Return Grille' },
        // Airflow arrows — gentle, sweeping pattern
        { id: 'flow-1', type: 'cone', args: [0.06, 0.18, 8], position: [0, 2.55, 0], rotation: [Math.PI, 0, 0], color: '#93c5fd' },
        { id: 'flow-2', type: 'cone', args: [0.06, 0.16, 8], position: [0.8, 2.3, 0], rotation: [Math.PI / 2 + 0.3, 0, 0], color: '#93c5fd' },
        { id: 'flow-3', type: 'cone', args: [0.06, 0.16, 8], position: [-0.8, 2.3, 0], rotation: [Math.PI / 2 + 0.3, 0, 0], color: '#93c5fd' },
        { id: 'flow-4', type: 'cone', args: [0.05, 0.14, 8], position: [-1.5, 0.6, 0], rotation: [0, 0, Math.PI / 2], color: '#93c5fd' },
        // Desk/occupant
        { id: 'desk', type: 'box', args: [1.0, 0.06, 0.6], position: [0.3, 0.8, 0], color: '#92400e' },
        // ACH indicator bar
        { id: 'ach-bar', type: 'box', args: [0.3, 0.12, 0.1], position: [1.7, 2.3, 0], color: '#3b82f6', label: '3 ACH' },
      ],
    },

    // ── Step 2: Kitchen — 10 ACH ─────────────────────────────────────────────
    {
      id: 'kitchen-ach',
      label: 'Commercial Kitchen — 10 ACH',
      description:
        'Commercial kitchens require 10 ACH minimum to remove heat, grease-laden vapors, and odors. Exhaust hood over cooking equipment captures contaminants at source. Makeup air supply replaces exhausted air.',
      codeCitation: 'PMEC Table 403.3.1.1 — Kitchen Exhaust Requirements',
      duration: 1800,
      geometry: [
        // Room envelope
        { id: 'floor', type: 'box', args: [4, 0.08, 2.5], position: [0, 0, 0], color: '#d4d4d8' },
        { id: 'ceiling', type: 'box', args: [4, 0.08, 2.5], position: [0, 2.8, 0], color: '#e7e5e4' },
        { id: 'wall-left', type: 'box', args: [0.1, 2.8, 2.5], position: [-2.0, 1.4, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [0.1, 2.8, 2.5], position: [2.0, 1.4, 0], color: '#a1a1aa' },
        // Cooking range
        { id: 'range', type: 'box', args: [1.0, 0.9, 0.7], position: [0.2, 0.45, 0], color: '#71717a' },
        // Exhaust hood
        { id: 'hood', type: 'box', args: [1.4, 0.2, 0.9], position: [0.2, 1.5, 0], color: '#64748b', label: 'Exhaust Hood' },
        { id: 'hood-duct', type: 'cylinder', args: [0.15, 0.15, 0.9, 8], position: [0.2, 2.15, 0], color: '#64748b' },
        // Exhaust arrows (upward into hood, strong)
        { id: 'ex-1', type: 'cone', args: [0.09, 0.25, 8], position: [-0.2, 1.1, 0], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'ex-2', type: 'cone', args: [0.09, 0.25, 8], position: [0.2, 1.1, 0], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'ex-3', type: 'cone', args: [0.09, 0.25, 8], position: [0.6, 1.1, 0], rotation: [0, 0, 0], color: '#f97316' },
        // Makeup air supply (side wall, high)
        { id: 'makeup', type: 'box', args: [0.35, 0.2, 0.06], position: [-1.95, 2.3, 0], color: '#3b82f6', label: 'Makeup Air' },
        { id: 'makeup-flow', type: 'cone', args: [0.07, 0.2, 8], position: [-1.7, 2.3, 0], rotation: [0, 0, -Math.PI / 2], color: '#93c5fd' },
        // High ACH indicator
        { id: 'ach-bar', type: 'box', args: [0.6, 0.12, 0.1], position: [1.5, 2.4, 0], color: '#f97316', label: '10 ACH' },
      ],
    },

    // ── Step 3: Operating Room — 15–25 ACH ──────────────────────────────────
    {
      id: 'or-ach',
      label: 'Operating Room — 15–25 ACH',
      description:
        'Operating rooms (OR) require 15–25 ACH with 100% outdoor air (no recirculation without HEPA filtration). Unidirectional (laminar) airflow over the surgical field maintains positive pressure and removes airborne pathogens.',
      codeCitation: 'ASHRAE 170 / DOH AO 2012-0012 — Ventilation of Health Care Facilities',
      duration: 2000,
      geometry: [
        // Room envelope
        { id: 'floor', type: 'box', args: [4, 0.08, 2.5], position: [0, 0, 0], color: '#d4d4d8' },
        { id: 'ceiling', type: 'box', args: [4, 0.08, 2.5], position: [0, 2.8, 0], color: '#f0f9ff' },
        { id: 'wall-left', type: 'box', args: [0.1, 2.8, 2.5], position: [-2.0, 1.4, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [0.1, 2.8, 2.5], position: [2.0, 1.4, 0], color: '#a1a1aa' },
        // HEPA supply plenum (large ceiling area)
        { id: 'hepa-plenum', type: 'box', args: [2.0, 0.1, 1.6], position: [0, 2.73, 0], color: '#3b82f6', opacity: 0.8, transparent: true, label: 'HEPA Laminar Supply' },
        // Operating table
        { id: 'or-table', type: 'box', args: [0.6, 0.8, 1.8], position: [0, 0.4, 0], color: '#c0c0c0' },
        // Laminar airflow arrows (uniform downward)
        { id: 'lam-1', type: 'cone', args: [0.07, 0.2, 8], position: [-0.8, 2.4, 0], rotation: [Math.PI, 0, 0], color: '#bfdbfe' },
        { id: 'lam-2', type: 'cone', args: [0.07, 0.2, 8], position: [-0.4, 2.4, 0], rotation: [Math.PI, 0, 0], color: '#bfdbfe' },
        { id: 'lam-3', type: 'cone', args: [0.07, 0.2, 8], position: [0, 2.4, 0], rotation: [Math.PI, 0, 0], color: '#bfdbfe' },
        { id: 'lam-4', type: 'cone', args: [0.07, 0.2, 8], position: [0.4, 2.4, 0], rotation: [Math.PI, 0, 0], color: '#bfdbfe' },
        { id: 'lam-5', type: 'cone', args: [0.07, 0.2, 8], position: [0.8, 2.4, 0], rotation: [Math.PI, 0, 0], color: '#bfdbfe' },
        // Return grilles at floor level
        { id: 'ret-left', type: 'box', args: [0.3, 0.2, 0.06], position: [-1.95, 0.1, 0], color: '#64748b', label: 'Return' },
        { id: 'ret-right', type: 'box', args: [0.3, 0.2, 0.06], position: [1.95, 0.1, 0], color: '#64748b' },
        // High ACH indicator
        { id: 'ach-bar', type: 'box', args: [0.9, 0.12, 0.1], position: [1.3, 2.5, 0], color: '#D64545', label: '15–25 ACH' },
      ],
    },

    // ── Step 4: Comparison Summary ───────────────────────────────────────────
    {
      id: 'comparison',
      label: 'ACH Comparison by Occupancy',
      description:
        'Summary: Office = 3 ACH (comfort ventilation), Kitchen = 10 ACH (process exhaust), OR = 15–25 ACH (infection control). Higher ACH requires larger ducts, more fan energy, and precise pressure control.',
      codeCitation: 'PMEC Table 403.3.1.1',
      duration: 2000,
      geometry: [
        // Base platform
        { id: 'base', type: 'box', args: [5, 0.06, 1.5], position: [0, 0, 0], color: '#d4d4d8' },
        // Office bar
        { id: 'bar-office', type: 'box', args: [0.6, 0.6, 0.5], position: [-1.8, 0.33, 0], color: '#3b82f6', label: 'Office: 3 ACH' },
        { id: 'office-label', type: 'sphere', args: [0.1, 8, 8], position: [-1.8, 0.7, 0], color: '#3b82f6' },
        // Kitchen bar
        { id: 'bar-kitchen', type: 'box', args: [0.6, 2.0, 0.5], position: [0, 1.03, 0], color: '#f97316', label: 'Kitchen: 10 ACH' },
        { id: 'kitchen-label', type: 'sphere', args: [0.1, 8, 8], position: [0, 2.1, 0], color: '#f97316' },
        // OR bar
        { id: 'bar-or', type: 'box', args: [0.6, 3.5, 0.5], position: [1.8, 1.78, 0], color: '#D64545', label: 'OR: 15–25 ACH' },
        { id: 'or-label', type: 'sphere', args: [0.1, 8, 8], position: [1.8, 3.6, 0], color: '#D64545' },
        // ACH axis line
        { id: 'axis', type: 'box', args: [5.0, 0.03, 0.03], position: [0, 0.08, 0], color: '#71717a' },
        // Axis markers
        { id: 'mark-5', type: 'sphere', args: [0.05, 6, 6], position: [-2.3, 0.08, 0], color: '#71717a' },
        { id: 'mark-10', type: 'sphere', args: [0.05, 6, 6], position: [0, 0.08, 0], color: '#71717a' },
        { id: 'mark-25', type: 'sphere', args: [0.05, 6, 6], position: [2.3, 0.08, 0], color: '#71717a' },
      ],
    },
  ],
}
