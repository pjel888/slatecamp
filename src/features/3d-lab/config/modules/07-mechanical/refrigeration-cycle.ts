// src/features/3d-lab/config/modules/refrigeration-cycle.ts
// Refrigeration Cycle — PMEC
// ─────────────────────────────────────────────────────────────────────────────
// Compressor → condenser → expansion valve → evaporator vapor-compression loop.

import type { AnimatedSequenceConfig } from '@/features/3d-lab/types/templates'

export const refrigerationCycleConfig: AnimatedSequenceConfig = {
  id: 'refrigeration-cycle',
  title: 'Vapor-Compression Refrigeration Cycle',
  description:
    'The four stages of the vapor-compression refrigeration cycle: compression (low → high pressure), condensation (heat rejection), expansion (pressure drop), and evaporation (heat absorption / cooling effect).',
  subject: 'pmec',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [0, 2, 5.5], target: [0, 0.5, 0], fov: 45 },
  steps: [
    // ── Step 1: Full Cycle Overview ──────────────────────────────────────────
    {
      id: 'overview',
      label: 'System Overview — Four Components',
      description:
        'The vapor-compression refrigeration system consists of four main components arranged in a closed loop: Compressor (raises refrigerant pressure), Condenser (rejects heat outdoors), Expansion Valve (drops pressure), Evaporator (absorbs indoor heat).',
      duration: 2000,
      geometry: [
        // Base plate
        { id: 'base', type: 'box', args: [5, 0.06, 3], position: [0, 0, 0], color: '#e7e5e4' },
        // Compressor (bottom-left)
        { id: 'compressor', type: 'cylinder', args: [0.35, 0.35, 0.7, 12], position: [-1.5, 0.41, -0.6], color: '#64748b', label: 'Compressor' },
        { id: 'comp-motor', type: 'cylinder', args: [0.2, 0.2, 0.25, 8], position: [-1.5, 0.88, -0.6], color: '#475569' },
        // Condenser (top-right)
        { id: 'condenser', type: 'box', args: [1.0, 0.6, 0.6], position: [1.3, 0.37, -0.6], color: '#D64545', label: 'Condenser' },
        { id: 'cond-fins', type: 'box', args: [0.9, 0.5, 0.08], position: [1.3, 0.37, -0.32], color: '#ef4444', opacity: 0.7, transparent: true },
        // Expansion valve (top-left)
        { id: 'exp-valve', type: 'sphere', args: [0.18, 12, 12], position: [-1.5, 0.4, 0.7], color: '#D4951A', label: 'Expansion Valve' },
        // Evaporator (bottom-right)
        { id: 'evaporator', type: 'box', args: [1.0, 0.6, 0.6], position: [1.3, 0.37, 0.7], color: '#3b82f6', label: 'Evaporator' },
        { id: 'evap-fins', type: 'box', args: [0.9, 0.5, 0.08], position: [1.3, 0.37, 0.42], color: '#60a5fa', opacity: 0.7, transparent: true },
        // Connecting pipes (high pressure side — red)
        { id: 'pipe-hp-1', type: 'box', args: [0.07, 0.07, 1.3], position: [-1.5, 0.7, 0.05], color: '#D64545' },
        { id: 'pipe-hp-2', type: 'box', args: [2.8, 0.07, 0.07], position: [0, 0.7, -0.6], color: '#D64545' },
        // Connecting pipes (low pressure side — blue)
        { id: 'pipe-lp-1', type: 'box', args: [2.8, 0.07, 0.07], position: [0, 0.2, 0.7], color: '#3b82f6' },
        { id: 'pipe-lp-2', type: 'box', args: [0.07, 0.07, 1.3], position: [1.3, 0.2, 0.05], color: '#3b82f6' },
      ],
    },

    // ── Step 2: Compression Stage ────────────────────────────────────────────
    {
      id: 'compression',
      label: 'Stage 1 — Compression (Low → High Pressure)',
      description:
        'The compressor draws in low-pressure refrigerant vapor from the evaporator and compresses it to high pressure, raising temperature above outdoor ambient. Refrigerant exits as high-pressure, high-temperature superheated vapor.',
      codeCitation: 'PMEC Chapter 11 — Refrigeration Systems',
      duration: 1800,
      geometry: [
        { id: 'base', type: 'box', args: [5, 0.06, 3], position: [0, 0, 0], color: '#e7e5e4' },
        // Compressor (highlighted)
        { id: 'compressor', type: 'cylinder', args: [0.4, 0.4, 0.8, 12], position: [-1.5, 0.46, -0.6], color: '#D4951A', label: 'Compressor ACTIVE' },
        { id: 'comp-motor', type: 'cylinder', args: [0.22, 0.22, 0.28, 8], position: [-1.5, 0.96, -0.6], color: '#D4951A' },
        // Other components dimmed
        { id: 'condenser', type: 'box', args: [1.0, 0.6, 0.6], position: [1.3, 0.37, -0.6], color: '#94a3b8', opacity: 0.5, transparent: true, label: 'Condenser' },
        { id: 'exp-valve', type: 'sphere', args: [0.18, 12, 12], position: [-1.5, 0.4, 0.7], color: '#94a3b8', opacity: 0.5, transparent: true, label: 'Exp. Valve' },
        { id: 'evaporator', type: 'box', args: [1.0, 0.6, 0.6], position: [1.3, 0.37, 0.7], color: '#94a3b8', opacity: 0.5, transparent: true, label: 'Evaporator' },
        // Suction pipe (low pressure — blue entering compressor)
        { id: 'suction', type: 'box', args: [0.07, 0.07, 1.3], position: [-1.5, 0.2, 0.1], color: '#3b82f6', label: 'Suction (low P)' },
        { id: 'suc-arrow', type: 'cone', args: [0.09, 0.25, 8], position: [-1.5, 0.2, -0.35], rotation: [Math.PI / 2, 0, 0], color: '#3b82f6' },
        // Discharge pipe (high pressure — red leaving compressor)
        { id: 'discharge', type: 'box', args: [2.85, 0.07, 0.07], position: [0, 0.8, -0.6], color: '#D64545', label: 'Discharge (high P)' },
        { id: 'disc-arrow', type: 'cone', args: [0.09, 0.25, 8], position: [0.7, 0.8, -0.6], rotation: [0, 0, -Math.PI / 2], color: '#D64545' },
        // Heat indicator (compression generates heat)
        { id: 'heat-1', type: 'cone', args: [0.06, 0.15, 8], position: [-1.2, 1.2, -0.6], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'heat-2', type: 'cone', args: [0.06, 0.15, 8], position: [-1.5, 1.25, -0.6], rotation: [0, 0, 0], color: '#f97316' },
      ],
    },

    // ── Step 3: Condensation Stage ───────────────────────────────────────────
    {
      id: 'condensation',
      label: 'Stage 2 — Condensation (Heat Rejection)',
      description:
        'High-pressure superheated vapor enters the condenser and rejects heat to outdoor air (air-cooled) or cooling water (water-cooled). Refrigerant condenses into high-pressure saturated liquid. Condenser fan or cooling tower removes this heat.',
      codeCitation: 'PMEC Chapter 11 — Condensers and Cooling Towers',
      duration: 1800,
      geometry: [
        { id: 'base', type: 'box', args: [5, 0.06, 3], position: [0, 0, 0], color: '#e7e5e4' },
        // Condenser (highlighted)
        { id: 'condenser', type: 'box', args: [1.1, 0.7, 0.65], position: [1.3, 0.42, -0.6], color: '#D64545', label: 'Condenser ACTIVE' },
        { id: 'cond-fins', type: 'box', args: [0.95, 0.6, 0.1], position: [1.3, 0.42, -0.32], color: '#fca5a5' },
        // Condenser fan
        { id: 'cond-fan', type: 'cylinder', args: [0.25, 0.25, 0.06, 8], position: [1.3, 0.8, -0.8], color: '#374151' },
        // Other components dimmed
        { id: 'compressor', type: 'cylinder', args: [0.35, 0.35, 0.7, 12], position: [-1.5, 0.41, -0.6], color: '#94a3b8', opacity: 0.5, transparent: true },
        { id: 'exp-valve', type: 'sphere', args: [0.18, 12, 12], position: [-1.5, 0.4, 0.7], color: '#94a3b8', opacity: 0.5, transparent: true },
        { id: 'evaporator', type: 'box', args: [1.0, 0.6, 0.6], position: [1.3, 0.37, 0.7], color: '#94a3b8', opacity: 0.5, transparent: true },
        // Hot vapor entering condenser
        { id: 'hp-pipe', type: 'box', args: [2.85, 0.07, 0.07], position: [0, 0.7, -0.6], color: '#D64545' },
        { id: 'hp-arrow', type: 'cone', args: [0.09, 0.25, 8], position: [0.7, 0.7, -0.6], rotation: [0, 0, -Math.PI / 2], color: '#D64545', label: 'Superheated vapor' },
        // Heat rejection arrows (outward from condenser)
        { id: 'rej-1', type: 'cone', args: [0.07, 0.2, 8], position: [1.0, 1.1, -0.6], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'rej-2', type: 'cone', args: [0.07, 0.2, 8], position: [1.3, 1.1, -0.6], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'rej-3', type: 'cone', args: [0.07, 0.2, 8], position: [1.6, 1.1, -0.6], rotation: [0, 0, 0], color: '#f97316' },
        // Liquid refrigerant leaving condenser
        { id: 'liq-pipe', type: 'box', args: [0.07, 0.07, 1.3], position: [1.3, 0.12, 0.05], color: '#D4951A' },
        { id: 'liq-arrow', type: 'cone', args: [0.09, 0.25, 8], position: [1.3, 0.12, 0.35], rotation: [-Math.PI / 2, 0, 0], color: '#D4951A', label: 'Liquid (high P)' },
      ],
    },

    // ── Step 4: Expansion & Evaporation ──────────────────────────────────────
    {
      id: 'expansion-evaporation',
      label: 'Stages 3 & 4 — Expansion & Evaporation',
      description:
        'Expansion valve throttles high-pressure liquid to low pressure, causing flash evaporation and temperature drop. Low-pressure, low-temperature refrigerant enters the evaporator, absorbing heat from the conditioned space (cooling effect). Cycle repeats.',
      codeCitation: 'PMEC Chapter 11 — Expansion Devices and Evaporators',
      duration: 2200,
      geometry: [
        { id: 'base', type: 'box', args: [5, 0.06, 3], position: [0, 0, 0], color: '#e7e5e4' },
        // Expansion valve (highlighted)
        { id: 'exp-valve', type: 'sphere', args: [0.22, 12, 12], position: [-1.5, 0.4, 0.7], color: '#D4951A', label: 'Expansion Valve' },
        // Evaporator (highlighted)
        { id: 'evaporator', type: 'box', args: [1.1, 0.7, 0.65], position: [1.3, 0.42, 0.7], color: '#3b82f6', label: 'Evaporator ACTIVE' },
        { id: 'evap-fins', type: 'box', args: [0.95, 0.6, 0.1], position: [1.3, 0.42, 0.42], color: '#93c5fd' },
        // Other components dimmed
        { id: 'compressor', type: 'cylinder', args: [0.35, 0.35, 0.7, 12], position: [-1.5, 0.41, -0.6], color: '#94a3b8', opacity: 0.5, transparent: true },
        { id: 'condenser', type: 'box', args: [1.0, 0.6, 0.6], position: [1.3, 0.37, -0.6], color: '#94a3b8', opacity: 0.5, transparent: true },
        // High-pressure liquid pipe TO expansion valve
        { id: 'hp-liq', type: 'box', args: [2.85, 0.07, 0.07], position: [0, 0.12, 0.7], color: '#D4951A', label: 'Liquid (high P)' },
        { id: 'hp-arr', type: 'cone', args: [0.08, 0.22, 8], position: [-0.8, 0.12, 0.7], rotation: [0, 0, Math.PI / 2], color: '#D4951A' },
        // Low-pressure vapor pipe TO compressor
        { id: 'lp-vap', type: 'box', args: [0.07, 0.07, 1.3], position: [-1.5, 0.25, 0.05], color: '#3b82f6', label: 'Vapor (low P)' },
        { id: 'lp-arr', type: 'cone', args: [0.08, 0.22, 8], position: [-1.5, 0.25, -0.4], rotation: [Math.PI / 2, 0, 0], color: '#3b82f6' },
        // Cold air blowing from evaporator (cooling effect)
        { id: 'cold-1', type: 'cone', args: [0.08, 0.22, 8], position: [0.85, 0.5, 0.7], rotation: [0, 0, Math.PI / 2], color: '#bfdbfe', label: 'Cold air (supply)' },
        { id: 'cold-2', type: 'cone', args: [0.07, 0.18, 8], position: [0.75, 0.7, 0.7], rotation: [0, 0, Math.PI / 2], color: '#bfdbfe' },
        // Evaporator fan
        { id: 'evap-fan', type: 'cylinder', args: [0.22, 0.22, 0.06, 8], position: [0.9, 0.6, 0.8], color: '#374151' },
        // Flash evaporation indicator
        { id: 'flash', type: 'sphere', args: [0.12, 8, 8], position: [-1.5, 0.55, 0.7], color: '#93c5fd', opacity: 0.7, transparent: true, label: 'Flash evaporation' },
      ],
    },
  ],
}

