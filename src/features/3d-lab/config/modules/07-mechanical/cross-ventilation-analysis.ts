// src/app/dashboard/3d-lab/_config/modules/cross-ventilation-analysis.ts
// Cross-Ventilation Analysis — PMEC
// ─────────────────────────────────────────────────────────────────────────────
// Natural airflow through windward/leeward openings and pressure differential.

import type { AnimatedSequenceConfig } from '@/features/3d-lab/types/templates'

export const crossVentilationAnalysisConfig: AnimatedSequenceConfig = {
  id: 'cross-ventilation-analysis',
  title: 'Cross-Ventilation Analysis',
  description:
    'Natural cross-ventilation: windward openings receive positive pressure from wind, leeward openings exhaust air at negative pressure. Effective cross-ventilation requires openings on opposite walls and unobstructed flow paths.',
  subject: 'pmec',
  loop: true,
  autoPlaySpeed: 2000,
  camera: { position: [0, 3, 5.5], target: [0, 1, 0], fov: 45 },
  steps: [
    // ── Step 1: Building & Wind Approach ────────────────────────────────────
    {
      id: 'wind-approach',
      label: 'Wind Approach & Pressure Zones',
      description:
        'Wind strikes the windward face of a building, creating a positive pressure zone (+Cp). The leeward face and roof experience negative pressure (suction, −Cp). This pressure differential is the driving force for cross-ventilation.',
      codeCitation: 'NSCP 2015 Section 207 Wind Loads — Pressure Coefficients',
      duration: 1800,
      geometry: [
        // Building volume
        { id: 'bldg', type: 'box', args: [2.5, 2.0, 1.8], position: [0, 1.0, 0], color: '#d4d4d8', opacity: 0.6, transparent: true },
        // Floor
        { id: 'floor', type: 'box', args: [5, 0.07, 3], position: [0, 0, 0], color: '#e7e5e4' },
        // Wind arrows (approaching from left)
        { id: 'wind-1', type: 'cone', args: [0.1, 0.3, 8], position: [-2.3, 1.6, 0.5], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'wind-1s', type: 'box', args: [0.45, 0.04, 0.04], position: [-2.75, 1.6, 0.5], color: '#06b6d4' },
        { id: 'wind-2', type: 'cone', args: [0.1, 0.3, 8], position: [-2.3, 1.2, 0], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'wind-2s', type: 'box', args: [0.45, 0.04, 0.04], position: [-2.75, 1.2, 0], color: '#06b6d4' },
        { id: 'wind-3', type: 'cone', args: [0.1, 0.3, 8], position: [-2.3, 0.8, -0.5], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'wind-3s', type: 'box', args: [0.45, 0.04, 0.04], position: [-2.75, 0.8, -0.5], color: '#06b6d4' },
        // Positive pressure zone (windward)
        { id: 'pos-zone', type: 'box', args: [0.15, 1.8, 1.6], position: [-1.35, 1.0, 0], color: '#2D9F6F', opacity: 0.4, transparent: true, label: '+Cp Windward' },
        // Negative pressure zone (leeward)
        { id: 'neg-zone', type: 'box', args: [0.15, 1.8, 1.6], position: [1.35, 1.0, 0], color: '#D64545', opacity: 0.4, transparent: true, label: '−Cp Leeward' },
        // Roof suction
        { id: 'roof-suction', type: 'box', args: [2.5, 0.12, 1.8], position: [0, 2.1, 0], color: '#D64545', opacity: 0.3, transparent: true, label: 'Roof Suction' },
      ],
    },

    // ── Step 2: Windward Opening — Air Intake ────────────────────────────────
    {
      id: 'windward-intake',
      label: 'Windward Opening — Air Intake',
      description:
        'Openings on the windward wall (positive pressure side) allow outdoor air to enter. Minimum opening area: 4% of floor area per NSCP. Inlet height and size control incoming air velocity and distribution.',
      codeCitation: 'NSCP 2015 Section 1203.4 — Natural Ventilation Opening Requirements',
      duration: 1800,
      geometry: [
        // Building walls (section view)
        { id: 'wall-wind', type: 'box', args: [0.15, 2.0, 1.8], position: [-1.25, 1.0, 0], color: '#a1a1aa' },
        { id: 'wall-lee', type: 'box', args: [0.15, 2.0, 1.8], position: [1.25, 1.0, 0], color: '#a1a1aa' },
        { id: 'ceiling', type: 'box', args: [2.65, 0.1, 1.8], position: [0, 2.1, 0], color: '#d4d4d8' },
        { id: 'floor-slab', type: 'box', args: [2.65, 0.1, 1.8], position: [0, 0, 0], color: '#d4d4d8' },
        // Windward opening (window)
        { id: 'window-wind', type: 'box', args: [0.18, 0.7, 0.8], position: [-1.25, 1.1, 0], color: '#bfdbfe', label: 'Inlet Window' },
        // Closed leeward (to show one-sided effect)
        { id: 'wall-lee-solid', type: 'box', args: [0.15, 0.7, 0.8], position: [1.25, 1.1, 0], color: '#94a3b8' },
        // Wind arrows entering window
        { id: 'in-1', type: 'cone', args: [0.08, 0.22, 8], position: [-0.95, 1.3, 0.2], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'in-1s', type: 'box', args: [0.3, 0.04, 0.04], position: [-1.2, 1.3, 0.2], color: '#06b6d4' },
        { id: 'in-2', type: 'cone', args: [0.08, 0.22, 8], position: [-0.95, 0.95, -0.2], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'in-2s', type: 'box', args: [0.3, 0.04, 0.04], position: [-1.2, 0.95, -0.2], color: '#06b6d4' },
        // Stagnant air (no outlet — air piles up)
        { id: 'stagnant', type: 'sphere', args: [0.45, 8, 8], position: [0.5, 1.1, 0], color: '#a3a3a3', opacity: 0.3, transparent: true, label: 'Stagnant' },
        // Positive pressure indicator
        { id: 'pos', type: 'sphere', args: [0.09, 8, 8], position: [-1.5, 1.1, 0], color: '#2D9F6F' },
      ],
    },

    // ── Step 3: Cross-Ventilation Active ────────────────────────────────────
    {
      id: 'cross-vent-active',
      label: 'Cross-Ventilation — Both Openings',
      description:
        'With openings on both windward and leeward walls, air flows across the space driven by the pressure differential. Effective cross-ventilation: air traverses the full depth of the room. Velocity increases with pressure difference.',
      codeCitation: 'NSCP 2015 Section 1203.4',
      duration: 2000,
      geometry: [
        // Walls with openings both sides
        { id: 'wall-wind-top', type: 'box', args: [0.15, 0.9, 1.8], position: [-1.25, 1.65, 0], color: '#a1a1aa' },
        { id: 'wall-wind-bot', type: 'box', args: [0.15, 0.6, 1.8], position: [-1.25, 0.3, 0], color: '#a1a1aa' },
        { id: 'wall-lee-top', type: 'box', args: [0.15, 0.9, 1.8], position: [1.25, 1.65, 0], color: '#a1a1aa' },
        { id: 'wall-lee-bot', type: 'box', args: [0.15, 0.6, 1.8], position: [1.25, 0.3, 0], color: '#a1a1aa' },
        { id: 'ceiling', type: 'box', args: [2.65, 0.1, 1.8], position: [0, 2.1, 0], color: '#d4d4d8' },
        { id: 'floor-slab', type: 'box', args: [2.65, 0.1, 1.8], position: [0, 0, 0], color: '#d4d4d8' },
        // Openings highlighted
        { id: 'open-wind', type: 'box', args: [0.18, 0.7, 0.8], position: [-1.25, 1.05, 0], color: '#bfdbfe', label: 'Inlet' },
        { id: 'open-lee', type: 'box', args: [0.18, 0.7, 0.8], position: [1.25, 1.05, 0], color: '#fde68a', label: 'Outlet' },
        // Cross airflow arrows (left to right across room)
        { id: 'flow-1', type: 'cone', args: [0.07, 0.2, 8], position: [-0.7, 1.2, 0.2], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'flow-1s', type: 'box', args: [0.5, 0.03, 0.03], position: [-1.0, 1.2, 0.2], color: '#06b6d4' },
        { id: 'flow-2', type: 'cone', args: [0.07, 0.2, 8], position: [0, 1.0, 0], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'flow-2s', type: 'box', args: [0.7, 0.03, 0.03], position: [-0.35, 1.0, 0], color: '#06b6d4' },
        { id: 'flow-3', type: 'cone', args: [0.07, 0.2, 8], position: [0.7, 0.85, -0.2], rotation: [0, 0, -Math.PI / 2], color: '#06b6d4' },
        { id: 'flow-3s', type: 'box', args: [0.5, 0.03, 0.03], position: [0.4, 0.85, -0.2], color: '#06b6d4' },
        // Pressure zones
        { id: 'pos-p', type: 'sphere', args: [0.09, 8, 8], position: [-1.5, 1.05, 0], color: '#2D9F6F' },
        { id: 'neg-p', type: 'sphere', args: [0.09, 8, 8], position: [1.5, 1.05, 0], color: '#D64545' },
      ],
    },

    // ── Step 4: Stack Effect & Openings Placement ─────────────────────────────
    {
      id: 'stack-effect',
      label: 'Stack Effect — Height-Driven Ventilation',
      description:
        'The stack effect drives airflow when outdoor and indoor air temperatures differ. Warm indoor air rises and exits high openings; cooler outdoor air enters low openings. Effective for spaces with high ceilings (e.g., atriums, tropical buildings).',
      codeCitation: 'NSCP 2015 Section 1203.4.1.2 — Stack-Driven Ventilation',
      duration: 2000,
      geometry: [
        // Tall room / atrium
        { id: 'floor', type: 'box', args: [3, 0.08, 2], position: [0, 0, 0], color: '#d4d4d8' },
        { id: 'wall-left', type: 'box', args: [0.12, 4.5, 2], position: [-1.5, 2.25, 0], color: '#a1a1aa' },
        { id: 'wall-right', type: 'box', args: [0.12, 4.5, 2], position: [1.5, 2.25, 0], color: '#a1a1aa' },
        { id: 'ceiling', type: 'box', args: [3, 0.1, 2], position: [0, 4.55, 0], color: '#d4d4d8' },
        // Low inlet openings (windward/cool)
        { id: 'low-open-l', type: 'box', args: [0.15, 0.45, 0.6], position: [-1.5, 0.4, 0], color: '#bfdbfe', label: 'Low Inlet' },
        { id: 'low-open-r', type: 'box', args: [0.15, 0.45, 0.6], position: [1.5, 0.4, 0], color: '#bfdbfe' },
        // High outlet openings (warm air exits)
        { id: 'high-open-l', type: 'box', args: [0.15, 0.45, 0.6], position: [-1.5, 4.05, 0], color: '#fde68a', label: 'High Outlet' },
        { id: 'high-open-r', type: 'box', args: [0.15, 0.45, 0.6], position: [1.5, 4.05, 0], color: '#fde68a' },
        // Rising warm air arrows (center — upward, warm color)
        { id: 'rise-1', type: 'cone', args: [0.08, 0.22, 8], position: [0, 1.5, 0], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'rise-2', type: 'cone', args: [0.08, 0.22, 8], position: [0, 2.5, 0], rotation: [0, 0, 0], color: '#f97316' },
        { id: 'rise-3', type: 'cone', args: [0.08, 0.22, 8], position: [0, 3.5, 0], rotation: [0, 0, 0], color: '#f97316' },
        // Cool air entering low (blue arrows inward)
        { id: 'cool-l', type: 'cone', args: [0.07, 0.18, 8], position: [-1.1, 0.4, 0], rotation: [0, 0, -Math.PI / 2], color: '#93c5fd' },
        { id: 'cool-r', type: 'cone', args: [0.07, 0.18, 8], position: [1.1, 0.4, 0], rotation: [0, 0, Math.PI / 2], color: '#93c5fd' },
        // Warm zone indicator
        { id: 'warm-zone', type: 'box', args: [2.7, 2.0, 1.8], position: [0, 3.5, 0], color: '#fef3c7', opacity: 0.25, transparent: true, label: 'Warm Zone' },
      ],
    },
  ],
}

