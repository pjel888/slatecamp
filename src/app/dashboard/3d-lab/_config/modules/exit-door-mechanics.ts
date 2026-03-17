// src/app/dashboard/3d-lab/_config/modules/exit-door-mechanics.ts
// Exit Door Mechanics — RA 9514 IRR Rule 10
// ─────────────────────────────────────────────────────────────────────────────
// Animated sequence showing exit door requirements: swing direction,
// clear width, panic hardware activation, and code compliance.

import type { AnimatedSequenceConfig } from '../../_types/templates'

export const exitDoorMechanicsConfig: AnimatedSequenceConfig = {
  id: 'exit-door-mechanics',
  title: 'Exit Door Mechanics',
  description:
    'Step-by-step animation of exit door requirements per RA 9514: swing direction (egress direction), minimum clear width, panic hardware operation, and door closer mechanism.',
  subject: 'ra-9514',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [3, 2.5, 3], fov: 40 },
  steps: [
    // ── Step 1: Door Assembly (Closed) ──────────────────────────────────────
    {
      id: 'door-closed',
      label: 'Door Assembly (Closed)',
      description:
        'Exit door in closed position. Standard exit door: min 860mm clear width (single leaf), min 2100mm height. Door frame includes stops, hinges, and threshold.',
      codeCitation: 'RA 9514 IRR Rule 10 §1008',
      duration: 1500,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [3, 0.05, 3], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Wall left of door
        { id: 'wall-left', type: 'box', args: [1.0, 2.4, 0.2], position: [-1.0, 1.2, 0], color: '#a1a1aa' },
        // Wall right of door
        { id: 'wall-right', type: 'box', args: [1.0, 2.4, 0.2], position: [1.0, 1.2, 0], color: '#a1a1aa' },
        // Wall above door (transom area)
        { id: 'wall-above', type: 'box', args: [1.0, 0.3, 0.2], position: [0, 2.25, 0], color: '#a1a1aa' },
        // Door leaf (closed — aligned with wall)
        { id: 'door-leaf', type: 'box', args: [0.9, 2.1, 0.045], position: [0, 1.05, 0], color: '#78716c' },
        // Door frame
        { id: 'frame-left', type: 'box', args: [0.05, 2.2, 0.22], position: [-0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-right', type: 'box', args: [0.05, 2.2, 0.22], position: [0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-top', type: 'box', args: [1.0, 0.05, 0.22], position: [0, 2.125, 0], color: '#57534e' },
        // Hinges (3 per door)
        { id: 'hinge-top', type: 'box', args: [0.04, 0.1, 0.03], position: [-0.44, 1.85, 0.02], color: '#374151' },
        { id: 'hinge-mid', type: 'box', args: [0.04, 0.1, 0.03], position: [-0.44, 1.05, 0.02], color: '#374151' },
        { id: 'hinge-bot', type: 'box', args: [0.04, 0.1, 0.03], position: [-0.44, 0.35, 0.02], color: '#374151' },
        // Panic bar (horizontal push bar)
        { id: 'panic-bar', type: 'box', args: [0.7, 0.04, 0.06], position: [0.05, 1.0, 0.05], color: '#dc2626' },
        // EXIT sign above
        { id: 'exit-sign', type: 'box', args: [0.3, 0.1, 0.03], position: [0, 2.5, 0], color: '#16a34a' },
        // Clear width indicator
        { id: 'width-line', type: 'box', args: [0.9, 0.005, 0.005], position: [0, 0.01, 0.3], color: '#3b82f6' },
      ],
    },

    // ── Step 2: Panic Bar Push ──────────────────────────────────────────────
    {
      id: 'panic-push',
      label: 'Panic Hardware Activation',
      description:
        'Panic hardware (push bar/crash bar) activates with body pressure — no twisting or key required. Required for doors serving >50 occupants. Single-motion release per RA 9514.',
      codeCitation: 'RA 9514 IRR Rule 10 §1008.1.10',
      duration: 1000,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [3, 0.05, 3], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Walls
        { id: 'wall-left', type: 'box', args: [1.0, 2.4, 0.2], position: [-1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [1.0, 2.4, 0.2], position: [1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-above', type: 'box', args: [1.0, 0.3, 0.2], position: [0, 2.25, 0], color: '#a1a1aa' },
        // Door (slightly ajar — 10°)
        { id: 'door-leaf', type: 'box', args: [0.9, 2.1, 0.045], position: [-0.05, 1.05, 0.15], rotation: [0, 0.17, 0], color: '#78716c' },
        // Frame
        { id: 'frame-left', type: 'box', args: [0.05, 2.2, 0.22], position: [-0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-right', type: 'box', args: [0.05, 2.2, 0.22], position: [0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-top', type: 'box', args: [1.0, 0.05, 0.22], position: [0, 2.125, 0], color: '#57534e' },
        // Panic bar (depressed — moved inward)
        { id: 'panic-bar', type: 'box', args: [0.7, 0.04, 0.06], position: [0, 1.0, 0.18], color: '#f97316', label: 'Push to release' },
        // Force arrow
        { id: 'force-arrow', type: 'cone', args: [0.06, 0.15, 8], position: [0, 1.0, 0.4], rotation: [Math.PI / 2, 0, 0], color: '#f97316' },
        // EXIT sign
        { id: 'exit-sign', type: 'box', args: [0.3, 0.1, 0.03], position: [0, 2.5, 0], color: '#16a34a' },
      ],
    },

    // ── Step 3: Door Swing (90°) ────────────────────────────────────────────
    {
      id: 'door-swing',
      label: 'Door Swing (Egress Direction)',
      description:
        'Exit doors must swing in the direction of egress (outward from the building). 90° swing required. Door must not reduce required corridor width by more than half when open.',
      codeCitation: 'RA 9514 IRR Rule 10 §1008.1.2',
      duration: 1500,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [3, 0.05, 3], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Walls
        { id: 'wall-left', type: 'box', args: [1.0, 2.4, 0.2], position: [-1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [1.0, 2.4, 0.2], position: [1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-above', type: 'box', args: [1.0, 0.3, 0.2], position: [0, 2.25, 0], color: '#a1a1aa' },
        // Door (fully open — 90°)
        { id: 'door-leaf', type: 'box', args: [0.045, 2.1, 0.9], position: [-0.475, 1.05, 0.55], color: '#78716c' },
        // Frame
        { id: 'frame-left', type: 'box', args: [0.05, 2.2, 0.22], position: [-0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-right', type: 'box', args: [0.05, 2.2, 0.22], position: [0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-top', type: 'box', args: [1.0, 0.05, 0.22], position: [0, 2.125, 0], color: '#57534e' },
        // Swing arc (quarter circle on floor)
        { id: 'swing-arc', type: 'cylinder', args: [0.9, 0.9, 0.005, 32, 1, 0, Math.PI / 2], position: [-0.45, 0.01, 0], rotation: [-Math.PI / 2, 0, 0], color: '#3b82f6', opacity: 0.3, transparent: true },
        // Direction arrow (egress direction)
        { id: 'egress-arrow', type: 'cone', args: [0.08, 0.2, 8], position: [0, 0.3, 1.0], rotation: [Math.PI / 2, 0, 0], color: '#16a34a', label: 'Egress direction →' },
        // EXIT sign
        { id: 'exit-sign', type: 'box', args: [0.3, 0.1, 0.03], position: [0, 2.5, 0], color: '#16a34a' },
      ],
    },

    // ── Step 4: Clear Width Measurement ─────────────────────────────────────
    {
      id: 'clear-width',
      label: 'Clear Width Measurement',
      description:
        'Clear width measured from face of door (90° open) to opposite stop. Minimum: 860mm (single leaf), 1220mm (double leaf for >50 occupants). Projection of door into corridor max 180mm when open.',
      codeCitation: 'RA 9514 IRR Rule 10 §1008.1.1',
      duration: 1500,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [3, 0.05, 3], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Walls
        { id: 'wall-left', type: 'box', args: [1.0, 2.4, 0.2], position: [-1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [1.0, 2.4, 0.2], position: [1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-above', type: 'box', args: [1.0, 0.3, 0.2], position: [0, 2.25, 0], color: '#a1a1aa' },
        // Door (90° open)
        { id: 'door-leaf', type: 'box', args: [0.045, 2.1, 0.9], position: [-0.475, 1.05, 0.55], color: '#78716c' },
        // Frame
        { id: 'frame-left', type: 'box', args: [0.05, 2.2, 0.22], position: [-0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-right', type: 'box', args: [0.05, 2.2, 0.22], position: [0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-top', type: 'box', args: [1.0, 0.05, 0.22], position: [0, 2.125, 0], color: '#57534e' },
        // Clear width measurement line
        { id: 'clear-width-line', type: 'box', args: [0.86, 0.008, 0.008], position: [0.02, 0.5, 0.15], color: '#2563eb', label: '860mm clear width' },
        // Left marker
        { id: 'cw-left', type: 'box', args: [0.008, 0.15, 0.008], position: [-0.41, 0.5, 0.15], color: '#2563eb' },
        // Right marker
        { id: 'cw-right', type: 'box', args: [0.008, 0.15, 0.008], position: [0.45, 0.5, 0.15], color: '#2563eb' },
        // EXIT sign
        { id: 'exit-sign', type: 'box', args: [0.3, 0.1, 0.03], position: [0, 2.5, 0], color: '#16a34a' },
      ],
    },

    // ── Step 5: Door Closer Return ──────────────────────────────────────────
    {
      id: 'door-closer',
      label: 'Self-Closing Mechanism',
      description:
        'All exit doors must be self-closing. Door closer returns door to fully closed and latched position. Maximum closing time: 5 seconds from full open. Fire doors must have listed closers.',
      codeCitation: 'RA 9514 IRR Rule 10 §1008.1.8',
      duration: 1500,
      geometry: [
        // Floor
        { id: 'floor', type: 'box', args: [3, 0.05, 3], position: [0, -0.025, 0], color: '#d4d4d8' },
        // Walls
        { id: 'wall-left', type: 'box', args: [1.0, 2.4, 0.2], position: [-1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [1.0, 2.4, 0.2], position: [1.0, 1.2, 0], color: '#a1a1aa' },
        { id: 'wall-above', type: 'box', args: [1.0, 0.3, 0.2], position: [0, 2.25, 0], color: '#a1a1aa' },
        // Door (partially closed — 30°)
        { id: 'door-leaf', type: 'box', args: [0.9, 2.1, 0.045], position: [-0.1, 1.05, 0.25], rotation: [0, 0.5, 0], color: '#78716c' },
        // Frame
        { id: 'frame-left', type: 'box', args: [0.05, 2.2, 0.22], position: [-0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-right', type: 'box', args: [0.05, 2.2, 0.22], position: [0.475, 1.1, 0], color: '#57534e' },
        { id: 'frame-top', type: 'box', args: [1.0, 0.05, 0.22], position: [0, 2.125, 0], color: '#57534e' },
        // Door closer (box at top of door)
        { id: 'closer-body', type: 'box', args: [0.25, 0.06, 0.06], position: [-0.2, 2.05, 0.06], color: '#374151', label: 'Door closer' },
        // Closer arm
        { id: 'closer-arm', type: 'box', args: [0.2, 0.02, 0.02], position: [-0.05, 2.05, 0.15], rotation: [0, 0.3, 0], color: '#374151' },
        // Return arrow
        { id: 'return-arrow', type: 'cone', args: [0.06, 0.15, 8], position: [0.2, 1.5, 0.3], rotation: [0, -Math.PI / 4, -Math.PI / 2], color: '#f97316' },
        // EXIT sign
        { id: 'exit-sign', type: 'box', args: [0.3, 0.1, 0.03], position: [0, 2.5, 0], color: '#16a34a' },
      ],
    },
  ],
}
