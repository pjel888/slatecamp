// src/features/3d-lab/config/modules/backflow-prevention.ts
// Backflow Prevention Devices — NPCP Plumbing
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

export const backflowPreventionConfig: ExplodedAssemblyConfig = {
  id: 'backflow-prevention',
  title: 'Backflow Prevention Devices',
  description: 'Side-by-side exploded comparison of the four main backflow prevention methods: Air Gap, Atmospheric Vacuum Breaker, Double Check Valve Assembly, and Reduced Pressure Zone (RPZ) device — per NPCP.',
  subject: 'npcp',
  comparisonMode: true,
  parts: [
    // ── AIR GAP (leftmost) ───────────────────────────────────────────────────
    {
      id: 'bf-ag-pipe',
      label: 'Air Gap — Supply Pipe',
      description: 'Supply pipe discharging above the flood rim of the receiving vessel. Simplest and most effective backflow prevention — physical separation breaks the siphon path.',
      codeCitation: 'NPCP Section 602',
      geometry: { id: 'bf-ag-pipe-geo', type: 'cylinder', position: [-1.2, 0.4, 0], args: [0.04, 0.04, 0.5, 8], color: '#3b82f6' },
      explodeOffset: [-1.2, 0.4, 0],
    },
    {
      id: 'bf-ag-gap',
      label: 'Air Gap Space (min 2× dia)',
      description: 'Required air gap: minimum 2× pipe diameter but never less than 25mm. Cannot be defeated by back-pressure or back-siphonage.',
      geometry: { id: 'bf-ag-gap-geo', type: 'cylinder', position: [-1.2, 0.12, 0], args: [0.04, 0.04, 0.12, 8], color: '#bfdbfe', opacity: 0.4, transparent: true },
      explodeOffset: [-1.2, 0.2, 0],
    },
    {
      id: 'bf-ag-tank',
      label: 'Receiving Vessel (Break Tank)',
      description: 'Open tank or fixture below the supply outlet. The free-surface provides the physical air gap discontinuity.',
      geometry: { id: 'bf-ag-tank-geo', type: 'box', position: [-1.2, -0.12, 0], args: [0.25, 0.2, 0.2], color: '#94a3b8', opacity: 0.5, transparent: true },
      explodeOffset: [-1.2, -0.1, 0],
    },
    // ── ATMOSPHERIC VACUUM BREAKER (second) ──────────────────────────────────
    {
      id: 'bf-avb-inlet',
      label: 'AVB — Inlet',
      description: 'Atmospheric Vacuum Breaker inlet connection. Must be installed at least 150mm above highest downstream outlet.',
      codeCitation: 'NPCP Section 602.2',
      geometry: { id: 'bf-avb-inlet-geo', type: 'cylinder', position: [-0.4, -0.2, 0], args: [0.035, 0.035, 0.3, 8], color: '#3b82f6' },
      explodeOffset: [-0.4, -0.3, 0],
    },
    {
      id: 'bf-avb-body',
      label: 'AVB Body (Check Poppet)',
      description: 'AVB body with check poppet that opens to atmosphere on back-siphonage. Closes under forward pressure.',
      geometry: { id: 'bf-avb-body-geo', type: 'cylinder', position: [-0.4, 0.07, 0], args: [0.06, 0.06, 0.2, 8], color: '#64748b' },
      explodeOffset: [-0.4, 0.1, 0],
    },
    {
      id: 'bf-avb-vent',
      label: 'AVB Air Vent Port',
      description: 'Atmospheric vent port opens when downstream pressure drops below atmospheric — admits air to break the siphon.',
      geometry: { id: 'bf-avb-vent-geo', type: 'cylinder', position: [-0.35, 0.1, 0], rotation: [0, 0, 1.5708], args: [0.015, 0.015, 0.06, 6], color: '#a1a1aa' },
      explodeOffset: [-0.25, 0.1, 0],
    },
    // ── DOUBLE CHECK VALVE (third) ────────────────────────────────────────────
    {
      id: 'bf-dc-shutoff-1',
      label: 'DC — Shutoff Valve (Inlet)',
      description: 'First resilient-seated shutoff valve of the Double Check Valve Assembly. Allows isolation for testing.',
      codeCitation: 'NPCP Section 602.3 / ASSE 1015',
      geometry: { id: 'bf-dc-shutoff-1-geo', type: 'cylinder', position: [0.4, 0, -0.15], args: [0.04, 0.04, 0.18, 8], color: '#3b82f6' },
      explodeOffset: [0.3, 0, -0.2],
    },
    {
      id: 'bf-dc-check-1',
      label: 'DC — First Check Valve',
      description: 'First independently-acting check valve. Seals on back-pressure or back-siphonage. Minimum 1 psi closing pressure.',
      geometry: { id: 'bf-dc-check-1-geo', type: 'cylinder', position: [0.4, 0, 0.03], args: [0.05, 0.05, 0.12, 8], color: '#2D9F6F' },
      explodeOffset: [0.4, 0, 0.1],
    },
    {
      id: 'bf-dc-check-2',
      label: 'DC — Second Check Valve',
      description: 'Second independently-acting check valve providing double protection. Intermediate chamber test cocks for field testing.',
      geometry: { id: 'bf-dc-check-2-geo', type: 'cylinder', position: [0.4, 0, 0.18], args: [0.05, 0.05, 0.12, 8], color: '#2D9F6F' },
      explodeOffset: [0.4, 0, 0.25],
    },
    // ── RPZ (rightmost) ──────────────────────────────────────────────────────
    {
      id: 'bf-rpz-inlet',
      label: 'RPZ — Inlet Shutoff',
      description: 'Reduced Pressure Zone (RPZ) device inlet shutoff. Highest level of testable backflow protection. Required for high-hazard connections.',
      codeCitation: 'NPCP Section 602.4 / ASSE 1013',
      geometry: { id: 'bf-rpz-inlet-geo', type: 'cylinder', position: [1.2, 0, -0.2], args: [0.04, 0.04, 0.18, 8], color: '#3b82f6' },
      explodeOffset: [1.1, 0, -0.3],
    },
    {
      id: 'bf-rpz-check-1',
      label: 'RPZ — First Check Valve',
      description: 'First check valve of the RPZ. Differential pressure maintained across it by the pressure differential relief valve.',
      geometry: { id: 'bf-rpz-check-1-geo', type: 'cylinder', position: [1.2, 0, 0], args: [0.055, 0.055, 0.12, 8], color: '#D64545' },
      explodeOffset: [1.2, 0, 0.1],
    },
    {
      id: 'bf-rpz-relief',
      label: 'RPZ — Relief Valve (Key)',
      description: 'Differential pressure relief valve opens to atmosphere if pressure between checks falls below supply pressure. Ensures zone between checks is always at lowest pressure — prevents any backflow path.',
      geometry: { id: 'bf-rpz-relief-geo', type: 'cylinder', position: [1.2, -0.1, 0.05], rotation: [1.5708, 0, 0], args: [0.04, 0.04, 0.12, 8], color: '#f97316' },
      explodeOffset: [1.2, -0.3, 0.1],
    },
    {
      id: 'bf-rpz-check-2',
      label: 'RPZ — Second Check Valve',
      description: 'Second check valve providing redundant protection. RPZ must be tested annually by certified tester.',
      geometry: { id: 'bf-rpz-check-2-geo', type: 'cylinder', position: [1.2, 0, 0.18], args: [0.055, 0.055, 0.12, 8], color: '#D64545' },
      explodeOffset: [1.2, 0, 0.3],
    },
  ],
  camera: { position: [0, 2, 3], fov: 55 },
}

