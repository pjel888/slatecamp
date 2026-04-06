// src/app/dashboard/3d-lab/_config/modules/steel-connections.ts
// Steel Connections — NSCP Structural Steel
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'

export const steelConnectionsConfig: ExplodedAssemblyConfig = {
  id: 'steel-connections',
  title: 'Steel Connections',
  description: 'Side-by-side exploded comparison of bolted vs welded beam-column connections, showing moment connection and shear (pin) connection types per NSCP/AISC standards.',
  subject: 'nscp',
  comparisonMode: true,
  parts: [
    // ── BOLTED MOMENT CONNECTION (left) ─────────────────────────────────────
    {
      id: 'sc-bolt-column',
      label: 'W-Shape Column (Bolted)',
      description: 'Wide-flange column section. Moment connection transfers both shear and moment to column flanges via bolted plates.',
      codeCitation: 'NSCP Section 502 / AISC 360',
      geometry: { id: 'sc-bolt-column-geo', type: 'box', position: [-0.8, 0, 0], args: [0.1, 1.2, 0.2], color: '#64748b' },
      explodeOffset: [-0.8, 0, 0],
    },
    {
      id: 'sc-bolt-beam',
      label: 'W-Shape Beam (Bolted)',
      description: 'Wide-flange beam framing into column. Bolted moment connection requires end plate or split-tee flanges.',
      geometry: { id: 'sc-bolt-beam-geo', type: 'box', position: [-0.45, 0, 0], args: [0.6, 0.15, 0.18], color: '#64748b' },
      explodeOffset: [-0.55, 0.3, 0],
    },
    {
      id: 'sc-bolt-end-plate',
      label: 'End Plate (Bolted Moment)',
      description: 'Thick end plate shop-welded to beam web/flanges, then field-bolted to column face. Extended end plate transfers full moment.',
      codeCitation: 'AISC Design Guide 4',
      geometry: { id: 'sc-bolt-end-plate-geo', type: 'box', position: [-0.74, 0, 0], args: [0.02, 0.25, 0.22], color: '#94a3b8' },
      explodeOffset: [-0.65, 0.3, 0],
    },
    {
      id: 'sc-bolt-1',
      label: 'High-Strength Bolt (A325)',
      description: 'A325 high-strength bolts in slip-critical configuration for moment connections. Installed with direct-tension indicator washers.',
      geometry: { id: 'sc-bolt-1-geo', type: 'cylinder', position: [-0.73, 0.07, 0.05], rotation: [0, 0, 1.5708], args: [0.015, 0.015, 0.12, 8], color: '#f97316' },
      explodeOffset: [-0.6, 0.35, 0.1],
    },
    {
      id: 'sc-bolt-2',
      label: 'Bolt — Upper Flange',
      description: 'Upper pair of bolts at beam top flange level — carry tension component of moment couple.',
      geometry: { id: 'sc-bolt-2-geo', type: 'cylinder', position: [-0.73, -0.07, 0.05], rotation: [0, 0, 1.5708], args: [0.015, 0.015, 0.12, 8], color: '#f97316' },
      explodeOffset: [-0.6, 0.25, 0.1],
    },
    // ── WELDED MOMENT CONNECTION (centre) ───────────────────────────────────
    {
      id: 'sc-weld-column',
      label: 'W-Shape Column (Welded)',
      description: 'Wide-flange column for fully welded moment connection. Continuity plates (stiffeners) added at beam flange levels.',
      geometry: { id: 'sc-weld-column-geo', type: 'box', position: [0, 0, 0], args: [0.1, 1.2, 0.2], color: '#52525b' },
      explodeOffset: [0, 0, 0],
    },
    {
      id: 'sc-weld-beam',
      label: 'W-Shape Beam (Welded)',
      description: 'Beam with CJP (complete joint penetration) groove welds at both flanges to column. Shear tab fillet-welded to web.',
      geometry: { id: 'sc-weld-beam-geo', type: 'box', position: [0.35, 0, 0], args: [0.6, 0.15, 0.18], color: '#52525b' },
      explodeOffset: [0.45, 0.3, 0],
    },
    {
      id: 'sc-weld-bead',
      label: 'CJP Groove Weld',
      description: 'Complete Joint Penetration (CJP) groove weld at beam flange. Full-strength weld — develops 100% of beam flange capacity. Requires weld access holes in web.',
      codeCitation: 'AWS D1.1 / AISC 360 Ch. J',
      geometry: { id: 'sc-weld-bead-geo', type: 'box', position: [0.06, 0.075, 0], args: [0.04, 0.02, 0.2], color: '#D4951A' },
      explodeOffset: [0.1, 0.35, 0],
    },
    {
      id: 'sc-continuity-plate',
      label: 'Continuity Plate (Stiffener)',
      description: 'Horizontal stiffener plate added to column web at beam flange level. Transfers flange force across the column web panel zone.',
      codeCitation: 'AISC 360 Section J10',
      geometry: { id: 'sc-continuity-plate-geo', type: 'box', position: [0, 0.08, 0], args: [0.08, 0.015, 0.18], color: '#94a3b8' },
      explodeOffset: [0.1, 0.4, 0],
    },
    // ── SHEAR (PIN) CONNECTION (right) ──────────────────────────────────────
    {
      id: 'sc-shear-column',
      label: 'Column (Shear Connection)',
      description: 'Column with simple shear (pin) connection. No moment transfer — beam end rotates freely. Used in braced frames.',
      geometry: { id: 'sc-shear-column-geo', type: 'box', position: [0.8, 0, 0], args: [0.1, 1.2, 0.2], color: '#64748b' },
      explodeOffset: [0.8, 0, 0],
    },
    {
      id: 'sc-shear-tab',
      label: 'Shear Tab (Single Plate)',
      description: 'Single plate shear tab shop-welded to column web, field-bolted to beam web. Transfers shear only — no moment.',
      codeCitation: 'AISC Manual Part 10',
      geometry: { id: 'sc-shear-tab-geo', type: 'box', position: [0.86, 0, 0], args: [0.02, 0.2, 0.04], color: '#a1a1aa' },
      explodeOffset: [0.9, 0.3, 0],
    },
    {
      id: 'sc-shear-beam',
      label: 'Beam (Pin End)',
      description: 'Beam framing in with simple shear connection. End rotates under load — beam behaves as simply supported.',
      geometry: { id: 'sc-shear-beam-geo', type: 'box', position: [1.15, 0, 0], args: [0.5, 0.15, 0.18], color: '#64748b' },
      explodeOffset: [1.25, 0.3, 0],
    },
  ],
  camera: { position: [0, 2, 3], fov: 50 },
}

