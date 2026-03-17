// src/app/dashboard/3d-lab/_config/modules/smoke-control-systems.ts
// Smoke Control Systems — RA 9514
// ─────────────────────────────────────────────────────────────────────────────
// Stairwell pressurization, smoke partitions, sprinkler-vent downdraft method.

import type { AnimatedSequenceConfig } from '../../_types/templates'

export const smokeControlSystemsConfig: AnimatedSequenceConfig = {
  id: 'smoke-control-systems',
  title: 'Smoke Control Systems',
  description:
    'Animated visualization of smoke control strategies per RA 9514: stairwell pressurization, smoke barriers, and the sprinkler-vent method (91.5 m/min downdraft velocity).',
  subject: 'ra-9514',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [4, 3.5, 4], target: [0, 1, 0], fov: 45 },
  steps: [
    // ── Step 1: Fire Compartment (No Control) ───────────────────────────────
    {
      id: 'fire-compartment',
      label: 'Fire Compartment — Uncontrolled Smoke',
      description:
        'A fire in a floor compartment produces smoke that migrates through gaps, corridors, and vertical shafts without control measures. Smoke rises due to buoyancy and stack effect.',
      codeCitation: 'RA 9514 IRR Rule 11 §1101',
      duration: 1800,
      geometry: [
        // Floor slab
        { id: 'floor', type: 'box', args: [4, 0.1, 3], position: [0, 0, 0], color: '#94a3b8' },
        // Ceiling slab
        { id: 'ceiling', type: 'box', args: [4, 0.1, 3], position: [0, 2.5, 0], color: '#94a3b8' },
        // Left wall
        { id: 'wall-left', type: 'box', args: [0.15, 2.5, 3], position: [-2.0, 1.25, 0], color: '#a1a1aa' },
        // Right wall
        { id: 'wall-right', type: 'box', args: [0.15, 2.5, 3], position: [2.0, 1.25, 0], color: '#a1a1aa' },
        // Fire source
        { id: 'fire', type: 'cone', args: [0.2, 0.5, 8], position: [-0.8, 0.25, 0], color: '#f97316', label: 'Fire' },
        // Smoke cloud 1
        { id: 'smoke-1', type: 'sphere', args: [0.25, 8, 8], position: [-0.8, 0.8, 0], color: '#71717a', opacity: 0.5, transparent: true },
        // Smoke cloud 2
        { id: 'smoke-2', type: 'sphere', args: [0.35, 8, 8], position: [-0.4, 1.3, 0], color: '#52525b', opacity: 0.45, transparent: true },
        // Smoke spreading at ceiling
        { id: 'smoke-ceiling', type: 'box', args: [3.5, 0.35, 2.5], position: [0, 2.15, 0], color: '#52525b', opacity: 0.35, transparent: true, label: 'Smoke layer' },
        // Gap in partition (smoke migrating)
        { id: 'gap-arrow', type: 'cone', args: [0.07, 0.2, 8], position: [1.8, 1.8, 0], rotation: [0, 0, -Math.PI / 2], color: '#52525b' },
      ],
    },

    // ── Step 2: Smoke Barriers ───────────────────────────────────────────────
    {
      id: 'smoke-barriers',
      label: 'Smoke Barriers & Compartmentation',
      description:
        'Smoke barriers are 1-hour fire-rated assemblies extending from floor to deck above. Maximum smoke compartment area: 2,000 m². Smoke-resistant doors required at each barrier penetration.',
      codeCitation: 'RA 9514 IRR Rule 11 §1102',
      duration: 1800,
      geometry: [
        // Floor slab
        { id: 'floor', type: 'box', args: [4, 0.1, 3], position: [0, 0, 0], color: '#94a3b8' },
        // Ceiling slab
        { id: 'ceiling', type: 'box', args: [4, 0.1, 3], position: [0, 2.5, 0], color: '#94a3b8' },
        // Left wall
        { id: 'wall-left', type: 'box', args: [0.15, 2.5, 3], position: [-2.0, 1.25, 0], color: '#a1a1aa' },
        // Right wall
        { id: 'wall-right', type: 'box', args: [0.15, 2.5, 3], position: [2.0, 1.25, 0], color: '#a1a1aa' },
        // Smoke barrier partition (center)
        { id: 'barrier', type: 'box', args: [0.12, 2.5, 3], position: [0, 1.25, 0], color: '#dc2626', opacity: 0.8, transparent: true, label: '1-hr Smoke Barrier' },
        // Smoke door in barrier
        { id: 'smoke-door', type: 'box', args: [0.12, 2.1, 0.9], position: [0, 1.05, 0], color: '#b91c1c', label: 'Smoke Door' },
        // Fire source (left compartment)
        { id: 'fire', type: 'cone', args: [0.2, 0.5, 8], position: [-0.8, 0.25, 0], color: '#f97316', label: 'Fire' },
        // Smoke contained left side
        { id: 'smoke-left', type: 'box', args: [1.7, 0.45, 2.5], position: [-1.0, 2.2, 0], color: '#52525b', opacity: 0.4, transparent: true },
        // Right side clear
        { id: 'clear-right', type: 'box', args: [1.7, 0.45, 2.5], position: [1.0, 2.2, 0], color: '#bbf7d0', opacity: 0.2, transparent: true, label: 'Protected zone' },
        // Rating label
        { id: 'rating-marker', type: 'sphere', args: [0.08, 8, 8], position: [0, 2.7, 0], color: '#dc2626' },
      ],
    },

    // ── Step 3: Stairwell Pressurization ────────────────────────────────────
    {
      id: 'stairwell-pressurization',
      label: 'Stairwell Pressurization',
      description:
        'Mechanical fans inject outdoor air into the exit stairwell, creating a positive pressure differential (12.5–25 Pa) relative to the fire floor. Smoke cannot enter the pressurized stairwell, keeping the egress path tenable.',
      codeCitation: 'RA 9514 IRR Rule 11 §1104.2',
      duration: 2000,
      geometry: [
        // Stairwell shaft
        { id: 'shaft-wall-left', type: 'box', args: [0.15, 4, 1.5], position: [-0.75, 2, 0], color: '#64748b' },
        { id: 'shaft-wall-right', type: 'box', args: [0.15, 4, 1.5], position: [0.75, 2, 0], color: '#64748b' },
        { id: 'shaft-floor', type: 'box', args: [1.5, 0.1, 1.5], position: [0, 0, 0], color: '#94a3b8' },
        { id: 'shaft-top', type: 'box', args: [1.5, 0.1, 1.5], position: [0, 4, 0], color: '#94a3b8' },
        // Pressurization fan at top
        { id: 'fan', type: 'cylinder', args: [0.3, 0.3, 0.15, 12], position: [0, 4.15, 0], color: '#3b82f6', label: 'Supply Fan' },
        // Air injection arrows (downward into shaft)
        { id: 'air-1', type: 'cone', args: [0.07, 0.2, 8], position: [0, 3.5, 0], rotation: [Math.PI, 0, 0], color: '#93c5fd' },
        { id: 'air-2', type: 'cone', args: [0.07, 0.2, 8], position: [0, 2.5, 0], rotation: [Math.PI, 0, 0], color: '#93c5fd' },
        { id: 'air-3', type: 'cone', args: [0.07, 0.2, 8], position: [0, 1.5, 0], rotation: [Math.PI, 0, 0], color: '#93c5fd' },
        // Corridor on fire floor
        { id: 'corridor', type: 'box', args: [2.5, 2.5, 1.5], position: [2.0, 1.25, 0], color: '#a1a1aa', opacity: 0.3, transparent: true },
        // Smoke in corridor
        { id: 'corridor-smoke', type: 'box', args: [2.0, 0.6, 1.2], position: [2.0, 2.15, 0], color: '#52525b', opacity: 0.45, transparent: true },
        // Pressure differential arrow (smoke pushed back)
        { id: 'pressure-arrow', type: 'cone', args: [0.08, 0.25, 8], position: [1.1, 1.4, 0], rotation: [0, 0, Math.PI / 2], color: '#3b82f6', label: '+12.5 Pa' },
        // Stair door
        { id: 'stair-door', type: 'box', args: [0.12, 2.1, 0.85], position: [0.72, 1.05, 0], color: '#b91c1c' },
      ],
    },

    // ── Step 4: Sprinkler-Vent Downdraft Method ──────────────────────────────
    {
      id: 'sprinkler-vent',
      label: 'Sprinkler-Vent Downdraft Method',
      description:
        'Sprinkler activation triggers mechanical exhaust at the ceiling and supply air injection at low level. Required downdraft velocity: 91.5 m/min (1.52 m/s) across the opening, pushing smoke down and out.',
      codeCitation: 'RA 9514 IRR Rule 11 §1105.4 — Sprinkler-Vent Method',
      duration: 2000,
      geometry: [
        // Room enclosure
        { id: 'floor', type: 'box', args: [4, 0.1, 3], position: [0, 0, 0], color: '#94a3b8' },
        { id: 'ceiling', type: 'box', args: [4, 0.1, 3], position: [0, 3.0, 0], color: '#94a3b8' },
        { id: 'wall-left', type: 'box', args: [0.15, 3.0, 3], position: [-2.0, 1.5, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [0.15, 3.0, 3], position: [2.0, 1.5, 0], color: '#a1a1aa' },
        // Exhaust duct at ceiling
        { id: 'exhaust-duct', type: 'box', args: [0.5, 0.15, 0.5], position: [0, 3.15, 0], color: '#3b82f6', label: 'Exhaust' },
        // Supply duct at floor
        { id: 'supply-duct', type: 'box', args: [0.5, 0.15, 0.5], position: [-1.5, 0.05, 0], color: '#16a34a', label: 'Supply Air' },
        // Sprinkler heads
        { id: 'sprinkler-1', type: 'sphere', args: [0.06, 8, 8], position: [-0.8, 2.92, 0], color: '#dc2626' },
        { id: 'sprinkler-2', type: 'sphere', args: [0.06, 8, 8], position: [0.6, 2.92, 0], color: '#dc2626' },
        // Sprinkler spray
        { id: 'spray-1', type: 'cone', args: [0.25, 0.4, 8], position: [-0.8, 2.65, 0], rotation: [Math.PI, 0, 0], color: '#93c5fd', opacity: 0.6, transparent: true },
        // Fire source
        { id: 'fire', type: 'cone', args: [0.2, 0.45, 8], position: [0.5, 0.25, 0], color: '#f97316' },
        // Downward airflow arrows (91.5 m/min)
        { id: 'flow-1', type: 'cone', args: [0.07, 0.2, 8], position: [0, 2.5, 0], rotation: [Math.PI, 0, 0], color: '#60a5fa' },
        { id: 'flow-2', type: 'cone', args: [0.07, 0.2, 8], position: [0, 1.8, 0], rotation: [Math.PI, 0, 0], color: '#60a5fa' },
        // Exhaust arrow (up at ceiling)
        { id: 'exhaust-arrow', type: 'cone', args: [0.07, 0.2, 8], position: [0, 3.4, 0], rotation: [0, 0, 0], color: '#3b82f6' },
      ],
    },
  ],
}
